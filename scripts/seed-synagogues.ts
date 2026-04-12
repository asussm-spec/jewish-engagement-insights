/**
 * Seed script — generates 15 synagogues with realistic membership data.
 * 5 Reform, 5 Conservative, 5 Orthodox.
 * 200-500 members each, most married, many with kids.
 *
 * Run: npx tsx scripts/seed-synagogues.ts
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
  "Rivka", "Oren", "Eliana", "Micah", "Aviva", "Moshe", "Devorah", "Shmuel",
  "Batya", "Yosef", "Chava", "Menachem", "Bracha", "Dovid", "Malka", "Aryeh",
  "Penina", "Tzvi", "Ayelet", "Reuven", "Tehila", "Shimon", "Hadassah", "Yehuda",
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
];

const kidNames = [
  "Emma", "Noah", "Lily", "Jack", "Ava", "Leo", "Mia", "Ben",
  "Zoe", "Sam", "Maya", "Eli", "Sophie", "Max", "Noa", "Asher",
  "Talia", "Jonah", "Ella", "Caleb", "Ruby", "Tom", "Olive", "Levi",
  "Ezra", "Shoshana", "Ari", "Liora", "Noam", "Tova", "Gideon", "Avital",
];

const spouseFirstNames = [
  "Sarah", "David", "Rachel", "Michael", "Rebecca", "Daniel", "Leah", "Joshua",
  "Hannah", "Benjamin", "Miriam", "Samuel", "Esther", "Aaron", "Naomi", "Eli",
  "Sophie", "Jacob", "Emma", "Oliver", "Lily", "Nathan", "Zoe", "Adam",
  "Emily", "Matthew", "Noa", "Gabriel", "Talia", "Lucas", "Ariel", "Simon",
];

// ── Synagogues ──────────────────────────────────────────

interface SynagogueConfig {
  name: string;
  denomination: "reform" | "conservative" | "orthodox";
  subtype: string;
  memberRange: [number, number];
  emailDomain: string;
}

const synagogues: SynagogueConfig[] = [
  // Reform (5)
  { name: "Temple Sinai", denomination: "reform", subtype: "reform", memberRange: [300, 450], emailDomain: "templesinai.org" },
  { name: "Beth Israel Reform", denomination: "reform", subtype: "reform", memberRange: [250, 400], emailDomain: "bethisraelreform.org" },
  { name: "Temple Emanu-El", denomination: "reform", subtype: "reform", memberRange: [350, 500], emailDomain: "emanu-el.org" },
  { name: "Congregation Or Shalom", denomination: "reform", subtype: "reform", memberRange: [200, 350], emailDomain: "orshalom.org" },
  { name: "Temple Har Zion", denomination: "reform", subtype: "reform", memberRange: [280, 420], emailDomain: "harzion.org" },
  // Conservative (5)
  { name: "Congregation Beth Shalom", denomination: "conservative", subtype: "conservative", memberRange: [250, 400], emailDomain: "bethshalom.org" },
  { name: "Adath Jeshurun", denomination: "conservative", subtype: "conservative", memberRange: [300, 450], emailDomain: "adathjeshurun.org" },
  { name: "Temple Bnai Torah", denomination: "conservative", subtype: "conservative", memberRange: [200, 350], emailDomain: "bnaitorah.org" },
  { name: "Ohev Shalom Synagogue", denomination: "conservative", subtype: "conservative", memberRange: [280, 380], emailDomain: "ohevshalom.org" },
  { name: "Congregation Agudas Achim", denomination: "conservative", subtype: "conservative", memberRange: [220, 400], emailDomain: "agudasachim.org" },
  // Orthodox (5)
  { name: "Young Israel of Brookline", denomination: "orthodox", subtype: "modern_orthodox", memberRange: [200, 350], emailDomain: "yibrookline.org" },
  { name: "Congregation Shaarei Tefillah", denomination: "orthodox", subtype: "modern_orthodox", memberRange: [250, 400], emailDomain: "shaareitefillah.org" },
  { name: "Beth Jacob Congregation", denomination: "orthodox", subtype: "orthodox", memberRange: [300, 450], emailDomain: "bethjacob.org" },
  { name: "Kehillath Israel", denomination: "orthodox", subtype: "modern_orthodox", memberRange: [220, 380], emailDomain: "kehillathisrael.org" },
  { name: "Anshei Sfard", denomination: "orthodox", subtype: "orthodox", memberRange: [200, 300], emailDomain: "ansheisfard.org" },
];

// Membership types by denomination
const membershipTypes: Record<string, { types: string[]; weights: number[] }> = {
  reform: {
    types: ["Family", "Individual", "Young Professional", "Senior", "Associate"],
    weights: [50, 20, 10, 15, 5],
  },
  conservative: {
    types: ["Family", "Individual", "Young Adult", "Senior", "Sustaining"],
    weights: [55, 15, 10, 12, 8],
  },
  orthodox: {
    types: ["Family", "Individual", "Young Couple", "Senior", "Full"],
    weights: [60, 12, 12, 8, 8],
  },
};

const membershipStatuses = ["Current", "Current", "Current", "Current", "Lapsed", "New"];

const jewishEducationTypes = [
  "Hebrew School", "Day School", "Supplementary School", "None",
  "Hebrew School", "Day School", "None", "Homeschool Jewish Ed",
];

const volunteerRoles = [
  "Kiddush Committee", "Gala Committee", "Youth Programs", "Social Action",
  "Ritual Committee", "Building & Grounds", "Membership Committee",
  "Education Committee", "Sisterhood/Brotherhood", "Board of Directors",
];

const zipCodes = [
  "02134", "02135", "02138", "02139", "02140", "02141", "02142",
  "02143", "02144", "02145", "02148", "02149", "02150", "02155",
  "02160", "02161", "02169", "02170", "02171", "02176",
  "02332", "02333", "02346", "02351", "02360",
  "01701", "01702", "01720", "01730", "01740", "01760",
];

const cities = [
  "Brookline", "Newton", "Cambridge", "Somerville", "Watertown",
  "Brighton", "Allston", "Needham", "Wellesley", "Natick",
  "Framingham", "Lexington", "Arlington", "Belmont", "Waltham",
  "Sharon", "Canton", "Stoughton", "Brockton", "Plymouth",
];

// ── Main ────────────────────────────────────────────────

async function main() {
  console.log("🏛️  Seeding 15 synagogues with membership data...\n");

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

  const usedEmails = new Set<string>();
  let totalMembers = 0;
  let totalOrgs = 0;

  for (const synConfig of synagogues) {
    console.log(`\n🕍 ${synConfig.name} (${synConfig.denomination})`);

    // Create or find the org
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("name", synConfig.name)
      .single();

    let orgId: string;
    if (existingOrg) {
      orgId = existingOrg.id;
      console.log("  ✓ Org exists");
    } else {
      const { data: newOrg, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: synConfig.name,
          org_type: "synagogue",
          subtype: synConfig.subtype,
          email_domains: [synConfig.emailDomain],
        })
        .select("id")
        .single();
      if (orgError) throw orgError;
      orgId = newOrg.id;
      console.log("  + Created org");
    }
    totalOrgs++;

    // Update seed user's org for this batch (so RLS works)
    await supabase
      .from("profiles")
      .update({ organization_id: orgId })
      .eq("id", seedUserId);

    // Create a population upload record
    const { data: popUpload, error: popError } = await supabase
      .from("population_uploads")
      .insert({
        organization_id: orgId,
        created_by: seedUserId,
        name: `${synConfig.name} Membership ${new Date().getFullYear()}`,
        description: `Full membership roster for ${synConfig.name}`,
      })
      .select("id")
      .single();
    if (popError) throw popError;

    const memberCount = randomInt(synConfig.memberRange[0], synConfig.memberRange[1]);
    let processedCount = 0;

    for (let m = 0; m < memberCount; m++) {
      const firstName = pick(firstNames);
      const lastName = pick(lastNames);
      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}@example.com`;
      while (usedEmails.has(email)) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1000, 99999)}@example.com`;
      }
      usedEmails.add(email);

      // Create identity
      const { data: identity, error: idError } = await supabase
        .from("people_identities")
        .upsert({ email, first_name: firstName, last_name: lastName }, { onConflict: "email" })
        .select("id")
        .single();
      if (idError || !identity) {
        console.error(`  ✗ Identity error: ${idError?.message}`);
        continue;
      }

      // Demographics
      const dob = randomDate(1955, 2005);
      const ageBucket = ageBucketFromDOB(dob);
      const isMarried = Math.random() < 0.72; // 72% married
      const hasKids = isMarried ? Math.random() < 0.65 : Math.random() < 0.15;
      const numKids = hasKids ? randomInt(1, 4) : 0;

      // Build attributes
      const attributes: Record<string, string> = {};

      // Membership fields (org-namespaced)
      const orgPrefix = `org:${orgId}`;
      const memType = pickWeighted(
        membershipTypes[synConfig.denomination].types,
        membershipTypes[synConfig.denomination].weights
      );
      attributes[`${orgPrefix}:membership_type`] = memType;
      attributes[`${orgPrefix}:membership_status`] = pick(membershipStatuses);
      attributes[`${orgPrefix}:synagogue_member`] = "yes";
      attributes[`${orgPrefix}:member_since`] = randomDate(2005, 2025);

      // Donor status (40% are donors)
      if (Math.random() < 0.4) {
        attributes[`${orgPrefix}:is_donor`] = "yes";
        attributes[`${orgPrefix}:donor_level`] = pickWeighted(
          ["Sustaining", "Supporting", "Contributing", "Patron", "Benefactor"],
          [30, 25, 25, 12, 8]
        );
      }

      // Volunteer (25%)
      if (Math.random() < 0.25) {
        attributes[`${orgPrefix}:is_volunteer`] = "yes";
        attributes[`${orgPrefix}:volunteer_role`] = pick(volunteerRoles);
      }

      // Board member (5%)
      if (Math.random() < 0.05) {
        attributes[`${orgPrefix}:is_board_member`] = "yes";
      }

      // Spouse
      if (isMarried) {
        attributes.spouse_name = `${pick(spouseFirstNames)} ${lastName}`;
      }

      // Children
      for (let k = 1; k <= numKids; k++) {
        attributes[`child_${k}_name`] = pick(kidNames);
        attributes[`child_${k}_dob`] = randomDate(2008, 2024);
      }

      // Jewish education for kids
      if (hasKids) {
        attributes.jewish_education = pick(jewishEducationTypes);
      }

      // Day school enrollment (15% of families with kids)
      if (hasKids && Math.random() < 0.15) {
        attributes.day_school_enrolled = "yes";
        attributes.day_school_name = pick([
          "Solomon Schechter", "Maimonides", "Gann Academy",
          "Rashi School", "JCDS", "Torah Academy", "Bais Yaakov",
        ]);
      }

      // Geographic
      attributes.zip_code = pick(zipCodes);
      attributes.city = pick(cities);

      // Engagement signals
      if (Math.random() < 0.3) {
        attributes.attends_shabbat = pickWeighted(
          ["Weekly", "Monthly", "Occasionally", "High Holidays Only"],
          [15, 25, 35, 25]
        );
      }

      if (Math.random() < 0.2) {
        attributes.hebrew_school_parent = hasKids ? "yes" : "no";
      }

      if (Math.random() < 0.15) {
        attributes.bnai_mitzvah_upcoming = pick(["2025", "2026", "2027", "2028"]);
      }

      // Profile upsert
      const { error: profError } = await supabase
        .from("people_profiles")
        .upsert({
          id: identity.id,
          date_of_birth: dob,
          age_bucket: ageBucket,
          denomination: synConfig.denomination,
          has_children: hasKids,
          number_of_children: numKids,
          is_member: true,
          member_org_ids: [orgId],
          data_sources: 1,
          attributes,
        }, { onConflict: "id" });

      if (profError) {
        console.error(`  ✗ Profile error: ${profError.message}`);
        continue;
      }

      // Add to population_members
      const { error: memError } = await supabase
        .from("population_members")
        .upsert({
          population_id: popUpload.id,
          person_id: identity.id,
          raw_data: { first_name: firstName, last_name: lastName, email },
        }, { onConflict: "population_id,person_id" });

      if (memError) {
        console.error(`  ✗ Population member error: ${memError.message}`);
        continue;
      }

      processedCount++;
    }

    // Update member count
    await supabase
      .from("population_uploads")
      .update({ member_count: processedCount })
      .eq("id", popUpload.id);

    console.log(`  ✓ ${processedCount} members created`);
    totalMembers += processedCount;
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   ${totalOrgs} synagogues`);
  console.log(`   ${totalMembers} total members`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
