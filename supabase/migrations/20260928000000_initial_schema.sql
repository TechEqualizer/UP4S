-- UP4S initial schema: replaces the Base44 entities.
--
-- Column names (including created_date / updated_date) match the Base44 field
-- names so the frontend and any exported Base44 data map across unchanged.

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_date timestamptz not null default now()
);
comment on table public.admins is
  'Auth users allowed into the admin dashboard. Add rows via the SQL editor.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admins enable row level security;

create policy "Users can see their own admin row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- updated_date trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  amount numeric(10, 2) not null check (amount > 0),
  donation_type text not null default 'one-time'
    check (donation_type in ('one-time', 'monthly')),
  donor_name text,
  donor_email text,
  fund_designation text not null default 'general',
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'completed', 'failed', 'expired', 'refunded')),
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  stripe_subscription_id text,
  stripe_invoice_id text unique
);

create table public.kid_referrals (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  child_name text not null,
  child_age integer check (child_age between 0 and 25),
  guardian_name text not null,
  guardian_email text not null,
  guardian_phone text,
  wish_description text not null,
  referral_source text,
  urgency_level text not null default 'medium'
    check (urgency_level in ('low', 'medium', 'high', 'critical')),
  uploaded_files jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  admin_notes text,
  follow_up_date date
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  title text not null,
  description text,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  is_external_url boolean not null default false,
  category text,
  child_name text,
  child_age integer,
  is_featured boolean not null default false,
  display_order integer not null default 0
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  email text not null check (email = lower(email) and position('@' in email) > 1),
  first_name text,
  subscription_source text,
  is_active boolean not null default true,
  constraint newsletter_subscribers_email_key unique (email)
);

create table public.fundraising_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  title text not null,
  description text,
  goal_amount numeric(12, 2),
  amount_raised numeric(12, 2) not null default 0,
  start_date date,
  end_date date,
  is_active boolean not null default true
);

create table public.fundraising_events (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  title text not null,
  description text,
  event_date timestamptz,
  location text,
  fundraising_goal numeric(12, 2),
  amount_raised numeric(12, 2) not null default 0,
  image_url text,
  is_active boolean not null default true
);

create index donations_created_date_idx on public.donations (created_date desc);
create index kid_referrals_created_date_idx on public.kid_referrals (created_date desc);
create index gallery_items_display_order_idx on public.gallery_items (display_order);
create index gallery_items_featured_idx on public.gallery_items (display_order) where is_featured;
create index newsletter_subscribers_created_date_idx on public.newsletter_subscribers (created_date desc);
create index fundraising_events_event_date_idx on public.fundraising_events (event_date desc);

do $$
declare
  t text;
begin
  foreach t in array array[
    'donations', 'kid_referrals', 'gallery_items',
    'newsletter_subscribers', 'fundraising_campaigns', 'fundraising_events'
  ] loop
    execute format(
      'create trigger set_updated_date before update on public.%I
         for each row execute function public.set_updated_date()', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

-- Expose the tables to the Data API explicitly (newer projects don't by
-- default). Row level security below decides what each role can actually do.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  public.donations, public.kid_referrals, public.gallery_items,
  public.newsletter_subscribers, public.fundraising_campaigns, public.fundraising_events
  to anon, authenticated;
grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

-- Public content: anyone can read, only admins can write.
create policy "Anyone can read gallery items"
  on public.gallery_items for select to anon, authenticated using (true);
create policy "Admins manage gallery items"
  on public.gallery_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can read fundraising events"
  on public.fundraising_events for select to anon, authenticated using (true);
create policy "Admins manage fundraising events"
  on public.fundraising_events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can read fundraising campaigns"
  on public.fundraising_campaigns for select to anon, authenticated using (true);
create policy "Admins manage fundraising campaigns"
  on public.fundraising_campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Referrals hold children's personal data: the public may submit, only admins
-- may read or change them. Submissions can't pre-set review fields.
create policy "Anyone can submit a referral"
  on public.kid_referrals for insert to anon, authenticated
  with check (status = 'pending' and admin_notes is null and follow_up_date is null);
create policy "Admins read referrals"
  on public.kid_referrals for select to authenticated using (public.is_admin());
create policy "Admins update referrals"
  on public.kid_referrals for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete referrals"
  on public.kid_referrals for delete to authenticated using (public.is_admin());

create policy "Anyone can subscribe to the newsletter"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (is_active);
create policy "Admins read subscribers"
  on public.newsletter_subscribers for select to authenticated using (public.is_admin());
create policy "Admins update subscribers"
  on public.newsletter_subscribers for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete subscribers"
  on public.newsletter_subscribers for delete to authenticated using (public.is_admin());

-- Donations are written only by the Stripe edge functions (service role).
create policy "Admins read donations"
  on public.donations for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

-- Gallery and event images: publicly readable, admin-managed.
insert into storage.buckets (id, name, public, file_size_limit)
values ('public-media', 'public-media', true, 104857600)
on conflict (id) do nothing;

-- Files attached to referrals (may include medical documents): private.
-- The public can upload, only admins can read (via signed URLs).
insert into storage.buckets (id, name, public, file_size_limit)
values ('referral-uploads', 'referral-uploads', false, 10485760)
on conflict (id) do nothing;

create policy "Admins upload public media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'public-media' and public.is_admin());
create policy "Admins update public media"
  on storage.objects for update to authenticated
  using (bucket_id = 'public-media' and public.is_admin());
create policy "Admins delete public media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'public-media' and public.is_admin());

create policy "Anyone can upload referral files"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'referral-uploads');
create policy "Admins read referral files"
  on storage.objects for select to authenticated
  using (bucket_id = 'referral-uploads' and public.is_admin());
create policy "Admins delete referral files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'referral-uploads' and public.is_admin());
