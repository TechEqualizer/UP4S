import { createClient } from '@base44/sdk';

// Create Base44 client for production
export const base44 = createClient({
  appId: "689f4e044d22f613693763ee",
  requiresAuth: false // Allow public operations
});