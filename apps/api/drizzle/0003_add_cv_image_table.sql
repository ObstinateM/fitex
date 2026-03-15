CREATE TABLE IF NOT EXISTS "cv_image" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "original_filename" text NOT NULL,
  "storage_path" text NOT NULL,
  "mime_type" text NOT NULL,
  "label" text,
  "size_bytes" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "cv_image_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);
