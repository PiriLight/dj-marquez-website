-- Historical migration applied to PiriLight Studio / DJ-M4RQUEZ.
-- The following migration replaces only the metadata requirement in the helper.
begin;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  name text not null,
  location text not null,
  info_url text,
  is_visible boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_info_url_http check (info_url is null or info_url ~* '^https?://')
);

do $$
begin
  if exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'events'
    and policyname not in ('Public can read visible events', 'Admins can read all events',
      'Admins can insert events', 'Admins can update events', 'Admins can delete events')
  ) then raise exception 'Unknown events policies: inspect before applying this script.';
  end if;
end $$;

create schema if not exists private;
grant usage on schema private to authenticated;
create or replace function private.is_event_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
    where u.id = (select auth.uid())
      and lower(u.email) in ('lachefbino@gmail.com', 'marquesandre112005@gmail.com')
      and u.email_confirmed_at is not null
      and coalesce(u.is_anonymous, false) = false
      and u.raw_app_meta_data ->> 'role' = 'admin'
  );
$$;
revoke all on function private.is_event_admin() from public, anon;
grant execute on function private.is_event_admin() to authenticated;

alter table public.events enable row level security;
revoke all on table public.events from anon, authenticated;
grant select on table public.events to anon, authenticated;
grant insert, update, delete on table public.events to authenticated;

drop policy if exists "Public can read visible events" on public.events;
create policy "Public can read visible events" on public.events for select
  to anon, authenticated using (is_visible = true);
drop policy if exists "Admins can read all events" on public.events;
create policy "Admins can read all events" on public.events for select
  to authenticated using ((select private.is_event_admin()));
drop policy if exists "Admins can insert events" on public.events;
create policy "Admins can insert events" on public.events for insert
  to authenticated with check ((select private.is_event_admin()));
drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events" on public.events for update
  to authenticated using ((select private.is_event_admin()))
  with check ((select private.is_event_admin()));
drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events" on public.events for delete
  to authenticated using ((select private.is_event_admin()));

commit;
