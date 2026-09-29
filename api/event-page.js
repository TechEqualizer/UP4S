// Serves /events/:slug with the event's title, description and image in the
// <head>, so links shared to Facebook, iMessage, WhatsApp, X etc. preview the
// event itself. (Link crawlers don't run JavaScript, so the SPA alone would show
// the generic site preview.) People get the normal app: same index.html, which
// then renders the event page in the browser.
//
// Any failure falls back to the untouched index.html, so the page always loads.

const SLUG = /^[a-z0-9-]{1,80}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function summary(text, max = 200) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

const dateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Detroit' });

async function fetchEvent(slug) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;
  const filter = UUID.test(slug) ? `id=eq.${slug}` : `slug=eq.${encodeURIComponent(slug)}`;
  const response = await fetch(
    `${supabaseUrl}/rest/v1/fundraising_events?select=id,slug,title,description,image_url,event_date,location,is_active&${filter}&limit=1`,
    { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }, signal: AbortSignal.timeout(3000) }
  );
  if (!response.ok) return null;
  const [event] = await response.json();
  return event?.is_active ? event : null;
}

// Replace (or add) a <meta> tag's content.
function setMeta(html, attr, name, content) {
  const tag = `<meta ${attr}="${name}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+${attr}="${name.replace(/[:.]/g, '\\$&')}"[^>]*>`, 'i');
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

export function renderEventHead(html, event, origin) {
  const url = `${origin}/events/${event.slug}`;
  const when = event.event_date ? dateFormat.format(new Date(event.event_date)) : '';
  const details = [when, event.location].filter(Boolean).join(' · ');
  const description = summary([details, event.description].filter(Boolean).join(' — ')) ||
    'Support Team UP4S, a Metro Detroit nonprofit giving young people a creative path through film and media.';
  const image = /^https?:\/\//.test(event.image_url || '') ? event.image_url : `${origin}/hero/drumline.jpg`;
  const title = `${event.title} · Team UP4S`;

  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(url)}" />`);
  out = setMeta(out, 'name', 'description', description);
  out = setMeta(out, 'property', 'og:type', 'website');
  out = setMeta(out, 'property', 'og:title', event.title);
  out = setMeta(out, 'property', 'og:description', description);
  out = setMeta(out, 'property', 'og:url', url);
  out = setMeta(out, 'property', 'og:image', image);
  out = setMeta(out, 'name', 'twitter:card', 'summary_large_image');
  out = setMeta(out, 'name', 'twitter:title', event.title);
  out = setMeta(out, 'name', 'twitter:description', description);
  out = setMeta(out, 'name', 'twitter:image', image);
  return out;
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${host}`;
  const slug = String(req.query?.slug || '').trim();

  let html;
  try {
    const page = await fetch(`${origin}/index.html`, { signal: AbortSignal.timeout(3000) });
    html = await page.text();
  } catch (error) {
    console.error('event-page: could not load index.html', error);
    res.statusCode = 302;
    res.setHeader('Location', '/');
    return res.end();
  }

  try {
    const event = SLUG.test(slug) ? await fetchEvent(slug) : null;
    if (event) html = renderEventHead(html, event, origin);
  } catch (error) {
    console.error('event-page: could not load event', slug, error);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Short CDN cache so edits to an event show up in new shares within minutes.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  res.statusCode = 200;
  return res.end(html);
}
