// Apply pending Drizzle migrations as part of the build, so a deploy that ships a
// schema change also applies it (prod was 500ing because migration 0001 added the
// `stage` column but the build never ran migrations).
//
// Guarded on DATABASE_URL: on Vercel it's set (build-time env) → migrations run;
// locally / in CI without a DB it's absent → skip, so `next build` still works.
import { execSync } from 'node:child_process';

if (!process.env.DATABASE_URL) {
  console.log('[migrate-on-deploy] No DATABASE_URL — skipping migrations (local build).');
  process.exit(0);
}

try {
  console.log('[migrate-on-deploy] Applying pending Drizzle migrations…');
  execSync('npx drizzle-kit migrate', { stdio: 'inherit' });
  console.log('[migrate-on-deploy] Migrations up to date.');
} catch (err) {
  console.error('[migrate-on-deploy] Migration failed — aborting build to avoid shipping code against a stale schema.');
  process.exit(1);
}
