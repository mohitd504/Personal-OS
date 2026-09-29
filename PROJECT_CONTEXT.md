# Personal OS — Project Handoff & Context

A single-user (multi-user capable) life-management web app: health, exercise, nutrition, study, a 3-course study planner, a 45-day English fluency coach, Gmail/Calendar, and AI helpers. This document gives a new AI assistant (ChatGPT, Cursor, Claude, etc.) everything needed to continue development.

## How to continue in a new tool
1. Clone the repo (default branch: `master`). It's a normal Next.js 14 App Router + TypeScript project.
2. Install deps: `npm install`. Run locally: `npm run dev`. Before pushing: `npm run check` (lint + typecheck + tests) and `npm run build`. CI runs both on every push.
3. To edit AI behaviour, change the `app/api/*/route.ts` files. To edit UI, find the tab under `components/dashboard/views/` or `components/fitness/` (see Components).
4. To deploy: `git push` then `npx vercel --prod` (see Deploy).
5. Build marker: shown top-right in the app (currently **build 112**). Bump the `build&nbsp;NN` string in `components/Dashboard.tsx` on each deploy to verify it went live.

## Tech stack
- Next.js 14 (App Router), React, TypeScript.
- Styling: custom CSS in `app/globals.css` (dark theme, CSS variables) — minimal Tailwind.
- Auth: NextAuth (Auth.js) Google provider (`lib/auth.ts`). Scopes: openid, email, profile, gmail.readonly, gmail.compose, calendar.readonly.
- AI: OpenAI (ChatGPT) — `lib/llm.ts` → `askLLM(system, user, maxTokens, { json })` and `askLLMImage(...)`. Model `gpt-4o-mini` (env `OPENAI_MODEL` to override). Falls back to Anthropic if only `ANTHROPIC_API_KEY` is set. 25 s timeout, one retry on 429/5xx, failures logged; `{ json: true }` turns on OpenAI JSON mode.
- Storage/sync: browser `localStorage` (all keys prefixed `pos_`) synced per key to **Supabase** per user email (see Sync).
- Tests: Vitest (`tests/`).
- Hosting: Vercel (Hobby). PWA (`app/manifest.ts`, icons in `public/`).

## Environment variables (set in Vercel → Settings → Environment Variables)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` — NextAuth Google login (Gmail/Calendar).
- `OPENAI_API_KEY` (and optional `OPENAI_MODEL`) — all AI features. (Or `ANTHROPIC_API_KEY`.)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — cross-device sync and AI usage counters.
- `GHEALTH_CLIENT_ID`, `GHEALTH_CLIENT_SECRET` — separate Google project for Google Health (Fitbit watch) steps/HR/sleep/activities.
- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` — Strava import.
- Optional limits: `AI_RATE_LIMIT_PER_DAY` (default 200, per user across all AI routes), `AI_RATE_LIMIT_PER_MINUTE` (default 12, per route), `LLM_TIMEOUT_MS` (default 25000).

## Components
- `components/Dashboard.tsx` — app shell only: sidebar nav, top bar (clock, date picker, build marker), error boundary, and the view switch.
- `components/dashboard/views/` — one file per tab:
  - `Home`, `Health`, `Nutrition`, `Calendar` (incl. 120-day plan calendar), `Settings`.
  - `Study` — study tab + curriculum; uses `StudyDashboard` and the Goals planner in study mode.
  - `English` — 45-day fluency coach: lesson, speaking coach with scenarios + voice, essay check, shadowing drill, pronunciation, spelling.
  - `Goals` — the big daily planner (`GoalPlanner`): exercise sessions, meals with AI macros, study courses with timers, journal, 10-day outlooks with AI edit, skip/rest, undo, course start anchor; plus `CoursePlanner`.
- `components/dashboard/data.tsx` — storage helpers (`LS`/`SS`), settings defaults, the 3 seeded courses (Agentic AI 15d, System Design 20d, DSA 45d from S. K. Srivastava's *Data Structures Through C in Depth*), workout plan seeding, markdown→HTML, misc helpers.
- `components/dashboard/ui.tsx` — small shared UI (`Chip`, `Kpi`, `Head`, `Bar`, `MiniTimer`, `PRow`). `lazy.tsx` — tabs and charts loaded on demand with `next/dynamic`.
- `components/Fitness.tsx` — Exercise tab shell. Screens in `components/fitness/`:
  - `PlanWorkout` — loads today's plan from Goals, per-set logging, per-exercise save→summary, submit → AI report → next workout → schedule back to Goals; skip/rest/move-forward; workout history.
  - `GoogleHealth` — Google Health card + board (sync today or a past day up to 15 days back). `StravaView`, `SleepBoard`.
  - `data.ts` / `ui.tsx` — helpers and chart/layout pieces.
- `components/features/` — `TodayView` (default tab), `WeeklyReview`, `ReminderCenter`, `DataControls` (export/restore backup), and the Study / Exercise / Nutrition / English / Gmail workspaces.
- `components/charts.tsx` — recharts cards (loaded on demand). `components/Assistant.tsx` — global ✨ assistant chat. `components/SyncManager.tsx` — sync client.
- `lib/exercise-guide.ts` — exercise emoji, how-to text and demo links shared by Goals and PlanWorkout.

## API routes (app/api/*)
- Auth/data: `auth`, `sync`.
- Google: `gmail`, `gmail/draft`, `calendar`, `ghealth/{connect,callback,steps,activities,range}`, `strava/{connect,callback,sync}`.
- AI (all go through `guardAiRequest` in `lib/api-security.ts`: sign-in, size, per-minute and daily limits): `assistant`, `nutrition`, `parse-activity`, `gh-activity`, `plan-nutrition`, `exercise`, `next-workout`, `workout-report`, `workout-options`, `edit-workout`, `plan-edit`, `food-photo`, `study-path`, `study-quiz`, `study-assistant`, `course-plan`, `notes`, `code`, `proofread`, `english-lesson`, `english-chat`, `english-feedback`, `english-drill`, `drill-review`, `essay-check`, `word-set`, `gmail-assistant`.

## Sync
- `components/SyncManager.tsx` + `app/api/sync/route.ts` + pure logic in `lib/sync-core.ts`.
- Per-key last-write-wins: each `pos_*` key has its own edit time; push sends only edited keys, pull fetches only keys the server received since the last pull (`GET /api/sync?since=`). Pending edits persist in `possync_meta` (not synced, not exported) so they survive reloads.
- Supabase: table `user_data(email pk, data jsonb, key_times jsonb, updated_at)` + functions `sync_push` / `sync_pull` from `supabase/sync_v2.sql`. Without those functions the route falls back to read-merge-write (still safe, just sends everything).
- AI daily usage: table `ai_usage` + function `increment_ai_usage` from `supabase/ai_usage.sql`.
- New Supabase SQL: paste the file **contents** into Supabase → SQL Editor and Run (both files are re-runnable).

## Data model (localStorage keys, all `pos_`-prefixed, synced to Supabase)
- `pos_settings` — profile & goals. `pos_health` — today's watch metrics. `pos_ghealth` — daily watch history (180d). `pos_gh_acts` — watch activities. `pos_sleep`, `pos_walks`, `pos_cardio`, `pos_weightlog`, `pos_workouts` (with planned vs actual), `pos_strava`.
- `pos_nutri_<date>` — meals+water per day. `pos_plan_<date>` — the Goals daily plan `{exSessions, meals{breakfast,lunch,dinner}, studyList[], journal}`.
- `pos_course_start` — fixed course anchor date; `pos_seed_all` — seed flag. Courses seed relative to `pos_course_start`, idempotent (fill missing days, never wipe progress).
- English: `pos_eng_start`, `pos_eng_<date>` (lesson/chat/essay/report), `pos_engdrill_<date>`, `pos_engpron_<date>`, `pos_engspell_<date>`.
- `pos_reminders`, `pos_data_version`, `pos_curriculum`, study minutes, etc.

## Deploy
1. `git add . && git commit -m "..." && git push` (Vercel auto-deploy is unreliable so also run step 2).
2. `npx vercel --prod` (login once with `npx vercel login`). Live URL: `https://personal-os-teal-alpha.vercel.app`.
3. Confirm the top-bar build marker matches what you set. Hard-refresh (Ctrl+Shift+R) — it's a PWA and caches.
- New API route files must be committed for their features to work (a 404 on `/api/...` means the route wasn't deployed).
- Course PDFs live in `public/course/*.pdf` (80 files) and must be committed.

## Notes / known limitations
- Speaking/pronunciation uses the browser Web Speech API (best in Chrome/Edge); voice + recognizer set to Indian English `en-IN`. Pronunciation feedback is inferred from the speech-to-text transcript, not raw-audio phonemes.
- Public launch: data is already per-user (keyed by email). Blocker to open sign-up = Google OAuth verification because of Gmail/Calendar sensitive scopes (100-user cap + "unverified" warning until verified). Option: reduce login to email/profile only (no verification) and make Gmail/Calendar optional connects.
- AI cost: all AI runs on the owner's `OPENAI_API_KEY`, capped per user per day by `AI_RATE_LIMIT_PER_DAY`. For public use, add a per-user key field or lower the limit.
- Sync does not propagate deletions (nothing in the app removes `pos_*` keys today).
- Vercel Hobby: personal/non-commercial, 100 deploys/day, function timeout — long AI generations can 504; keep prompts reasonable.
