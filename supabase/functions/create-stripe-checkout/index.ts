// Creates a Stripe Checkout session for a donation and records it as pending.
// Called from the browser via supabase.functions.invoke('create-stripe-checkout').

import { stripe, supabaseAdmin } from '../_shared/stripe.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 50_000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Only redirect back to the site itself (SITE_URL), never to an arbitrary URL.
function sameSiteUrl(value: unknown, fallbackPath: string): string {
  const site = new URL(Deno.env.get('SITE_URL') ?? 'http://localhost:5173');
  try {
    const url = new URL(String(value));
    if (url.origin === site.origin) return url.toString();
  } catch {
    // fall through
  }
  return new URL(fallbackPath, site).toString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const amount = Math.round(Number(body.amount) * 100) / 100;
  const donationType = body.donation_type === 'monthly' ? 'monthly' : 'one-time';
  const donorName = String(body.donor_name ?? '').trim().slice(0, 200);
  const donorEmail = String(body.donor_email ?? '').trim().toLowerCase().slice(0, 320);
  const fundDesignation = String(body.fund_designation ?? 'general').slice(0, 100);

  if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return json({ error: `Amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT}` }, 400);
  }
  if (!donorName || !donorEmail.includes('@')) {
    return json({ error: 'Name and a valid email are required' }, 400);
  }

  const successUrl = new URL(sameSiteUrl(body.success_url, '/DonationSuccess'));
  // Stripe substitutes the real id; build the query by hand so the braces aren't escaped.
  const successUrlWithSession =
    `${successUrl.origin}${successUrl.pathname}?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = sameSiteUrl(body.cancel_url, '/');

  const metadata = {
    donor_name: donorName,
    donor_email: donorEmail,
    donation_type: donationType,
    fund_designation: fundDesignation,
  };
  const productName = donationType === 'monthly' ? 'Monthly donation to UP4S' : 'Donation to UP4S';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: donationType === 'monthly' ? 'subscription' : 'payment',
      customer_email: donorEmail,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: { name: productName },
          ...(donationType === 'monthly' ? { recurring: { interval: 'month' as const } } : {}),
        },
      }],
      metadata,
      ...(donationType === 'monthly'
        ? { subscription_data: { metadata } }
        : { payment_intent_data: { metadata } }),
      success_url: successUrlWithSession,
      cancel_url: cancelUrl,
    });

    const { error } = await supabaseAdmin.from('donations').insert({
      amount,
      donation_type: donationType,
      donor_name: donorName,
      donor_email: donorEmail,
      fund_designation: fundDesignation,
      payment_status: 'pending',
      stripe_session_id: session.id,
    });
    if (error) console.error('Failed to record pending donation', error);

    return json({ checkout_url: session.url });
  } catch (error) {
    console.error('Stripe checkout error', error);
    return json({ error: 'Could not start checkout' }, 500);
  }
});
