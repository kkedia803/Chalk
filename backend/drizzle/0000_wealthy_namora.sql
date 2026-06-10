CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"language" text NOT NULL,
	"code" text NOT NULL,
	"status" text NOT NULL,
	"output" text,
	"error" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
