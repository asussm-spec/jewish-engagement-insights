/**
 * Enrich JCC event attendees with Hebrew school + JCC program-engagement
 * attributes so the event-page comparison charts have data.
 *
 *   • hebrew_school_parent ("yes"/"no") — families with school-age kids
 *     (synagogue members skew yes). Mirrors the synagogue-seed attribute.
 *   • org:<jccId>:program_interests — JCC business units, weighted by kid
 *     ages (early_childhood/preschool for 0–5, day_camp/after_school for
 *     5–12, teen_programs for 13–17) plus general-adult units.
 *   • org:<jccId>:jcc_member — for profiles gaining program interests.
 *
 * Idempotent: never overwrites an attribute that already exists.
 *
 * Run: npx tsx scripts/enrich-jcc-attendee-attrs.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const envContent = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
function getEnv(key: string): string {
  const match = envContent.match(new RegExp(`${key}=(.+)`));
  if (!match) throw new Error(`Missing ${key} in .env.local`);
  return match[1].trim();
}

const supabase = createClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY")
);

const JCC_NAME = "Greater Boston JCC";

function chance(p: number): boolean {
  return Math.random() < p;
}

function kidAges(attrs: Record<string, unknown>): number[] {
  const ages: number[] = [];
  const now = new Date();
  for (const [k, v] of Object.entries(attrs)) {
    if (/^child_\d+_dob$/.test(k) && typeof v === "string") {
      const dob = new Date(v);
      if (!isNaN(dob.getTime())) {
        let age = now.getFullYear() - dob.getFullYear();
        if (
          now.getMonth() < dob.getMonth() ||
          (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
        )
          age--;
        if (age >= 0 && age <= 25) ages.push(age);
      }
    }
  }
  return ages;
}

async function main() {
  const { data: org, error: orgErr } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("name", JCC_NAME)
    .single();
  if (orgErr || !org) throw new Error(`Org "${JCC_NAME}" not found`);
  const orgPrefix = `org:${org.id}`;

  // All JCC events → unique attendees
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("organization_id", org.id);
  const eventIds = events!.map((e) => e.id);

  const attendeeIds = new Set<string>();
  for (let i = 0; i < eventIds.length; i += 50) {
    const { data: attendees } = await supabase
      .from("event_attendees")
      .select("person_id")
      .in("event_id", eventIds.slice(i, i + 50));
    for (const a of attendees || []) attendeeIds.add(a.person_id);
  }
  console.log(`JCC events: ${eventIds.length}, unique attendees: ${attendeeIds.size}`);

  const ids = [...attendeeIds];
  let hebrewAdded = 0;
  let programAdded = 0;
  let updated = 0;

  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200);
    const { data: profiles } = await supabase
      .from("people_profiles")
      .select("id, has_children, attributes")
      .in("id", batch);

    for (const p of profiles || []) {
      const attrs = { ...((p.attributes || {}) as Record<string, unknown>) };
      const ages = kidAges(attrs);
      const hasSchoolAgeKid = ages.some((a) => a >= 5 && a <= 13);
      const isSynMember = Object.entries(attrs).some(
        ([k, v]) => k.replace(/^org:[^:]+:/, "") === "synagogue_member" && v === "yes"
      );
      let changed = false;

      // Hebrew school — only for families with school-age kids; ~70% of
      // those get the field. Synagogue members skew heavily yes.
      const hasHebrew = Object.keys(attrs).some((k) =>
        /hebrew_school/.test(k.replace(/^org:[^:]+:/, ""))
      );
      if (!hasHebrew && hasSchoolAgeKid && chance(0.7)) {
        const yes = isSynMember ? chance(0.55) : chance(0.2);
        attrs.hebrew_school_parent = yes ? "yes" : "no";
        hebrewAdded++;
        changed = true;
      }

      // JCC program engagement — ~60% of attendee families have some JCC
      // program relationship, weighted by kid ages.
      const hasPrograms = `${orgPrefix}:program_interests` in attrs;
      if (!hasPrograms && chance(0.6)) {
        const interests = new Set<string>();
        if (ages.some((a) => a <= 5) && chance(0.5))
          interests.add(chance(0.5) ? "early_childhood" : "preschool");
        if (ages.some((a) => a >= 5 && a <= 12)) {
          if (chance(0.45)) interests.add("day_camp");
          if (chance(0.3)) interests.add("after_school");
        }
        if (ages.some((a) => a >= 13 && a <= 17) && chance(0.35))
          interests.add("teen_programs");
        if (chance(0.4)) interests.add("fitness");
        if (chance(0.25)) interests.add("holiday_programs");
        if (chance(0.15)) interests.add("jewish_learning");
        if (interests.size > 0) {
          attrs[`${orgPrefix}:program_interests`] = [...interests].join(",");
          if (!(`${orgPrefix}:jcc_member` in attrs)) {
            attrs[`${orgPrefix}:jcc_member`] = chance(0.7) ? "yes" : "day_pass";
          }
          programAdded++;
          changed = true;
        }
      }

      if (changed) {
        const { error } = await supabase
          .from("people_profiles")
          .update({ attributes: attrs })
          .eq("id", p.id);
        if (error) console.error(`  ✗ ${p.id}: ${error.message}`);
        else updated++;
      }
    }
    console.log(`  ...processed ${Math.min(i + 200, ids.length)}/${ids.length}`);
  }

  console.log(`\n✅ Updated ${updated} profiles (${hebrewAdded} hebrew_school, ${programAdded} program_interests)`);
}

main().catch((err) => {
  console.error("Enrichment failed:", err);
  process.exit(1);
});
