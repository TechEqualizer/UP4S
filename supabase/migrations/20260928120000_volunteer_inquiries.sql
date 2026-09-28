-- Volunteer sign-ups from the Support Us page. Like referrals, these hold
-- personal contact details: the public may submit, only admins may read.

create table public.volunteer_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  name text not null check (length(name) between 1 and 200),
  email text not null check (email = lower(email) and position('@' in email) > 1 and length(email) <= 320),
  phone text check (length(phone) <= 40),
  interests text check (interests in ('mentorship', 'events', 'admin', 'fundraising', 'other')),
  experience text check (length(experience) <= 4000),
  availability text check (length(availability) <= 2000),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'active', 'inactive')),
  admin_notes text,
  base44_id text unique
);

create index volunteer_inquiries_created_date_idx on public.volunteer_inquiries (created_date desc);

create trigger set_updated_date before update on public.volunteer_inquiries
  for each row execute function public.set_updated_date();

alter table public.volunteer_inquiries enable row level security;

grant select, insert, update, delete on public.volunteer_inquiries to anon, authenticated;

-- Submissions can't pre-set review fields.
create policy "Anyone can volunteer"
  on public.volunteer_inquiries for insert to anon, authenticated
  with check (status = 'new' and admin_notes is null and base44_id is null);
create policy "Admins read volunteers"
  on public.volunteer_inquiries for select to authenticated using (private.is_admin());
create policy "Admins update volunteers"
  on public.volunteer_inquiries for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy "Admins delete volunteers"
  on public.volunteer_inquiries for delete to authenticated using (private.is_admin());
