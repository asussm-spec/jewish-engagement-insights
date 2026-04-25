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
 * Idempotent: upserts on natural keys. Safe to re-run.
 *
 * Run: npx tsx scripts/seed-cross-org-overlap.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createServiceClient } from "../src/lib/supabase/service";

const sb = createServiceClient();
const JCC_NAME = "Greater Boston JCC";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
  const camp = orgs.find((o) => o.name === "Camp Ramah New England");
  const school = orgs.find((o) => o.name === "Solomon Schechter Day School");

  // JCC member identities (parents only — children are synthetic email-prefixed and we don't want to sprinkle them across orgs)
  const { data: jccUploads } = await sb
    .from("population_uploads")
    .select("id")
    .eq("organization_id", jcc.id);
  const jccUploadIds = (jccUploads ?? []).map((u) => u.id);
  const allJccPersonIds = await fetchAllPersonIdsForUpload(jccUploadIds);
  // Filter out synthetic children (their identity emails start with "child_")
  const { data: realIdentities } = await sb
    .from("people_identities")
    .select("id, email")
    .in("id", allJccPersonIds.slice(0, 0)); // placeholder — we batch below
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
  console.log(`JCC adult members: ${adults.length}`);

  // ── 1. Synagogue cross-affiliation (~35% of adults) ─────────
  const synEligible = shuffle(adults).slice(0, Math.floor(adults.length * 0.35));
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

  // ── 2. Schechter day school (~8%) ────────────────────────
  const schoolUploadId = school
    ? await ensureUpload(
        school.id,
        seedUserId,
        "Student & family roster — 2025–26",
        "Families of currently enrolled students."
      )
    : null;
  const schoolEligible = shuffle(adults).slice(0, Math.floor(adults.length * 0.08));
  if (schoolUploadId) {
    await batchUpsertMembers(
      schoolEligible.map((person_id) => ({ population_id: schoolUploadId, person_id }))
    );
    console.log(`Schechter overlap rows: ${schoolEligible.length}`);
  }

  // ── 3. Camp Ramah (~6%) ──────────────────────────────────
  const campUploadId = camp
    ? await ensureUpload(
        camp.id,
        seedUserId,
        "Camper family roster — 2026",
        "Families of currently enrolled campers."
      )
    : null;
  const campEligible = shuffle(adults).slice(0, Math.floor(adults.length * 0.06));
  if (campUploadId) {
    await batchUpsertMembers(
      campEligible.map((person_id) => ({ population_id: campUploadId, person_id }))
    );
    console.log(`Camp Ramah overlap rows: ${campEligible.length}`);
  }

  // ── 4. Cross-org event attendance ────────────────────────
  // For each org with events (TBS, Camp Ramah, Schechter, Kehillat Shalom),
  // sample ~30% of the cross-affiliated members and add them as attendees
  // for 1–3 random events at that org.
  const eventOrgs = [
    { name: "Temple Beth Shalom", members: synRows.filter((r) => personSynOrg.get(r.person_id)).map((r) => r.person_id).filter((p) => personSynOrg.get(p) === orgs.find((o) => o.name === "Temple Beth Shalom")?.id) },
    { name: "Solomon Schechter Day School", members: schoolEligible },
    { name: "Camp Ramah New England", members: campEligible },
  ];

  // Also for Kehillat Shalom (it has events but we didn't specifically target it). Sample some sync members assigned to it.
  const kehilathId = orgs.find((o) => o.name === "Congregation Kehillat Shalom")?.id;
  const kehilathMembers = synRows.filter((r) => personSynOrg.get(r.person_id) === kehilathId).map((r) => r.person_id);
  eventOrgs.push({ name: "Congregation Kehillat Shalom", members: kehilathMembers });

  for (const { name, members } of eventOrgs) {
    const org = orgs.find((o) => o.name === name);
    if (!org) continue;
    const { data: events } = await sb
      .from("events")
      .select("id")
      .eq("organization_id", org.id);
    if (!events || events.length === 0) continue;

    const sampleSize = Math.floor(members.length * 0.5);
    const sampledMembers = shuffle(members).slice(0, sampleSize);
    const rows: { event_id: string; person_id: string }[] = [];
    for (const personId of sampledMembers) {
      const numEvents = 1 + Math.floor(Math.random() * 3);
      const pickedEvents = shuffle(events).slice(0, numEvents);
      for (const ev of pickedEvents) {
        rows.push({ event_id: ev.id as string, person_id: personId });
      }
    }
    await batchUpsertAttendees(rows);
    console.log(`${name}: ${sampledMembers.length} members → ${rows.length} attendance rows`);
  }

  // ── 5. Update people_profiles.member_org_ids[] ───────────
  // For each cross-affiliated person, append the new org_id to member_org_ids.
  // (Aggregator could compute from joins, but keeping the column accurate is cheap.)
  const personOrgs = new Map<string, Set<string>>();
  for (const personId of allJccPersonIds) {
    if (!personOrgs.has(personId)) personOrgs.set(personId, new Set([jcc.id]));
  }
  for (const r of synRows) {
    const orgId = personSynOrg.get(r.person_id);
    if (!orgId) continue;
    if (!personOrgs.has(r.person_id)) personOrgs.set(r.person_id, new Set([jcc.id]));
    personOrgs.get(r.person_id)!.add(orgId);
  }
  for (const personId of schoolEligible) {
    if (school) {
      if (!personOrgs.has(personId)) personOrgs.set(personId, new Set([jcc.id]));
      personOrgs.get(personId)!.add(school.id);
    }
  }
  for (const personId of campEligible) {
    if (camp) {
      if (!personOrgs.has(personId)) personOrgs.set(personId, new Set([jcc.id]));
      personOrgs.get(personId)!.add(camp.id);
    }
  }

  let profileUpdates = 0;
  const entries = Array.from(personOrgs.entries());
  for (let i = 0; i < entries.length; i += 100) {
    const slice = entries.slice(i, i + 100);
    for (const [personId, orgSet] of slice) {
      await sb
        .from("people_profiles")
        .update({
          is_member: true,
          member_org_ids: Array.from(orgSet),
        })
        .eq("id", personId);
      profileUpdates++;
    }
    if (i % 500 === 0) console.log(`  profile updates: ${profileUpdates}/${entries.length}`);
  }

  console.log(`\n✅ Cross-org overlap seed complete.`);
  console.log(`   ${synRows.length} synagogue affiliations`);
  console.log(`   ${schoolEligible.length} Schechter affiliations`);
  console.log(`   ${campEligible.length} Camp Ramah affiliations`);
  console.log(`   ${profileUpdates} people_profiles updated with member_org_ids`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
