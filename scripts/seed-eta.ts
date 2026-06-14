import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { etaCases } from '../src/db/schema';
import { SEED_CASES } from '../src/lib/eta/seed-cases';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log(`Seeding ${SEED_CASES.length} ETA curriculum cases...`);

  for (const c of SEED_CASES) {
    await db.insert(etaCases).values({
      caseNumber: c.caseNumber,
      title: c.title,
      industry: c.industry,
      difficulty: c.difficulty,
      source: 'curriculum',
      data: c.data,
    }).onConflictDoNothing();
    console.log(`  ✓ Case ${c.caseNumber}: ${c.title}`);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
