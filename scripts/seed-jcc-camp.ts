/**
 * Seed the Greater Boston JCC's day camp programming.
 *
 * The JCC drill-down reports four business units — Membership, Early
 * childhood, Camp, Other programs — but the seed data had no camp events, so
 * the Camp bar never appeared. This adds a realistic day camp slate.
 *
 * Camp is classified by event NAME (see businessUnitFor in
 * population-aggregator.ts), so these use the existing `youth_family` enum
 * value rather than requiring a new one.
 *
 * Attendance is drawn from households with children, which is what makes camp
 * overlap the early-childhood and membership populations the way it does in
 * real life — a family that sends a kid to camp is more likely to be a member,
 * but plenty of camp families are not.
 *
 * Idempotent: re-running deletes and rebuilds the same named events.
 *
 * Run: npx tsx scripts/seed-jcc-camp.ts
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

const JCC_ID = "e8b72232-5416-4d82-bec4-a7ecc0700190";

type CampEvent = {
  name: string;
  date: string;
  description: string;
  /** Share of the eligible camp-family pool that attends. */
  reach: number;
};

const CAMP_EVENTS: CampEvent[] = [
  {
    name: "Camp Open House",
    date: "2026-03-08",
    description: "Tour the camp, meet the directors, and register for summer.",
    reach: 0.12,
  },
  {
    name: "Summer Day Camp — Session 1",
    date: "2026-06-29",
    description: "Two-week day camp session: swim, sports, arts, and Shabbat.",
    reach: 0.22,
  },
  {
    name: "Summer Day Camp — Session 2",
    date: "2026-07-13",
    description: "Two-week day camp session: swim, sports, arts, and Shabbat.",
    reach: 0.2,
  },
  {
    name: "Summer Day Camp — Session 3",
    date: "2026-07-27",
    description: "Two-week day camp session: swim, sports, arts, and Shabbat.",
    reach: 0.17,
  },
  {
    name: "CIT Program — Summer 2026",
    date: "2026-07-06",
    description: "Counselor-in-training cohort for rising 10th and 11th graders.",
    reach: 0.03,
  },
];

async function pageAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const out: T[] = [];
  const PAGE = 1000;
  let from = 0;
  for (;;) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

/** Deterministic PRNG so re-running produces the same camp roster. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

async function main() {
  console.log("🏕  Seeding Greater Boston JCC camp programming...\n");

  const { data: creator } = await supabase
    .from("profiles")
    .select("id")
    .eq("organization_id", JCC_ID)
    .limit(1)
    .single();
  if (!creator) throw new Error("No profile found for the JCC — seed a user first.");

  // Existing JCC reach: anyone who attends a JCC event or is a JCC member.
  const jccEvents = await pageAll<{ id: string }>((f, t) =>
    supabase.from("events").select("id").eq("organization_id", JCC_ID).range(f, t)
  );
  const attendees = await pageAll<{ person_id: string }>((f, t) =>
    supabase
      .from("event_attendees")
      .select("person_id")
      .in("event_id", jccEvents.map((e) => e.id))
      .range(f, t)
  );
  const reach = new Set(attendees.map((a) => a.person_id));

  const profiles = await pageAll<{
    id: string;
    has_children: boolean | null;
    number_of_children: number | null;
    member_org_ids: string[] | null;
  }>((f, t) =>
    supabase
      .from("people_profiles")
      .select("id, has_children, number_of_children, member_org_ids")
      .range(f, t)
  );
  for (const p of profiles) {
    if ((p.member_org_ids ?? []).includes(JCC_ID)) reach.add(p.id);
  }

  // Camp families = people the JCC already reaches who have children.
  const campPool = profiles
    .filter((p) => reach.has(p.id))
    .filter((p) => p.has_children === true || (p.number_of_children ?? 0) > 0)
    .map((p) => p.id)
    .sort();

  console.log(`JCC reach: ${reach.size} people · camp-eligible (has children): ${campPool.length}\n`);
  if (campPool.length === 0) throw new Error("No camp-eligible people found.");

  for (const [i, ev] of CAMP_EVENTS.entries()) {
    // Remove any prior run of this event so re-seeding is clean.
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("organization_id", JCC_ID)
      .eq("name", ev.name);
    for (const e of existing ?? []) {
      await supabase.from("event_attendees").delete().eq("event_id", e.id);
      await supabase.from("events").delete().eq("id", e.id);
    }

    const rng = makeRng(1000 + i * 37);
    const roster = campPool.filter(() => rng() < ev.reach);

    const { data: created, error: evErr } = await supabase
      .from("events")
      .insert({
        organization_id: JCC_ID,
        created_by: creator.id,
        name: ev.name,
        short_description: ev.description,
        event_date: ev.date,
        event_type: "youth_family",
        attendee_count: roster.length,
      })
      .select("id")
      .single();
    if (evErr || !created) throw evErr ?? new Error("Event insert failed");

    for (let j = 0; j < roster.length; j += 500) {
      const { error: attErr } = await supabase.from("event_attendees").insert(
        roster.slice(j, j + 500).map((person_id) => ({
          event_id: created.id,
          person_id,
        }))
      );
      if (attErr) throw attErr;
    }

    console.log(`  ✓ ${ev.name.padEnd(32)} ${ev.date}  ${roster.length} attendees`);
  }

  console.log("\n✅ Camp programming seeded.");
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
