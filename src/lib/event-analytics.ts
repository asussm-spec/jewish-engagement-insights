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

async function getOrgEventIds(
  supabase: SupabaseClient,
  organizationId: string,
  dateFilter?: DateFilter
): Promise<string[]> {
  let query = supabase
    .from("events")
    .select("id")
    .eq("organization_id", organizationId);
  if (dateFilter?.start) query = query.gte("event_date", dateFilter.start);
  if (dateFilter?.end) query = query.lte("event_date", dateFilter.end);
  const { data } = await query;
  return data?.map((e) => e.id) || [];
}

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

async function getUniqueAttendeeCount(
  supabase: SupabaseClient,
  eventIds: string[]
): Promise<number> {
  if (eventIds.length === 0) return 0;
  const { data } = await supabase
    .from("event_attendees")
    .select("person_id")
    .in("event_id", eventIds);
  if (!data) return 0;
  return new Set(data.map((a) => a.person_id)).size;
}

async function getProfilesForEventIds(
  supabase: SupabaseClient,
  eventIds: string[]
): Promise<{ age_bucket: string | null; denomination: string | null; has_children: boolean | null; number_of_children: number | null; attributes: Record<string, unknown> | null; is_member: boolean | null; member_org_ids: string[] | null }[]> {
  if (eventIds.length === 0) return [];
  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("person_id")
    .in("event_id", eventIds);
  if (!attendees || attendees.length === 0) return [];
  const uniqueIds = [...new Set(attendees.map((a) => a.person_id))];
  const { data: profiles } = await supabase
    .from("people_profiles")
    .select("age_bucket, denomination, has_children, number_of_children, attributes, is_member, member_org_ids")
    .in("id", uniqueIds);
  return profiles || [];
}

// ── Attendance comparison ──

export async function getAttendanceComparison(
  supabase: SupabaseClient,
  eventId: string,
  organizationId: string,
  eventType: string,
  dateFilter?: DateFilter
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
  let communityQuery = supabase
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

  // Membership status
  const withMembership = profiles.filter((p) => p.is_member !== null);
  if (withMembership.length / total >= MIN_COVERAGE) {
    const members = withMembership.filter((p) => p.is_member === true).length;
    const nonMembers = withMembership.filter((p) => p.is_member === false).length;
    const unknown = total - withMembership.length;
    const segments = [
      { name: "Member", value: members },
      { name: "Non-member", value: nonMembers },
    ];
    if (unknown > 0) segments.push({ name: "Unknown", value: unknown });
    fields.push({
      key: "is_member",
      label: "Membership Status",
      segments: segments.filter((s) => s.value > 0),
      coverage: withMembership.length / total,
      total,
    });
  }

  // Has children
  const withChildrenData = profiles.filter((p) => p.has_children !== null);
  if (withChildrenData.length / total >= MIN_COVERAGE) {
    const yes = withChildrenData.filter((p) => p.has_children === true).length;
    const no = withChildrenData.filter((p) => p.has_children === false).length;
    const unknown = total - withChildrenData.length;
    const segments = [
      { name: "Has children", value: yes },
      { name: "No children", value: no },
    ];
    if (unknown > 0) segments.push({ name: "Unknown", value: unknown });
    fields.push({
      key: "has_children",
      label: "Has Children",
      segments: segments.filter((s) => s.value > 0),
      coverage: withChildrenData.length / total,
      total,
    });
  }

  // Dynamic attributes from JSONB — scan all profiles and find common attributes
  // First, fetch field registry to know which fields are text (non-chartable)
  const { data: registryFields } = await supabase
    .from("field_registry")
    .select("key, data_type");
  const fieldTypes: Record<string, string> = {};
  if (registryFields) {
    for (const f of registryFields) fieldTypes[f.key] = f.data_type;
  }

  // Skip text-type fields — names, addresses, free-text aren't meaningful in charts
  const NON_CHARTABLE_TYPES = new Set(["text", "date"]);

  const attrCounts: Record<string, Record<string, number>> = {};
  const attrTotals: Record<string, number> = {};
  for (const p of profiles) {
    const attrs = p.attributes as Record<string, string> | null;
    if (!attrs) continue;
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "is_child" || key === "parent_id") continue; // skip internal attrs
      if (!value || typeof value !== "string") continue;
      // Skip fields whose registry data_type is text
      if (NON_CHARTABLE_TYPES.has(fieldTypes[key] || "")) continue;
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

    // Clean up the key into a readable label
    const label = key
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
