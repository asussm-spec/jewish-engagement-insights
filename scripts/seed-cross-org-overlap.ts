/**
 * Seed cross-org overlap so JCC members appear in other orgs' rosters and
 * event attendance. Without this, the population-page cross-org charts
 * render empty.
 *
 * Targets (relative to JCC member count):
 *   - 35% also belong to one synagogue (round-robin across the 12 synagogues)
 *   - 8% also family of a Schechter day-school student
 *   - 6% also family at Camp Ramah
 *
 * Of cross-affiliated members, ~30% also have at least 1–3 event_attendees
 * rows at the target org (using existing events at TBS, Camp Ramah, Schechter).
 *
 * Idempotent: upserts on natural keys AND deterministic (seeded PRNG), so
 * re-runs assign the same people to the same orgs instead of accumulating
 * fresh random slices. Run rebalance-jcc-membership.ts first so is_member
 * reflects the realistic minority membership slice.
 *
 * Run: npx tsx scripts/seed-cross-org-overlap.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createServiceClient } from "../src/lib/supabase/service";

const sb = createServiceClient();
const JCC_NAME = "Greater Boston JCC";

// Deterministic PRNG (mulberry32) so re-runs assign the SAME people to the
// same orgs. With Math.random, every re-run sampled a fresh random slice and
// affiliations accumulated far beyond the target percentages.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchAllPersonIdsForUpload(uploadIds: string[]): Promise<string[]> {
  const out: string[] = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data: rows } = await sb
      .from("population_members")
      .select("person_id")
      .in("population_id", uploadIds)
      .range(from, from + PAGE - 1);
    if (!rows || rows.length === 0) break;
    for (const r of rows) out.push(r.person_id as string);
    if (rows.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

async function ensureUpload(
  orgId: string,
  createdBy: string,
  name: string,
  description: string
): Promise<string> {
  const { data: existing } = await sb
    .from("population_uploads")
    .select("id")
    .eq("organization_id", orgId)
    .eq("name", name)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await sb
    .from("population_uploads")
    .insert({
      organization_id: orgId,
      created_by: createdBy,
      name,
      description,
    })
    .select("id")
    .single();
  if (error || !created) throw error ?? new Error(`failed to create upload ${name}`);
  return created.id;
}

async function batchUpsertMembers(rows: { population_id: string; person_id: string }[]) {
  const SIZE = 200;
  for (let i = 0; i < rows.length; i += SIZE) {
    const slice = rows.slice(i, i + SIZE);
    const { error } = await sb
      .from("population_members")
      .upsert(slice, { onConflict: "population_id,person_id" });
    if (error) console.error("  upsert members error:", error.message);
  }
}

async function batchUpsertAttendees(rows: { event_id: string; person_id: string }[]) {
  const SIZE = 200;
  for (let i = 0; i < rows.length; i += SIZE) {
    const slice = rows.slice(i, i + SIZE);
    const { error } = await sb
      .from("event_attendees")
      .upsert(slice, { onConflict: "event_id,person_id" });
    if (error) console.error("  upsert attendees error:", error.message);
  }
}

async function main() {
  // Seed bot user
  const { data: seedUser } = await sb
    .from("profiles")
    .select("id")
    .eq("full_name", "Seed Bot")
    .single();
  if (!seedUser) throw new Error("Seed Bot user not found — run seed-jcc.ts first.");
  const seedUserId = seedUser.id;

  // Orgs
  const { data: orgs } = await sb.from("organizations").select("id, name, org_type");
  if (!orgs) throw new Error("no orgs");
  const jcc = orgs.find((o) => o.name === JCC_NAME);
  if (!jcc) throw new Error("JCC not found");
  const synagogues = orgs.filter((o) => o.org_type === "synagogue");
  const allDaySchools = orgs.filter((o) => o.org_type === "day_school");
  const allCamps = orgs.filter((o) => o.org_type === "camp");

  // Realistic distribution weights for day schools and camps
  // (sums per-list don't need to be normalized; weighted round-robin handles it).
  const DAY_SCHOOL_WEIGHTS: Record<string, number> = {
    "Solomon Schechter Day School": 35,
    "Rashi School": 25,
    "Maimonides School": 15,
    "Gann Academy": 15,
    "JCDS Boston": 10,
  };
  const CAMP_WEIGHTS: Record<string, number> = {
    "Camp Ramah New England": 25,
    "URJ Eisner Camp": 18,
    "Camp Yavneh": 18,
    "Camp Tevya": 12,
    "Camp Pembroke": 10,
    "Camp JRF": 9,
    "Capital Camps": 8,
  };

  const daySchools = allDaySchools.filter((o) => DAY_SCHOOL_WEIGHTS[o.name] !== undefined);
  const camps = allCamps.filter((o) => CAMP_WEIGHTS[o.name] !== undefined);

  // Reset existing day-school + camp seed uploads so the re-seed redistributes
  // affiliations across all currently-known orgs (otherwise old runs that only
  // saw one school/camp leave a stuck dominant entry).
  const seededUploadNames = [
    "Student & family roster — 2025–26",
    "Camper family roster — 2026",
  ];
  const resetOrgIds = [...daySchools, ...camps].map((o) => o.id);
  if (resetOrgIds.length > 0) {
    const { data: oldUploads } = await sb
      .from("population_uploads")
      .select("id")
      .in("organization_id", resetOrgIds)
      .in("name", seededUploadNames);
    const oldUploadIds = (oldUploads ?? []).map((u) => u.id);
    if (oldUploadIds.length > 0) {
      const { error: delErr } = await sb
        .from("population_members")
        .delete()
        .in("population_id", oldUploadIds);
      if (delErr) console.error("  reset members error:", delErr.message);
      console.log(`Reset day-school + camp memberships from ${oldUploadIds.length} prior uploads`);
    }
  }

  // JCC member identities (parents only — children are synthetic email-prefixed and we don't want to sprinkle them across orgs)
  const { data: jccUploads } = await sb
    .from("population_uploads")
    .select("id")
    .eq("organization_id", jcc.id);
  const jccUploadIds = (jccUploads ?? []).map((u) => u.id);
  const allJccPersonIds = await fetchAllPersonIdsForUpload(jccUploadIds);
  // Filter out synthetic children (their identity emails start with "child_")
  const adults: string[] = [];
  const BATCH = 100;
  for (let i = 0; i < allJccPersonIds.length; i += BATCH) {
    const slice = allJccPersonIds.slice(i, i + BATCH);
    const { data: ids } = await sb
      .from("people_identities")
      .select("id, email")
      .in("id", slice);
    for (const id of ids ?? []) {
      if (id.email && !String(id.email).startsWith("child_")) {
        adults.push(id.id as string);
      }
    }
  }
  adults.sort(); // stable input order so seeded shuffles are reproducible
  console.log(`JCC adults: ${adults.length}`);

  // ── 1. Synagogue cross-affiliation (~35% of adults) ─────────
  const synEligible = shuffle(adults, mulberry32(101)).slice(
    0,
    Math.floor(adults.length * 0.35)
  );
  // Pre-fetch each synagogue's primary upload
  const synUploadIdByOrg = new Map<string, string>();
  for (const s of synagogues) {
    const { data: up } = await sb
      .from("population_uploads")
      .select("id")
      .eq("organization_id", s.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (up) synUploadIdByOrg.set(s.id, up.id);
  }
  // Round-robin distribute
  const synRows: { population_id: string; person_id: string }[] = [];
  const personSynOrg = new Map<string, string>(); // for downstream event seeding
  let i = 0;
  for (const personId of synEligible) {
    const syn = synagogues[i % synagogues.length];
    const upId = synUploadIdByOrg.get(syn.id);
    if (upId) {
      synRows.push({ population_id: upId, person_id: personId });
      personSynOrg.set(personId, syn.id);
    }
    i++;
  }
  console.log(`Synagogue overlap rows: ${synRows.length}`);
  await batchUpsertMembers(synRows);

  // ── 2. Day schools (~12% of adults, spread across 5 schools) ──
  // Family of one school → 1 day-school affiliation. Distribution by weights.
  const schoolEligible = shuffle(adults, mulberry32(202)).slice(
    0,
    Math.floor(adults.length * 0.12)
  );
  const personSchoolOrg = new Map<string, string>(); // for downstream
  if (daySchools.length > 0) {
    const schoolUploadIdByOrg = new Map<string, string>();
    for (const s of daySchools) {
      schoolUploadIdByOrg.set(
        s.id,
        await ensureUpload(
          s.id,
          seedUserId,
          `Student & family roster — 2025–26`,
          `Families of currently enrolled students at ${s.name}.`
        )
      );
    }
    // Build a weighted picking sequence
    const schoolPool: typeof daySchools = [];
    for (const s of daySchools) {
      const w = DAY_SCHOOL_WEIGHTS[s.name] ?? 1;
      for (let k = 0; k < w; k++) schoolPool.push(s);
    }
    const shuffledPool = shuffle(schoolPool, mulberry32(203));
    const schoolRows: { population_id: string; person_id: string }[] = [];
    let si = 0;
    for (const personId of schoolEligible) {
      const s = shuffledPool[si % shuffledPool.length];
      const upId = schoolUploadIdByOrg.get(s.id);
      if (upId) {
        schoolRows.push({ population_id: upId, person_id: personId });
        personSchoolOrg.set(personId, s.id);
      }
      si++;
    }
    await batchUpsertMembers(schoolRows);
    console.log(`Day school overlap rows: ${schoolRows.length} across ${daySchools.length} schools`);
  }

  // ── 3. Camps (~14% of adults, spread across 7 camps) ─────────
  const campEligible = shuffle(adults, mulberry32(301)).slice(
    0,
    Math.floor(adults.length * 0.14)
  );
  const personCampOrg = new Map<string, string>();
  if (camps.length > 0) {
    const campUploadIdByOrg = new Map<string, string>();
    for (const c of camps) {
      campUploadIdByOrg.set(
        c.id,
        await ensureUpload(
          c.id,
          seedUserId,
          `Camper family roster — 2026`,
          `Families of currently enrolled campers at ${c.name}.`
        )
      );
    }
    const campPool: typeof camps = [];
    for (const c of camps) {
      const w = CAMP_WEIGHTS[c.name] ?? 1;
      for (let k = 0; k < w; k++) campPool.push(c);
    }
    const shuffledPool = shuffle(campPool, mulberry32(302));
    const campRows: { population_id: string; person_id: string }[] = [];
    let ci = 0;
    for (const personId of campEligible) {
      const c = shuffledPool[ci % shuffledPool.length];
      const upId = campUploadIdByOrg.get(c.id);
      if (upId) {
        campRows.push({ population_id: upId, person_id: personId });
        personCampOrg.set(personId, c.id);
      }
      ci++;
    }
    await batchUpsertMembers(campRows);
    console.log(`Camp overlap rows: ${campRows.length} across ${camps.length} camps`);
  }

  // ── 4. Cross-org event attendance ────────────────────────
  // For TBS (the only synagogue with seeded events), sample ~50% of members
  // and add 1–3 attendance rows. Skip orgs without any seeded events.
  const tbs = orgs.find((o) => o.name === "Temple Beth Shalom");
  if (tbs) {
    const tbsMembers = synRows
      .filter((r) => personSynOrg.get(r.person_id) === tbs.id)
      .map((r) => r.person_id);
    const { data: events } = await sb
      .from("events")
      .select("id")
      .eq("organization_id", tbs.id);
    if (events && events.length > 0 && tbsMembers.length > 0) {
      // Reset prior seeded TBS attendance for JCC adults — earlier random
      // runs accumulated rows and made TBS dwarf every other synagogue.
      const eventIds = events.map((e) => e.id as string);
      for (let d = 0; d < adults.length; d += 100) {
        const slice = adults.slice(d, d + 100);
        const { error: delErr } = await sb
          .from("event_attendees")
          .delete()
          .in("event_id", eventIds)
          .in("person_id", slice);
        if (delErr) console.error("  reset TBS attendance error:", delErr.message);
      }
      const rand = mulberry32(401);
      const sampleSize = Math.floor(tbsMembers.length * 0.5);
      const sampledMembers = shuffle(tbsMembers.slice().sort(), rand).slice(0, sampleSize);
      const rows: { event_id: string; person_id: string }[] = [];
      for (const personId of sampledMembers) {
        const numEvents = 1 + Math.floor(rand() * 3);
        const pickedEvents = shuffle(events, rand).slice(0, numEvents);
        for (const ev of pickedEvents) {
          rows.push({ event_id: ev.id as string, person_id: personId });
        }
      }
      await batchUpsertAttendees(rows);
      console.log(`Temple Beth Shalom: ${sampledMembers.length} members → ${rows.length} attendance rows`);
    }
  }

  // ── 5. Update people_profiles.member_org_ids[] ───────────
  // Rebuild member_org_ids from this run's assignments. JCC membership is NOT
  // granted here — is_member is owned by rebalance-jcc-membership.ts (only a
  // minority of the JCC population are members); the JCC id is kept in
  // member_org_ids only for people who already are members.
  const personOrgs = new Map<string, Set<string>>();
  for (const personId of allJccPersonIds) {
    if (!personOrgs.has(personId)) personOrgs.set(personId, new Set());
  }
  for (const r of synRows) {
    const orgId = personSynOrg.get(r.person_id);
    if (!orgId) continue;
    if (!personOrgs.has(r.person_id)) personOrgs.set(r.person_id, new Set());
    personOrgs.get(r.person_id)!.add(orgId);
  }
  for (const [personId, schoolOrgId] of personSchoolOrg) {
    if (!personOrgs.has(personId)) personOrgs.set(personId, new Set());
    personOrgs.get(personId)!.add(schoolOrgId);
  }
  for (const [personId, campOrgId] of personCampOrg) {
    if (!personOrgs.has(personId)) personOrgs.set(personId, new Set());
    personOrgs.get(personId)!.add(campOrgId);
  }

  let profileUpdates = 0;
  const entries = Array.from(personOrgs.entries());
  for (let i = 0; i < entries.length; i += 100) {
    const slice = entries.slice(i, i + 100);
    const { data: existing } = await sb
      .from("people_profiles")
      .select("id, is_member")
      .in(
        "id",
        slice.map(([personId]) => personId)
      );
    const isMemberById = new Map(
      (existing ?? []).map((p) => [p.id as string, Boolean(p.is_member)])
    );
    for (const [personId, orgSet] of slice) {
      const orgs = new Set(orgSet);
      if (isMemberById.get(personId)) orgs.add(jcc.id);
      await sb
        .from("people_profiles")
        .update({ member_org_ids: Array.from(orgs) })
        .eq("id", personId);
      profileUpdates++;
    }
    if (i % 500 === 0) console.log(`  profile updates: ${profileUpdates}/${entries.length}`);
  }

  console.log(`\n✅ Cross-org overlap seed complete.`);
  console.log(`   ${synRows.length} synagogue affiliations`);
  console.log(`   ${personSchoolOrg.size} day-school affiliations across ${daySchools.length} schools`);
  console.log(`   ${personCampOrg.size} camp affiliations across ${camps.length} camps`);
  console.log(`   ${profileUpdates} people_profiles updated with member_org_ids`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
