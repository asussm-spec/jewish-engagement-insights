/**
 * Generates a demo attendee CSV for one JCC event scenario.
 *
 *   npx tsx scripts/build-demo-csv.ts                     # list scenarios
 *   npx tsx scripts/build-demo-csv.ts senior-lunch-april  # build one
 *
 * Output: ~/Downloads/demo-uploads/<scenario-id>.csv
 *
 * Mixes real JCC members (so identity matching shows) with invented
 * first-timers (so new-ID creation shows). Re-running produces fresh
 * randomization.
 *
 * To add a new scenario, edit scripts/demo-scenarios.ts.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import {
  scenarios,
  rowsToCsv,
  type Scenario,
  type Identity,
  type Profile,
} from "./demo-scenarios";

const envContent = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
const get = (k: string) => envContent.match(new RegExp(`${k}=(.+)`))![1].trim();
const supabase = createClient(
  get("NEXT_PUBLIC_SUPABASE_URL"),
  get("SUPABASE_SERVICE_ROLE_KEY")
);

const JCC_NAME = "Greater Boston JCC";
const OUT_DIR = join(homedir(), "Downloads", "demo-uploads");

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export async function buildScenarioCsv(scenario: Scenario): Promise<{
  path: string;
  rowCount: number;
  existingCount: number;
  newCount: number;
}> {
  // Find JCC org
  const { data: jcc } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("name", JCC_NAME)
    .single();
  if (!jcc) throw new Error(`Org "${JCC_NAME}" not found — run seed-jcc.ts.`);

  // Pull JCC profiles (via array containment on member_org_ids)
  const { data: profiles } = await supabase
    .from("people_profiles")
    .select("id, date_of_birth, has_children, attributes")
    .contains("member_org_ids", [jcc.id])
    .limit(2000);

  if (!profiles || profiles.length === 0) {
    throw new Error("No JCC profiles found — run seed-jcc.ts.");
  }

  // Filter and sample
  const eligible = (profiles as unknown as Profile[]).filter(
    scenario.audienceFilter
  );
  const picked = shuffle(eligible).slice(0, scenario.existingCount);

  // Fetch identities in one batch
  const { data: identities } = await supabase
    .from("people_identities")
    .select("id, email, first_name, last_name")
    .in(
      "id",
      picked.map((p) => p.id)
    );
  const identById = new Map<string, Identity>(
    ((identities ?? []) as unknown as Identity[]).map((i) => [i.id, i])
  );

  // Build existing rows
  const existingRows: Record<string, string>[] = [];
  for (const p of picked) {
    const id = identById.get(p.id);
    if (!id) continue;
    existingRows.push(scenario.rowFromExisting(id, p));
  }

  // Build new rows
  const newRows: Record<string, string>[] = [];
  for (let i = 0; i < scenario.newCount; i++) {
    newRows.push(scenario.rowFromNew());
  }

  // Interleave
  const rows = shuffle([...existingRows, ...newRows]);

  // Write
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const filename = `${scenario.id}.csv`;
  const outPath = join(OUT_DIR, filename);
  writeFileSync(outPath, rowsToCsv(rows));

  return {
    path: outPath,
    rowCount: rows.length,
    existingCount: existingRows.length,
    newCount: newRows.length,
  };
}

function printCatalog() {
  console.log("\nAvailable demo scenarios:\n");
  for (const s of scenarios) {
    console.log(`  ${s.id.padEnd(28)} — ${s.title}`);
    console.log(`  ${" ".repeat(28)}   ${s.description}`);
    console.log("");
  }
  console.log("Run: npx tsx scripts/build-demo-csv.ts <scenario-id>");
  console.log("Or:  npx tsx scripts/build-all-demo-csvs.ts");
}

async function main() {
  const id = process.argv[2];
  if (!id) {
    printCatalog();
    return;
  }

  const scenario = scenarios.find((s) => s.id === id);
  if (!scenario) {
    console.error(`✗ Unknown scenario: "${id}"`);
    printCatalog();
    process.exit(1);
  }

  console.log(`📄 Building ${scenario.title}...`);
  const result = await buildScenarioCsv(scenario);
  console.log(`\n✓ Wrote ${result.rowCount} rows to:`);
  console.log(`  ${result.path}`);
  console.log(
    `  ${result.existingCount} existing JCC members + ${result.newCount} first-timers`
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
  });
}
