import { createAuthClient } from 'better-auth/client';
import { twoFactorClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  plugins: [twoFactorClient()],
});

export const { signIn, signUp, signOut } = authClient;
