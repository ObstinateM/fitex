ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;

CREATE TABLE IF NOT EXISTS "credit_balance" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "balance" numeric NOT NULL DEFAULT '0',
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "credit_transaction" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "amount" numeric NOT NULL,
  "type" text NOT NULL,
  "description" text,
  "stripe_session_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payment" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "stripe_session_id" text NOT NULL UNIQUE,
  "stripe_invoice_id" text,
  "amount" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'eur',
  "status" text NOT NULL,
  "product_type" text NOT NULL,
  "credits_added" integer,
  "invoice_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "subscription" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "stripe_subscription_id" text NOT NULL UNIQUE,
  "stripe_customer_id" text NOT NULL,
  "status" text NOT NULL,
  "current_period_end" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
