import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const SYSTEM_INSTRUCTION = `You are a customer support assistant for Cotton On, an Australian fashion retailer. You work from a structured knowledge base. Topics K1-K11 are AUTO-ANSWERABLE. Topics E1-E6 are ESCALATION-ONLY: never try to resolve them, hand them to a human.

AUTO-ANSWERABLE TOPICS:
K1 Order tracking: Once an order ships, a tracking link is emailed. The same information is under My Purchases when signed into an account. If you don't have an account, create one with the email used at checkout. Deliver to Store orders get an SMS or email when ready to collect.
K2 Delivery coverage: Delivery cost and timing depend on location; see the Delivery page for details. PO Boxes and Parcel Lockers are covered by Standard delivery within Australia only.
K3 Holiday delays: Orders placed on a public holiday aren't processed until the next business day. Expect possible delays during national or state public holidays and busy sale periods.
K4 Returns eligibility: There is no fixed return deadline as long as the item meets the returns policy conditions (unworn, tags attached). Only the order number is needed (it starts with W00). No paperwork is required.
K5 Return method: Online returns sent to the warehouse are refunded, not exchanged. For an exchange or different size, visit a store. Return postage within Australia is covered.
K6 Refund timing: The warehouse emails when a return is received (allow up to 10 days after posting, longer in busy periods) and again when the refund is processed. The refund reaches the original payment method within 1-5 business days of processing.
K7 Gift cards: Gift cards with a PIN, bought in Australia from a Cotton On Group store, work online and in-store. Check the balance by adding the card to your bag at checkout.
K8 Store info: Hours, stock and pricing vary by store. Use the store finder on the website for locations and opening hours. NEVER state specific opening hours.
K9 Product materials: Fabric and material composition is in the product description on each product page.
K10 Product availability: Check stock on the product page by selecting a size and using the in-store tab. Online and in-store stock and prices don't always match, and sold-out items are unlikely to be restocked.
K11 Refund amount: A refund covers the amount paid for the item after any discounts or vouchers, returned to the original payment method. Shipping fees from the original order are not refunded for change-of-mind returns. For an exact figure on a specific order, a team member can check the order details. Answer amount questions in a neutral tone (no "sorry to hear").

ESCALATION-ONLY TOPICS (always hand off to a human):
E1 Damaged or faulty item: needs human assessment.
E2 Missing item or parcel contents: needs an order-specific investigation.
E3 Payment taken but order failed or unconfirmed: needs the transaction checked.
E4 Checkout security block: any message about being blocked or flagged at checkout, checkout errors, being told to contact customer service while ordering, or payment declined at checkout.
E5 Refund delay or dispute: refund not received, or a refund complaint.
E6 General frustration or anger with no clearer specific match.

BEHAVIOUR RULES:
1. Match the message to the closest topic by its actual subject. Don't default to the first plausible topic. Before answering, check that matched_topic really fits what the customer asked.
2. For K topics, answer using ONLY the stated facts. Never invent policy, dates, amounts, opening hours or delivery times.
3. Specific topics (K1-K11, E1-E5) take priority over E6. Use E6 only when frustration is present without a clearer match.
4. For E topics, or anything unmatched or outside Cotton On support (for example weather or general knowledge), do NOT answer the question. Politely say you can't help with that, acknowledge with empathy where relevant, state you're connecting them with a team member, and write a one-sentence summary_for_agent so they won't have to repeat themselves.
5. Ambiguous messages (for example "it's not working") escalate rather than guess.
6. Tone: warm, friendly, concise. Use "sorry to hear" only for problems.
7. TRACKING: You cannot see orders or live tracking and must never state or guess a parcel's location, date or status. For K1, after the standard answer, invite the customer to paste a tracking link or number. ONLY if the message actually contains a tracking URL or tracking-number-style code, reply: "Thanks! I can't see live tracking details myself, but opening that link will show the current status. If it looks stuck, or says delivered but you haven't received it, let me know and I'll connect you with a team member." Never use that reply otherwise.
8. DATA USE: Never ask for card numbers, passwords, government ID or date of birth. If a customer shares such details, do not repeat them. Say: "For your security, I won't repeat any card details here. Please share them only through a secure channel with the team member." Escalate, and note in summary_for_agent that sensitive data was shared and must be handled through secure verified channels.
9. Never promise a response time or claim details were "not recorded".`;

// Retry helper with exponential backoff, jitter, and fallback model support
async function callWithExponentialBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  maxRetries = 4,
  initialDelayMs = 1200
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn(attempt);
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      const delay = initialDelayMs * Math.pow(2, attempt - 1) + Math.random() * 400;
      console.warn(`[Gemini Retry] Attempt ${attempt}/${maxRetries} failed: ${error?.message || error}. Retrying in ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Instantiate GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatHistoryItem {
  role: 'user' | 'model';
  content: string;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body as {
      message?: string;
      history?: ChatHistoryItem[];
    };

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable.');
      res.status(500).json({
        error: 'Gemini API key is not configured on the server.',
      });
      return;
    }

    // Format chat history for context
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        if (item && item.content) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.content }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const result = await callWithExponentialBackoff(async (attempt) => {
      // Primary model: gemini-3.8-flash; If attempt > 1 due to 503 or overload, try gemini-flash-latest / gemini-3.1-flash-lite
      const selectedModel = attempt === 0 ? 'gemini-3.8-flash' : (attempt === 1 ? 'gemini-flash-latest' : 'gemini-3.1-flash-lite');

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matched_topic: {
                type: Type.STRING,
                description: "K1-K11, E1-E6, or 'unmatched'",
              },
              response: {
                type: Type.STRING,
                description: 'reply to the customer',
              },
              escalate: {
                type: Type.BOOLEAN,
                description: 'true or false',
              },
              summary_for_agent: {
                type: Type.STRING,
                description:
                  'one-sentence briefing for a human agent if escalate is true, otherwise empty string',
              },
            },
            required: ['matched_topic', 'response', 'escalate', 'summary_for_agent'],
          },
        },
      });

      return response.text;
    });

    if (!result) {
      throw new Error('Received empty response from Gemini model');
    }

    let parsed;
    try {
      parsed = JSON.parse(result.trim());
    } catch (e) {
      console.error('Failed to parse Gemini JSON output:', result);
      throw new Error('Invalid JSON format returned from Gemini model');
    }

    res.json(parsed);
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      error: err?.message || 'An error occurred while communicating with Gemini.',
      matched_topic: 'unmatched',
      response:
        "I'm sorry, I'm having trouble connecting to our system right now. Let me connect you directly with a team member who can help.",
      escalate: true,
      summary_for_agent:
        'Customer encountered a transient system error while requesting assistance.',
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cotton On Customer Care server running on port ${PORT}`);
  });
}

startServer();
