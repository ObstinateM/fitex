import { createAuthClient } from 'better-auth/react';
import { twoFactorClient, oneTimeTokenClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  plugins: [twoFactorClient(), oneTimeTokenClient()],
});

export const { useSession, signIn, signUp, signOut, twoFactor } = authClient;
