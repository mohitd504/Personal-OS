-- Daily AI usage counter used by lib/api-security.ts (guardAiRequest).
-- Run once in Supabase → SQL Editor. Free tier is plenty: one row per user per day.
create table if not exists ai_usage (
  email text not null,
  day date not null,
  count integer not null default 0,
  primary key (email, day)
);

-- Only the server (service role key) touches this table.
alter table ai_usage enable row level security;

-- Atomically increments today's count and returns the new value.
create or replace function increment_ai_usage(p_email text, p_day date)
returns integer
language sql
as $$
  insert into ai_usage (email, day, count) values (p_email, p_day, 1)
  on conflict (email, day) do update set count = ai_usage.count + 1
  returning count;
$$;

revoke execute on function increment_ai_usage(text, date) from public, anon, authenticated;

-- Optional housekeeping: keep 90 days of history.
-- delete from ai_usage where day < current_date - 90;
