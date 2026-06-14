-- ETA curriculum tables: pre-built acquisition cases + single-row progress tracker.
CREATE TABLE "eta_cases" (
  "id" serial PRIMARY KEY NOT NULL,
  "case_number" integer NOT NULL,
  "title" text NOT NULL,
  "industry" text NOT NULL,
  "difficulty" integer NOT NULL,
  "source" text DEFAULT 'curriculum' NOT NULL,
  "listing_id" text,
  "data" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "eta_cases_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "eta_progress" (
  "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
  "current_case" integer DEFAULT 1 NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "eta_cases" ADD CONSTRAINT "eta_cases_listing_id_listings_id_fk"
  FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;
