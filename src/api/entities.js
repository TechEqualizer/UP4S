import { supabase } from './supabaseClient';

// Thin Base44-compatible entity API over Supabase tables, so pages keep calling
// Entity.list / filter / create / update / delete as before.

const READ_ONLY_FIELDS = ['id', 'created_date', 'updated_date'];

// Base44 accepted '' for empty optional fields; Postgres rejects '' for
// integer/date columns, so send null instead.
function toRow(data) {
  const row = {};
  for (const [key, value] of Object.entries(data)) {
    if (READ_ONLY_FIELDS.includes(key)) continue;
    row[key] = value === '' ? null : value;
  }
  return row;
}

// '-created_date' => descending, 'display_order' => ascending
function applySort(query, sort) {
  if (!sort) return query;
  const descending = sort.startsWith('-');
  return query.order(descending ? sort.slice(1) : sort, { ascending: !descending });
}

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

// publicInsert: the public may insert but not read back, so don't ask
// Postgres to return the inserted row (RLS would reject the select).
function createEntity(table, { publicInsert = false } = {}) {
  return {
    async list(sort, limit) {
      let query = applySort(supabase.from(table).select('*'), sort);
      if (limit) query = query.limit(limit);
      return unwrap(await query);
    },

    async filter(where = {}, sort, limit) {
      let query = supabase.from(table).select('*').match(where);
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      return unwrap(await query);
    },

    async get(id) {
      return unwrap(await supabase.from(table).select('*').eq('id', id).single());
    },

    async create(data) {
      const query = supabase.from(table).insert(toRow(data));
      if (publicInsert) {
        unwrap(await query);
        return null;
      }
      return unwrap(await query.select().single());
    },

    async update(id, data) {
      return unwrap(await supabase.from(table).update(toRow(data)).eq('id', id).select().single());
    },

    async delete(id) {
      unwrap(await supabase.from(table).delete().eq('id', id));
    },
  };
}

export const Donation = createEntity('donations');
export const KidReferral = createEntity('kid_referrals', { publicInsert: true });
export const GalleryItem = createEntity('gallery_items');
export const NewsletterSubscriber = createEntity('newsletter_subscribers', { publicInsert: true });
export const FundraisingCampaign = createEntity('fundraising_campaigns');
export const FundraisingEvent = createEntity('fundraising_events');
