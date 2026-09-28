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

   They sign in at `/Login` with an emailed link. Supabase's built-in email is rate-limited to a few messages an hour; configure a custom SMTP provider for production.

4. **Stripe**: set the function secrets and deploy the functions:

   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_... SITE_URL=https://your-site.example
   supabase functions deploy create-stripe-checkout
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```

   In the Stripe dashboard, add a webhook endpoint at `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` for the events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` and `invoice.paid`, then set its signing secret:

   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Access rules

| Data | Public | Admins |
| --- | --- | --- |
| Gallery items, fundraising events and campaigns | read | full |
| Kid referrals, newsletter subscribers | submit only | full |
| Donations | none (written by the Stripe functions) | read |
| `public-media` bucket (gallery/event images) | read | full |
| `referral-uploads` bucket (referral attachments) | upload only | read, delete |

`/AdminDashboard`, `/TestingDashboard` and `/ProductionChecklist` require an admin login.
