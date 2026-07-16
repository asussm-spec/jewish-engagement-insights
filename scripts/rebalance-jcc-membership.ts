/**
 * Rebalance JCC membership so members are a realistic minority slice.
 *
 * seed-jcc.ts marked every seeded person as a member (is_member: true), which
 * makes 100% of any cross-org overlap group show up under "Membership" — not
 * credible for a JCC, where membership (~fitness) is a narrow slice of the
 * tens of thousands who interact annually.
 *
 * This script deterministically keeps ~35% of the JCC population as members
 * (stable hash of person id, so re-runs are idempotent) and demotes the rest:
 *   - is_member: false, JCC removed from member_org_ids
 *   - org-namespaced membership attributes removed (tier / flag / join date)
 *
 * Run: npx tsx scripts/rebalance-jcc-membership.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createServiceClient } from "../src/lib/supabase/service";

const sb = createServiceClient();
const JCC_NAME = "Greater Boston JCC";
const MEMBER_FRACTION = 0.35;

/** Deterministic [0,1) from a string — FNV-1a hash. */
function hash01(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x100000000;
}

async function main() {
  const { data: jcc } = await sb
    .from("organizations")
    .select("id, name")
    .eq("name", JCC_NAME)
    .single();
  if (!jcc) throw new Error(`${JCC_NAME} not found`);
  const orgPrefix = `org:${jcc.id}`;
  const membershipKeys = [
    `${orgPrefix}:membership_tier`,
    `${orgPrefix}:jcc_member`,
    `${orgPrefix}:member_since`,
  ];

  const { data: uploads } = await sb
    .from("population_uploads")
    .select("id")
    .eq("organization_id", jcc.id);
  const uploadIds = (uploads ?? []).map((u) => u.id);

  const personIds = new Set<string>();
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data: rows } = await sb
      .from("population_members")
      .select("person_id")
      .in("population_id", uploadIds)
      .range(from, from + PAGE - 1);
    if (!rows || rows.length === 0) break;
    for (const r of rows) personIds.add(r.person_id as string);
    if (rows.length < PAGE) break;
    from += PAGE;
  }
  const ids = Array.from(personIds).sort();
  console.log(`JCC population: ${ids.length} people`);

  let members = 0;
  let demoted = 0;
  const BATCH = 100;
  for (let i = 0; i < ids.length; i += BATCH) {
    const slice = ids.slice(i, i + BATCH);
    const { data: profiles } = await sb
      .from("people_profiles")
      .select("id, is_member, member_org_ids, attributes")
      .in("id", slice);
    for (const p of profiles ?? []) {
      const keep = hash01(p.id as string) < MEMBER_FRACTION;
      const orgIds: string[] = Array.isArray(p.member_org_ids) ? p.member_org_ids : [];
      if (keep) {
        members++;
        if (!p.is_member || !orgIds.includes(jcc.id)) {
          await sb
            .from("people_profiles")
            .update({
              is_member: true,
              member_org_ids: Array.from(new Set([...orgIds, jcc.id])),
            })
            .eq("id", p.id);
        }
        continue;
      }
      demoted++;
      const attributes = { ...((p.attributes as Record<string, unknown>) ?? {}) };
      for (const k of membershipKeys) delete attributes[k];
      await sb
        .from("people_profiles")
        .update({
          is_member: false,
          member_org_ids: orgIds.filter((o) => o !== jcc.id),
          attributes,
        })
        .eq("id", p.id);
    }
    if ((i / BATCH) % 5 === 0) console.log(`  processed ${Math.min(i + BATCH, ids.length)}/${ids.length}`);
  }

  console.log(`\n✅ Membership rebalanced: ${members} members (${Math.round((members / ids.length) * 100)}%), ${demoted} non-member participants.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
