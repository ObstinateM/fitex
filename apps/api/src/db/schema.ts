import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  isOnboarded: boolean('is_onboarded').notNull().default(false),
  stripeCustomerId: text('stripe_customer_id'),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const twoFactor = pgTable('two_factor', {
  id: text('id').primaryKey(),
  secret: text('secret').notNull(),
  backupCodes: text('backup_codes').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const oneTimeToken = pgTable('one_time_token', {
  id: text('id').primaryKey(),
  token: text('token').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const pdfConversionLog = pgTable('pdf_conversion_log', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const cvTemplate = pgTable('cv_template', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  filename: text('filename'),
  tex: text('tex').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const cvImage = pgTable('cv_image', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  originalFilename: text('original_filename').notNull(),
  storagePath: text('storage_path').notNull(),
  mimeType: text('mime_type').notNull(),
  label: text('label'),
  sizeBytes: integer('size_bytes').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const story = pgTable('story', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  tags: text('tags').notNull().default('[]'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const creditBalance = pgTable('credit_balance', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  balance: numeric('balance').notNull().default('0'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const creditTransaction = pgTable('credit_transaction', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  amount: numeric('amount').notNull(),
  type: text('type').notNull(), // 'purchase' | 'free' | 'referral' | 'consumption'
  description: text('description'),
  stripeSessionId: text('stripe_session_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const payment = pgTable('payment', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  stripeSessionId: text('stripe_session_id').notNull().unique(),
  stripeInvoiceId: text('stripe_invoice_id'),
  amount: integer('amount').notNull(), // cents
  currency: text('currency').notNull().default('eur'),
  status: text('status').notNull(), // 'completed' | 'refunded'
  productType: text('product_type').notNull(), // 'starter' | 'pro' | 'unlimited'
  creditsAdded: integer('credits_added'),
  invoiceUrl: text('invoice_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const generationHistory = pgTable('generation_history', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  jobDescription: text('job_description').notNull(),
  atsKeywords: text('ats_keywords').notNull().default('[]'),
  storyIds: text('story_ids').notNull().default('[]'),
  tex: text('tex').notNull(),
  adjustmentComment: text('adjustment_comment'),
  matchScore: integer('match_score'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const subscription = pgTable('subscription', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  status: text('status').notNull(), // 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
