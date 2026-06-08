CREATE TYPE "public"."pipeline_status" AS ENUM('scraped', 'scored', 'researched', 'failed');--> statement-breakpoint
CREATE TYPE "public"."research_depth" AS ENUM('medium', 'deep');--> statement-breakpoint
CREATE TYPE "public"."user_action_type" AS ENUM('pass', 'save', 'pursue');--> statement-breakpoint
CREATE TYPE "public"."verdict_type" AS ENUM('PURSUE', 'DIG_DEEPER', 'PASS', 'EDGE_CASE');--> statement-breakpoint
CREATE TABLE "listings" (
	"id" text PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"external_id" text NOT NULL,
	"pipeline_status" "pipeline_status" DEFAULT 'scraped' NOT NULL,
	"scraped_at" timestamp DEFAULT now() NOT NULL,
	"duplicate_of" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"user_action" "user_action_type",
	"data" jsonb NOT NULL,
	CONSTRAINT "listings_source_external_id_unique" UNIQUE("source","external_id")
);
--> statement-breakpoint
CREATE TABLE "research" (
	"listing_id" text NOT NULL,
	"depth" "research_depth" NOT NULL,
	"data" jsonb NOT NULL,
	"researched_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "research_listing_id_depth_unique" UNIQUE("listing_id","depth")
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"listing_id" text PRIMARY KEY NOT NULL,
	"verdict" "verdict_type" NOT NULL,
	"data" jsonb NOT NULL,
	"scored_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "research" ADD CONSTRAINT "research_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;