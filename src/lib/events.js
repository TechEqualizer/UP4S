// Helpers for public event pages: links, sharing and calendar entries.

const SITE_ORIGIN = 'https://www.teamup4s.org';

export function eventPath(event) {
  return `/events/${encodeURIComponent(event.slug || event.id)}`;
}

// Absolute link for sharing: always the brand domain, even when an admin copies it
// from up4s.vercel.app or a preview deployment.
export function eventUrl(event) {
  return `${SITE_ORIGIN}${eventPath(event)}`;
}

export function isPastEvent(event, now = new Date()) {
  return Boolean(event?.event_date) && new Date(event.event_date) < now;
}

export function eventSummary(event, max = 160) {
  const text = (event?.description || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function shareMessage(event) {
  return `Join me in supporting Team UP4S: ${event.title}`;
}

// Social share targets. All open in a new tab except email/SMS.
export function shareTargets(event) {
  const url = eventUrl(event);
  const text = shareMessage(event);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    email: `mailto:?subject=${t}&body=${encodeURIComponent(`${eventSummary(event, 300)}\n\n${url}`)}`,
    sms: `sms:?&body=${encodeURIComponent(`${text} ${url}`)}`,
  };
}

// Calendar entries assume a 2-hour event when only a start time is known.
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;
const toCalendarStamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function googleCalendarUrl(event) {
  const start = new Date(event.event_date);
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    details: `${eventSummary(event, 400)}\n\n${eventUrl(event)}`,
    location: event.location || '',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const icsEscape = (value) => String(value ?? '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

// Downloads an .ics file (Apple Calendar, Outlook, ...).
export function downloadIcs(event) {
  const start = new Date(event.event_date);
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Team UP4S//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@teamup4s.org`,
    `DTSTAMP:${toCalendarStamp(new Date())}`,
    `DTSTART:${toCalendarStamp(start)}`,
    `DTEND:${toCalendarStamp(end)}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(`${eventSummary(event, 400)}\n\n${eventUrl(event)}`)}`,
    `LOCATION:${icsEscape(event.location)}`,
    `URL:${eventUrl(event)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `${event.slug || 'event'}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

export function donateToEvent(event) {
  window.dispatchEvent(new CustomEvent('openDonationModal', { detail: { eventId: event.id, eventTitle: event.title } }));
}
