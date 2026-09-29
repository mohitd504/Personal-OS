-- Stores the Google refresh token so sign-in skips the consent screen after the first time.
-- Run once in Supabase → SQL Editor (paste this text, then Run). Safe to run again.
create table if not exists google_tokens (
  email text primary key,
  refresh_token text not null,
  updated_at timestamptz default now()
);
-- Only the server (service role key) can read or write it.
alter table google_tokens enable row level security;
