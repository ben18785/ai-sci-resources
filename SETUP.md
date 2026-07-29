# Going live — free backend + free hosting (≈15 minutes)

The site works out of the box in **demo mode** (votes stay in each visitor's
browser, no login). To make votes and suggestions shared between all
visitors — with GitHub/Google sign-in and one-person-one-vote — connect the
free Supabase backend, then host the site for free.

**Identity model once live:** anyone can browse the rankings without an
account. To vote or suggest, visitors sign in with GitHub or Google; on first
sign-in they fill in their academic background (field + career stage), which
is saved to their profile and attached to every vote they cast. Votes sync
across their devices and each person can vote once per resource.

## Step 1 — Create the free Supabase project (~5 min)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign up
   (GitHub login is easiest). The **Free plan is enough** — no card needed.
2. Click **New project**, give it a name (e.g. `ai-sci-resources`), set any
   strong database password (you won't need it day-to-day), pick a region near
   your users (e.g. London), and create it.
3. Wait ~1 minute for the project to provision.

## Step 2 — Create the tables

1. In the left sidebar choose **SQL Editor** → **New query**.
2. Open `supabase-setup.sql` from this folder, paste its entire contents, and
   click **Run**. You should see "Success".
3. Then do the same with `seed-resources.sql` to load the starting resource
   list. (Run it once only, or you'll get duplicates.)

## Step 3 — Turn on GitHub and Google sign-in

Voting and suggesting require sign-in (browsing doesn't). Enable one or both
providers — GitHub is the quickest; do Google too if your audience may not
have GitHub accounts.

**GitHub (~5 min)**

1. In Supabase: **Authentication → Sign In / Up → Auth Providers → GitHub** — keep this
   page open; it shows the **callback URL** you'll need (like
   `https://<ref>.supabase.co/auth/v1/callback`).
2. On GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Application name: `AI in Science resources` (anything you like)
   - Homepage URL: your site's URL (or `http://localhost` for now)
   - Authorization callback URL: paste the callback URL from Supabase
3. Register it, then **Generate a new client secret**. Copy the **Client ID**
   and **Client Secret** into the Supabase GitHub provider form, toggle it
   **Enabled**, and save.

**Google (~10 min)**

1. In Supabase: **Authentication → Sign In / Up → Auth Providers → Google** — copy the
   callback URL shown.
2. At [console.cloud.google.com](https://console.cloud.google.com): create a
   project → **APIs & Services → OAuth consent screen** (External, fill in the
   app name + your email, add no scopes beyond the defaults) → **Credentials →
   Create credentials → OAuth client ID → Web application**.
   - Authorized redirect URI: paste the Supabase callback URL
3. Copy the **Client ID** and **Client Secret** into the Supabase Google
   provider form, toggle **Enabled**, and save.

**Finally**, tell Supabase where your site lives: **Authentication → URL
Configuration → Site URL** — set it to your deployed site address (you can
update this after Step 5, and add extra addresses under Redirect URLs for
testing).

## Step 4 — Connect the site to your project

1. In your Supabase project, click the **Connect** button at the top of the
   dashboard — it shows the **Project URL** and API key together. (Or via the
   gear icon: **Project Settings → Data API** for the URL and **Project
   Settings → API Keys** for the key.)
2. Copy the **Project URL** and the **publishable** key (`sb_publishable_…`).
   The older "Legacy API Keys → anon" JWT also works, but it's deprecated
   from the end of 2026, so prefer the publishable one.
3. Open `index.html` in a text editor, find the CONFIG block near the bottom:

   ```js
   const SUPABASE_URL      = "";
   const SUPABASE_ANON_KEY = "";
   ```

   and paste your two values between the quotes (the publishable key goes in
   `SUPABASE_ANON_KEY`). Save.

   > The publishable/anon key is designed to be public — access is controlled
   > by the row-level security rules the SQL script set up, so publishing it
   > in the page is safe and normal. (OAuth *client secrets* from GitHub and
   > Google are different: those stay private, only ever pasted into the
   > Supabase provider forms.)

## Step 5 — Host it for free

Easiest: **GitHub Pages**

1. Create a free account at [github.com](https://github.com) if needed.
2. Create a new **public** repository (e.g. `ai-sci-resources`).
3. Upload `index.html` (and optionally `seed-data.js`, though live mode
   doesn't use it) via **Add file → Upload files**.
4. In the repo: **Settings → Pages → Source: Deploy from a branch**, pick
   `main` and `/ (root)`, save.
5. After a minute your site is live at
   `https://<your-username>.github.io/ai-sci-resources/` — share that link.

Alternatives that are equally free: [Netlify](https://netlify.com) or
[Vercel](https://vercel.com) (drag-and-drop the folder), or any static host.

## Moderating suggestions (optional)

By default, suggested resources appear immediately. If you'd rather approve
them first, run this once in the SQL Editor:

```sql
alter table resources alter column approved set default false;
```

New suggestions then wait invisibly until you set `approved = true` in
**Table Editor → resources**.

## Free-tier limits (plenty for this use)

Supabase free tier: 500 MB database, 50k monthly active users, pauses after
1 week with zero traffic (it wakes automatically on the next visit, or keep it
active by visiting weekly). GitHub Pages: 100 GB bandwidth/month. For a
community voting site this is effectively unlimited.

## How the personalised ranking works

Every vote is stored with the voter's (anonymous) field and career stage.
For the "For you" tab, each vote is weighted for the current viewer:

| Vote comes from… | Weight |
|---|---|
| any voter | 1.0 |
| + same broad field as you | +1.0 |
| + a related field group (e.g. Life sciences ↔ Medicine) | +0.4 |
| + same career stage | +0.5 |

So a resource loved by people with your background outranks one with more
votes overall. "Most upvoted" shows the raw count; badges show how many votes
came from your own field. Tweak the weights in `index.html`
(`W_BASE`, `W_SAME_FIELD`, `W_RELATED_FIELD`, `W_SAME_STAGE`).
