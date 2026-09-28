import { supabase } from './supabaseClient';

// Calls the create-stripe-checkout edge function (supabase/functions).
// Resolves to { checkout_url }.
export async function createStripeCheckout(checkoutData) {
  const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
    body: checkoutData,
  });
  if (error) throw error;
  return data;
}
