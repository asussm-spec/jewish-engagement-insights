/**
 * Seed script — populates the Greater Boston JCC with realistic data for the
 * JCC Program Manager demo.
 *
 *   • ~2,000 members across family / individual / senior / young-adult tiers
 *   • 30+ events across JCC programming areas (fitness, early childhood,
 *     seniors, arts & culture, teen, Jewish life, family)
 *   • Attendees linked from the population with realistic demographic skew
 *     per event type (e.g., seniors go to senior programs, young families
 *     go to Tot Shabbat)
 *
 * Run: npx tsx scripts/seed-jcc.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Safe to re-run — upserts by natural keys; old JCC events are preserved.
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

// ── Helpers ──────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}
function pickWeighted<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
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
function ageFromDOB(dob: string): number {
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}
function ageBucketFromDOB(dob: string): string {
  const age = ageFromDOB(dob);
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
  "Rivka", "Oren", "Eliana", "Micah", "Aviva", "Moshe", "Devorah", "Shmuel",
  "Jessica", "Ryan", "Jennifer", "Brian", "Amanda", "Robert", "Ashley", "John",
  "Megan", "Kevin", "Stephanie", "Brandon", "Nicole", "Jason", "Tracy", "Scott",
  "Rosalie", "Arthur", "Bernice", "Harold", "Sylvia", "Stanley", "Miriam", "Morris",
];
const lastNames = [
  "Cohen", "Levy", "Goldstein", "Shapiro", "Friedman", "Katz", "Rosen",
  "Schwartz", "Klein", "Weiss", "Stern", "Berger", "Goldman", "Silverman",
  "Greenberg", "Kaplan", "Epstein", "Bloom", "Stein", "Meyer", "Adler",
  "Blum", "Frank", "Gross", "Kohn", "Segal", "Feldman", "Horowitz",
  "Lieberman", "Marcus", "Peretz", "Rubin", "Schneider", "Solomon",
  "Strauss", "Weil", "Zimmerman", "Abrams", "Becker", "Diamond",
  "Fishman", "Geller", "Handler", "Isaacs", "Jacobson", "Kantor",
  "Lazar", "Mandel", "Newman", "Ostrow", "Plotkin", "Rand",
  "Sherman", "Tannenbaum", "Unger", "Vogel", "Weinberg", "Yates",
  "Chen-Cohen", "Kim-Levy", "Rodriguez-Stein", "Patel-Schwartz",
];
const kidNames = [
  "Emma", "Noah", "Lily", "Jack", "Ava", "Leo", "Mia", "Ben",
  "Zoe", "Sam", "Maya", "Eli", "Sophie", "Max", "Noa", "Asher",
  "Talia", "Jonah", "Ella", "Caleb", "Ruby", "Tom", "Olive", "Levi",
  "Ezra", "Shoshana", "Ari", "Liora", "Noam", "Tova", "Gideon", "Avital",
];
const zipCodes = [
  "02134", "02135", "02138", "02139", "02140", "02141", "02142",
  "02143", "02144", "02145", "02148", "02149", "02155",
  "02160", "02161", "02445", "02446", "02458", "02459", "02462",
  "02464", "02465", "02468", "02481", "02492",
];
const cities = [
  "Brookline", "Newton", "Cambridge", "Somerville", "Watertown",
  "Brighton", "Allston", "Needham", "Wellesley", "Natick",
  "Framingham", "Lexington", "Arlington", "Belmont", "Waltham",
];
const denominations = [
  "reform", "reform", "reform", "reform",
  "conservative", "conservative", "conservative",
  "just_jewish", "just_jewish", "just_jewish", "just_jewish", "just_jewish",
  "orthodox",
  "reconstructionist",
];

// ── Membership tiers ────────────────────────────────────
// JCCs sell membership tiers — different from synagogues.
type MemberTier = {
  name: string;
  ageMin: number;
  ageMax: number;
  weight: number;
  hasKidsPct: number;
  marriedPct: number;
};
const tiers: MemberTier[] = [
  { name: "Family",            ageMin: 28, ageMax: 55, weight: 40, hasKidsPct: 0.92, marriedPct: 0.88 },
  { name: "Individual",        ageMin: 22, ageMax: 70, weight: 18, hasKidsPct: 0.10, marriedPct: 0.15 },
  { name: "Young Adult",       ageMin: 22, ageMax: 35, weight: 14, hasKidsPct: 0.05, marriedPct: 0.12 },
  { name: "Senior",            ageMin: 62, ageMax: 92, weight: 16, hasKidsPct: 0.00, marriedPct: 0.55 },
  { name: "Senior Couple",     ageMin: 62, ageMax: 90, weight: 6,  hasKidsPct: 0.00, marriedPct: 1.00 },
  { name: "Student",           ageMin: 18, ageMax: 26, weight: 3,  hasKidsPct: 0.00, marriedPct: 0.00 },
  { name: "Day Pass",          ageMin: 22, ageMax: 75, weight: 3,  hasKidsPct: 0.20, marriedPct: 0.40 },
];

// JCC-specific interest tags that show up as attributes
const programInterestPool = [
  "fitness", "swim", "group_fitness", "personal_training", "pilates", "yoga",
  "senior_lunch", "senior_trips", "early_childhood", "preschool", "after_school",
  "tot_shabbat", "family_programs", "teen_maccabi", "bbyo",
  "book_festival", "film_festival", "lecture_series", "concerts",
  "day_camp", "holiday_programs", "jewish_learning", "pj_library",
  "mens_club", "womens_group", "singles", "lgbtq",
];

// ── Events ──────────────────────────────────────────────
// Each event lists the kinds of attendees it typically draws, used to skew
// the attendee sampling.
type EventSpec = {
  name: string;
  type: "holiday" | "shabbat" | "educational" | "social" | "fundraiser" |
        "family" | "youth" | "cultural" | "worship" | "volunteer" |
        "health_wellness" | "arts_culture" | "community_social" | "youth_family" |
        "learning_education" | "holiday_calendar" | "institutional";
  category: "fitness" | "early_childhood" | "senior" | "arts_culture" |
            "teen" | "family" | "community" | "jewish_life" | "institutional";
  date: string; // YYYY-MM-DD
  attendeeRange: [number, number];
  ageSkew: "kids" | "teens" | "young_adult" | "family" | "senior" | "mixed";
  description: string;
};

const events: EventSpec[] = [
  // ── Fitness / Wellness ────────────────────────────
  { name: "New Year Wellness Kickoff",        type: "health_wellness", category: "fitness",         date: "2026-01-04", attendeeRange: [60, 90],   ageSkew: "mixed",        description: "Open house for fitness members, class samplers, and healthy cooking demo." },
  { name: "Mindful Meditation Series — Session 1", type: "health_wellness", category: "fitness",    date: "2026-01-15", attendeeRange: [18, 30],   ageSkew: "mixed",        description: "Weekly mindfulness practice, 8-week series." },
  { name: "Group Swim Clinic",                type: "health_wellness", category: "fitness",         date: "2026-02-12", attendeeRange: [22, 38],   ageSkew: "mixed",        description: "Technique and endurance for adult swimmers." },
  { name: "Spring Health Fair",               type: "health_wellness", category: "fitness",         date: "2026-03-22", attendeeRange: [180, 260], ageSkew: "mixed",        description: "Wellness vendors, BP/glucose screenings, fitness demos." },

  // ── Early Childhood / Family ──────────────────────
  { name: "Tot Shabbat — January",            type: "youth_family",    category: "family",          date: "2026-01-16", attendeeRange: [45, 70],   ageSkew: "family",       description: "Friday morning Tot Shabbat with songs and challah for families with kids 0-5." },
  { name: "Tot Shabbat — February",           type: "youth_family",    category: "family",          date: "2026-02-13", attendeeRange: [50, 75],   ageSkew: "family",       description: "Monthly Tot Shabbat." },
  { name: "Tot Shabbat — March",              type: "youth_family",    category: "family",          date: "2026-03-13", attendeeRange: [55, 80],   ageSkew: "family",       description: "Monthly Tot Shabbat." },
  { name: "PJ Library Family Breakfast",      type: "family",          category: "family",          date: "2026-02-01", attendeeRange: [60, 95],   ageSkew: "family",       description: "Sunday morning story time and pancakes with PJ Library." },
  { name: "Preschool Open House",             type: "institutional",   category: "early_childhood", date: "2026-01-25", attendeeRange: [70, 110],  ageSkew: "family",       description: "Tour the preschool, meet teachers, Q&A for prospective families." },
  { name: "Family Hanukkah Celebration",      type: "holiday_calendar", category: "family",         date: "2025-12-21", attendeeRange: [220, 340], ageSkew: "family",       description: "Community Hanukkah celebration with latkes, menorah lighting, and kids activities." },
  { name: "Purim Carnival",                   type: "holiday_calendar", category: "family",         date: "2026-03-01", attendeeRange: [280, 420], ageSkew: "family",       description: "JCC Purim carnival with games, costumes, and hamentaschen." },

  // ── Senior programming ────────────────────────────
  { name: "Senior Lunch Program — January",   type: "community_social",category: "senior",          date: "2026-01-08", attendeeRange: [55, 85],   ageSkew: "senior",       description: "Weekly senior lunch with speaker and musical performance." },
  { name: "Senior Lunch Program — February",  type: "community_social",category: "senior",          date: "2026-02-05", attendeeRange: [60, 90],   ageSkew: "senior",       description: "Weekly senior lunch." },
  { name: "Senior Lunch Program — March",     type: "community_social",category: "senior",          date: "2026-03-05", attendeeRange: [58, 88],   ageSkew: "senior",       description: "Weekly senior lunch." },
  { name: "Senior Day Trip — MFA",            type: "cultural",        category: "senior",          date: "2026-02-19", attendeeRange: [35, 55],   ageSkew: "senior",       description: "Chartered bus to the Museum of Fine Arts with docent tour." },
  { name: "Active Aging Forum",               type: "learning_education",category:"senior",          date: "2026-03-15", attendeeRange: [60, 95],   ageSkew: "senior",       description: "Panel on aging well — health, finance, purpose, community." },
  { name: "Senior Shabbat Lunch",             type: "community_social",category: "senior",          date: "2026-02-26", attendeeRange: [45, 70],   ageSkew: "senior",       description: "Friday Shabbat lunch for seniors with d'var Torah." },

  // ── Arts & Culture ────────────────────────────────
  { name: "Jewish Book Festival Opening Night", type: "arts_culture",  category: "arts_culture",    date: "2025-11-05", attendeeRange: [180, 260], ageSkew: "mixed",        description: "Keynote author conversation opening the annual Jewish Book Festival." },
  { name: "Jewish Film Festival — Screening 1", type: "arts_culture",  category: "arts_culture",    date: "2026-02-08", attendeeRange: [120, 180], ageSkew: "mixed",        description: "Opening film of the JCC Jewish Film Festival." },
  { name: "Jewish Film Festival — Closing Night", type: "arts_culture",category: "arts_culture",    date: "2026-02-22", attendeeRange: [140, 210], ageSkew: "mixed",        description: "Closing film and director Q&A." },
  { name: "Klezmer Concert",                  type: "arts_culture",    category: "arts_culture",    date: "2026-03-08", attendeeRange: [90, 150],  ageSkew: "mixed",        description: "Winter concert featuring a Boston-area klezmer ensemble." },
  { name: "Author Talk — Israel in Context",  type: "learning_education",category: "arts_culture",  date: "2026-01-29", attendeeRange: [110, 170], ageSkew: "mixed",        description: "Visiting author on contemporary Israeli society." },

  // ── Teens / Youth ─────────────────────────────────
  { name: "Maccabi Team Tryouts",             type: "youth",           category: "teen",            date: "2026-01-11", attendeeRange: [40, 70],   ageSkew: "teens",        description: "Tryouts for the JCC Maccabi summer games delegation." },
  { name: "Teen Leadership Cohort Launch",    type: "youth_family",    category: "teen",            date: "2026-02-06", attendeeRange: [22, 38],   ageSkew: "teens",        description: "First meeting of the high school leadership cohort." },
  { name: "BBYO Regional Kickoff",            type: "youth",           category: "teen",            date: "2026-01-18", attendeeRange: [55, 85],   ageSkew: "teens",        description: "Regional BBYO event hosted at the JCC." },
  { name: "After-School Pickup Families Mixer", type: "family",        category: "teen",            date: "2026-02-15", attendeeRange: [40, 65],   ageSkew: "family",       description: "Informal mixer for families whose kids attend the after-school program." },

  // ── Jewish Life / Learning ────────────────────────
  { name: "Adult Hebrew — Level 2 Orientation", type: "educational",   category: "jewish_life",     date: "2026-01-07", attendeeRange: [18, 30],   ageSkew: "mixed",        description: "Kickoff for the 12-week adult Hebrew learning cohort." },
  { name: "Introduction to Judaism",          type: "learning_education",category: "jewish_life",   date: "2026-02-04", attendeeRange: [22, 38],   ageSkew: "mixed",        description: "Multi-session intro course for converts, interfaith couples, and curious community members." },
  { name: "Community Seder",                  type: "holiday_calendar",category: "jewish_life",     date: "2026-04-12", attendeeRange: [220, 340], ageSkew: "mixed",        description: "Community Passover Seder at the JCC." },
  { name: "Shabbat Dinner Club",              type: "community_social",category: "jewish_life",     date: "2026-02-28", attendeeRange: [80, 130],  ageSkew: "mixed",        description: "Catered Shabbat dinner for JCC community, monthly." },

  // ── Community / Social ────────────────────────────
  { name: "Young Professionals Mixer",        type: "community_social",category: "community",       date: "2026-02-20", attendeeRange: [75, 120],  ageSkew: "young_adult",  description: "20s/30s happy hour at the JCC." },
  { name: "New Member Welcome",               type: "community_social",category: "community",       date: "2026-01-22", attendeeRange: [45, 75],   ageSkew: "mixed",        description: "Tour, Q&A, and social hour for new members who joined in the last quarter." },
  { name: "LGBTQ+ Community Shabbat",         type: "community_social",category: "community",       date: "2026-03-21", attendeeRange: [55, 90],   ageSkew: "mixed",        description: "Pride Shabbat dinner hosted by the JCC LGBTQ+ group." },
  { name: "Volunteer Day — Greater Boston Food Bank", type: "volunteer",category:"community",       date: "2026-01-26", attendeeRange: [40, 65],   ageSkew: "mixed",        description: "Group volunteer day at the Greater Boston Food Bank." },

  // ── Institutional / Fundraiser ────────────────────
  { name: "Annual Gala",                      type: "fundraiser",      category: "institutional",   date: "2026-03-28", attendeeRange: [320, 440], ageSkew: "mixed",        description: "Annual JCC Gala honoring community leaders." },
  { name: "State of the JCC Town Hall",       type: "institutional",   category: "institutional",   date: "2026-02-24", attendeeRange: [110, 170], ageSkew: "mixed",        description: "CEO town hall — strategic priorities and Q&A." },
];

// ── Main ────────────────────────────────────────────────
type PersonRecord = {
  id: string;
  dob: string;
  age: number;
  hasKids: boolean;
  isFamily: boolean;
  isSenior: boolean;
  isYoungAdult: boolean;
  isTeen: boolean;
  isKidUnder13: boolean;
  interests: Set<string>;
};

async function main() {
  console.log("🏢 Seeding Greater Boston JCC demo data...\n");

  // Find the JCC
  const { data: jcc } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("name", JCC_NAME)
    .single();

  if (!jcc) {
    throw new Error(`Org "${JCC_NAME}" not found. Run seed-data.ts first.`);
  }
  const orgId = jcc.id;
  console.log(`✓ Found ${jcc.name} (${orgId.slice(0, 8)})\n`);

  // Get or create seed user
  let seedUserId: string;
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("full_name", "Seed Bot")
    .single();

  if (existingProfile) {
    seedUserId = existingProfile.id;
    console.log("✓ Using existing seed user");
  } else {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: "seed@engagement-insights.test",
      password: "seed-password-not-real-12345",
      email_confirm: true,
      user_metadata: { full_name: "Seed Bot" },
    });
    if (authError) throw authError;
    seedUserId = authUser.user.id;
    console.log("+ Created seed user");
  }

  // Point seed user at the JCC for RLS writes
  await supabase
    .from("profiles")
    .update({ organization_id: orgId })
    .eq("id", seedUserId);

  // ── Create the population upload ──────────────────
  console.log("\n📋 Creating population upload...");
  const { data: popUpload, error: popErr } = await supabase
    .from("population_uploads")
    .insert({
      organization_id: orgId,
      created_by: seedUserId,
      name: `${JCC_NAME} Membership — Spring 2026`,
      description: `Full roster: fitness, family, senior, young adult, and student memberships.`,
    })
    .select("id")
    .single();
  if (popErr) throw popErr;
  const populationId = popUpload.id;

  // ── Seed members ───────────────────────────────────
  console.log("\n👥 Seeding ~2,000 JCC members...");
  const orgPrefix = `org:${orgId}`;
  const usedEmails = new Set<string>();
  const people: PersonRecord[] = [];
  const TARGET = 2000;

  let processed = 0;
  for (let i = 0; i < TARGET; i++) {
    // Pick a tier weighted by membership mix
    const tier = pickWeighted(
      tiers,
      tiers.map((t) => t.weight)
    );

    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}${randomInt(1, 999)}@example.com`;
    while (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}${randomInt(1000, 99999)}@example.com`;
    }
    usedEmails.add(email);

    // Identity
    const { data: identity, error: idError } = await supabase
      .from("people_identities")
      .upsert({ email, first_name: firstName, last_name: lastName }, { onConflict: "email" })
      .select("id")
      .single();
    if (idError || !identity) {
      console.error(`  ✗ Identity error: ${idError?.message}`);
      continue;
    }

    // DOB within the tier's age range
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - randomInt(tier.ageMin, tier.ageMax);
    const dob = `${birthYear}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`;
    const age = ageFromDOB(dob);
    const hasKids = Math.random() < tier.hasKidsPct;
    const isMarried = Math.random() < tier.marriedPct;
    const numKids = hasKids ? randomInt(1, 3) : 0;

    // Attribute blob
    const attributes: Record<string, string> = {};

    // Membership info (org-namespaced)
    attributes[`${orgPrefix}:membership_tier`] = tier.name;
    attributes[`${orgPrefix}:jcc_member`] = tier.name === "Day Pass" ? "day_pass" : "yes";
    attributes[`${orgPrefix}:member_since`] = randomDate(Math.max(2005, currentYear - 25), currentYear);

    // Fitness access (roughly everyone except Day Pass has some access)
    if (tier.name !== "Day Pass" && Math.random() < 0.82) {
      attributes[`${orgPrefix}:fitness_access`] = "yes";
    }

    // Program interests — seed a handful based on tier
    const interests = new Set<string>();
    const picked = pickN(programInterestPool, randomInt(1, 4));
    for (const p of picked) interests.add(p);
    // Seed clusters by tier
    if (tier.name === "Family") {
      for (const p of ["tot_shabbat", "family_programs", "pj_library", "holiday_programs"]) {
        if (Math.random() < 0.5) interests.add(p);
      }
    }
    if (tier.name === "Senior" || tier.name === "Senior Couple") {
      for (const p of ["senior_lunch", "senior_trips", "lecture_series", "concerts"]) {
        if (Math.random() < 0.55) interests.add(p);
      }
    }
    if (tier.name === "Young Adult" || tier.name === "Student") {
      for (const p of ["fitness", "group_fitness", "singles", "film_festival"]) {
        if (Math.random() < 0.5) interests.add(p);
      }
    }
    attributes[`${orgPrefix}:program_interests`] = Array.from(interests).join(",");

    // Donor / board
    if (Math.random() < 0.18) {
      attributes[`${orgPrefix}:is_donor`] = "yes";
      attributes[`${orgPrefix}:donor_level`] = pickWeighted(
        ["Sustaining", "Supporting", "Patron", "Leadership"],
        [40, 30, 20, 10]
      );
    }
    if (Math.random() < 0.03) {
      attributes[`${orgPrefix}:is_board_member`] = "yes";
    }

    // Household
    if (isMarried) {
      attributes.spouse_name = `${pick(firstNames)} ${lastName}`;
    }
    for (let k = 1; k <= numKids; k++) {
      const kidDob = randomDate(Math.max(2007, currentYear - 16), currentYear - 1);
      attributes[`child_${k}_name`] = pick(kidNames);
      attributes[`child_${k}_dob`] = kidDob;
    }

    // Geo
    attributes.zip_code = pick(zipCodes);
    attributes.city = pick(cities);

    // Denomination (used by the dashboard demographics section)
    const denom = pick(denominations);

    const { error: profError } = await supabase.from("people_profiles").upsert(
      {
        id: identity.id,
        date_of_birth: dob,
        age_bucket: ageBucketFromDOB(dob),
        denomination: denom,
        has_children: hasKids,
        number_of_children: numKids,
        is_member: true,
        member_org_ids: [orgId],
        data_sources: 1,
        attributes,
      },
      { onConflict: "id" }
    );
    if (profError) {
      console.error(`  ✗ Profile error: ${profError.message}`);
      continue;
    }

    // Population row
    const { error: memError } = await supabase.from("population_members").upsert(
      {
        population_id: populationId,
        person_id: identity.id,
        raw_data: { first_name: firstName, last_name: lastName, email, tier: tier.name },
      },
      { onConflict: "population_id,person_id" }
    );
    if (memError) {
      console.error(`  ✗ Member error: ${memError.message}`);
      continue;
    }

    people.push({
      id: identity.id,
      dob,
      age,
      hasKids,
      isFamily: tier.name === "Family",
      isSenior: tier.name === "Senior" || tier.name === "Senior Couple",
      isYoungAdult: tier.name === "Young Adult" || tier.name === "Student",
      isTeen: age >= 13 && age <= 19,
      isKidUnder13: age < 13,
      interests,
    });
    processed++;

    if (processed % 250 === 0) console.log(`  ${processed}/${TARGET} members`);
  }

  await supabase
    .from("population_uploads")
    .update({ member_count: processed })
    .eq("id", populationId);
  console.log(`  ✓ ${processed} members created`);

  // ── Seed events ────────────────────────────────────
  console.log("\n📅 Seeding events...");
  let eventCount = 0;
  let attendeeTotal = 0;

  for (const ev of events) {
    // Check if an event with this name already exists for this org on this date
    const { data: existingEvent } = await supabase
      .from("events")
      .select("id")
      .eq("organization_id", orgId)
      .eq("name", ev.name)
      .eq("event_date", ev.date)
      .maybeSingle();

    let eventId: string;
    if (existingEvent) {
      eventId = existingEvent.id;
    } else {
      const { data: newEvent, error: evErr } = await supabase
        .from("events")
        .insert({
          organization_id: orgId,
          created_by: seedUserId,
          name: ev.name,
          short_description: ev.description,
          event_date: ev.date,
          event_type: ev.type,
          attendee_count: 0,
        })
        .select("id")
        .single();
      if (evErr) {
        console.error(`  ✗ Event error (${ev.name}): ${evErr.message}`);
        continue;
      }
      eventId = newEvent.id;
    }

    // Sample attendees with age-skew weighting
    const target = randomInt(ev.attendeeRange[0], ev.attendeeRange[1]);
    const pool = people.map((p) => {
      let w = 1;
      if (ev.ageSkew === "senior") w = p.isSenior ? 8 : p.age >= 55 ? 2 : 0.15;
      else if (ev.ageSkew === "family") w = p.isFamily || p.hasKids ? 6 : 0.3;
      else if (ev.ageSkew === "young_adult") w = p.isYoungAdult ? 6 : p.age < 40 ? 1.5 : 0.2;
      else if (ev.ageSkew === "teens") w = p.isTeen || p.hasKids ? 3 : 0.2;
      else if (ev.ageSkew === "kids") w = p.isKidUnder13 ? 6 : 0.2;
      else w = 1; // mixed
      // Boost if they've expressed interest in this category
      if (p.interests.has(ev.category)) w *= 2.5;
      return { person: p, weight: w };
    });

    const picked = new Set<string>();
    const attendees: string[] = [];
    // Weighted sample without replacement
    let attempts = 0;
    while (attendees.length < target && attempts < target * 10) {
      const totalW = pool.reduce((s, x) => s + x.weight, 0);
      let r = Math.random() * totalW;
      for (const x of pool) {
        r -= x.weight;
        if (r <= 0) {
          if (!picked.has(x.person.id)) {
            picked.add(x.person.id);
            attendees.push(x.person.id);
          }
          break;
        }
      }
      attempts++;
    }

    // Upsert attendee rows
    const rows = attendees.map((pid) => ({
      event_id: eventId,
      person_id: pid,
      raw_data: {},
    }));
    for (let b = 0; b < rows.length; b += 100) {
      const slice = rows.slice(b, b + 100);
      const { error: attErr } = await supabase
        .from("event_attendees")
        .upsert(slice, { onConflict: "event_id,person_id" });
      if (attErr) console.error(`  ✗ Attendee error (${ev.name}): ${attErr.message}`);
    }

    // Update event attendee count
    await supabase
      .from("events")
      .update({ attendee_count: attendees.length })
      .eq("id", eventId);

    console.log(`  ✓ ${ev.name.padEnd(44)} ${attendees.length.toString().padStart(3)} attendees`);
    eventCount++;
    attendeeTotal += attendees.length;
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   ${jcc.name}`);
  console.log(`   ${processed} members`);
  console.log(`   ${eventCount} events`);
  console.log(`   ${attendeeTotal} total attendance records`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
