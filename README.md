# Personal OS — live, deployable version

A private command center: live **Gmail** + **Google Calendar**, plus Health, Exercise (PPL + running),
Nutrition (full macros), Study (AI/DevOps/System Design + curriculum), Goals and a 180-day plan calendar.
Built with Next.js 14 (App Router), TypeScript, NextAuth (Google) and Tailwind.

Personal logs are stored in your browser (localStorage). Gmail/Calendar are read live from your Google account.

---

## 1. Get Google credentials (~10 min, one-time)

1. Go to https://console.cloud.google.com/ and create a project (e.g. "Personal OS").
2. **APIs & Services → Library**: enable **Gmail API** and **Google Calendar API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External** → Create.
   - Fill App name + your email. Save.
   - **Scopes**: add `.../auth/gmail.readonly`, `.../auth/gmail.compose`, `.../auth/calendar.readonly`.
   - **Test users**: add your own Gmail address. (Keeping the app in **Testing** mode works instantly for you — no Google review needed.)
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Type: **Web application**.
   - Authorized redirect URIs — add BOTH:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://YOUR-VERCEL-URL/api/auth/callback/google`  (add after step 3 below; you can edit anytime)
   - Copy the **Client ID** and **Client secret**.

## 2. Run locally (optional)

```bash
npm install
cp .env.example .env.local     # fill in the 4 values
npm run dev                     # open http://localhost:3000
```
Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

## 3. Deploy to Vercel (~5 min)

1. Push this folder to a new GitHub repo (or use Vercel's "Upload" import).
2. On https://vercel.com → **Add New → Project → Import** the repo.
3. **Environment Variables** — add:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`  (the random string)
   - `NEXTAUTH_URL`  =  your Vercel URL, e.g. `https://personal-os-mohit.vercel.app`
4. **Deploy**. Open the URL, click **Sign in with Google**.
5. Go back to Google Cloud → Credentials → your OAuth client → add the Vercel callback URL
   (`https://YOUR-VERCEL-URL/api/auth/callback/google`) if you hadn't already. Redeploy if needed.

Done — open the URL on any device, sign in, and Gmail/Calendar sync live.

## Notes
- **Testing mode**: Google may ask you to re-consent periodically. Submitting for verification removes that.
- **Cross-device data**: trackers use localStorage (per browser). To sync logs across devices, add a database
  (Vercel Postgres / Supabase) and swap the `LS/SS` helpers in `components/Dashboard.tsx` for API calls — ask and I can add this.
- **Replies**: the Gmail tab saves replies as **drafts** in your Gmail (safe); open Gmail to send.

## Cross-device data sync (optional, Supabase)

By default your logs are saved per-browser. To sync them across every device you sign into:

1. Create a free project at https://supabase.com  → **New project**.
2. In the project, open **SQL Editor** and run:
   ```sql
   create table if not exists user_data (
     email text primary key,
     data jsonb,
     updated_at timestamptz default now()
   );
   ```
3. Go to **Project Settings → API** and copy:
   - **Project URL**  → env var `SUPABASE_URL`
   - **service_role** secret key  → env var `SUPABASE_SERVICE_ROLE_KEY`  (keep this secret; server-only)
4. In **Vercel → Settings → Environment Variables**, add both, then **Redeploy**.

Now signing in with the same Google account on any device pulls your data and pushes changes automatically.

## Strava integration (optional)
1. Create a free API app at https://www.strava.com/settings/api
   - Authorization Callback Domain: your Vercel domain (e.g. personal-os-teal-alpha.vercel.app)
2. Copy the Client ID and Client Secret into Vercel env: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET.
3. In Supabase SQL editor run:
   create table if not exists strava_tokens (email text primary key, access_token text, refresh_token text, expires_at bigint);
4. Redeploy. In the app: Exercise -> Cardio -> Connect Strava, then Sync now.
