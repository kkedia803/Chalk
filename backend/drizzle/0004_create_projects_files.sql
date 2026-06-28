CREATE TABLE IF NOT EXISTS "projects" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" uuid,
  "project_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
  "id" uuid PRIMARY KEY NOT NULL,
  "project_id" uuid,
  "file_name" text NOT NULL,
  "language" text NOT NULL,
  "code" text NOT NULL,
  "createdat" timestamp DEFAULT now(),
  "updatedat" timestamp DEFAULT now()
);
