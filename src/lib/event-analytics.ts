import { SupabaseClient } from "@supabase/supabase-js";

export interface DemographicBreakdown {
  ageBuckets: { name: string; count: number }[];
  denominations: { name: string; value: number }[];
  totalAttendees: number;
  avgAge: number | null;
  hasChildrenPct: number;
  avgChildren: number | null;
}

export interface AttendanceComparison {
  thisEvent: number;
  orgEventTypeAvg: number;         // average attendees per event for this org+type
  orgEventTypeCount: number;       // number of events in this org of this type
  communityEventTypeAvg: number;   // average attendees per event community-wide for this type
  communityEventTypeCount: number; // number of events community-wide of this type
}

export interface DemographicField {
  key: string;
  label: string;
  segments: { name: string; value: number }[];
  coverage: number; // 0-1, what fraction of attendees have data for this field
  total: number;
}

export interface EventAnalyticsData {
  attendance: AttendanceComparison;
  demographics: DemographicField[];
  totalAttendees: number;
  orgName: string;
  eventTypeLabel: string;
}

const AGE_ORDER = [
  "0-5", "6-10", "11-15", "16-20", "21-30",
  "31-40", "41-50", "51-60", "61+",
];

const DENOM_LABELS: Record<string, string> = {
  reform: "Reform",
  conservative: "Conservative",
  orthodox: "Orthodox",
  reconstructionist: "Reconstructionist",
  just_jewish: "Just Jewish",
  other: "Other",
  unknown: "Unknown",
};

interface DateFilter {
  start?: string; // ISO date
  end?: string;   // ISO date
}

// ── Attendance distribution (histogram) ──

export const ATTENDANCE_BUCKETS = [
  { label: "1–10", min: 1, max: 10 },
  { label: "11–20", min: 11, max: 20 },
  { label: "21–30", min: 21, max: 30 },
  { label: "31–40", min: 31, max: 40 },
  { label: "41–50", min: 41, max: 50 },
  { label: "51–75", min: 51, max: 75 },
  { label: "76–100", min: 76, max: 100 },
  { label: "100+", min: 101, max: Infinity },
] as const;

export function attendanceBucketLabel(count: number): string {
  const bucket = ATTENDANCE_BUCKETS.find(
    (b) => count >= b.min && count <= b.max
  );
  return bucket?.label ?? ATTENDANCE_BUCKETS[0].label;
}

export interface DistributionBucket {
  range: string;
  count: number;
}

export interface AttendanceDistribution {
  thisEvent: number;
  org: { buckets: DistributionBucket[]; totalEvents: number };
  community: { buckets: DistributionBucket[]; totalEvents: number };
}

function buildHistogram(counts: number[]): DistributionBucket[] {
  const buckets = ATTENDANCE_BUCKETS.map((b) => ({
    range: b.label,
    count: counts.filter((c) => c >= b.min && c <= b.max).length,
  }));
  // Trim trailing empty buckets but keep zeros in the middle so the
  // histogram shape is honest.
  let last = buckets.length - 1;
  while (last > 0 && buckets[last].count === 0) last--;
  return buckets.slice(0, last + 1);
}

export async function getAttendanceDistribution(
  supabase: SupabaseClient,
  eventId: string,
  organizationId: string,
  eventType: string,
  dateFilter?: DateFilter,
  serviceClient?: SupabaseClient
): Promise<AttendanceDistribution> {
  // This event's unique attendee count
  const { data: thisEventAttendees } = await supabase
    .from("event_attendees")
    .select("person_id")
    .eq("event_id", eventId);
  const thisEvent = thisEventAttendees
    ? new Set(thisEventAttendees.map((a) => a.person_id)).size
    : 0;

  // Org events of this type
  let orgQuery = supabase
    .from("events")
    .select("attendee_count")
    .eq("organization_id", organizationId)
    .eq("event_type", eventType)
    .gt("attendee_count", 0);
  if (dateFilter?.start) orgQuery = orgQuery.gte("event_date", dateFilter.start);
  if (dateFilter?.end) orgQuery = orgQuery.lte("event_date", dateFilter.end);
  const { data: orgEvents } = await orgQuery;
  const orgCounts = orgEvents?.map((e) => e.attendee_count || 0) || [];

  // Community events of this type (all orgs — needs service client for RLS)
  const communityClient = serviceClient || supabase;
  let communityQuery = communityClient
    .from("events")
    .select("attendee_count")
    .eq("event_type", eventType)
    .gt("attendee_count", 0);
  if (dateFilter?.start) communityQuery = communityQuery.gte("event_date", dateFilter.start);
  if (dateFilter?.end) communityQuery = communityQuery.lte("event_date", dateFilter.end);
  const { data: communityEvents } = await communityQuery;
  const communityCounts = communityEvents?.map((e) => e.attendee_count || 0) || [];

  return {
    thisEvent,
    org: { buckets: buildHistogram(orgCounts), totalEvents: orgCounts.length },
    community: {
      buckets: buildHistogram(communityCounts),
      totalEvents: communityCounts.length,
    },
  };
}

// ── Three-way demographic comparison (event / org / community) ──

export type ComparisonScope = "event" | "org" | "community";

export interface ComparisonSeries {
  scope: ComparisonScope;
  n: number;      // people with data for this field in this scope
  total: number;  // total unique attendees in this scope
  eventCount: number; // events aggregated in this scope (1 for "event")
  segments: { name: string; count: number; pct: number }[];
}

export interface ComparisonField {
  key: string;
  label: string;
  segmentOrder: string[];
  series: ComparisonSeries[]; // ordered: event, org, community
}

type ProfileRow = {
  age_bucket: string | null;
  denomination: string | null;
  has_children: boolean | null;
  number_of_children: number | null;
  attributes: Record<string, unknown> | null;
};

const CHILD_BUCKETS = ["0 children", "1 child", "2 children", "3+ children"];

/** Look up an attribute value ignoring any org:<uuid>: prefix. */
function attrValue(
  attrs: Record<string, unknown> | null,
  ...keys: string[]
): string | null {
  if (!attrs) return null;
  for (const [k, v] of Object.entries(attrs)) {
    const clean = k.replace(/^org:[^:]+:/, "");
    if (keys.includes(clean) && typeof v === "string" && v) return v;
  }
  return null;
}

function yesNoSegments(
  profiles: ProfileRow[],
  ...keys: string[]
): { n: number; segments: { name: string; count: number; pct: number }[] } {
  let yes = 0;
  let no = 0;
  for (const p of profiles) {
    const v = attrValue(p.attributes, ...keys);
    if (v === null) continue;
    if (/^(yes|true|y|1)$/i.test(v)) yes++;
    else no++;
  }
  const n = yes + no;
  const pct = (c: number) => (n > 0 ? Math.round((c / n) * 100) : 0);
  return {
    n,
    segments: [
      { name: "Enrolled", count: yes, pct: pct(yes) },
      { name: "Not enrolled", count: no, pct: pct(no) },
    ],
  };
}

function buildComparisonSeries(
  scope: ComparisonScope,
  profiles: ProfileRow[],
  eventCount: number
): Record<string, ComparisonSeries> {
  const total = profiles.length;
  const out: Record<string, ComparisonSeries> = {};
  const pctOf = (count: number, n: number) =>
    n > 0 ? Math.round((count / n) * 100) : 0;

  // Age
  const withAge = profiles.filter(
    (p) => p.age_bucket && p.age_bucket !== "Unknown"
  );
  {
    const counts: Record<string, number> = {};
    for (const p of withAge) counts[p.age_bucket!] = (counts[p.age_bucket!] || 0) + 1;
    out.age = {
      scope,
      n: withAge.length,
      total,
      eventCount,
      segments: AGE_ORDER.map((b) => ({
        name: b,
        count: counts[b] || 0,
        pct: pctOf(counts[b] || 0, withAge.length),
      })),
    };
  }

  // Denomination
  const withDenom = profiles.filter(
    (p) => p.denomination && p.denomination !== "unknown"
  );
  {
    const counts: Record<string, number> = {};
    for (const p of withDenom) {
      const label = DENOM_LABELS[p.denomination!] || p.denomination!;
      counts[label] = (counts[label] || 0) + 1;
    }
    out.denomination = {
      scope,
      n: withDenom.length,
      total,
      eventCount,
      segments: Object.entries(counts).map(([name, count]) => ({
        name,
        count,
        pct: pctOf(count, withDenom.length),
      })),
    };
  }

  // Number of children (0 / 1 / 2 / 3+)
  const withKidsData = profiles.filter(
    (p) => p.number_of_children !== null || p.has_children === false
  );
  {
    const counts: Record<string, number> = {};
    for (const p of withKidsData) {
      const num = p.number_of_children ?? 0;
      const bucket =
        num <= 0 ? CHILD_BUCKETS[0]
        : num === 1 ? CHILD_BUCKETS[1]
        : num === 2 ? CHILD_BUCKETS[2]
        : CHILD_BUCKETS[3];
      counts[bucket] = (counts[bucket] || 0) + 1;
    }
    out.children = {
      scope,
      n: withKidsData.length,
      total,
      eventCount,
      segments: CHILD_BUCKETS.map((b) => ({
        name: b,
        count: counts[b] || 0,
        pct: pctOf(counts[b] || 0, withKidsData.length),
      })),
    };
  }

  // Day school enrolled
  {
    const { n, segments } = yesNoSegments(profiles, "day_school_enrolled");
    out.day_school = { scope, n, total, eventCount, segments };
  }

  // Hebrew school enrolled
  {
    const { n, segments } = yesNoSegments(
      profiles,
      "hebrew_school_enrolled",
      "hebrew_school_parent"
    );
    out.hebrew_school = { scope, n, total, eventCount, segments };
  }

  return out;
}

const COMPARISON_FIELD_DEFS: { key: string; label: string; segmentOrder: string[] }[] = [
  { key: "age", label: "Age Distribution", segmentOrder: [...AGE_ORDER] },
  { key: "denomination", label: "Denomination", segmentOrder: [] }, // ordered by event pct below
  { key: "children", label: "Number of Children", segmentOrder: CHILD_BUCKETS },
  { key: "day_school", label: "Day School Enrolled", segmentOrder: ["Enrolled", "Not enrolled"] },
  { key: "hebrew_school", label: "Hebrew School Enrolled", segmentOrder: ["Enrolled", "Not enrolled"] },
];

export async function getDemographicComparison(
  supabase: SupabaseClient,
  eventId: string,
  organizationId: string,
  eventType: string,
  serviceClient?: SupabaseClient
): Promise<ComparisonField[]> {
  const communityClient = serviceClient || supabase;

  // Scope event IDs
  const orgEventIds = await getOrgEventTypeIds(supabase, organizationId, eventType);
  const { data: communityEvents } = await communityClient
    .from("events")
    .select("id")
    .eq("event_type", eventType);
  const communityEventIds = communityEvents?.map((e) => e.id) || [];

  const [eventProfiles, orgProfiles, communityProfiles] = await Promise.all([
    getProfilesForEventIds(supabase, [eventId]),
    getProfilesForEventIds(supabase, orgEventIds),
    getProfilesForEventIds(communityClient, communityEventIds),
  ]);

  const eventSeries = buildComparisonSeries("event", eventProfiles, 1);
  const orgSeries = buildComparisonSeries("org", orgProfiles, orgEventIds.length);
  const communitySeries = buildComparisonSeries(
    "community",
    communityProfiles,
    communityEventIds.length
  );

  return COMPARISON_FIELD_DEFS.map((def) => {
    const series = [
      eventSeries[def.key],
      orgSeries[def.key],
      communitySeries[def.key],
    ];
    let segmentOrder = def.segmentOrder;
    if (def.key === "denomination") {
      // Order by this event's share desc, then org's, so the event's story leads
      const names = new Set<string>();
      for (const s of series) for (const seg of s.segments) names.add(seg.name);
      const eventPct = (name: string) =>
        series[0].segments.find((x) => x.name === name)?.pct ?? 0;
      segmentOrder = [...names].sort((a, b) => eventPct(b) - eventPct(a));
    }
    return { key: def.key, label: def.label, segmentOrder, series };
  });
}

// ── Business-unit engagement (what else attendees do at this org) ──

export interface BusinessUnitEngagement {
  unit: string;          // e.g. "Day camp"
  ageRange: string;      // e.g. "5–12"
  eligible: number;      // families with an age-eligible kid
  engaged: number;       // of those, families engaging with the unit
  pct: number;
}

const BUSINESS_UNITS: {
  unit: string;
  interestKeys: string[];
  minAge: number;
  maxAge: number;
}[] = [
  { unit: "Early childhood", interestKeys: ["early_childhood", "preschool"], minAge: 0, maxAge: 5 },
  { unit: "Day camp", interestKeys: ["day_camp"], minAge: 5, maxAge: 12 },
  { unit: "After school", interestKeys: ["after_school"], minAge: 5, maxAge: 12 },
  { unit: "Teen programs", interestKeys: ["teen_programs", "teen_leadership", "bbyo", "maccabi"], minAge: 13, maxAge: 17 },
];

function childAges(attrs: Record<string, unknown> | null): number[] {
  if (!attrs) return [];
  const ages: number[] = [];
  const now = new Date();
  for (const [k, v] of Object.entries(attrs)) {
    const clean = k.replace(/^org:[^:]+:/, "");
    if (/^child_\d+_dob$/.test(clean) && typeof v === "string") {
      const dob = new Date(v);
      if (!isNaN(dob.getTime())) {
        let age = now.getFullYear() - dob.getFullYear();
        const monthDiff = now.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
        if (age >= 0 && age <= 25) ages.push(age);
      }
    }
  }
  return ages;
}

/** Program interests recorded by THIS org only (org-prefixed attribute). */
function orgProgramInterests(
  attrs: Record<string, unknown> | null,
  organizationId: string
): Set<string> {
  if (!attrs) return new Set();
  const v = attrs[`org:${organizationId}:program_interests`];
  if (typeof v !== "string" || !v) return new Set();
  return new Set(v.split(",").map((s) => s.trim()).filter(Boolean));
}

export async function getBusinessUnitEngagement(
  supabase: SupabaseClient,
  eventId: string,
  organizationId: string
): Promise<{ units: BusinessUnitEngagement[]; withInterestData: number; totalAttendees: number }> {
  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("person_id")
    .eq("event_id", eventId);
  if (!attendees || attendees.length === 0) {
    return { units: [], withInterestData: 0, totalAttendees: 0 };
  }
  const uniqueIds = [...new Set(attendees.map((a) => a.person_id))];
  const { data: profiles } = await supabase
    .from("people_profiles")
    .select("attributes")
    .in("id", uniqueIds);
  if (!profiles) return { units: [], withInterestData: 0, totalAttendees: uniqueIds.length };

  let withInterestData = 0;
  const units = BUSINESS_UNITS.map((def) => ({
    ...def,
    eligible: 0,
    engaged: 0,
  }));

  for (const p of profiles) {
    const attrs = p.attributes as Record<string, unknown> | null;
    const ages = childAges(attrs);
    const interests = orgProgramInterests(attrs, organizationId);
    if (interests.size > 0) withInterestData++;
    for (const u of units) {
      const hasEligibleKid = ages.some((a) => a >= u.minAge && a <= u.maxAge);
      if (!hasEligibleKid) continue;
      u.eligible++;
      if (u.interestKeys.some((k) => interests.has(k))) u.engaged++;
    }
  }

  return {
    units: units
      .filter((u) => u.eligible > 0)
      .map((u) => ({
        unit: u.unit,
        ageRange: `${u.minAge}–${u.maxAge}`,
        eligible: u.eligible,
        engaged: u.engaged,
        pct: u.eligible > 0 ? Math.round((u.engaged / u.eligible) * 100) : 0,
      })),
    withInterestData,
    totalAttendees: uniqueIds.length,
  };
}

function buildBreakdown(
  profiles: { age_bucket: string | null; denomination: string | null; has_children: boolean | null; number_of_children: number | null }[]
): DemographicBreakdown {
  const total = profiles.length;
  if (total === 0) {
    return {
      ageBuckets: [],
      denominations: [],
      totalAttendees: 0,
      avgAge: null,
      hasChildrenPct: 0,
      avgChildren: null,
    };
  }

  // Age buckets
  const ageCounts: Record<string, number> = {};
  for (const p of profiles) {
    const bucket = p.age_bucket || "Unknown";
    ageCounts[bucket] = (ageCounts[bucket] || 0) + 1;
  }
  const ageBuckets = AGE_ORDER
    .filter((b) => ageCounts[b])
    .map((b) => ({ name: b, count: ageCounts[b] }));

  // Denominations
  const denomCounts: Record<string, number> = {};
  for (const p of profiles) {
    const d = p.denomination || "unknown";
    denomCounts[d] = (denomCounts[d] || 0) + 1;
  }
  const denominations = Object.entries(denomCounts)
    .filter(([key]) => key !== "unknown")
    .map(([key, value]) => ({
      name: DENOM_LABELS[key] || key,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  // Children stats
  const withKids = profiles.filter((p) => p.has_children);
  const hasChildrenPct = Math.round((withKids.length / total) * 100);
  const childCounts = profiles
    .map((p) => p.number_of_children)
    .filter((n): n is number => n !== null && n > 0);
  const avgChildren = childCounts.length > 0
    ? Math.round((childCounts.reduce((a, b) => a + b, 0) / childCounts.length) * 10) / 10
    : null;

  return {
    ageBuckets,
    denominations,
    totalAttendees: total,
    avgAge: null,
    hasChildrenPct,
    avgChildren,
  };
}

// ── Helpers for fetching event IDs with date filters ──

async function getOrgEventTypeIds(
  supabase: SupabaseClient,
  organizationId: string,
  eventType: string,
  dateFilter?: DateFilter
): Promise<string[]> {
  let query = supabase
    .from("events")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("event_type", eventType);
  if (dateFilter?.start) query = query.gte("event_date", dateFilter.start);
  if (dateFilter?.end) query = query.lte("event_date", dateFilter.end);
  const { data } = await query;
  return data?.map((e) => e.id) || [];
}

// Chunk sizes: .in() lists ride in the request URL, so keep them short, and
// PostgREST caps responses at 1000 rows, so paginate attendee reads.
const EVENT_ID_CHUNK = 50;
const PERSON_ID_CHUNK = 150;
const PAGE_SIZE = 1000;

async function getProfilesForEventIds(
  supabase: SupabaseClient,
  eventIds: string[]
): Promise<{ age_bucket: string | null; denomination: string | null; has_children: boolean | null; number_of_children: number | null; attributes: Record<string, unknown> | null; is_member: boolean | null; member_org_ids: string[] | null }[]> {
  if (eventIds.length === 0) return [];

  const personIds = new Set<string>();
  for (let i = 0; i < eventIds.length; i += EVENT_ID_CHUNK) {
    const chunk = eventIds.slice(i, i + EVENT_ID_CHUNK);
    let from = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("event_attendees")
        .select("person_id")
        .in("event_id", chunk)
        .range(from, from + PAGE_SIZE - 1);
      if (error) {
        console.error("getProfilesForEventIds attendees error:", error.message);
        break;
      }
      if (!data || data.length === 0) break;
      for (const a of data) personIds.add(a.person_id);
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
  }
  if (personIds.size === 0) return [];

  const ids = [...personIds];
  const profiles: { age_bucket: string | null; denomination: string | null; has_children: boolean | null; number_of_children: number | null; attributes: Record<string, unknown> | null; is_member: boolean | null; member_org_ids: string[] | null }[] = [];
  for (let i = 0; i < ids.length; i += PERSON_ID_CHUNK) {
    const { data, error } = await supabase
      .from("people_profiles")
      .select("age_bucket, denomination, has_children, number_of_children, attributes, is_member, member_org_ids")
      .in("id", ids.slice(i, i + PERSON_ID_CHUNK));
    if (error) {
      console.error("getProfilesForEventIds profiles error:", error.message);
      continue;
    }
    if (data) profiles.push(...data);
  }
  return profiles;
}

// ── Attendance comparison ──

export async function getAttendanceComparison(
  supabase: SupabaseClient,
  eventId: string,
  organizationId: string,
  eventType: string,
  dateFilter?: DateFilter,
  serviceClient?: SupabaseClient // bypasses RLS for cross-org community queries
): Promise<AttendanceComparison> {
  // This specific event's attendee count (always unfiltered — it's one event)
  const { data: thisEventAttendees } = await supabase
    .from("event_attendees")
    .select("person_id")
    .eq("event_id", eventId);
  const thisEvent = thisEventAttendees
    ? new Set(thisEventAttendees.map((a) => a.person_id)).size
    : 0;

  // All org events of this type — get attendee counts per event for averaging
  let orgQuery = supabase
    .from("events")
    .select("id, attendee_count")
    .eq("organization_id", organizationId)
    .eq("event_type", eventType);
  if (dateFilter) {
    if (dateFilter.start) orgQuery = orgQuery.gte("event_date", dateFilter.start);
    if (dateFilter.end) orgQuery = orgQuery.lte("event_date", dateFilter.end);
  }
  const { data: orgEvents } = await orgQuery;
  const orgEventTypeCount = orgEvents?.length || 0;
  const orgTotalAttendees = orgEvents?.reduce((sum, e) => sum + (e.attendee_count || 0), 0) || 0;
  const orgEventTypeAvg = orgEventTypeCount > 0 ? Math.round(orgTotalAttendees / orgEventTypeCount) : 0;

  // All community events of this type (across all orgs)
  // Use service client to bypass RLS so we see events from ALL orgs
  const communityClient = serviceClient || supabase;
  let communityQuery = communityClient
    .from("events")
    .select("id, attendee_count")
    .eq("event_type", eventType);
  if (dateFilter) {
    if (dateFilter.start) communityQuery = communityQuery.gte("event_date", dateFilter.start);
    if (dateFilter.end) communityQuery = communityQuery.lte("event_date", dateFilter.end);
  }
  const { data: communityEvents } = await communityQuery;
  const communityEventTypeCount = communityEvents?.length || 0;
  const communityTotalAttendees = communityEvents?.reduce((sum, e) => sum + (e.attendee_count || 0), 0) || 0;
  const communityEventTypeAvg = communityEventTypeCount > 0 ? Math.round(communityTotalAttendees / communityEventTypeCount) : 0;

  return {
    thisEvent,
    orgEventTypeAvg,
    orgEventTypeCount,
    communityEventTypeAvg,
    communityEventTypeCount,
  };
}

// ── Demographics with coverage-based field detection ──

const MIN_COVERAGE = 0.15; // At least 15% of attendees must have data for a field to show

export async function getEventDemographics(
  supabase: SupabaseClient,
  eventId: string
): Promise<DemographicField[]> {
  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("person_id")
    .eq("event_id", eventId);
  if (!attendees || attendees.length === 0) return [];

  const uniqueIds = [...new Set(attendees.map((a) => a.person_id))];
  const { data: profiles } = await supabase
    .from("people_profiles")
    .select("age_bucket, denomination, has_children, number_of_children, attributes, is_member, member_org_ids")
    .in("id", uniqueIds);

  if (!profiles || profiles.length === 0) return [];

  const total = profiles.length;
  const fields: DemographicField[] = [];

  // Age distribution
  const withAge = profiles.filter((p) => p.age_bucket && p.age_bucket !== "Unknown");
  if (withAge.length / total >= MIN_COVERAGE) {
    const counts: Record<string, number> = {};
    for (const p of withAge) counts[p.age_bucket!] = (counts[p.age_bucket!] || 0) + 1;
    const segments = AGE_ORDER
      .filter((b) => counts[b])
      .map((b) => ({ name: b, value: counts[b] }));
    fields.push({
      key: "age_bucket",
      label: "Age Distribution",
      segments,
      coverage: withAge.length / total,
      total: withAge.length,
    });
  }

  // Denomination
  const withDenom = profiles.filter((p) => p.denomination && p.denomination !== "unknown");
  if (withDenom.length / total >= MIN_COVERAGE) {
    const counts: Record<string, number> = {};
    for (const p of withDenom) counts[p.denomination!] = (counts[p.denomination!] || 0) + 1;
    const segments = Object.entries(counts)
      .map(([key, value]) => ({ name: DENOM_LABELS[key] || key, value }))
      .sort((a, b) => b.value - a.value);
    fields.push({
      key: "denomination",
      label: "Denomination",
      segments,
      coverage: withDenom.length / total,
      total: withDenom.length,
    });
  }

  // Membership status — only chart people who actually have this field set.
  // People with null are excluded from the chart denominator; coverage
  // communicates how much of the population we have this data for.
  const withMembership = profiles.filter((p) => p.is_member !== null);
  if (withMembership.length / total >= MIN_COVERAGE) {
    const members = withMembership.filter((p) => p.is_member === true).length;
    const nonMembers = withMembership.filter((p) => p.is_member === false).length;
    const segments = [
      { name: "Member", value: members },
      { name: "Non-member", value: nonMembers },
    ].filter((s) => s.value > 0);
    fields.push({
      key: "is_member",
      label: "Membership Status",
      segments,
      coverage: withMembership.length / total,
      total: withMembership.length,
    });
  }

  // Has children — same approach, exclude "unknown" from segments.
  const withChildrenData = profiles.filter((p) => p.has_children !== null);
  if (withChildrenData.length / total >= MIN_COVERAGE) {
    const yes = withChildrenData.filter((p) => p.has_children === true).length;
    const no = withChildrenData.filter((p) => p.has_children === false).length;
    const segments = [
      { name: "Has children", value: yes },
      { name: "No children", value: no },
    ].filter((s) => s.value > 0);
    fields.push({
      key: "has_children",
      label: "Has Children",
      segments,
      coverage: withChildrenData.length / total,
      total: withChildrenData.length,
    });
  }

  // Dynamic attributes from JSONB — scan all profiles and find common attributes.
  // Allowlist: only chart fields that are actual demographic attributes —
  // comparable population characteristics. Excludes PII (phone, email, name),
  // operational/behavioral fields (registration channel, dietary notes,
  // program interests, RSVP source), and free text.
  // Strips any "org:<uuid>:" prefix before matching.
  const DEMOGRAPHIC_PATTERNS = [
    /age/i,
    /denomination/i,
    /gender/i, /\bsex\b/i,
    /membership/i, /\bmember\b/i, /\btier\b/i,
    /life[_-]?stage/i, /family[_-]?stage/i,
    /marital/i, /relationship[_-]?status/i,
    /household/i, /family[_-]?size/i,
    /children/i, /\bkids\b/i,
    /\bzip\b/i, /postal/i, /neighborhood/i, /\bcity\b/i,
    /language/i,
    /ethnicity/i, /\brace\b/i, /heritage/i,
    /education/i,
    /occupation/i, /profession/i,
    /income/i,
    // Jewish engagement biographical facts (self + kids)
    /jewish[_-]?preschool/i,
    /hebrew[_-]?school/i,
    /religious[_-]?school/i,
    /day[_-]?school/i,
    /overnight[_-]?camp/i,
    /\bday[_-]?camp\b/i,
    /birthright/i,
    /federation/i,
    /\bsynagogue\b/i,
    /bnai[_-]?mitzvah/i, /bar[_-]?mitzvah/i, /bat[_-]?mitzvah/i,
    /israel[_-]?trip/i,
    /youth[_-]?group/i,
    /jewish[_-]?board/i,
  ];
  const stripOrgPrefix = (k: string) => k.replace(/^org:[^:]+:/, "");
  const isDemographic = (k: string) =>
    DEMOGRAPHIC_PATTERNS.some((re) => re.test(stripOrgPrefix(k)));

  const attrCounts: Record<string, Record<string, number>> = {};
  const attrTotals: Record<string, number> = {};
  for (const p of profiles) {
    const attrs = p.attributes as Record<string, string> | null;
    if (!attrs) continue;
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "is_child" || key === "parent_id") continue; // skip internal attrs
      if (!value || typeof value !== "string") continue;
      // Only include recognized demographic fields
      if (!isDemographic(key)) continue;
      if (!attrCounts[key]) attrCounts[key] = {};
      attrCounts[key][value] = (attrCounts[key][value] || 0) + 1;
      attrTotals[key] = (attrTotals[key] || 0) + 1;
    }
  }

  // Only include attribute fields that meet coverage threshold
  // and have at least 2 distinct values (otherwise not interesting)
  for (const [key, valueCounts] of Object.entries(attrCounts)) {
    // Count unique people who have this attr (not total mentions)
    const peopleWithAttr = new Set<number>();
    profiles.forEach((p, i) => {
      const attrs = p.attributes as Record<string, string> | null;
      if (attrs && attrs[key]) peopleWithAttr.add(i);
    });
    const coverage = peopleWithAttr.size / total;
    if (coverage < MIN_COVERAGE) continue;

    const segments = Object.entries(valueCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    if (segments.length < 2) continue; // not interesting if only one value

    // Identifier heuristic: if no single value is shared by 2+ people, this
    // is a high-cardinality identifier (phone numbers, IDs), not a demographic.
    if (segments[0].value < 2) continue;

    // Strip org-scoped prefix like "org:uuid:" before building the label
    const cleanKey = stripOrgPrefix(key);
    const label = cleanKey
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    fields.push({
      key: `attr_${key}`,
      label,
      segments,
      coverage,
      total: peopleWithAttr.size,
    });
  }

  // Sort by coverage descending — best data first
  fields.sort((a, b) => b.coverage - a.coverage);

  return fields;
}

// ── Available timeframe options ──

export async function getAvailableYears(
  supabase: SupabaseClient,
  organizationId: string
): Promise<number[]> {
  const { data } = await supabase
    .from("events")
    .select("event_date")
    .eq("organization_id", organizationId)
    .order("event_date", { ascending: true });

  if (!data || data.length === 0) return [];

  const years = new Set<number>();
  for (const e of data) {
    years.add(new Date(e.event_date).getFullYear());
  }

  return [...years].sort((a, b) => b - a); // newest first
}

// ── Legacy exports (still used by ComparisonCharts) ──

export async function getEventBreakdown(
  supabase: SupabaseClient,
  eventId: string
): Promise<DemographicBreakdown> {
  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("person_id")
    .eq("event_id", eventId);

  if (!attendees || attendees.length === 0) {
    return buildBreakdown([]);
  }

  const personIds = attendees.map((a) => a.person_id);
  const { data: profiles } = await supabase
    .from("people_profiles")
    .select("age_bucket, denomination, has_children, number_of_children")
    .in("id", personIds);

  return buildBreakdown(profiles || []);
}

export async function getOrgTypeBreakdown(
  supabase: SupabaseClient,
  organizationId: string,
  eventType: string
): Promise<DemographicBreakdown> {
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("event_type", eventType);
  if (!events || events.length === 0) return buildBreakdown([]);

  const eventIds = events.map((e) => e.id);
  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("person_id")
    .in("event_id", eventIds);
  if (!attendees || attendees.length === 0) return buildBreakdown([]);

  const uniquePersonIds = [...new Set(attendees.map((a) => a.person_id))];
  const { data: profiles } = await supabase
    .from("people_profiles")
    .select("age_bucket, denomination, has_children, number_of_children")
    .in("id", uniquePersonIds);

  return buildBreakdown(profiles || []);
}

export async function getCommunityTypeBreakdown(
  supabase: SupabaseClient,
  eventType: string
): Promise<DemographicBreakdown> {
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("event_type", eventType);
  if (!events || events.length === 0) return buildBreakdown([]);

  const eventIds = events.map((e) => e.id);
  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("person_id")
    .in("event_id", eventIds);
  if (!attendees || attendees.length === 0) return buildBreakdown([]);

  const uniquePersonIds = [...new Set(attendees.map((a) => a.person_id))];
  const { data: profiles } = await supabase
    .from("people_profiles")
    .select("age_bucket, denomination, has_children, number_of_children")
    .in("id", uniquePersonIds);

  return buildBreakdown(profiles || []);
}
