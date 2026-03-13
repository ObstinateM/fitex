import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { bearer } from 'better-auth/plugins/bearer';
import { db } from '../db/index.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  basePath: '/api/auth',
  trustedOrigins: [
    'http://localhost:3000',
    'chrome-extension://*',
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      isOnboarded: {
        type: 'boolean',
        defaultValue: false,
      },
    },
  },
  plugins: [
    twoFactor({ issuer: 'Fitex' }),
    bearer(),
  ],
});
