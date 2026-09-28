import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';

const secretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

// A usable key is a secret (sk_) or restricted (rk_) key, not a publishable
// key (pk_) or a key's ID (mk_), which are easy to paste by mistake.
export const stripeConfigured = /^(sk|rk)_(test|live)_/.test(secretKey);

// The Stripe constructor throws on an empty key; at module load that would
// crash the function before it can answer, even the browser's CORS preflight.
export const stripe = new Stripe(secretKey || 'sk_not_configured', {
  httpClient: Stripe.createFetchHttpClient(),
});

// Service-role client: bypasses RLS, so only use it server-side.
export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } },
);
