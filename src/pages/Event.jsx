import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import { ArrowLeft, ArrowRight, Calendar, CalendarPlus, Clock, Heart, MapPin, Share2 } from 'lucide-react';
import { FundraisingEvent } from '@/api/entities';
import { Progress } from '@/components/ui/progress';
import SmartImage from '@/components/ui/smart-image';
import { Container, Eyebrow, Surface, ctaClass } from '@/components/site/ui';
import Reveal from '@/components/site/Reveal';
import SharePanel, { shareEvent } from '@/components/site/SharePanel';
import NotFound from '@/pages/NotFound';
import { createPageUrl } from '@/index';
import { formatCurrency } from '@/lib/utils';
import { donateToEvent, downloadIcs, eventPath, eventSummary, googleCalendarUrl, isPastEvent } from '@/lib/events';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Events happen in Metro Detroit, so show their time in Detroit time for everyone.
const dateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Detroit' });
const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Detroit', timeZoneName: 'short' });

async function loadEvent(slug) {
  const [bySlug] = await FundraisingEvent.filter({ slug }, null, 1);
  if (bySlug) return bySlug;
  if (UUID.test(slug)) {
    const [byId] = await FundraisingEvent.filter({ id: slug }, null, 1);
    return byId ?? null;
  }
  return null;
}

export default function EventPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(undefined); // undefined = loading, null = not found
  const [otherEvents, setOtherEvents] = useState([]);
  const [heroImageOk, setHeroImageOk] = useState(true);

  useEffect(() => {
    let active = true;
    setEvent(undefined);
    loadEvent(slug)
      .then((found) => active && setEvent(found?.is_active ? found : null))
      .catch(() => active && setEvent(null));
    FundraisingEvent.list('event_date', 50)
      .then((all) => active && setOtherEvents(all.filter((e) => e.is_active && e.slug !== slug)))
      .catch(() => {});
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (event) document.title = `${event.title} · Team UP4S`;
  }, [event]);

  if (event === undefined) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center" role="status" aria-label="Loading event">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (event === null) return <NotFound />;

  const past = isPastEvent(event);
  const start = event.event_date ? new Date(event.event_date) : null;
  const goal = Number(event.fundraising_goal) || 0;
  const raised = Number(event.amount_raised) || 0;
  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const upcoming = otherEvents
    .filter((e) => !isPastEvent(e))
    .slice(0, 3);

  return (
    <div className="bg-white">
      {/* Hero */}
      <header className="relative isolate overflow-hidden bg-gray-950 text-white">
        {event.image_url && heroImageOk && (
          <img src={event.image_url} alt="" onError={() => setHeroImageOk(false)} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-50" />
        )}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/30" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_30rem_at_10%_100%,rgba(37,99,235,0.45),transparent_70%)]" />
        <Container className="pb-14 pt-8 sm:pb-20 sm:pt-10">
          <Link to={createPageUrl('Fundraising')} className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-gray-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All events
          </Link>
          <div className="mt-16 max-w-4xl sm:mt-24">
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow tone="dark">{past ? 'Past event' : 'Fundraising event'}</Eyebrow>
              {!past && start && (
                <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-bold text-gray-950">
                  {formatDistanceToNowStrict(start, { addSuffix: true })}
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-display-xl font-bold">{event.title}</h1>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-gray-200">
              {start && (
                <>
                  <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-yellow-400" aria-hidden="true" />{dateFormat.format(start)}</span>
                  <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-yellow-400" aria-hidden="true" />{timeFormat.format(start)}</span>
                </>
              )}
              {event.location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-yellow-400" aria-hidden="true" />{event.location}</span>}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {past ? (
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('openDonationModal'))} className={ctaClass('primary', 'lg')}>
                  <Heart className="h-5 w-5" aria-hidden="true" /> Donate to Team UP4S
                </button>
              ) : (
                <button type="button" onClick={() => donateToEvent(event)} className={ctaClass('primary', 'lg')}>
                  <Heart className="h-5 w-5" aria-hidden="true" /> Support this event
                </button>
              )}
              <button type="button" onClick={() => shareEvent(event)} className={ctaClass('ghostLight', 'lg')}>
                <Share2 className="h-5 w-5" aria-hidden="true" /> Share event
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Body */}
      <Container className="grid grid-cols-1 gap-10 py-14 sm:py-20 lg:grid-cols-3 lg:gap-14">
        <Reveal className="lg:col-span-2">
          <Eyebrow>About this event</Eyebrow>
          {event.description ? (
            <div className="mt-5 space-y-4 whitespace-pre-line text-lg leading-relaxed text-gray-700">{event.description}</div>
          ) : (
            <p className="mt-5 text-lg text-gray-600">More details coming soon.</p>
          )}
          {event.image_url && (
            <div className="relative mt-10 aspect-video overflow-hidden rounded-3xl bg-gray-100 ring-1 ring-gray-900/5">
              <SmartImage src={event.image_url} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          )}
        </Reveal>

        <aside className="lg:col-span-1">
          <div className="space-y-5 lg:sticky lg:top-24">
            <Surface className="p-6 shadow-xl shadow-gray-900/[0.04]">
              <p className="text-sm font-medium text-gray-500">Raised so far</p>
              <p className="mt-1 font-display text-4xl font-extrabold tabular-nums tracking-tight text-gray-900">{formatCurrency(raised)}</p>
              {goal > 0 && (
                <>
                  <Progress value={pct} className="mt-4 h-2.5" />
                  <p className="mt-2 flex justify-between text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">{pct.toFixed(0)}%</span>
                    <span>of {formatCurrency(goal)} goal</span>
                  </p>
                </>
              )}
              {past ? (
                <p className="mt-6 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  This event has ended. Thank you to everyone who took part! Gifts now go to our general fund.
                </p>
              ) : (
                <button type="button" onClick={() => donateToEvent(event)} className={ctaClass('primary', 'lg', 'mt-6 w-full')}>
                  <Heart className="h-5 w-5" aria-hidden="true" /> Support this event
                </button>
              )}
              <p className="mt-3 text-center text-xs text-gray-500">Tax-deductible · 501(c)(3) · EIN 92-2415944</p>
            </Surface>

            {!past && start && (
              <Surface className="p-6">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900"><CalendarPlus className="h-4 w-4 text-blue-600" aria-hidden="true" /> Add to calendar</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={ctaClass('secondary', 'sm')}>Google</a>
                  <button type="button" onClick={() => downloadIcs(event)} className={ctaClass('secondary', 'sm')}>Apple / Outlook</button>
                </div>
              </Surface>
            )}

            <Surface className="p-6">
              <h2 className="font-semibold text-gray-900">Spread the word</h2>
              <p className="mt-1 text-sm text-gray-500">Every share helps a young creator reach their goal.</p>
              <SharePanel event={event} className="mt-4" />
            </Surface>
          </div>
        </aside>
      </Container>

      {/* More events */}
      {upcoming.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-14 sm:py-20">
          <Container>
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="font-display text-display-md font-bold text-gray-900">More upcoming events</h2>
              <Link to={createPageUrl('Fundraising')} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
                All events <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {upcoming.map((other, index) => (
                <Reveal key={other.id} delay={index * 100}>
                  <Link to={eventPath(other)} className="group block h-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <SmartImage src={other.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-gray-500">{other.event_date ? dateFormat.format(new Date(other.event_date)) : 'Date to be announced'}</p>
                      <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-700">{other.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{eventSummary(other, 140)}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
