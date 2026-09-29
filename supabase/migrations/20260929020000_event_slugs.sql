-- Shareable event pages: /events/<slug>. The slug is generated from the title on
-- insert and then kept stable, so links that have been shared keep working even
-- if the title is edited. Setting slug to '' (or null) regenerates it.

alter table public.fundraising_events add column slug text;

create or replace function private.slugify(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'))
$$;

create or replace function public.set_event_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  base text;
  candidate text;
  n integer := 1;
begin
  if coalesce(new.slug, '') <> '' then
    new.slug := left(private.slugify(new.slug), 80);
  end if;
  if coalesce(new.slug, '') = '' then
    base := coalesce(nullif(left(private.slugify(new.title), 60), ''), 'event');
    base := trim(both '-' from base);
    candidate := base;
    while exists (
      select 1 from public.fundraising_events e where e.slug = candidate and e.id <> new.id
    ) loop
      n := n + 1;
      candidate := base || '-' || n;
    end loop;
    new.slug := candidate;
  end if;
  return new;
end;
$$;

create trigger set_event_slug
  before insert or update of slug on public.fundraising_events
  for each row execute function public.set_event_slug();

-- Backfill one row at a time (oldest first) so duplicate titles get -2, -3, ...
do $$
declare
  r record;
begin
  for r in select id from public.fundraising_events order by created_date loop
    update public.fundraising_events set slug = null where id = r.id;
  end loop;
end;
$$;

alter table public.fundraising_events alter column slug set not null;
create unique index fundraising_events_slug_key on public.fundraising_events (slug);
