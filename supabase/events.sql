-- Minimal DJ M4rquez events store.
-- Run once in the Supabase SQL editor, then create one Auth user and set
-- app_metadata.role to "admin" through a trusted Dashboard/Admin API flow.

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
  constraint events_info_url_http check (
    info_url is null or info_url ~* '^https?://'
  )
);

alter table public.events enable row level security;

-- Supabase no longer guarantees automatic Data API grants for new tables.
-- Keep the public role read-only and give authenticated users only the verbs
-- that the admin editor needs; RLS below still authorizes every row.
revoke all on table public.events from anon, authenticated;
grant select on table public.events to anon, authenticated;
grant select, insert, update on table public.events to authenticated;

drop policy if exists "Public can read visible events" on public.events;
create policy "Public can read visible events"
on public.events for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "Admins can read all events" on public.events;
create policy "Admins can read all events"
on public.events for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can insert events" on public.events;
create policy "Admins can insert events"
on public.events for insert
to authenticated
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events"
on public.events for update
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.events (id, date, name, location, info_url, is_visible, sort_order)
values (
  '13c7bfa8-5d7f-4e40-9f2c-18d3ff32c2a1',
  '26 AGO 2026',
  'Midnight',
  'Marteleira',
  null,
  true,
  0
)
on conflict (id) do nothing;
