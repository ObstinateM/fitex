CREATE TABLE IF NOT EXISTS "generation_history" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "job_description" text NOT NULL,
  "ats_keywords" text DEFAULT '[]' NOT NULL,
  "story_ids" text DEFAULT '[]' NOT NULL,
  "tex" text NOT NULL,
  "adjustment_comment" text,
  "match_score" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "generation_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);
