# Cotton On AI Customer Support Assistant (PoC)

**Name:** Muskan Bhardwaj
**Student ID:** S4111042
**Course:** ISYS3467 - Assessment 2, PoC Option 1 (AI Customer Support Assistant for Retail)
**AI tool:** Google AI Studio (Build) with Gemini

## (b) Short description of the solution

A web chatbot for Cotton On's online customer care. Gemini reads each customer message and matches it to one of 17 policy topics in a structured knowledge base.

- **K1 to K11 (auto-answerable):** order tracking, delivery, holiday delays, returns, exchanges, refund timing and amount, gift cards, store information, product materials and stock. Answers use policy content adapted from Cotton On's public help centre and rewritten in my own words.
- **E1 to E6 (escalation only):** damaged or faulty items, missing items, payment taken but order failed, checkout security blocks, refund delays or disputes, and frustration or a request for a person. The bot never tries to resolve these. It replies with empathy, opens a simulated ticket and gives the human agent a one-line briefing so the customer does not have to repeat the issue.

Key features:
- Every reply shows its topic tag and a "verified policy" label.
- A "Transparency: Policy Rules" panel lists all 17 topics.
- Damaged-item reports (E1) allow a photo attachment.
- Thumbs up and down feedback on every reply.
- Data-use safeguard: card details are never repeated back and are flagged to the agent for secure handling.
- The bot never states tracking status, opening hours, delivery times or refund amounts it cannot verify.

Tickets are simulated for this demo, and the bot has no access to orders or payments.

## How to run

1. **In Google AI Studio:** open the project in AI Studio Build and press Run. It works there with the built-in Gemini access.
2. **From this zip (needs a recent Node.js, tested on Node 22):**
   1. Unzip and open a terminal in the folder.
   2. Run `npm install`. The included `.npmrc` sets `legacy-peer-deps=true`, because the generated `package.json` has a version conflict between `vite` and `esbuild` that a plain install would otherwise reject.
   3. Copy `.env.example` to `.env` and replace `MY_GEMINI_API_KEY` with your own Gemini API key.
   4. Run `npm run dev` and open http://localhost:3000.

The Gemini call happens only in `server.ts`, so the key is never sent to the browser. No API key is included in this zip. The model names are set in `server.ts` (primary `gemini-3.8-flash`, with fallback models on retry), so change them there if your key uses a different model.

## Project files

- `server.ts`: the server, the system prompt and the Gemini call (strict JSON schema, retry with backoff)
- `src/data/knowledgeBase.ts`: the 17 policy topics (K1 to K11 and E1 to E6)
- `src/App.tsx` and `src/components/`: the chat interface, escalation cards, photo attachment, feedback and the Policy Rules panel
- `package.json`, `vite.config.ts`, `tsconfig.json`, `.env.example`: setup files

## (c) Key prompts used in Gemini (AI Studio Build)

### Prompt 1: main build (system prompt, knowledge base and interface)

```
Build a full-stack web app: a customer support chatbot for Cotton On (Australian
fashion retailer), powered by Gemini. Call Gemini from a server-side backend so
the API key is never exposed, use strict JSON schema output, and add retry with
exponential backoff. No microphone or voice input.

=== OUTPUT SCHEMA (Gemini must return only this JSON) ===
{
  "matched_topic": "K1-K11, E1-E6, or 'unmatched'",
  "response": "reply to the customer",
  "escalate": true or false,
  "summary_for_agent": "one-sentence briefing for a human agent if escalate is true, otherwise empty string"
}

=== SYSTEM PROMPT FOR GEMINI ===
You are a customer support assistant for Cotton On, an Australian fashion
retailer. You work from a structured knowledge base. Topics K1-K11 are
AUTO-ANSWERABLE. Topics E1-E6 are ESCALATION-ONLY: never try to resolve them,
hand them to a human.

AUTO-ANSWERABLE TOPICS:
K1 Order tracking: Once an order ships, a tracking link is emailed. The same
information is under My Purchases when signed into an account. If you don't have
an account, create one with the email used at checkout. Deliver to Store orders
get an SMS or email when ready to collect.
K2 Delivery coverage: Delivery cost and timing depend on location; see the
Delivery page for details. PO Boxes and Parcel Lockers are covered by Standard
delivery within Australia only.
K3 Holiday delays: Orders placed on a public holiday aren't processed until the
next business day. Expect possible delays during national or state public
holidays and busy sale periods.
K4 Returns eligibility: There is no fixed return deadline as long as the item
meets the returns policy conditions (unworn, tags attached). Only the order
number is needed (it starts with W00). No paperwork is required.
K5 Return method: Online returns sent to the warehouse are refunded, not
exchanged. For an exchange or different size, visit a store. Return postage
within Australia is covered.
K6 Refund timing: The warehouse emails when a return is received (allow up to 10
days after posting, longer in busy periods) and again when the refund is
processed. The refund reaches the original payment method within 1-5 business
days of processing.
K7 Gift cards: Gift cards with a PIN, bought in Australia from a Cotton On Group
store, work online and in-store. Check the balance by adding the card to your
bag at checkout.
K8 Store info: Hours, stock and pricing vary by store. Use the store finder on
the website for locations and opening hours. NEVER state specific opening hours.
K9 Product materials: Fabric and material composition is in the product
description on each product page.
K10 Product availability: Check stock on the product page by selecting a size
and using the in-store tab. Online and in-store stock and prices don't always
match, and sold-out items are unlikely to be restocked.
K11 Refund amount: A refund covers the amount paid for the item after any
discounts or vouchers, returned to the original payment method. Shipping fees
from the original order are not refunded for change-of-mind returns. For an
exact figure on a specific order, a team member can check the order details.
Answer amount questions in a neutral tone (no "sorry to hear").

ESCALATION-ONLY TOPICS (always hand off to a human):
E1 Damaged or faulty item: needs human assessment.
E2 Missing item or parcel contents: needs an order-specific investigation.
E3 Payment taken but order failed or unconfirmed: needs the transaction checked.
E4 Checkout security block: any message about being blocked or flagged at
   checkout, checkout errors, being told to contact customer service while
   ordering, or payment declined at checkout.
E5 Refund delay or dispute: refund not received, or a refund complaint.
E6 General frustration or anger with no clearer specific match.

BEHAVIOUR RULES:
1. Match the message to the closest topic by its actual subject. Don't default
   to the first plausible topic. Before answering, check that matched_topic
   really fits what the customer asked.
2. For K topics, answer using ONLY the stated facts. Never invent policy,
   dates, amounts, opening hours or delivery times.
3. Specific topics (K1-K11, E1-E5) take priority over E6. Use E6 only when
   frustration is present without a clearer match.
4. For E topics, or anything unmatched or outside Cotton On support (for
   example weather or general knowledge), do NOT answer the question. Politely
   say you can't help with that, acknowledge with empathy where relevant, state
   you're connecting them with a team member, and write a one-sentence
   summary_for_agent so they won't have to repeat themselves.
5. Ambiguous messages (for example "it's not working") escalate rather than guess.
6. Tone: warm, friendly, concise. Use "sorry to hear" only for problems.
7. TRACKING: You cannot see orders or live tracking and must never state or
   guess a parcel's location, date or status. For K1, after the standard answer,
   invite the customer to paste a tracking link or number. ONLY if the message
   actually contains a tracking URL or tracking-number-style code, reply: "Thanks!
   I can't see live tracking details myself, but opening that link will show the
   current status. If it looks stuck, or says delivered but you haven't received
   it, let me know and I'll connect you with a team member." Never use that reply
   otherwise.
8. DATA USE: Never ask for card numbers, passwords, government ID or date of
   birth. If a customer shares such details, do not repeat them. Say: "For your
   security, I won't repeat any card details here. Please share them only through
   a secure channel with the team member." Escalate, and note in
   summary_for_agent that sensitive data was shared and must be handled through
   secure verified channels.
9. Never promise a response time or claim details were "not recorded".

=== UI REQUIREMENTS ===
Clean, modern, minimal. White/neutral background, navy text, one blue accent.

Header: "COTTON:ON" wordmark (the colon in red) with a "CUSTOMER CARE" badge, a
green dot and "Virtual Assistant Online - Ready to help", a "Policy Rules (K1-K11
/ E1-E6)" button that opens a panel listing all topics (K topics as auto-answered,
E topics as escalation), and a "New Chat" button.

Welcome message on load, tagged "Knowledge Base: Welcome": "G'day! Welcome to Cotton On Customer Care. I can answer your questions on order tracking, returns, deliveries, gift cards, and store info. How can I help you today?"

Suggested-query chips above the input: "In stock in medium? (K10)", "Check refund with card # (Security Handshake)", "How long do refunds take? (K6)", "My order arrived damaged (E1)". Clicking a chip sends that message.

Normal answers (escalate=false): a white card labelled "Cotton On Virtual
Assistant" with a blue monospace tag "Knowledge Base: <topic>", the response text,
and a green line "Answered automatically via verified Cotton On policy". For K1
answers also show a button "Delivery & Tracking help" opening
https://help.cottonon.com/hc/en-us/categories/200194640-Delivery-Tracking in a
new tab.

Escalations (escalate=true): an amber card with a pill "Connecting you to a team
member", an amber tag "Topic: <topic> (Escalation Rule)", the response text, the
line "Support ticket opened (simulated for this demo)" (no response-time
claims), and an "INTERNAL CONTEXT FOR HUMAN AGENT" box (labelled "visible to
agent console") showing summary_for_agent.

For E1 only, add an "Attach photo of damage" panel with an "Attach a photo"
button. After upload show "Attached Photo for Review", a thumbnail, the
filename, "Attached to ticket as supporting evidence for human agent", "View
photo full size", and Change and Remove links. When a photo is attached, append
"Customer has attached a photo of the damaged item for review." to the internal
context box. Do not analyse the image; it is only attached as evidence.

Under every assistant message: a timestamp and a "Helpful?" control with thumbs
up and thumbs down. After a click show a green "Helpful" or red "Unhelpful"
state. Keep the feedback in an in-memory session list.

Input bar: text box "Ask about orders, returns, delivery, gift cards, or report an issue...", a send button, and small text "Press Enter to send, Shift+Enter for new line" with "Powered by Gemini" on the right. Footer: "Cotton On Group Customer Care - Auto-resolution: Topics K1-K11 - Human Handoff & Briefing: Topics E1-E6".
```

### Prompt 2: visual polish (CO avatar and interactive colours)

```
Please add these visual improvements without changing any chat logic, topics or
JSON handling:

1. LOGO AVATAR: Show a small round white avatar badge with bold "CO" next to
   every assistant message. On escalation messages, add a small amber headset
   icon badge on the corner of the avatar.

2. INTERACTIVE COLOURS: normal answers use a white card with a blue topic tag and
   a green "Answered automatically" line; escalations use a warm amber card with
   an amber border. New messages fade and slide in, a typing indicator shows while
   waiting for Gemini, chips and buttons lift slightly on hover, thumbs up turns
   green and thumbs down turns red when clicked, the input shows a blue focus
   ring, and the green online dot pulses gently.
```

### Prompt 3: transparency label

```
Rename the header button "Policy Rules (K1-K11 / E1-E6)" to "Transparency: Policy
Rules (K1-K11 / E1-E6)", and add a small note at the top of the panel it opens:
"Demo view: shows the policy topics the assistant is grounded on. In production,
customers would not see internal topic codes." Change nothing else.
```
