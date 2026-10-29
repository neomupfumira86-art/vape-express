import { business, delivery, paymentMethods } from '../config.js';

// Settings saved in the admin dashboard override the defaults in config.js.
// They are applied to the same objects every component already reads, so the
// header, footer, checkout and WhatsApp links pick them up on the next render.
const BUSINESS_KEYS = ['tagline', 'whatsappDisplay', 'whatsappNumber', 'instagramHandle', 'instagramUrl'];
const DELIVERY_KEYS = Object.keys(delivery);

export function applySettings(s) {
  if (!s) return;
  for (const k of BUSINESS_KEYS) if (typeof s.business?.[k] === 'string' && s.business[k].trim()) business[k] = s.business[k].trim();
  for (const k of DELIVERY_KEYS) if (typeof s.delivery?.[k] === 'string' && s.delivery[k].trim()) delivery[k] = s.delivery[k].trim();
  const methods = Array.isArray(s.payment_methods)
    ? s.payment_methods.filter((m) => m && typeof m.id === 'string' && typeof m.label === 'string' && m.label.trim())
    : [];
  if (methods.some((m) => m.enabled)) {
    paymentMethods.splice(0, paymentMethods.length, ...methods.map((m) => ({ id: m.id, label: m.label.trim(), enabled: Boolean(m.enabled), confirmed: Boolean(m.confirmed) })));
  }
}

// Last good copy of the store, used if the database is briefly unreachable.
const CACHE_KEY = 'vx-store-cache-v1';

export function readCache() {
  try {
    const v = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    return v && Array.isArray(v.products) ? v : null;
  } catch {
    return null;
  }
}

export function writeCache(products, settings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), products, settings }));
  } catch {
    /* storage full or blocked — the cache is only a convenience */
  }
}
