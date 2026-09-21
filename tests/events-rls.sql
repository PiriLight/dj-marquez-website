-- Isolated PostgreSQL test ONLY. Run in a disposable database, never in Supabase.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, is_anonymous boolean default false, raw_app_meta_data jsonb, raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to authenticated, anon;
grant execute on function auth.uid() to authenticated, anon;
insert into auth.users values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','lachefbino@gmail.com',now(),false,'{}','{}'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','marquesandre112005@gmail.com',now(),false,'{}','{}'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','other@example.com',now(),false,'{"role":"admin"}','{}'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','lachefbino@gmail.com',null,false,'{"role":"admin"}','{}'),
 ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','outsider@example.com',now(),false,'{}','{"role":"admin"}');
\i /tmp/events.sql
insert into public.events(id,date,name,location,is_visible) values
 ('11111111-1111-4111-8111-111111111111','2026-09-21','Public fixture','Local',true),
 ('22222222-2222-4222-8222-222222222222','2026-09-22','Private fixture','Local',false);
-- Re-applying preserves rows.
\i /tmp/events.sql
set role anon;
do $$ begin
 if (select count(*) from public.events) <> 1 then raise exception 'anon read leak'; end if;
 begin insert into public.events(date,name,location) values('2026-01-01','bad','bad'); raise exception 'anon wrote'; exception when insufficient_privilege then null; end;
 begin perform private.is_event_admin(); raise exception 'anon helper exposed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',false);
do $$ declare changed integer; begin
 if (select count(*) from public.events) <> 1 then raise exception 'non-admin read leak'; end if;
 begin insert into public.events(date,name,location) values('2026-01-01','bad','bad'); raise exception 'third account wrote'; exception when insufficient_privilege then null; end;
 update public.events set name='bad'; get diagnostics changed=row_count; if changed<>0 then raise exception 'third account updated'; end if;
 delete from public.events; get diagnostics changed=row_count; if changed<>0 then raise exception 'third account deleted'; end if;
end $$;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
do $$ begin if private.is_event_admin() then raise exception 'unconfirmed admin'; end if; end $$;
select set_config('request.jwt.claim.sub','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',false);
do $$ begin if private.is_event_admin() then raise exception 'user metadata elevation'; end if; end $$;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
do $$ declare changed integer; begin
 if not private.is_event_admin() or (select count(*) from public.events)<>2 then raise exception 'approved admin denied'; end if;
 insert into public.events(id,date,name,location) values('99999999-9999-4999-8999-999999999999','2026-09-21','Test create','Local');
 update public.events set name='Test edited',is_visible=true where id='99999999-9999-4999-8999-999999999999'; get diagnostics changed=row_count; if changed<>1 then raise exception 'admin update failed'; end if;
 delete from public.events where id='99999999-9999-4999-8999-999999999999'; get diagnostics changed=row_count; if changed<>1 then raise exception 'admin delete failed'; end if;
end $$;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
do $$ begin if not private.is_event_admin() then raise exception 'second approved admin denied'; end if; end $$;
reset role;
update auth.users set email_confirmed_at=null where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
set role authenticated;
do $$ begin if private.is_event_admin() then raise exception 'unconfirmed email still authorized'; end if; end $$;
reset role;
select 'PASS: anon/read, third-account denial, two admins without app_metadata, CRUD, unconfirmed/forged metadata, confirmation revocation, idempotent SQL' as result;
