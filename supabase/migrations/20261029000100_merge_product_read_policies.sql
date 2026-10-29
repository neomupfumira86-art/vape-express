-- One SELECT policy per role on products (Supabase advisor: multiple permissive policies).
-- Same access as before: visitors see visible products; admins see everything.
drop policy "Anyone can view visible products" on public.products;
drop policy "Admins can view all products" on public.products;
create policy "Visitors can view visible products" on public.products
  for select to anon using (active);
create policy "Signed-in users see visible products, admins see all" on public.products
  for select to authenticated using (active or (select private.is_admin()));
