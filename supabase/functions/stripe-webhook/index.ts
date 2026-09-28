// Stripe webhook: marks donations completed/expired and records monthly renewals.
// Deploy with --no-verify-jwt (Stripe doesn't send a Supabase JWT); requests are
// authenticated by the Stripe signature instead.

import Stripe from 'npm:stripe@17';
import { stripe, supabaseAdmin } from '../_shared/stripe.ts';

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const cryptoProvider = Stripe.createSubtleCryptoProvider();

async function setSessionStatus(session: Stripe.Checkout.Session, status: string) {
  const update: Record<string, unknown> = { payment_status: status };
  if (typeof session.payment_intent === 'string') update.stripe_payment_intent_id = session.payment_intent;
  if (typeof session.subscription === 'string') update.stripe_subscription_id = session.subscription;

  const { data, error } = await supabaseAdmin
    .from('donations')
    .update(update)
    .eq('stripe_session_id', session.id)
    .select('id');
  if (error) throw error;

  // The pending row is written at checkout creation; recreate it if that failed.
  if (data.length === 0 && status === 'completed') {
    const meta = session.metadata ?? {};
    const { error: insertError } = await supabaseAdmin.from('donations').insert({
      ...update,
      amount: (session.amount_total ?? 0) / 100,
      donation_type: meta.donation_type === 'monthly' ? 'monthly' : 'one-time',
      donor_name: meta.donor_name ?? session.customer_details?.name ?? null,
      donor_email: meta.donor_email ?? session.customer_details?.email ?? null,
      fund_designation: meta.fund_designation ?? 'general',
      stripe_session_id: session.id,
    });
    if (insertError) throw insertError;
  }
}

// Monthly renewals: the first invoice is covered by checkout.session.completed.
async function recordRenewal(invoice: Stripe.Invoice) {
  if (invoice.billing_reason !== 'subscription_cycle') return;

  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id;
  const meta = invoice.subscription_details?.metadata ?? {};

  const { error } = await supabaseAdmin.from('donations').upsert({
    amount: invoice.amount_paid / 100,
    donation_type: 'monthly',
    donor_name: meta.donor_name ?? invoice.customer_name ?? null,
    donor_email: meta.donor_email ?? invoice.customer_email ?? null,
    fund_designation: meta.fund_designation ?? 'general',
    payment_status: 'completed',
    stripe_subscription_id: subscriptionId ?? null,
    stripe_invoice_id: invoice.id,
  }, { onConflict: 'stripe_invoice_id', ignoreDuplicates: true });
  if (error) throw error;
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(), signature, webhookSecret, undefined, cryptoProvider,
    );
  } catch (error) {
    console.error('Webhook signature verification failed', error);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
          await setSessionStatus(session, 'completed');
        }
        break;
      }
      case 'checkout.session.async_payment_failed':
        await setSessionStatus(event.data.object, 'failed');
        break;
      case 'checkout.session.expired':
        await setSessionStatus(event.data.object, 'expired');
        break;
      case 'invoice.paid':
        await recordRenewal(event.data.object);
        break;
    }
  } catch (error) {
    // Non-2xx makes Stripe retry the event.
    console.error(`Error handling ${event.type}`, error);
    return new Response('Webhook handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
