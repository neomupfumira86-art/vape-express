// Public, read-only access to the Supabase catalogue.
// The storefront uses plain fetch (no Supabase library) so the shop stays light;
// only the /admin area loads @supabase/supabase-js.
// Both values are public by design: what visitors can read is decided by the
// database's Row Level Security, not by keeping these secret.

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '');
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
export const hasBackend = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const PRODUCT_COLUMNS =
  'id,name,brand,category,description,price,puffs,nicotine,flavours,image,hero_image,in_stock,featured,is_new,sort_order';

export async function rest(path, { timeout = 8000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_KEY, Accept: 'application/json' },
      cache: 'no-store',
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Store data unavailable (${res.status})`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}
