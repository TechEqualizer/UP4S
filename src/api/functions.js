import { base44 } from './base44Client';

// Resolve lazily: @base44/sdk 0.1.x has no `functions` module, so reading it at
// import time crashes every page that (transitively) imports this file.
export const createStripeCheckout = (...args) => base44.functions.createStripeCheckout(...args);
export const stripeWebhook = (...args) => base44.functions.stripeWebhook(...args);
