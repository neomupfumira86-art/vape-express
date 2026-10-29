import { supabase, BUCKET } from './supabase.js';

export const CONFIRM = '[CONFIRM WITH OWNER]';

// Turns database / network errors into sentences an owner can act on.
export function friendly(error) {
  const msg = String(error?.message ?? error ?? '');
  const code = error?.code;
  if (error?.name === 'TypeError' || /fetch|network|load failed/i.test(msg))
    return 'Couldn’t reach the database. Check your internet connection and try again.';
  if (/jwt|token|session/i.test(msg) && /expired|invalid|missing/i.test(msg)) return 'Your sign-in has expired. Please sign out and sign in again.';
  if (code === '42501' || code === 'PGRST116' || /row-level security|permission denied/i.test(msg))
    return 'This account isn’t allowed to make that change. Sign in with an admin account.';
  if (code === '23505') return 'Something with the same ID already exists.';
  if (code === '23514') return 'One of the values is outside what the store accepts. Check the highlighted fields.';
  if (/payload too large|exceeded the maximum allowed size/i.test(msg)) return 'That image is too large. Use one under 5 MB.';
  if (/mime type|invalid_mime/i.test(msg)) return 'That file type isn’t supported. Use a JPG, PNG or WebP image.';
  return msg || 'Something went wrong. Please try again.';
}

const check = ({ data, error }) => {
  if (error) throw new Error(friendly(error), { cause: error });
  return data;
};

// ── Products ──────────────────────────────────────────────────────────────────
export async function listProducts() {
  return check(await supabase.from('products').select('*').order('sort_order').order('name'));
}

export async function getProduct(id) {
  const [p, n] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).maybeSingle(),
    supabase.from('product_notes').select('notes').eq('product_id', id).maybeSingle(),
  ]);
  return { product: check(p), notes: check(n)?.notes ?? '' };
}

export const slugify = (s) =>
  String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'product';

// Creates a product with a readable, unique ID made from its name.
export async function createProduct(row, notes) {
  const base = slugify(row.name);
  for (let n = 1; n <= 20; n++) {
    const id = n === 1 ? base : `${base}-${n}`;
    const res = await supabase.from('products').insert({ ...row, id }).select().single();
    if (res.error?.code === '23505') continue;
    const saved = check(res);
    await saveNotes(id, notes);
    return saved;
  }
  throw new Error('Couldn’t create a unique ID for this product. Try a slightly different name.');
}

export async function updateProduct(id, patch, notes) {
  // .single() fails if no row came back, which is what RLS does to non-admins.
  const saved = check(await supabase.from('products').update(patch).eq('id', id).select().single());
  if (notes !== undefined) await saveNotes(id, notes);
  return saved;
}

async function saveNotes(id, notes) {
  check(await supabase.from('product_notes').upsert({ product_id: id, notes: notes ?? '' }));
}

export async function deleteProduct(product, allProducts) {
  const rows = check(await supabase.from('products').delete().eq('id', product.id).select('id'));
  if (!rows?.length) throw new Error('This account isn’t allowed to delete products.');
  const others = allProducts.filter((p) => p.id !== product.id);
  await removeImagesIfUnused([product.image, product.hero_image], others);
}

// ── Images ────────────────────────────────────────────────────────────────────
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const IMAGE_ACCEPT = ACCEPT.join(',');
const MAX_IN = 20 * 1024 * 1024; // before resizing
const MAX_OUT = 5 * 1024 * 1024; // bucket limit

// Resize to max 1200px and convert to WebP in the browser so photos load fast.
async function optimise(file) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.85));
    if (blob?.type === 'image/webp') return blob;
  } catch {
    /* fall back to the original file */
  }
  return file;
}

export async function uploadImage(file) {
  if (!ACCEPT.includes(file.type)) throw new Error('That file type isn’t supported. Use a JPG, PNG or WebP image.');
  if (file.size > MAX_IN) throw new Error('That image is too large. Use one under 20 MB.');
  const blob = await optimise(file);
  if (blob.size > MAX_OUT) throw new Error('That image is still over 5 MB after resizing. Try a smaller photo.');
  const ext = blob.type === 'image/webp' ? 'webp' : file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  check(await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || file.type, cacheControl: '31536000', upsert: false }));
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Only images uploaded through the dashboard live in storage; the original
// photos ship with the website (/images/...) and are never deleted from here.
export function storagePath(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = typeof url === 'string' ? url.indexOf(marker) : -1;
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
}

export async function removeImagesIfUnused(urls, otherProducts) {
  const used = new Set(otherProducts.flatMap((p) => [p.image, p.hero_image]).filter(Boolean));
  const paths = [...new Set(urls)].filter((u) => u && !used.has(u)).map(storagePath).filter(Boolean);
  if (!paths.length) return;
  // Best effort: a leftover file is harmless, so failures here are not shown.
  await supabase.storage.from(BUCKET).remove(paths).catch(() => {});
}

// ── Settings ──────────────────────────────────────────────────────────────────
export async function getSettings() {
  return check(await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle());
}

export async function saveSettings(patch) {
  return check(await supabase.from('site_settings').update(patch).eq('id', 1).select().single());
}

// ── Team (admins + access requests) ───────────────────────────────────────────
export async function getTeam() {
  const [admins, requests] = await Promise.all([
    supabase.from('admins').select('user_id,email,created_at').order('created_at'),
    supabase.from('admin_requests').select('user_id,email,created_at').order('created_at'),
  ]);
  return { admins: check(admins), requests: check(requests) };
}

const rpc = async (fn, args) => check(await supabase.rpc(fn, args));
export const approveRequest = (id) => rpc('approve_admin_request', { request_user: id });
export const declineRequest = (id) => rpc('decline_admin_request', { request_user: id });
export const removeAdmin = (id) => rpc('remove_admin', { admin_user: id });
