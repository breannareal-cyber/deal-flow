-- Replace the old user_action (pass/save/pursue) with a richer, canonical
-- pipeline `stage`. Backfill existing dispositions, then drop the old column/enum.
CREATE TYPE "public"."pipeline_stage" AS ENUM('new', 'researching', 'contacted', 'passed', 'dead');--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "stage" "pipeline_stage" NOT NULL DEFAULT 'new';--> statement-breakpoint
UPDATE "listings" SET "stage" = CASE "user_action"
  WHEN 'pass' THEN 'passed'::"public"."pipeline_stage"
  WHEN 'save' THEN 'researching'::"public"."pipeline_stage"
  WHEN 'pursue' THEN 'contacted'::"public"."pipeline_stage"
  ELSE 'new'::"public"."pipeline_stage"
END;--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "user_action";--> statement-breakpoint
DROP TYPE "public"."user_action_type";
