-- Admin sign-up with approval.
-- Anyone can create an account on /admin, but it has no rights: it becomes an
-- access request that an existing admin approves or declines in the dashboard.

-- Every new auth account is recorded as a pending request.
create table public.admin_requests (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
alter table public.admin_requests enable row level security;
create policy "Admins can see access requests" on public.admin_requests
  for select to authenticated using ((select private.is_admin()));
create policy "Requesters can see their own request" on public.admin_requests
  for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.admin_requests from anon;
revoke insert, update, delete, truncate on public.admin_requests from authenticated;

create or replace function private.record_admin_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.admins where user_id = new.id) then
    insert into public.admin_requests (user_id, email) values (new.id, coalesce(new.email, ''))
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.record_admin_request() from public;
create trigger on_auth_user_created_record_request
  after insert on auth.users
  for each row execute function private.record_admin_request();

-- Admins can see the whole team (previously: only their own row).
drop policy "Admins can see their own admin row" on public.admins;
create policy "Admins see the team, others only themselves" on public.admins
  for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));

-- Approve: make the account an admin. The approving admin vouches for the
-- address, so it is marked confirmed (lets them sign in even if the
-- confirmation email never arrived).
create or replace function public.approve_admin_request(request_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  req_email text;
begin
  if not private.is_admin() then
    raise exception 'Only admins can approve access requests' using errcode = '42501';
  end if;
  select email into req_email from public.admin_requests where user_id = request_user;
  if req_email is null then
    raise exception 'That request no longer exists' using errcode = 'P0002';
  end if;
  insert into public.admins (user_id, email) values (request_user, req_email) on conflict (user_id) do nothing;
  update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = request_user;
  delete from public.admin_requests where user_id = request_user;
end;
$$;

-- Decline: delete the request and the account behind it.
create or replace function public.decline_admin_request(request_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can decline access requests' using errcode = '42501';
  end if;
  if exists (select 1 from public.admins where user_id = request_user) then
    raise exception 'That account is already an admin' using errcode = '42501';
  end if;
  delete from auth.users where id = request_user;
end;
$$;

-- Remove another admin (you can't remove yourself, so the store always keeps one).
create or replace function public.remove_admin(admin_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can remove admins' using errcode = '42501';
  end if;
  if admin_user = (select auth.uid()) then
    raise exception 'You can’t remove your own admin access' using errcode = '42501';
  end if;
  delete from public.admins where user_id = admin_user;
  delete from auth.users where id = admin_user;
end;
$$;

revoke all on function public.approve_admin_request(uuid) from public, anon;
revoke all on function public.decline_admin_request(uuid) from public, anon;
revoke all on function public.remove_admin(uuid) from public, anon;
grant execute on function public.approve_admin_request(uuid) to authenticated;
grant execute on function public.decline_admin_request(uuid) to authenticated;
grant execute on function public.remove_admin(uuid) to authenticated;
