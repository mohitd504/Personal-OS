-- Per-key sync for user_data (used by app/api/sync/route.ts).
-- Run once in Supabase → SQL Editor: open this file, copy ALL of its text, paste, Run.
-- Safe to run more than once. Existing data is kept as-is.

-- key_times: { "<pos_key>": { "t": <client edit time ms>, "s": <server receive time ms> } }
--   t decides which edit wins (newest edit per key)
--   s drives the change feed ("what changed since my last pull")
alter table user_data add column if not exists key_times jsonb not null default '{}'::jsonb;

-- p_changes: { "<pos_key>": { "v": "<string value>", "t": <client edit time ms> } }
-- Applies each change whose t is >= the stored t. Returns the server time and, for
-- any rejected (older) change, the current server value so the client can catch up.
create or replace function sync_push(p_email text, p_changes jsonb)
returns jsonb
language plpgsql
as $$
declare
  now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  d jsonb;
  kt jsonb;
  k text;
  c jsonb;
  incoming_t bigint;
  rejected jsonb := '{}'::jsonb;
begin
  insert into user_data (email, data, key_times, updated_at)
  values (p_email, '{}'::jsonb, '{}'::jsonb, now())
  on conflict (email) do nothing;

  select coalesce(data, '{}'::jsonb), coalesce(key_times, '{}'::jsonb) into d, kt
  from user_data where email = p_email for update;

  for k, c in select * from jsonb_each(p_changes) loop
    incoming_t := coalesce((c->>'t')::bigint, 0);
    if incoming_t >= coalesce((kt->k->>'t')::bigint, 0) then
      d := d || jsonb_build_object(k, c->'v');
      kt := kt || jsonb_build_object(k, jsonb_build_object('t', incoming_t, 's', now_ms));
    else
      rejected := rejected || jsonb_build_object(k, jsonb_build_object('v', d->k, 't', (kt->k->>'t')::bigint));
    end if;
  end loop;

  update user_data set data = d, key_times = kt, updated_at = now() where email = p_email;
  return jsonb_build_object('now', now_ms, 'rejected', rejected);
end;
$$;

-- Returns keys received by the server after p_since (server ms). p_since < 0 = everything.
create or replace function sync_pull(p_email text, p_since bigint)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'now', (extract(epoch from clock_timestamp()) * 1000)::bigint,
    'changes', coalesce(
      jsonb_object_agg(k, jsonb_build_object('v', u.data->k, 't', coalesce((u.key_times->k->>'t')::bigint, 0))),
      '{}'::jsonb)
  )
  from user_data u
  cross join lateral jsonb_object_keys(coalesce(u.data, '{}'::jsonb)) as k
  where u.email = p_email
    and (p_since < 0 or coalesce((u.key_times->k->>'s')::bigint, 0) > p_since);
$$;

revoke execute on function sync_push(text, jsonb) from public, anon, authenticated;
revoke execute on function sync_pull(text, bigint) from public, anon, authenticated;
