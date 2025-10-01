import { base44 } from './base44Client';

// Export all functions from Base44 SDK
export const createStripeCheckout = base44.functions.createStripeCheckout;
export const stripeWebhook = base44.functions.stripeWebhook;