// Stripe webhook: marks donations completed/expired and records monthly renewals.
// Deploy with --no-verify-jwt (Stripe doesn't send a Supabase JWT); requests are
// authenticated by the Stripe signature instead.

import Stripe from 'npm:stripe@17';
import { stripe, supabaseAdmin } from '../_shared/stripe.ts';

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const cryptoProvider = Stripe.createSubtleCryptoProvider();

function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

// complete_donation() also adds the amount to the linked event, once.
async function completeSession(session: Stripe.Checkout.Session) {
  const { data: completed, error } = await supabaseAdmin.rpc('complete_donation', {
    p_session_id: session.id,
    p_payment_intent_id: stripeId(session.payment_intent),
    p_subscription_id: stripeId(session.subscription),
  });
  if (error) throw error;
  if (completed) return;

  // Nothing updated: either already completed (a redelivery), or the pending row
  // written at checkout creation is missing. Recreate it only in the second case.
  const { data: existing, error: selectError } = await supabaseAdmin
    .from('donations')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return;

  const meta = session.metadata ?? {};
  const { error: insertError } = await supabaseAdmin.from('donations').insert({
    amount: (session.amount_total ?? 0) / 100,
    donation_type: meta.donation_type === 'monthly' ? 'monthly' : 'one-time',
    donor_name: meta.donor_name ?? session.customer_details?.name ?? null,
    donor_email: meta.donor_email ?? session.customer_details?.email ?? null,
    fund_designation: meta.fund_designation ?? 'general',
    payment_status: 'pending',
    stripe_session_id: session.id,
    event_id: meta.event_id ?? null,
  });
  if (insertError) throw insertError;
  await completeSession(session);
}

async function setSessionStatus(session: Stripe.Checkout.Session, status: 'failed' | 'expired') {
  const { error } = await supabaseAdmin
    .from('donations')
    .update({ payment_status: status })
    .eq('stripe_session_id', session.id)
    .neq('payment_status', 'completed');
  if (error) throw error;
}

// Monthly renewals: the first invoice is covered by checkout.session.completed.
async function recordRenewal(invoice: Stripe.Invoice) {
  if (invoice.billing_reason !== 'subscription_cycle') return;

  const subscriptionId = stripeId(invoice.subscription);
  const meta = invoice.subscription_details?.metadata ?? {};

  const { error } = await supabaseAdmin.from('donations').upsert({
    amount: invoice.amount_paid / 100,
    donation_type: 'monthly',
    donor_name: meta.donor_name ?? invoice.customer_name ?? null,
    donor_email: meta.donor_email ?? invoice.customer_email ?? null,
    fund_designation: meta.fund_designation ?? 'general',
    payment_status: 'completed',
    stripe_subscription_id: subscriptionId,
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
          await completeSession(session);
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
