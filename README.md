# Team UP4S

Website for UP4S, a Metro Detroit nonprofit that uses film and art to steer young people away from street violence. Visitors can donate, refer a child, browse the gallery and follow fundraising events; staff manage everything from an admin dashboard.

Vite + React on the frontend. [Supabase](https://supabase.com) provides the database, file storage, admin login and the Stripe edge functions.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL and anon key
npm run dev
```

`npm run build` produces the static site in `dist/`.

## Project layout

```
src/
  api/           supabaseClient, entities (table access), integrations (uploads), functions (Stripe)
  lib/auth.jsx   session + admin check, <RequireAdmin> route guard
  pages/         one component per route; index.jsx is the router
  components/    admin/, donation/, gallery/, ui/ (shadcn)
supabase/
  migrations/    database schema, row level security, storage buckets
  functions/     create-stripe-checkout, stripe-webhook (Deno edge functions)
```

## Setting up Supabase

1. Create a project, then link it and apply the schema with the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started):

   ```bash
   supabase link --project-ref <project-ref>
   supabase db push
   ```

2. **Auth**: under Authentication → URL Configuration, set the Site URL to the deployed site and add `http://localhost:5173/**` to the redirect URLs. Under Authentication → Providers → Email, turn off "Allow new users to sign up": admin accounts are created by hand.

3. **Add an admin**: Authentication → Users → Add user (enter their email), then in the SQL editor:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'person@example.org';
   ```

   They sign in at `/Login` with their email and password, or with an emailed link. To set or reset a
   password without email, run this in the SQL editor (the password never leaves Supabase):

   ```sql
   update auth.users
   set encrypted_password = extensions.crypt('choose-a-strong-password', extensions.gen_salt('bf', 10))
   where email = 'person@example.org';
   ```

   Emailed links only work once the Site URL and Redirect URLs (step 2) are set. Supabase's built-in email is rate-limited to a few messages an hour; configure a custom SMTP provider for production.

4. **Stripe**: set the function secrets and deploy the functions:

   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_... SITE_URL=https://www.teamup4s.org,https://teamup4s.org,https://up4s.vercel.app
   supabase functions deploy create-stripe-checkout
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```

   `SITE_URL` is a comma-separated list of the addresses the site is served from. Stripe only sends donors back to one of these; the first is the default.

   In the Stripe dashboard, add a webhook endpoint at `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` for the events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` and `invoice.paid`, then set its signing secret:

   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Deploying to Vercel

`vercel.json` configures the build and serves `index.html` for every route (React Router handles routing in the browser).

1. Import the repository in Vercel (Add New → Project). Framework and build settings come from `vercel.json`.
2. Add the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (use the legacy `eyJ…` anon key; the checkout function's JWT check doesn't accept `sb_publishable_…` keys).
3. Under Settings → Deployment Protection, make sure Vercel Authentication covers previews only, or visitors will be asked to log in to Vercel.
4. Point Supabase's Auth Site URL at the site's final domain (`https://www.teamup4s.org`), add `https://www.teamup4s.org/**` and `https://teamup4s.org/**` to Auth Redirect URLs, and list every domain in the `SITE_URL` function secret.

## Event pages and link previews

Every active event has a public page at `/events/<slug>`. The slug is generated from the title when the event is created and then stays the same, so shared links keep working after the title is edited; clear it in the database to regenerate it.

Link crawlers (Facebook, iMessage, WhatsApp, X) don't run JavaScript, so `api/event-page.js` (a Vercel function, routed in `vercel.json`) serves `index.html` with that event's title, description and image in the `<head>`. It reads the event with the public anon key from the `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment variables and falls back to the unchanged page on any error. Facebook caches previews; after editing an event, re-scrape the link at https://developers.facebook.com/tools/debug/.

## Importing data from Base44

Export each entity from the Base44 dashboard (Data → entity → Export CSV) into one folder, then:

```bash
SUPABASE_URL=https://<project-ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service role key> \
STRIPE_SECRET_KEY=sk_live_... \
npm run import:base44 -- ./base44-exports --dry-run   # preview, writes nothing
```

Drop `--dry-run` to import. The script:

- copies images and files hosted by Base44 into Supabase Storage and rewrites the links, since they disappear when the Base44 app is deleted (run it from a machine that can reach `base44.app`);
- checks donations still marked pending against Stripe when `STRIPE_SECRET_KEY` is set;
- skips donations of $1 or less, which were checkout tests (`--keep-test-donations` to include them);
- matches records on their Base44 id, so it's safe to re-run just before switching over to pick up anything new.

Keep the CSV exports out of git: they contain donor and subscriber contact details.

## Access rules

| Data | Public | Admins |
| --- | --- | --- |
| Gallery items, fundraising events and campaigns | read | full |
| Kid referrals, volunteer sign-ups, newsletter subscribers | submit only | full |
| Donations | none (written by the Stripe functions) | read |
| `public-media` bucket (gallery/event images) | read | full |
| `referral-uploads` bucket (referral attachments) | upload only | read, delete |

`/AdminDashboard`, `/TestingDashboard` and `/ProductionChecklist` require an admin login.
