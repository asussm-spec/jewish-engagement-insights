/**
 * Regenerates every demo scenario CSV into ~/Downloads/demo-uploads/.
 *
 * Run: npx tsx scripts/build-all-demo-csvs.ts
 */

import { scenarios } from "./demo-scenarios";
import { buildScenarioCsv } from "./build-demo-csv";

async function main() {
  console.log(`🗂  Generating ${scenarios.length} demo CSVs...\n`);

  for (const s of scenarios) {
    try {
      console.log(`— ${s.title}`);
      const r = await buildScenarioCsv(s);
      console.log(
        `  ✓ ${r.rowCount.toString().padStart(3)} rows  (${r.existingCount} existing + ${r.newCount} first-timers)`
      );
      console.log(`    ${r.path}`);
    } catch (err) {
      console.error(`  ✗ ${s.title}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(
    "\n✅ Done. CSVs are in ~/Downloads/demo-uploads/. Re-run anytime for fresh data."
  );
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
