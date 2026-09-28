#!/usr/bin/env node
// Imports Base44 CSV exports into Supabase.
//
//   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=... \
//   [STRIPE_SECRET_KEY=sk_live_...] \
//   node scripts/import-base44.mjs <folder with *_export.csv files> [--dry-run] [--skip-media]
//     [--keep-test-donations]
//
// - Records are matched on their Base44 id (newsletter subscribers on email), so
//   re-running only adds what's new; rows already in Supabase are left untouched.
// - Files hosted by Base44 (gallery media, event images, referral attachments) are
//   copied into Supabase Storage and the links rewritten, since they disappear
//   when the Base44 app is deleted. --skip-media keeps the Base44 links.
// - With STRIPE_SECRET_KEY set, donations still marked pending are checked against
//   Stripe and marked completed/expired to match what actually happened.
// - Donations of $1 or less were checkout tests and are skipped (each is listed);
//   --keep-test-donations imports them too.
// - --dry-run reads everything and prints what would be imported, writing nothing.

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipMedia = args.includes('--skip-media');
const keepTestDonations = args.includes('--keep-test-donations');
const TEST_DONATION_MAX = 1;
const folder = args.find((a) => !a.startsWith('--'));

if (!folder) {
  console.error('Usage: node scripts/import-base44.mjs <export folder> [--dry-run] [--skip-media]');
  process.exit(1);
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY } = process.env;
if (!dryRun && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Project Settings -> API).');
  process.exit(1);
}

const supabase = dryRun
  ? null
  : createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

// RFC 4180: quoted fields may contain commas, newlines and doubled quotes.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...records] = rows.filter((r) => r.some((value) => value !== ''));
  if (!header) return [];
  return records.map((values) => Object.fromEntries(header.map((key, i) => [key, values[i] ?? ''])));
}

// Finds e.g. "3280c198-GalleryItem_export.csv" for entity "GalleryItem".
function readExport(entity) {
  const file = fs.readdirSync(folder).find((name) => name.endsWith(`${entity}_export.csv`));
  if (!file) return null;
  const records = parseCsv(fs.readFileSync(path.join(folder, file), 'utf8'));
  // Base44 sample data isn't real content.
  return records.filter((r) => r.is_sample !== 'true');
}

// ---------------------------------------------------------------------------
// Field conversion
// ---------------------------------------------------------------------------

const text = (value) => (value === undefined || value === '' ? null : value);
const bool = (value) => value === 'true';
const int = (value) => (value === '' || value === undefined ? null : Number.parseInt(value, 10));
const num = (value) => (value === '' || value === undefined ? null : Number(value));
// Base44 exports UTC timestamps without a zone suffix.
const timestamp = (value) => (!value ? null : /Z|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
const json = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

function isBase44Hosted(url) {
  try {
    const { hostname, pathname } = new URL(url);
    return hostname.endsWith('base44.app') || hostname.endsWith('base44.com') ||
      (hostname.endsWith('.supabase.co') && pathname.includes('/base44-prod/'));
  } catch {
    return false;
  }
}

const copiedMedia = new Map();

// Copies a Base44-hosted file into a Supabase bucket. Returns the storage path.
async function copyFile(url, bucket, prefix) {
  const key = `${bucket}:${url}`;
  if (copiedMedia.has(key)) return copiedMedia.get(key);

  const filename = decodeURIComponent(new URL(url).pathname.split('/').pop());
  const storagePath = `${prefix}/${filename}`;

  if (!dryRun) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
    const body = Buffer.from(await response.arrayBuffer());
    const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
      contentType: response.headers.get('content-type') ?? undefined,
      upsert: true,
    });
    if (error) throw new Error(`Upload failed for ${url}: ${error.message}`);
  }

  copiedMedia.set(key, storagePath);
  return storagePath;
}

async function copyPublicMedia(url) {
  if (skipMedia || !url || !isBase44Hosted(url)) return url;
  const storagePath = await copyFile(url, 'public-media', 'base44');
  if (dryRun) return `<public-media>/${storagePath}`;
  return supabase.storage.from('public-media').getPublicUrl(storagePath).data.publicUrl;
}

// Referral attachments go to the private bucket; the admin UI opens them by path.
async function copyReferralFiles(files) {
  if (skipMedia || !Array.isArray(files)) return files ?? [];
  const copied = [];
  for (const file of files) {
    if (file?.url && isBase44Hosted(file.url)) {
      const storagePath = await copyFile(file.url, 'referral-uploads', 'referrals/base44');
      copied.push({ name: file.name, size: file.size, path: storagePath });
    } else {
      copied.push(file);
    }
  }
  return copied;
}

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

async function stripeSessionStatus(sessionId) {
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`Stripe lookup failed for ${sessionId}: ${response.status} ${await response.text()}`);
  }
  const session = await response.json();
  if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
    return { status: 'completed', paymentIntent: session.payment_intent };
  }
  if (session.status === 'expired') return { status: 'expired' };
  return { status: 'pending' };
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

async function existingValues(table, column) {
  if (dryRun) return new Set();
  const values = new Set();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(column).range(from, from + 999);
    if (error) throw new Error(`Reading ${table}: ${error.message}`);
    data.forEach((row) => row[column] && values.add(row[column]));
    if (data.length < 1000) return values;
  }
}

async function insertRows(table, rows) {
  if (rows.length === 0) return;
  if (dryRun) {
    console.log(`  would insert into ${table}:`);
    rows.forEach((row) => console.log('   ', JSON.stringify(row).slice(0, 220)));
    return;
  }
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(`Inserting into ${table}: ${error.message}`);
}

const summary = [];

// ---------------------------------------------------------------------------
// Entities (events first: donations link to them)
// ---------------------------------------------------------------------------

async function importEvents() {
  const records = readExport('FundraisingEvent');
  if (!records) return new Map();

  const existing = await existingValues('fundraising_events', 'base44_id');
  const rows = [];
  for (const r of records.filter((r) => !existing.has(r.id))) {
    rows.push({
      base44_id: r.id,
      title: r.title,
      description: text(r.description),
      event_date: timestamp(r.event_date),
      location: text(r.location),
      fundraising_goal: num(r.fundraising_goal),
      amount_raised: num(r.amount_raised) ?? 0,
      image_url: await copyPublicMedia(text(r.image_url)),
      is_active: bool(r.is_active),
      created_date: timestamp(r.created_date),
      updated_date: timestamp(r.updated_date),
    });
  }
  await insertRows('fundraising_events', rows);
  summary.push(['Fundraising events', records.length, rows.length]);

  // Base44 id -> Supabase id, for donations.event_id
  if (dryRun) return new Map(records.map((r) => [r.id, `<event ${r.id}>`]));
  const { data, error } = await supabase.from('fundraising_events').select('id, base44_id');
  if (error) throw new Error(`Reading fundraising_events: ${error.message}`);
  return new Map(data.filter((e) => e.base44_id).map((e) => [e.base44_id, e.id]));
}

async function importDonations(eventIds) {
  const records = readExport('Donation');
  if (!records) return;

  const existing = await existingValues('donations', 'base44_id');
  const rows = [];
  const reconciled = { completed: 0, expired: 0, pending: 0 };

  const skipped = [];
  for (const r of records.filter((r) => !existing.has(r.id))) {
    if (!keepTestDonations && num(r.amount) <= TEST_DONATION_MAX) {
      skipped.push(r);
      continue;
    }
    const stripeId = text(r.stripe_payment_id);
    let paymentStatus = oneOf(r.payment_status, ['pending', 'completed', 'failed', 'expired', 'refunded'], 'pending');
    let paymentIntent = stripeId?.startsWith('pi_') ? stripeId : null;

    if (paymentStatus === 'pending' && STRIPE_SECRET_KEY && stripeId?.startsWith('cs_')) {
      const result = await stripeSessionStatus(stripeId);
      reconciled[result.status]++;
      paymentStatus = result.status;
      paymentIntent = result.paymentIntent ?? paymentIntent;
    }

    if (r.event_id && !eventIds.has(r.event_id)) {
      console.warn(`  donation ${r.id}: event ${r.event_id} not found, importing without it`);
    }

    rows.push({
      base44_id: r.id,
      amount: num(r.amount),
      currency: (text(r.currency) ?? 'usd').toLowerCase(),
      donation_type: oneOf(r.donation_type, ['one-time', 'monthly'], 'one-time'),
      donor_name: text(r.donor_name),
      donor_email: text(r.donor_email)?.toLowerCase() ?? null,
      fund_designation: text(r.fund_designation) ?? 'general',
      event_id: eventIds.get(r.event_id) ?? null,
      is_anonymous: bool(r.is_anonymous),
      dedication_message: text(r.dedication_message),
      payment_status: paymentStatus,
      stripe_session_id: stripeId?.startsWith('cs_') ? stripeId : null,
      stripe_payment_intent_id: paymentIntent,
      created_date: timestamp(r.created_date),
      updated_date: timestamp(r.updated_date),
    });
  }

  if (skipped.length > 0) {
    console.log(`  Skipping ${skipped.length} test donation(s) of $${TEST_DONATION_MAX} or less (--keep-test-donations to include):`);
    skipped.forEach((r) => console.log(`    ${r.created_date.slice(0, 10)}  $${r.amount}  ${r.donor_name} <${r.donor_email}>`));
  }

  await insertRows('donations', rows);
  summary.push(['Donations', records.length, rows.length]);
  if (STRIPE_SECRET_KEY) {
    console.log(`  Stripe check of pending donations: ${reconciled.completed} paid, ` +
      `${reconciled.expired} expired, ${reconciled.pending} still open`);
  } else if (rows.some((row) => row.payment_status === 'pending')) {
    console.log('  Tip: set STRIPE_SECRET_KEY to check pending donations against Stripe.');
  }
}

async function importGallery() {
  const records = readExport('GalleryItem');
  if (!records) return;

  const existing = await existingValues('gallery_items', 'base44_id');
  const rows = [];
  for (const r of records.filter((r) => !existing.has(r.id))) {
    const isExternal = bool(r.is_external_url);
    rows.push({
      base44_id: r.id,
      title: r.title,
      description: text(r.description),
      media_url: isExternal ? r.media_url : await copyPublicMedia(r.media_url),
      media_type: oneOf(r.media_type, ['image', 'video'], 'image'),
      is_external_url: isExternal,
      category: text(r.category),
      child_name: text(r.child_name),
      child_age: int(r.child_age),
      is_featured: bool(r.is_featured),
      display_order: int(r.display_order) ?? 0,
      created_date: timestamp(r.created_date),
      updated_date: timestamp(r.updated_date),
    });
  }
  await insertRows('gallery_items', rows);
  summary.push(['Gallery items', records.length, rows.length]);
}

async function importNewsletter() {
  const records = readExport('NewsletterSubscriber');
  if (!records) return;

  const existing = await existingValues('newsletter_subscribers', 'email');
  const seen = new Set(existing);
  const rows = [];
  // Oldest first, so a repeated signup keeps the original date.
  for (const r of [...records].sort((a, b) => a.created_date.localeCompare(b.created_date))) {
    const email = r.email.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    rows.push({
      email,
      first_name: text(r.first_name),
      subscription_source: text(r.subscription_source),
      is_active: r.is_active !== 'false',
      created_date: timestamp(r.created_date),
      updated_date: timestamp(r.updated_date),
    });
  }
  await insertRows('newsletter_subscribers', rows);
  summary.push(['Newsletter subscribers', records.length, rows.length]);
}

async function importReferrals() {
  const records = readExport('KidReferral');
  if (!records) return;

  const existing = await existingValues('kid_referrals', 'base44_id');
  const rows = [];
  for (const r of records.filter((r) => !existing.has(r.id))) {
    rows.push({
      base44_id: r.id,
      child_name: r.child_name,
      child_age: int(r.child_age),
      guardian_name: r.guardian_name,
      guardian_email: r.guardian_email,
      guardian_phone: text(r.guardian_phone),
      wish_description: r.wish_description,
      referral_source: text(r.referral_source),
      urgency_level: oneOf(r.urgency_level, ['low', 'medium', 'high', 'critical'], 'medium'),
      uploaded_files: await copyReferralFiles(json(r.uploaded_files, [])),
      status: text(r.status) ?? 'pending',
      admin_notes: text(r.admin_notes),
      follow_up_date: text(r.follow_up_date),
      created_date: timestamp(r.created_date),
      updated_date: timestamp(r.updated_date),
    });
  }
  await insertRows('kid_referrals', rows);
  summary.push(['Kid referrals', records.length, rows.length]);
}

// ---------------------------------------------------------------------------

try {
  if (dryRun) console.log('Dry run: nothing will be written.\n');
  const eventIds = await importEvents();
  await importDonations(eventIds);
  await importGallery();
  await importNewsletter();
  await importReferrals();

  console.log(`\n${'Entity'.padEnd(24)}${'In export'.padEnd(11)}${dryRun ? 'Would import' : 'Imported'}`);
  for (const [name, total, imported] of summary) {
    console.log(`${name.padEnd(24)}${String(total).padEnd(11)}${imported}`);
  }
  if (!skipMedia) console.log(`\nFiles ${dryRun ? 'to copy' : 'copied'} from Base44: ${copiedMedia.size}`);
} catch (error) {
  console.error(`\nImport stopped: ${error.message}`);
  console.error('Rows inserted before the error are kept; re-run to continue.');
  process.exit(1);
}
