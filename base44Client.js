import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "689f4e044d22f613693763ee", 
  requiresAuth: true // Ensure authentication is required for all operations
});
