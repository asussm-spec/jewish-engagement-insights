/**
 * Migrate old event_type values to match the form's current values.
 * Run: npx tsx scripts/fix-event-types.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const envContent = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
function getEnv(key: string): string {
  const match = envContent.match(new RegExp(`${key}=(.+)`));
  if (!match) throw new Error(`Missing ${key}`);
  return match[1].trim();
}

const supabase = createClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY")
);

const TYPE_MAP: Record<string, string> = {
  holiday: "holiday_calendar",
  shabbat: "worship_prayer",
  educational: "learning_education",
  social: "community_social",
  family: "youth_family",
  youth: "youth_family",
  fundraiser: "institutional",
  cultural: "arts_culture",
  worship: "worship_prayer",
  volunteer: "tikkun_olam",
};

async function main() {
  for (const [oldType, newType] of Object.entries(TYPE_MAP)) {
    const { data, error } = await supabase
      .from("events")
      .update({ event_type: newType })
      .eq("event_type", oldType)
      .select("id");

    if (error) {
      console.error(`Error updating ${oldType} → ${newType}:`, error.message);
    } else {
      console.log(`${oldType} → ${newType}: ${data?.length || 0} events updated`);
    }
  }
  console.log("Done!");
}

main();
