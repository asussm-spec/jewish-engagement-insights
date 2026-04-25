import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PopulationSegment,
  PopulationSummary,
} from "./mock-population-data";

const ORDERED_AGE_BUCKETS = [
  "0-5",
  "6-10",
  "11-15",
  "16-20",
  "21-30",
  "31-40",
  "41-50",
  "51-60",
  "61+",
];

const JOIN_YEAR_BUCKETS: { name: string; min: number; max: number }[] = [
  { name: "Before 2010", min: 0, max: 2009 },
  { name: "2010–2014", min: 2010, max: 2014 },
  { name: "2015–2019", min: 2015, max: 2019 },
  { name: "2020–2022", min: 2020, max: 2022 },
  { name: "2023–2024", min: 2023, max: 2024 },
  { name: "2025–2026", min: 2025, max: 2026 },
];

function childAgeBucket(dob: string): string | null {
  const t = Date.parse(dob);
  if (Number.isNaN(t)) return null;
  const age = Math.floor((Date.now() - t) / (365.25 * 24 * 60 * 60 * 1000));
  if (age <= 2) return "0–2 (infant)";
  if (age <= 5) return "3–5 (preschool)";
  if (age <= 9) return "6–9 (elementary)";
  if (age <= 12) return "10–12 (preteen)";
  if (age <= 17) return "13–17 (teen)";
  return null;
}

interface ProfileRow {
  id: string;
  date_of_birth: string | null;
  age_bucket: string | null;
  has_children: boolean | null;
  number_of_children: number | null;
  is_member: boolean | null;
  membership_expires_at: string | null;
  member_org_ids: string[] | null;
  attributes: Record<string, unknown> | null;
}

interface OrgRow {
  id: string;
  name: string;
  org_type: string;
}

interface GlobalEvent {
  id: string;
  organization_id: string;
  event_type: string;
}

export interface CrossOrgInsights {
  /** % of segment members who also belong to ≥1 other org of each type */
  affiliationByType: {
    orgType: string;
    label: string;
    count: number;
    pctOfSegment: number;
  }[];
  /** Top other orgs the segment overlaps with (any source) */
  topOverlappingOrgs: {
    orgId: string;
    name: string;
    orgType: string;
    count: number;
  }[];
  /** For each event_type, count of distinct people attending at this org vs. other orgs */
  programShare: {
    category: string;
    thisOrg: number;
    otherOrgs: number;
  }[];
  /** Distribution of distinct orgs each person touches via either membership or events */
  engagementBreadth: {
    bucket: string;
    count: number;
    pctOfSegment: number;
  }[];
  /** Total number of orgs the segment touches in aggregate */
  totalEcosystemOrgs: number;
}

interface IdentityRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
}

interface EventRow {
  id: string;
  event_type: string;
  event_date: string;
}

interface AttendeeRow {
  person_id: string;
  event_id: string;
}

function isCurrentMember(p: ProfileRow): boolean {
  if (!p.is_member) return false;
  if (!p.membership_expires_at) return true;
  return Date.parse(p.membership_expires_at) > Date.now();
}

function bucketJoinYear(year: number): string | null {
  for (const b of JOIN_YEAR_BUCKETS) {
    if (year >= b.min && year <= b.max) return b.name;
  }
  return null;
}

function topNWithOther<T extends { name: string; value: number }>(
  entries: T[],
  n: number
): T[] {
  if (entries.length <= n) return entries;
  const top = entries.slice(0, n);
  const otherValue = entries.slice(n).reduce((s, e) => s + e.value, 0);
  if (otherValue > 0) {
    top.push({ name: "Other", value: otherValue } as T);
  }
  return top;
}

function emptyEngagementTiers(): PopulationSummary["engagementTiers"] {
  return [
    { name: "Highly Engaged", value: 0, description: "5+ events/year" },
    { name: "Regularly Engaged", value: 0, description: "2–4 events/year" },
    { name: "Occasionally Engaged", value: 0, description: "1 event/year" },
    { name: "Members Only", value: 0, description: "Member, no events attended" },
  ];
}

function compute(
  segment: PopulationSegment,
  orgName: string,
  orgId: string,
  profiles: ProfileRow[],
  identitiesById: Map<string, IdentityRow>,
  eventsByPerson: Map<string, EventRow[]>
): PopulationSummary {
  const orgPrefix = `org:${orgId}:`;
  const total = profiles.length;
  const entityLabel =
    segment === "members"
      ? "Members"
      : segment === "non_members"
      ? "Non-members"
      : "People";

  // Age buckets
  const ageMap = new Map<string, number>();
  for (const p of profiles) {
    const b = p.age_bucket;
    if (b) ageMap.set(b, (ageMap.get(b) ?? 0) + 1);
  }
  const ageBuckets = ORDERED_AGE_BUCKETS.filter((b) => ageMap.has(b)).map((b) => ({
    name: b,
    value: ageMap.get(b)!,
  }));

  // Membership types — from org-namespaced attribute
  const tierMap = new Map<string, number>();
  for (const p of profiles) {
    const tier = p.attributes?.[orgPrefix + "membership_tier"];
    if (typeof tier === "string" && tier) {
      tierMap.set(tier, (tierMap.get(tier) ?? 0) + 1);
    }
  }
  // For non-member segment, don't show membership types (every cell would be "non-member")
  const membershipTypes =
    segment === "non_members"
      ? []
      : Array.from(tierMap.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

  // Zip codes — top 9 + Other
  const zipMap = new Map<string, number>();
  for (const p of profiles) {
    const zip = p.attributes?.zip_code;
    if (typeof zip === "string" && zip) {
      const z = zip.slice(0, 5);
      const city = p.attributes?.city;
      const label = typeof city === "string" && city ? `${z} (${city})` : z;
      zipMap.set(label, (zipMap.get(label) ?? 0) + 1);
    }
  }
  const zipCodes = topNWithOther(
    Array.from(zipMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    9
  );

  // Family stats
  const withChildren = profiles.filter((p) => p.has_children).length;
  const childrenSum = profiles.reduce(
    (s, p) => s + (p.number_of_children ?? 0),
    0
  );
  const percentWithChildren = total > 0 ? Math.round((withChildren / total) * 100) : 0;
  const avgChildren =
    withChildren > 0 ? Math.round((childrenSum / withChildren) * 10) / 10 : 0;
  const childAgeMap = new Map<string, number>();
  for (const p of profiles) {
    if (!p.attributes) continue;
    for (let i = 1; i <= 10; i++) {
      const dob = p.attributes[`child_${i}_dob`];
      if (typeof dob === "string" && dob) {
        const bucket = childAgeBucket(dob);
        if (bucket) childAgeMap.set(bucket, (childAgeMap.get(bucket) ?? 0) + 1);
      }
    }
  }
  const orderedChildBuckets = [
    "0–2 (infant)",
    "3–5 (preschool)",
    "6–9 (elementary)",
    "10–12 (preteen)",
    "13–17 (teen)",
  ];
  const childAgeBuckets = orderedChildBuckets
    .filter((b) => childAgeMap.has(b))
    .map((b) => ({ name: b, value: childAgeMap.get(b)! }));

  // Engagement tiers — events attended in past 12 months
  const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
  let highly = 0;
  let regularly = 0;
  let occasionally = 0;
  let membersOnly = 0;
  for (const p of profiles) {
    const events = (eventsByPerson.get(p.id) ?? []).filter(
      (e) => Date.parse(e.event_date) >= cutoff
    );
    const c = events.length;
    if (c >= 5) highly++;
    else if (c >= 2) regularly++;
    else if (c >= 1) occasionally++;
    else if (segment !== "non_members") membersOnly++;
  }
  const engagementTiers: PopulationSummary["engagementTiers"] = [
    { name: "Highly Engaged", value: highly, description: "5+ events/year" },
    { name: "Regularly Engaged", value: regularly, description: "2–4 events/year" },
    { name: "Occasionally Engaged", value: occasionally, description: "1 event/year" },
  ];
  if (segment !== "non_members") {
    engagementTiers.push({
      name: "Members Only",
      value: membersOnly,
      description: "Member, no events attended",
    });
  }

  // Program participation — by event_type, distinct people per category
  const programMap = new Map<string, Set<string>>();
  for (const p of profiles) {
    const events = eventsByPerson.get(p.id) ?? [];
    const types = new Set(events.map((e) => e.event_type));
    for (const t of types) {
      if (!programMap.has(t)) programMap.set(t, new Set());
      programMap.get(t)!.add(p.id);
    }
  }
  const programParticipation = Array.from(programMap.entries())
    .map(([name, set]) => ({ name: humanizeEventType(name), value: set.size }))
    .sort((a, b) => b.value - a.value);

  // Join year buckets — from org-namespaced "member_since"
  const joinYearMap = new Map<string, number>();
  for (const p of profiles) {
    const ms = p.attributes?.[orgPrefix + "member_since"];
    if (typeof ms === "string" && ms) {
      const year = parseInt(ms.slice(0, 4), 10);
      const bucket = bucketJoinYear(year);
      if (bucket) joinYearMap.set(bucket, (joinYearMap.get(bucket) ?? 0) + 1);
    }
  }
  const joinYearBuckets = JOIN_YEAR_BUCKETS.filter((b) => joinYearMap.has(b.name)).map(
    (b) => ({ name: b.name, value: joinYearMap.get(b.name)! })
  );

  // Data completeness
  const dataCompleteness: PopulationSummary["dataCompleteness"] = [];
  if (total > 0) {
    let nameCovered = 0;
    let emailCovered = 0;
    let dobCovered = 0;
    let zipCovered = 0;
    let programCovered = 0;
    let tierCovered = 0;
    let joinCovered = 0;
    let childrenCovered = 0;
    let phoneCovered = 0;
    for (const p of profiles) {
      const id = identitiesById.get(p.id);
      if (id?.first_name && id?.last_name) nameCovered++;
      if (id?.email) emailCovered++;
      if (p.date_of_birth) dobCovered++;
      if (p.attributes?.zip_code) zipCovered++;
      if ((eventsByPerson.get(p.id) ?? []).length > 0) programCovered++;
      if (p.attributes?.[orgPrefix + "membership_tier"]) tierCovered++;
      if (p.attributes?.[orgPrefix + "member_since"]) joinCovered++;
      if (p.has_children !== null && p.has_children !== undefined) childrenCovered++;
      if (p.attributes?.phone || p.attributes?.phone_number) phoneCovered++;
    }
    dataCompleteness.push(
      { field: "Name", coverage: nameCovered / total },
      { field: "Email", coverage: emailCovered / total },
      { field: "Date of birth", coverage: dobCovered / total },
      { field: "Address / Zip", coverage: zipCovered / total },
      { field: "Program data", coverage: programCovered / total },
      { field: "Membership type", coverage: tierCovered / total },
      { field: "Join date", coverage: joinCovered / total },
      { field: "Children info", coverage: childrenCovered / total },
      { field: "Phone", coverage: phoneCovered / total }
    );
  }

  return {
    orgName,
    uploadName: `${orgName} — combined`,
    uploadDate: new Date().toISOString().slice(0, 10),
    entityLabel,
    totalMembers: total,
    totalHouseholds: 0, // no household linkage in seed yet
    membershipTypes,
    ageBuckets,
    programParticipation,
    joinYearBuckets,
    zipCodes,
    familyStats: {
      percentWithChildren,
      avgChildrenPerFamily: avgChildren,
      totalChildren: childrenSum,
      childAgeBuckets,
    },
    engagementTiers:
      total === 0 ? emptyEngagementTiers() : engagementTiers,
    genderSplit: [],
    dataCompleteness,
    comparisonPeriods: [],
  };
}

function humanizeEventType(t: string): string {
  return t
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const ORG_TYPE_LABELS: Record<string, string> = {
  synagogue: "Synagogues",
  jcc: "JCCs",
  day_school: "Day schools",
  federation: "Federations",
  camp: "Camps",
  youth_org: "Youth orgs",
  social_service: "Social services",
  other: "Other",
};

function computeCrossOrg(
  thisOrgId: string,
  profiles: ProfileRow[],
  attendancesByPerson: Map<string, { eventType: string; orgId: string }[]>,
  orgsById: Map<string, OrgRow>
): CrossOrgInsights {
  const total = profiles.length;
  if (total === 0) {
    return {
      affiliationByType: [],
      topOverlappingOrgs: [],
      programShare: [],
      engagementBreadth: [],
      totalEcosystemOrgs: 0,
    };
  }

  // Per person — orgs they touch via membership AND via event attendance
  const orgsTouchedPerPerson = new Map<string, Set<string>>();
  for (const p of profiles) {
    const orgs = new Set<string>();
    for (const id of p.member_org_ids ?? []) orgs.add(id);
    for (const a of attendancesByPerson.get(p.id) ?? []) orgs.add(a.orgId);
    orgsTouchedPerPerson.set(p.id, orgs);
  }

  // Affiliation by type — count people who touch ≥1 other org of each type
  const peopleByOtherOrgType = new Map<string, Set<string>>();
  const peopleByOtherOrg = new Map<string, Set<string>>();
  const allEcosystemOrgs = new Set<string>();
  for (const [personId, orgs] of orgsTouchedPerPerson) {
    for (const orgId of orgs) {
      if (orgId === thisOrgId) continue;
      allEcosystemOrgs.add(orgId);
      const meta = orgsById.get(orgId);
      if (!meta) continue;
      if (!peopleByOtherOrgType.has(meta.org_type)) {
        peopleByOtherOrgType.set(meta.org_type, new Set());
      }
      peopleByOtherOrgType.get(meta.org_type)!.add(personId);
      if (!peopleByOtherOrg.has(orgId)) peopleByOtherOrg.set(orgId, new Set());
      peopleByOtherOrg.get(orgId)!.add(personId);
    }
  }

  const affiliationByType = Array.from(peopleByOtherOrgType.entries())
    .map(([orgType, peopleSet]) => ({
      orgType,
      label: ORG_TYPE_LABELS[orgType] ?? orgType,
      count: peopleSet.size,
      pctOfSegment: Math.round((peopleSet.size / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const topOverlappingOrgs = Array.from(peopleByOtherOrg.entries())
    .map(([orgId, peopleSet]) => {
      const meta = orgsById.get(orgId);
      return {
        orgId,
        name: meta?.name ?? "Unknown",
        orgType: meta?.org_type ?? "other",
        count: peopleSet.size,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Program share by event_type — for each category, count distinct people
  // who attended at this org vs. at any other org.
  const peopleAttendingThisByType = new Map<string, Set<string>>();
  const peopleAttendingOtherByType = new Map<string, Set<string>>();
  for (const [personId, attendances] of attendancesByPerson) {
    for (const a of attendances) {
      const target =
        a.orgId === thisOrgId ? peopleAttendingThisByType : peopleAttendingOtherByType;
      if (!target.has(a.eventType)) target.set(a.eventType, new Set());
      target.get(a.eventType)!.add(personId);
    }
  }
  const allCategories = new Set<string>([
    ...peopleAttendingThisByType.keys(),
    ...peopleAttendingOtherByType.keys(),
  ]);
  const programShare = Array.from(allCategories)
    .map((category) => ({
      category: humanizeEventType(category),
      thisOrg: peopleAttendingThisByType.get(category)?.size ?? 0,
      otherOrgs: peopleAttendingOtherByType.get(category)?.size ?? 0,
    }))
    .sort((a, b) => b.thisOrg + b.otherOrgs - (a.thisOrg + a.otherOrgs));

  // Engagement breadth — distinct orgs touched per person
  const breadthBuckets = new Map<string, number>();
  for (const orgs of orgsTouchedPerPerson.values()) {
    const n = orgs.size;
    const bucket =
      n === 0 ? "0" : n === 1 ? "1 (only this org)" : n === 2 ? "2 orgs" : n === 3 ? "3 orgs" : "4+ orgs";
    breadthBuckets.set(bucket, (breadthBuckets.get(bucket) ?? 0) + 1);
  }
  const orderedBreadth = ["1 (only this org)", "2 orgs", "3 orgs", "4+ orgs"];
  const engagementBreadth = orderedBreadth
    .filter((b) => breadthBuckets.has(b))
    .map((b) => ({
      bucket: b,
      count: breadthBuckets.get(b)!,
      pctOfSegment: Math.round((breadthBuckets.get(b)! / total) * 100),
    }));

  return {
    affiliationByType,
    topOverlappingOrgs,
    programShare,
    engagementBreadth,
    totalEcosystemOrgs: allEcosystemOrgs.size,
  };
}

export interface AggregatedPopulation {
  orgName: string;
  segments: Record<PopulationSegment, PopulationSummary>;
  crossOrg: Record<PopulationSegment, CrossOrgInsights>;
}

export async function getPopulationForOrg(
  supabase: SupabaseClient,
  orgId: string
): Promise<AggregatedPopulation> {
  // Fetch org
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single();
  const orgName = org?.name ?? "Your organization";

  // Person IDs in scope = (population_members for org) ∪ (event_attendees for org)
  const { data: uploads } = await supabase
    .from("population_uploads")
    .select("id")
    .eq("organization_id", orgId);
  const uploadIds = (uploads ?? []).map((u) => u.id);

  const { data: events } = await supabase
    .from("events")
    .select("id, event_type, event_date")
    .eq("organization_id", orgId);
  const eventList = (events ?? []) as EventRow[];
  const eventIds = eventList.map((e) => e.id);
  const eventById = new Map(eventList.map((e) => [e.id, e]));

  const personIds = new Set<string>();

  if (uploadIds.length > 0) {
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data: rows } = await supabase
        .from("population_members")
        .select("person_id")
        .in("population_id", uploadIds)
        .range(from, from + PAGE - 1);
      if (!rows || rows.length === 0) break;
      for (const m of rows) personIds.add(m.person_id as string);
      if (rows.length < PAGE) break;
      from += PAGE;
    }
  }

  const allAttendees: AttendeeRow[] = [];
  if (eventIds.length > 0) {
    // Page through to handle large datasets
    const PAGE = 1000;
    for (let i = 0; i < eventIds.length; i += 100) {
      const batch = eventIds.slice(i, i + 100);
      let from = 0;
      while (true) {
        const { data: rows } = await supabase
          .from("event_attendees")
          .select("person_id, event_id")
          .in("event_id", batch)
          .range(from, from + PAGE - 1);
        if (!rows || rows.length === 0) break;
        for (const r of rows) {
          personIds.add(r.person_id as string);
          allAttendees.push({
            person_id: r.person_id as string,
            event_id: r.event_id as string,
          });
        }
        if (rows.length < PAGE) break;
        from += PAGE;
      }
    }
  }

  const personIdList = Array.from(personIds);
  if (personIdList.length === 0) {
    const empty = compute("all", orgName, orgId, [], new Map(), new Map());
    const emptyCross = computeCrossOrg(orgId, [], new Map(), new Map());
    return {
      orgName,
      segments: {
        all: { ...empty, entityLabel: "People" },
        members: { ...empty, entityLabel: "Members" },
        non_members: { ...empty, entityLabel: "Non-members" },
      },
      crossOrg: {
        all: emptyCross,
        members: emptyCross,
        non_members: emptyCross,
      },
    };
  }

  // Fetch profiles + identities in batches (in() has URL length limits with UUIDs)
  const profiles: ProfileRow[] = [];
  const identitiesById = new Map<string, IdentityRow>();
  const BATCH = 100;
  for (let i = 0; i < personIdList.length; i += BATCH) {
    const slice = personIdList.slice(i, i + BATCH);
    // membership_expires_at is optional — column may not exist yet (pending migration).
    // Try with it; fall back to without on schema error.
    let pfsRes = await supabase
      .from("people_profiles")
      .select(
        "id, date_of_birth, age_bucket, has_children, number_of_children, is_member, membership_expires_at, member_org_ids, attributes"
      )
      .in("id", slice);
    if (pfsRes.error?.code === "42703") {
      pfsRes = await supabase
        .from("people_profiles")
        .select(
          "id, date_of_birth, age_bucket, has_children, number_of_children, is_member, member_org_ids, attributes"
        )
        .in("id", slice);
    }
    const idsRes = await supabase
      .from("people_identities")
      .select("id, email, first_name, last_name, address")
      .in("id", slice);
    for (const p of pfsRes.data ?? []) profiles.push(p as unknown as ProfileRow);
    for (const i of idsRes.data ?? [])
      identitiesById.set(i.id as string, i as unknown as IdentityRow);
  }

  // Build events-by-person map
  const eventsByPerson = new Map<string, EventRow[]>();
  for (const a of allAttendees) {
    const ev = eventById.get(a.event_id);
    if (!ev) continue;
    if (!eventsByPerson.has(a.person_id)) eventsByPerson.set(a.person_id, []);
    eventsByPerson.get(a.person_id)!.push(ev);
  }

  // Cross-org data: fetch all orgs, all events, then all attendances for segment people.
  const { data: allOrgsRows } = await supabase
    .from("organizations")
    .select("id, name, org_type");
  const orgsById = new Map<string, OrgRow>(
    (allOrgsRows ?? []).map((o) => [o.id as string, o as OrgRow])
  );

  const { data: allEventsRows } = await supabase
    .from("events")
    .select("id, organization_id, event_type");
  const globalEventById = new Map<string, GlobalEvent>(
    (allEventsRows ?? []).map((e) => [e.id as string, e as GlobalEvent])
  );

  // For each segment person, fetch all their event_attendees rows globally
  const attendancesByPerson = new Map<
    string,
    { eventType: string; orgId: string }[]
  >();
  for (let i = 0; i < personIdList.length; i += BATCH) {
    const slice = personIdList.slice(i, i + BATCH);
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data: rows } = await supabase
        .from("event_attendees")
        .select("person_id, event_id")
        .in("person_id", slice)
        .range(from, from + PAGE - 1);
      if (!rows || rows.length === 0) break;
      for (const r of rows) {
        const ev = globalEventById.get(r.event_id as string);
        if (!ev) continue;
        const pid = r.person_id as string;
        if (!attendancesByPerson.has(pid)) attendancesByPerson.set(pid, []);
        attendancesByPerson.get(pid)!.push({
          eventType: ev.event_type,
          orgId: ev.organization_id,
        });
      }
      if (rows.length < PAGE) break;
      from += PAGE;
    }
  }

  // Filter for each segment and compute
  const allProfiles = profiles;
  const memberProfiles = profiles.filter(isCurrentMember);
  const memberIds = new Set(memberProfiles.map((p) => p.id));
  const nonMemberProfiles = profiles.filter((p) => !memberIds.has(p.id));

  return {
    orgName,
    segments: {
      all: compute("all", orgName, orgId, allProfiles, identitiesById, eventsByPerson),
      members: compute(
        "members",
        orgName,
        orgId,
        memberProfiles,
        identitiesById,
        eventsByPerson
      ),
      non_members: compute(
        "non_members",
        orgName,
        orgId,
        nonMemberProfiles,
        identitiesById,
        eventsByPerson
      ),
    },
    crossOrg: {
      all: computeCrossOrg(orgId, allProfiles, attendancesByPerson, orgsById),
      members: computeCrossOrg(orgId, memberProfiles, attendancesByPerson, orgsById),
      non_members: computeCrossOrg(
        orgId,
        nonMemberProfiles,
        attendancesByPerson,
        orgsById
      ),
    },
  };
}

export async function getPopulationByOrgName(
  supabase: SupabaseClient,
  name: string
): Promise<AggregatedPopulation | null> {
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("name", name)
    .single();
  if (!org) return null;
  return getPopulationForOrg(supabase, org.id);
}
