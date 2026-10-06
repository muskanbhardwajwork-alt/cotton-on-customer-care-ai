import { PolicyRule } from '../types';

export const POLICY_RULES: PolicyRule[] = [
  // K1-K11 Auto-Answerable
  {
    id: 'K1',
    title: 'Order tracking',
    category: 'auto',
    summary: 'Tracking links emailed upon dispatch, available under My Purchases, or SMS for store collection.',
    fullRule:
      "Once an order ships, a tracking link is emailed. The same information is under My Purchases when signed into an account. If you don't have an account, create one with the email used at checkout. Deliver to Store orders get an SMS or email when ready to collect.",
    samplePrompt: 'How can I track my recent order?',
  },
  {
    id: 'K2',
    title: 'Delivery coverage',
    category: 'auto',
    summary: 'Cost and timing depend on location; PO Boxes and Parcel Lockers covered by Standard AU delivery only.',
    fullRule:
      'Delivery cost and timing depend on location; see the Delivery page for details. PO Boxes and Parcel Lockers are covered by Standard delivery within Australia only.',
    samplePrompt: 'Do you deliver to PO Boxes or Parcel Lockers in Australia?',
  },
  {
    id: 'K3',
    title: 'Holiday delays',
    category: 'auto',
    summary: 'Public holiday orders processed next business day. Delays possible during peak sales and holidays.',
    fullRule:
      "Orders placed on a public holiday aren't processed until the next business day. Expect possible delays during national or state public holidays and busy sale periods.",
    samplePrompt: 'I placed an order on a public holiday, when will it be processed?',
  },
  {
    id: 'K4',
    title: 'Returns eligibility',
    category: 'auto',
    summary: 'No fixed deadline if unworn with tags attached. Only order number starting with W00 needed.',
    fullRule:
      'There is no fixed return deadline as long as the item meets the returns policy conditions (unworn, tags attached). Only the order number is needed (it starts with W00). No paperwork is required.',
    samplePrompt: 'What is the return window for clothing items?',
  },
  {
    id: 'K5',
    title: 'Return method',
    category: 'auto',
    summary: 'Warehouse returns are refunded only. In-store returns allow exchanges. AU return postage is covered.',
    fullRule:
      'Online returns sent to the warehouse are refunded, not exchanged. For an exchange or different size, visit a store. Return postage within Australia is covered.',
    samplePrompt: 'Can I exchange a dress if I post it back to the warehouse?',
  },
  {
    id: 'K6',
    title: 'Refund timing',
    category: 'auto',
    summary: 'Receipt email up to 10 days after posting; refund reaches payment method within 1-5 business days.',
    fullRule:
      'The warehouse emails when a return is received (allow up to 10 days after posting, longer in busy periods) and again when the refund is processed. The refund reaches the original payment method within 1-5 business days of processing.',
    samplePrompt: 'How long do refunds take to appear in my account?',
  },
  {
    id: 'K7',
    title: 'Gift cards',
    category: 'auto',
    summary: 'Australian gift cards with PIN work online and in-store. Balance check available in checkout bag.',
    fullRule:
      'Gift cards with a PIN, bought in Australia from a Cotton On Group store, work online and in-store. Check the balance by adding the card to your bag at checkout.',
    samplePrompt: 'Can I use my Australian store gift card online and check my balance?',
  },
  {
    id: 'K8',
    title: 'Store info',
    category: 'auto',
    summary: 'Hours, stock, and pricing vary by store. Use store finder online. Specific hours are never stated.',
    fullRule:
      'Hours, stock and pricing vary by store. Use the store finder on the website for locations and opening hours. NEVER state specific opening hours.',
    samplePrompt: 'Where can I find the nearest store and what time do you open tomorrow?',
  },
  {
    id: 'K9',
    title: 'Product materials',
    category: 'auto',
    summary: 'Fabric and material composition is listed in the product description on each product page.',
    fullRule:
      'Fabric and material composition is in the product description on each product page.',
    samplePrompt: 'Where do I find what fabric a shirt is made of?',
  },
  {
    id: 'K10',
    title: 'Product availability',
    category: 'auto',
    summary: 'Check size availability and in-store stock tab. Sold-out items are unlikely to be restocked.',
    fullRule:
      "Check stock on the product page by selecting a size and using the in-store tab. Online and in-store stock and prices don't always match, and sold-out items are unlikely to be restocked.",
    samplePrompt: 'Are sold out sizes going to be restocked soon?',
  },
  {
    id: 'K11',
    title: 'Refund amount',
    category: 'auto',
    summary: 'Refunds cover amount paid after discounts; original shipping not refunded for change of mind.',
    fullRule:
      'A refund covers the amount paid for the item after any discounts or vouchers, returned to the original payment method. Shipping fees from the original order are not refunded for change-of-mind returns. For an exact figure on a specific order, a team member can check the order details. Answer amount questions in a neutral tone (no "sorry to hear").',
    samplePrompt: 'Do I get the original shipping fee back if I change my mind and return an item?',
  },

  // E1-E6 Escalation Only
  {
    id: 'E1',
    title: 'Damaged or faulty item',
    category: 'escalation',
    summary: 'Requires human assessment. Allows attaching photo evidence of damage.',
    fullRule: 'Damaged or faulty item: needs human assessment.',
    samplePrompt: 'My jacket arrived with a torn seam and broken zipper.',
  },
  {
    id: 'E2',
    title: 'Missing item or parcel contents',
    category: 'escalation',
    summary: 'Requires an order-specific investigation by a team member.',
    fullRule: 'Missing item or parcel contents: needs an order-specific investigation.',
    samplePrompt: 'My parcel arrived today but one of the two shirts I ordered is missing.',
  },
  {
    id: 'E3',
    title: 'Payment taken but order unconfirmed',
    category: 'escalation',
    summary: 'Money deducted from bank or card but no confirmation email or order number received.',
    fullRule: 'Payment taken but order failed or unconfirmed: needs the transaction checked.',
    samplePrompt: 'My bank was charged $85 but the screen went blank and I never got a confirmation.',
  },
  {
    id: 'E4',
    title: 'Checkout security block',
    category: 'escalation',
    summary: 'Blocked or flagged at checkout, error prompts, or payment declined requiring support.',
    fullRule:
      'Checkout security block: any message about being blocked or flagged at checkout, checkout errors, being told to contact customer service while ordering, or payment declined at checkout.',
    samplePrompt: 'At checkout I got an error saying my account is flagged and to contact support.',
  },
  {
    id: 'E5',
    title: 'Refund delay or dispute',
    category: 'escalation',
    summary: 'Refund not received after expected timeline or dispute regarding refund calculation.',
    fullRule: 'Refund delay or dispute: refund not received, or a refund complaint.',
    samplePrompt: "It's been three weeks since you confirmed my return and I still haven't received my refund.",
  },
  {
    id: 'E6',
    title: 'General frustration or anger',
    category: 'escalation',
    summary: 'Customer frustration or anger without a clearer specific match.',
    fullRule: 'General frustration or anger with no clearer specific match.',
    samplePrompt: "I am fed up with the terrible service I've been experiencing all week!",
  },
];
