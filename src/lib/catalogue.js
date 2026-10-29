// Loads the catalogue and normalises it into one predictable shape.
// Source: the Supabase database (managed in /admin) when it is configured,
// otherwise /products.json. Tolerates common naming differences
// (flavors/flavours, price_usd, etc.) so either source works.
import { hasBackend, rest, PRODUCT_COLUMNS } from './backend.js';
import { readCache, writeCache } from './settings.js';

const isConfirm = (v) => typeof v === 'string' && /confirm/i.test(v);

function toPrice(raw) {
  if (raw == null || raw === '' || isConfirm(raw)) return null;
  const n = Number(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Product-level nicotine applies to any flavour that doesn't state its own.
function normaliseFlavour(f, productNicotine = null) {
  if (typeof f === 'string') f = { name: f };
  const name = f.name ?? f.flavour ?? f.flavor ?? f.variant ?? 'Unnamed';
  const nicotine = f.nicotine ?? f.nicotine_strength ?? f.strength ?? productNicotine;
  const stock = String(f.inStock ?? f.stock ?? f.availability ?? 'available').toLowerCase();
  const confirm = [];
  if (isConfirm(nicotine)) confirm.push('nicotine');
  if (isConfirm(name)) confirm.push('name');
  return { name, nicotine, available: !['out', 'out of stock', 'sold out', '0', 'false'].includes(stock), confirm };
}

export function normaliseProduct(p, index) {
  const rawPrice = p.price ?? p.price_usd ?? p.priceUSD ?? null;
  const flavours = (p.flavours ?? p.flavors ?? p.variants ?? []).map((f) => normaliseFlavour(f, p.nicotine ?? null));
  const confirm = [];
  if (toPrice(rawPrice) == null) confirm.push('price');
  if (isConfirm(p.puffs)) confirm.push('puff count');
  if (flavours.some((f) => f.confirm.includes('nicotine'))) confirm.push('nicotine');
  for (const [k, v] of Object.entries(p)) {
    if (isConfirm(v) && !['price', 'price_usd', 'puffs', 'notes'].includes(k)) confirm.push(k);
  }

  return {
    id: String(p.id ?? p.sku ?? `product-${index}`),
    name: p.name ?? 'Unnamed product',
    brand: p.brand ?? '',
    category: p.category ?? p.type ?? '',
    puffs: p.puffs ?? p.puff_count ?? null,
    price: toPrice(rawPrice),
    image: p.image ?? p.images?.[0] ?? '/brand/logo.webp',
    heroImage: p.heroImage ?? null,
    description: p.description ?? '',
    featured: Boolean(p.featured),
    isNew: Boolean(p.new ?? p.isNew),
    sample: Boolean(p.sample),
    flavours: flavours.length ? flavours : [{ name: 'Standard', nicotine: null, available: true, confirm: [] }],
    confirm: [...new Set(confirm)],
    order: index,
  };
}

// Database row -> the product shape normaliseProduct understands.
// A product marked unavailable makes every flavour unavailable.
export function fromRow(r) {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand,
    category: r.category,
    description: r.description,
    price: r.price,
    puffs: r.puffs,
    nicotine: r.nicotine || null,
    image: r.image || undefined,
    heroImage: r.hero_image || null,
    featured: r.featured,
    new: r.is_new,
    flavours: (r.flavours ?? []).map((f) => ({
      name: f.name,
      nicotine: f.nicotine || null,
      inStock: r.in_stock && f.available !== false ? 'available' : 'out',
    })),
  };
}

async function loadFile() {
  const res = await fetch('/products.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load products (${res.status})`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.products ?? [];
  return list.map(normaliseProduct);
}

// -> { products, settings, stale }. `stale` means the database was unreachable
// and the last saved copy is shown instead. Throws if there is nothing to show.
export async function loadStore() {
  if (!hasBackend) return { products: await loadFile(), settings: null, stale: false };
  try {
    const [rows, settings] = await Promise.all([
      rest(`products?select=${PRODUCT_COLUMNS}&active=eq.true&order=sort_order.asc,name.asc`),
      rest('site_settings?select=business,delivery,payment_methods&id=eq.1'),
    ]);
    writeCache(rows, settings[0] ?? null);
    return { products: rows.map(fromRow).map(normaliseProduct), settings: settings[0] ?? null, stale: false };
  } catch (err) {
    const cache = readCache();
    if (!cache) throw err;
    return { products: cache.products.map(fromRow).map(normaliseProduct), settings: cache.settings, stale: true };
  }
}

const puffNumber = (v) => (typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^0-9]/g, '')) || null);
export const puffCount = (p) => puffNumber(p.puffs);

export function puffLabel(p) {
  if (isConfirm(p.puffs)) return 'Puffs TBC';
  const n = puffNumber(p.puffs);
  return n ? `${n.toLocaleString('en-US')} puffs` : null;
}

// "5%", "2–5%", or "TBC" when any strength is unconfirmed and none are known.
export function nicotineSummary(p) {
  const vals = p.flavours.map((f) => f.nicotine).filter((v) => v != null && !isConfirm(v));
  const nums = [...new Set(vals.map((v) => parseFloat(v)).filter(Number.isFinite))].sort((a, b) => a - b);
  if (!nums.length) return p.flavours.some((f) => isConfirm(f.nicotine)) ? 'Nicotine TBC' : null;
  return nums.length === 1 ? `${nums[0]}% nicotine` : `${nums[0]}–${nums[nums.length - 1]}% nicotine`;
}

export const showValue = (v) => (v == null || v === '' ? null : isConfirm(v) ? 'To be confirmed' : String(v));
