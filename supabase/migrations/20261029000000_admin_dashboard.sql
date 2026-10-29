-- Vape Express admin dashboard: catalogue, site settings, admin accounts and image storage.
-- Run once in the Supabase SQL editor (or `supabase db push`). Safe to read top to bottom.

-- ── Admin accounts ────────────────────────────────────────────────────────────
-- A signed-in user is an admin only if their auth user id is listed here.
-- There are no insert/update/delete policies: admins are added from the SQL editor only.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
create policy "Admins can see their own admin row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.admins from anon;
revoke insert, update, delete on public.admins from authenticated;

-- Helper used by every write policy. Lives in a schema the API does not expose.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Products ──────────────────────────────────────────────────────────────────
create table public.products (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  brand text not null default '' check (char_length(brand) <= 60),
  category text not null default '' check (char_length(category) <= 80),
  description text not null default '' check (char_length(description) <= 1200),
  price numeric(10, 2) check (price is null or (price > 0 and price < 100000)),  -- null = price to confirm
  puffs integer check (puffs is null or (puffs > 0 and puffs < 1000000)),
  nicotine text not null default '' check (char_length(nicotine) <= 30),       -- default for every flavour; 'CONFIRM' = unverified
  flavours jsonb not null default '[]'::jsonb check (jsonb_typeof(flavours) = 'array'),  -- [{name, nicotine, available}]
  image text not null default '' check (char_length(image) <= 500),
  hero_image text check (hero_image is null or char_length(hero_image) <= 500),
  in_stock boolean not null default true,
  active boolean not null default true,      -- false = hidden from the public store
  featured boolean not null default false,
  is_new boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_public_order on public.products (sort_order, name) where active;
create trigger products_touch before update on public.products
  for each row execute function private.touch_updated_at();

alter table public.products enable row level security;
create policy "Anyone can view visible products" on public.products
  for select to anon, authenticated using (active);
create policy "Admins can view all products" on public.products
  for select to authenticated using ((select private.is_admin()));
create policy "Admins can add products" on public.products
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins can edit products" on public.products
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete products" on public.products
  for delete to authenticated using ((select private.is_admin()));
revoke insert, update, delete, truncate on public.products from anon;

-- Owner-only notes (e.g. "price read from a cut-off graphic"). Never readable by the public.
create table public.product_notes (
  product_id text primary key references public.products (id) on delete cascade on update cascade,
  notes text not null default '' check (char_length(notes) <= 2000),
  updated_at timestamptz not null default now()
);
create trigger product_notes_touch before update on public.product_notes
  for each row execute function private.touch_updated_at();
alter table public.product_notes enable row level security;
create policy "Admins manage product notes" on public.product_notes
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
revoke all on public.product_notes from anon;

-- ── Site settings (one row) ───────────────────────────────────────────────────
-- business:        { tagline, whatsappDisplay, whatsappNumber, instagramHandle, instagramUrl }
-- delivery:        { area, fees, areas, times, collection, minimumOrder, openingHours, returns, warranty }
-- payment_methods: [{ id, label, enabled, confirmed }]
-- The text '[CONFIRM WITH OWNER]' is shown on the site as a "Confirm with owner" tag.
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  business jsonb not null default '{}'::jsonb check (jsonb_typeof(business) = 'object'),
  delivery jsonb not null default '{}'::jsonb check (jsonb_typeof(delivery) = 'object'),
  payment_methods jsonb not null default '[]'::jsonb check (jsonb_typeof(payment_methods) = 'array'),
  updated_at timestamptz not null default now()
);
create trigger site_settings_touch before update on public.site_settings
  for each row execute function private.touch_updated_at();
alter table public.site_settings enable row level security;
create policy "Anyone can read site settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "Admins can edit site settings" on public.site_settings
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
revoke insert, update, delete, truncate on public.site_settings from anon;
revoke insert, delete, truncate on public.site_settings from authenticated;

-- ── Product image storage ─────────────────────────────────────────────────────
-- Public bucket: anyone can view an image by its URL, nobody but admins can list,
-- upload, replace or delete. Images only, 5 MB max.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can list product images" on storage.objects
  for select to authenticated using (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins can replace product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (select private.is_admin()))
  with check (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select private.is_admin()));
