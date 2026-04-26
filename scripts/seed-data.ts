/**
 * Seed script — generates realistic fake data for demo purposes.
 * Creates 5 orgs, ~500 people, ~50 events with attendee links.
 *
 * Run: npx tsx scripts/seed-data.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load env from .env.local
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

// ── Helpers ──────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startYear: number, endYear: number): string {
  const year = randomInt(startYear, endYear);
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ageBucketFromDOB(dob: string): string {
  const birth = new Date(dob);
  const age = Math.floor(
    (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  if (age <= 5) return "0-5";
  if (age <= 10) return "6-10";
  if (age <= 15) return "11-15";
  if (age <= 20) return "16-20";
  if (age <= 30) return "21-30";
  if (age <= 40) return "31-40";
  if (age <= 50) return "41-50";
  if (age <= 60) return "51-60";
  return "61+";
}

// ── Data pools ──────────────────────────────────────────

const firstNames = [
  "Sarah", "David", "Rachel", "Michael", "Rebecca", "Daniel", "Leah", "Joshua",
  "Hannah", "Benjamin", "Miriam", "Samuel", "Esther", "Aaron", "Naomi", "Eli",
  "Abigail", "Noah", "Ruth", "Isaac", "Maya", "Ethan", "Sophie", "Jacob",
  "Emma", "Liam", "Ava", "Oliver", "Mia", "Alexander", "Lily", "Nathan",
  "Zoe", "Adam", "Chloe", "Jonathan", "Emily", "Matthew", "Noa", "Gabriel",
  "Talia", "Lucas", "Ariel", "Simon", "Shira", "Max", "Dina", "Leo",
  "Yael", "Asher", "Ilana", "Caleb", "Orly", "Jonah", "Tamar", "Seth",
  "Rivka", "Oren", "Eliana", "Micah",
];

const lastNames = [
  "Cohen", "Levy", "Goldstein", "Shapiro", "Friedman", "Katz", "Rosen",
  "Schwartz", "Klein", "Weiss", "Stern", "Berger", "Goldman", "Silverman",
  "Greenberg", "Kaplan", "Epstein", "Bloom", "Stein", "Meyer", "Adler",
  "Blum", "Frank", "Gross", "Kohn", "Segal", "Feldman", "Horowitz",
  "Lieberman", "Marcus", "Peretz", "Rubin", "Schneider", "Solomon",
  "Strauss", "Weil", "Zimmerman", "Abrams", "Becker", "Diamond",
];

const denominations = [
  "reform", "reform", "reform",  // weighted more common
  "conservative", "conservative",
  "orthodox",
  "reconstructionist",
  "just_jewish", "just_jewish",
];

const kidNames = [
  "Emma", "Noah", "Lily", "Jack", "Ava", "Leo", "Mia", "Ben",
  "Zoe", "Sam", "Maya", "Eli", "Sophie", "Max", "Noa", "Asher",
  "Talia", "Jonah", "Ella", "Caleb", "Ruby", "Tom", "Olive", "Levi",
];

// Event types must match the form values in events/new/page.tsx
const eventTypes = [
  "holiday_calendar", "holiday_calendar", "holiday_calendar",
  "worship_prayer", "worship_prayer",
  "learning_education", "learning_education",
  "community_social", "community_social",
  "youth_family", "youth_family",
  "youth_family",
  "institutional",
  "arts_culture",
  "worship_prayer",
  "tikkun_olam",
];

const eventNames: Record<string, string[]> = {
  holiday_calendar: [
    "Hanukkah Family Celebration", "Purim Carnival", "Passover Community Seder",
    "Rosh Hashanah Open House", "Sukkot Under the Stars", "Simchat Torah Dance Party",
    "Tu B'Shvat Planting Day", "Yom Ha'atzmaut Festival",
  ],
  worship_prayer: [
    "Friday Night Lights", "Tot Shabbat", "Shabbat Morning Service",
    "Young Professionals Shabbat", "Community Shabbat Lunch", "High Holiday Services",
    "Healing Service",
  ],
  learning_education: [
    "Adult Hebrew Class", "Torah Study Circle", "Jewish History Lecture Series",
    "Israel Current Events Panel", "Parenting Through a Jewish Lens",
  ],
  community_social: [
    "New Member Welcome Social", "Young Families Mixer", "Game Night",
    "Wine Tasting Evening", "Book Club Meeting", "Shabbat Dinner Club",
  ],
  youth_family: [
    "Family Fun Day", "PJ Library Storytime", "Kids Art Workshop",
    "Family Shabbat Cooking Class", "Nature Hike for Families",
    "Teen Leadership Retreat", "Youth Group Shabbaton", "Middle School Movie Night",
    "High School Community Service Day",
  ],
  institutional: [
    "Annual Gala", "Phonathon", "Silent Auction Night",
  ],
  arts_culture: [
    "Jewish Film Festival Screening", "Israeli Dance Night", "Klezmer Concert",
  ],
  tikkun_olam: [
    "Food Bank Packing Day", "Habitat for Humanity Build", "Senior Home Visit",
  ],
};

// ── Organizations ───────────────────────────────────────

const orgs = [
  {
    name: "Temple Beth Shalom",
    org_type: "synagogue" as const,
    subtype: "reform",
    email_domains: ["gmail.com"],
  },
  {
    name: "Greater Boston JCC",
    org_type: "jcc" as const,
    subtype: null,
    email_domains: ["bostonjcc.org"],
  },
  // ── Day schools ────────────────────────────────
  {
    name: "Solomon Schechter Day School",
    org_type: "day_school" as const,
    subtype: "conservative",
    email_domains: ["ssds.org"],
  },
  {
    name: "Rashi School",
    org_type: "day_school" as const,
    subtype: "reform",
    email_domains: ["rashi.org"],
  },
  {
    name: "Maimonides School",
    org_type: "day_school" as const,
    subtype: "orthodox",
    email_domains: ["maimonides.org"],
  },
  {
    name: "Gann Academy",
    org_type: "day_school" as const,
    subtype: "pluralistic",
    email_domains: ["gannacademy.org"],
  },
  {
    name: "JCDS Boston",
    org_type: "day_school" as const,
    subtype: "pluralistic",
    email_domains: ["jcdsboston.org"],
  },
  // ── Camps ──────────────────────────────────────
  {
    name: "Camp Ramah New England",
    org_type: "camp" as const,
    subtype: "conservative",
    email_domains: ["campramahne.org"],
  },
  {
    name: "URJ Eisner Camp",
    org_type: "camp" as const,
    subtype: "reform",
    email_domains: ["eisnercamp.org"],
  },
  {
    name: "Camp Yavneh",
    org_type: "camp" as const,
    subtype: "pluralistic",
    email_domains: ["campyavneh.org"],
  },
  {
    name: "Camp Tevya",
    org_type: "camp" as const,
    subtype: "independent",
    email_domains: ["camptevya.org"],
  },
  {
    name: "Camp Pembroke",
    org_type: "camp" as const,
    subtype: "independent",
    email_domains: ["camppembroke.org"],
  },
  {
    name: "Camp JRF",
    org_type: "camp" as const,
    subtype: "reconstructionist",
    email_domains: ["campjrf.org"],
  },
  {
    name: "Capital Camps",
    org_type: "camp" as const,
    subtype: "pluralistic",
    email_domains: ["capitalcamps.org"],
  },
];

// ── Main ────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting seed...\n");

  // 1. Create organizations (skip Temple Beth Shalom if it already exists)
  console.log("Creating organizations...");
  const orgIds: string[] = [];

  for (const org of orgs) {
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("name", org.name)
      .single();

    if (existing) {
      orgIds.push(existing.id);
      // Backfill subtype on existing orgs (older seeds may have left it null)
      if (org.subtype !== null) {
        await supabase
          .from("organizations")
          .update({ subtype: org.subtype })
          .eq("id", existing.id)
          .is("subtype", null);
      }
      console.log(`  ✓ ${org.name} (existing)`);
    } else {
      const { data, error } = await supabase
        .from("organizations")
        .insert(org)
        .select("id")
        .single();
      if (error) throw error;
      orgIds.push(data.id);
      console.log(`  + ${org.name}`);
    }
  }

  // 2. Create a system user profile for seeding events
  //    (We need a profile ID to satisfy the events.created_by FK)
  console.log("\nCreating seed user...");
  let seedUserId: string;

  // Check if seed user already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("full_name", "Seed Bot")
    .single();

  if (existingProfile) {
    seedUserId = existingProfile.id;
    console.log("  ✓ Seed user exists");
  } else {
    // Create an auth user first, then the profile will be auto-created by trigger
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: "seed@engagement-insights.test",
      password: "seed-password-not-real-12345",
      email_confirm: true,
      user_metadata: { full_name: "Seed Bot" },
    });
    if (authError) throw authError;
    seedUserId = authUser.user.id;

    // Update profile with org
    await supabase
      .from("profiles")
      .update({ organization_id: orgIds[0], role: "program_manager" })
      .eq("id", seedUserId);

    console.log("  + Seed user created");
  }

  // 3. Generate people
  console.log("\nGenerating people...");
  const personIds: string[] = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < 500; i++) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@example.com`;

    // Ensure unique email
    while (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(100, 9999)}@example.com`;
    }
    usedEmails.add(email);

    // Create identity
    const { data: identity, error: idError } = await supabase
      .from("people_identities")
      .upsert({ email, first_name: firstName, last_name: lastName }, { onConflict: "email" })
      .select("id")
      .single();

    if (idError) {
      console.error(`  ✗ Error creating identity: ${idError.message}`);
      continue;
    }

    personIds.push(identity.id);

    // Create profile with rich attributes
    const dob = randomDate(1960, 2005);
    const denom = pick(denominations);
    const numKids = Math.random() > 0.3 ? randomInt(1, 4) : 0;
    const memberOrgCount = randomInt(1, 3);
    const memberOrgs = pickN(orgIds, memberOrgCount);

    const attributes: Record<string, unknown> = {};

    // Add children data
    for (let k = 1; k <= numKids; k++) {
      attributes[`child_${k}_name`] = pick(kidNames);
      attributes[`child_${k}_dob`] = randomDate(2012, 2024);
    }

    // Add other attributes randomly
    if (Math.random() > 0.5) {
      attributes.synagogue_name = pick([
        "Temple Beth Shalom", "Temple Israel", "Beth El",
        "Temple Emanu-El", "Temple Sinai",
      ]);
      attributes.synagogue_member = "yes";
    }
    if (Math.random() > 0.6) {
      attributes.day_school_enrolled = Math.random() > 0.5 ? "yes" : "no";
      if (attributes.day_school_enrolled === "yes") {
        attributes.day_school_name = pick([
          "Solomon Schechter", "Maimonides", "Gann Academy",
          "Rashi School", "JCDS",
        ]);
      }
    }
    if (Math.random() > 0.7) {
      attributes.zip_code = pick([
        "02134", "02135", "02138", "02139", "02140",
        "02141", "02142", "02143", "02144", "02145",
        "02148", "02149", "02150", "02151", "02152",
        "02155", "02160", "02161", "02169", "02170",
      ]);
    }
    if (Math.random() > 0.8) {
      attributes.is_volunteer = Math.random() > 0.5 ? "yes" : "no";
    }
    if (Math.random() > 0.85) {
      attributes.is_donor = "yes";
    }

    const { error: profError } = await supabase
      .from("people_profiles")
      .upsert({
        id: identity.id,
        date_of_birth: dob,
        age_bucket: ageBucketFromDOB(dob),
        denomination: denom,
        has_children: numKids > 0,
        number_of_children: numKids,
        is_member: true,
        member_org_ids: memberOrgs,
        data_sources: memberOrgCount,
        attributes,
      }, { onConflict: "id" });

    if (profError) {
      console.error(`  ✗ Error creating profile: ${profError.message}`);
    }

    if ((i + 1) % 100 === 0) console.log(`  ${i + 1}/500 people created`);
  }
  console.log(`  ✓ ${personIds.length} people created`);

  // 4. Generate events and attach attendees
  console.log("\nGenerating events...");
  let eventCount = 0;

  for (const orgId of orgIds) {
    const numEvents = randomInt(8, 12);

    for (let e = 0; e < numEvents; e++) {
      const type = pick(eventTypes);
      const names = eventNames[type] || ["Community Event"];
      const name = pick(names);
      const eventDate = randomDate(2024, 2026);
      const attendeeCount = randomInt(15, 80);
      const attendees = pickN(personIds, attendeeCount);

      // Also update the created_by to use a profile associated with this org
      // For simplicity, use the seed user for all
      const { data: event, error: evtError } = await supabase
        .from("events")
        .insert({
          organization_id: orgId,
          created_by: seedUserId,
          name: `${name} ${randomInt(2024, 2026)}`,
          short_description: `A ${type} event for the community.`,
          event_date: eventDate,
          event_type: type,
          attendee_count: attendees.length,
        })
        .select("id")
        .single();

      if (evtError) {
        console.error(`  ✗ Error creating event: ${evtError.message}`);
        continue;
      }

      // Attach attendees
      const attendeeRows = attendees.map((personId) => ({
        event_id: event.id,
        person_id: personId,
        raw_data: {},
      }));

      // Insert in batches of 50
      for (let batch = 0; batch < attendeeRows.length; batch += 50) {
        const slice = attendeeRows.slice(batch, batch + 50);
        const { error: attError } = await supabase
          .from("event_attendees")
          .upsert(slice, { onConflict: "event_id,person_id" });
        if (attError) {
          console.error(`  ✗ Error inserting attendees: ${attError.message}`);
        }
      }

      eventCount++;
    }
  }
  console.log(`  ✓ ${eventCount} events created`);

  console.log("\n✅ Seed complete!");
  console.log(`   ${orgIds.length} organizations`);
  console.log(`   ${personIds.length} people`);
  console.log(`   ${eventCount} events`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
