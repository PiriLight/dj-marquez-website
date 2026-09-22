-- DJ-M4RQUEZ only: extend the confirmed-email allowlist with the approved
-- third administrator. Events data, policies, grants and Auth users are not changed.
create or replace function private.is_event_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
    where u.id = (select auth.uid())
      and lower(u.email) in (
        'lachefbino@gmail.com',
        'marquesandre112005@gmail.com',
        'afonsosantoscs@gmail.com'
      )
      and u.email_confirmed_at is not null
      and coalesce(u.is_anonymous, false) = false
  );
$$;
