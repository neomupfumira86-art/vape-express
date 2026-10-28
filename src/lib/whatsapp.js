import { business } from '../config.js';
import { money } from './format.js';

// Builds a wa.me link with a safely encoded message.
export function waLink(text) {
  const url = new URL(`https://wa.me/${business.whatsappNumber}`);
  if (text) url.search = new URLSearchParams({ text }).toString();
  return url.toString();
}

export function productEnquiry(product, flavour) {
  return `Hi Vape Express, I'd like to order: ${product.name}${flavour ? ` (${flavour})` : ''}. Is it available?`;
}

export function orderMessage({ items, customer, paymentLabel }) {
  const lines = items.map((i, n) => {
    const unit = money(i.price);
    const total = i.price == null ? 'price to confirm' : money(i.price * i.qty);
    return `${n + 1}. ${i.name} — ${i.flavour}\n   Qty ${i.qty} × ${unit} = ${total}`;
  });
  const known = items.filter((i) => i.price != null).reduce((s, i) => s + i.price * i.qty, 0);
  const hasUnpriced = items.some((i) => i.price == null);

  return [
    '*New order request — Vape Express*',
    '',
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Delivery (Harare): ${customer.address}`,
    `Payment preference: ${paymentLabel}`,
    customer.note ? `Note: ${customer.note}` : null,
    '',
    '*Items*',
    ...lines,
    '',
    `*Order total: ${money(known)}*${hasUnpriced ? ' (plus items with price to confirm)' : ''}`,
    '',
    'This is an order request. Please confirm stock, payment and delivery with me on WhatsApp.',
  ]
    .filter((l) => l !== null)
    .join('\n');
}
