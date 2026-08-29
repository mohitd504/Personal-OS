# Personal OS — Project Handoff & Context

A single-user (multi-user capable) life-management web app: health, exercise, nutrition, study, a 3-course study planner, a 45-day English fluency coach, Gmail/Calendar, and AI helpers. This document gives a new AI assistant (ChatGPT, Cursor, etc.) everything needed to continue development.

## How to continue in a new tool
1. Open the folder `personal-os-app` in your tool (it's a normal Next.js 14 App Router + TypeScript project).
2. Install deps: `npm install`. Run locally: `npm run dev`.
3. To edit AI behaviour, change the `app/api/*/route.ts` files. To edit UI, change `components/*.tsx`.
4. To deploy: `git push` then `npx vercel --prod` (see Deploy).
5. Current build marker: **build 96** (shown top-right in the app; bump the `build&nbsp;NN` string in `components/Dashboard.tsx` on each deploy to verify it went live).

## Tech stack
- Next.js 14 (App Router), React, TypeScript.
- Styling: custom CSS in `app/globals.css` (dark theme, CSS variables) — minimal Tailwind.
- Auth: NextAuth (Auth.js) Google provider (`lib/auth.ts`). Scopes: openid, email, profile, gmail.readonly, gmail.compose, calendar.readonly.
- AI: OpenAI (ChatGPT) — `lib/llm.ts` → `askLLM(system,user,maxTokens)` and `askLLMImage(...)`. Model `gpt-4o-mini` (env `OPENAI_MODEL` to override). Falls back to Anthropic if only `ANTHROPIC_API_KEY` is set.
- Storage/sync: browser `localStorage` (all keys prefixed `pos_`) mirrored to **Supabase** per user email via `app/api/sync/route.ts` + `components/SyncManager.tsx` (table `user_data(email text pk, data jsonb, updated_at)`).
- Hosting: Vercel (Hobby). PWA (`app/manifest.ts`, icons in `public/`).

## Environment variables (set in Vercel → Settings → Environment Variables)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` — NextAuth Google login (Gmail/Calendar).
- `OPENAI_API_KEY` (and optional `OPENAI_MODEL`) — all AI features. (Or `ANTHROPIC_API_KEY`.)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — cross-device sync.
- `GHEALTH_CLIENT_ID`, `GHEALTH_CLIENT_SECRET` — separate Google project for Google Health (Fitbit) steps/HR/sleep.
- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` — Strava import.

## Components
- `components/Dashboard.tsx` — the app shell + MOST views: sidebar nav, Home, Health, Nutrition, Study, **English** (45-day fluency: lesson, speaking coach with scenarios + voice, essay check, shadowing drill, pronunciation, spelling), **Goals** (the big daily planner: exercise sessions, meals with AI macros, study courses with timers, journal, 10-day outlooks with AI edit, skip/rest, undo, course start anchor), Gmail, Calendar, Goals, Settings. Also the 3 seeded courses (Agentic AI 15d, System Design 20d, DSA/Abdul Bari 45d) and per-day PDFs.
- `components/Fitness.tsx` — the Exercise tab: **PlanWorkout** (loads today's plan from Goals, per-set logging, per-exercise save→summary, submit → AI report → next workout → schedule back to Goals; skip/rest/move-forward; workout history), Strava view, Google Health card (sync today or a past day up to 15 days back).
- `components/SyncManager.tsx` — pushes all `pos_*` keys to Supabase (debounced) and pulls on load/focus/every 30s.
- `components/Assistant.tsx` — global ✨ assistant chat.

## API routes (app/api/*)
- Auth/data: `auth`, `sync`.
- Google: `gmail`, `calendar`, `ghealth/{connect,callback,steps,activities,range}`, `gh-activity`, `fitbit/*` (legacy), `strava/{connect,callback,sync}`.
- AI (OpenAI): `assistant`, `nutrition`, `parse-activity`, `plan-nutrition`, `exercise`, `next-workout`, `workout-report`, `workout-options`, `edit-workout`, `plan-edit`, `food-photo`, `study-path`, `course-plan`, `notes`, `code`, `proofread`, `english-lesson`, `english-chat`, `english-feedback`, `english-drill`, `drill-review`, `essay-check`, `word-set`.

## Data model (localStorage keys, all `pos_`-prefixed, synced to Supabase)
- `pos_settings` — profile & goals. `pos_health` — today's watch metrics. `pos_ghealth` — daily watch history (180d). `pos_gh_acts` — watch activities. `pos_sleep`, `pos_walks`, `pos_cardio`, `pos_weightlog`, `pos_workouts` (with planned vs actual), `pos_strava`.
- `pos_nutri_<date>` — meals+water per day. `pos_plan_<date>` — the Goals daily plan `{exSessions, meals{breakfast,lunch,dinner}, studyList[], journal}`.
- `pos_course_start` — fixed course anchor date; `pos_seed_all` — seed flag. Courses seed relative to `pos_course_start`, idempotent (fill missing days, never wipe progress).
- English: `pos_eng_start`, `pos_eng_<date>` (lesson/chat/essay/report), `pos_engdrill_<date>`, `pos_engpron_<date>`, `pos_engspell_<date>`.
- `pos_curriculum`, study minutes, etc.

## Deploy
1. `git add . && git commit -m "..." && git push` (repo has a GitHub remote; Vercel auto-deploy is unreliable so also run step 2).
2. `npx vercel --prod` (login once with `npx vercel login`). Live URL: `https://personal-os-teal-alpha.vercel.app`.
3. Confirm the top-bar build marker matches what you set. Hard-refresh (Ctrl+Shift+R) — it's a PWA and caches.
- New API route files must be committed for their features to work (a 404 on `/api/...` means the route wasn't deployed).
- Course PDFs live in `public/course/*.pdf` (80 files) and must be committed.

## Notes / known limitations
- Speaking/pronunciation uses the browser Web Speech API (best in Chrome/Edge); voice + recognizer set to Indian English `en-IN`. Pronunciation feedback is inferred from the speech-to-text transcript, not raw-audio phonemes.
- Public launch: data is already per-user (keyed by email). Blocker to open sign-up = Google OAuth verification because of Gmail/Calendar sensitive scopes (100-user cap + "unverified" warning until verified). Option: reduce login to email/profile only (no verification) and make Gmail/Calendar optional connects.
- AI cost: all AI runs on the owner's `OPENAI_API_KEY`. For public use, add a per-user key field or usage limits.
- Vercel Hobby: personal/non-commercial, 100 deploys/day, function timeout — long AI generations can 504; keep prompts reasonable.
