-- Add the `starred` favorite flag (orthogonal to `stage`). Existing rows default
-- to false. Drives the Starred section at the top of The Hold.
ALTER TABLE "listings" ADD COLUMN "starred" boolean DEFAULT false NOT NULL;
