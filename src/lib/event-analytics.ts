import { SupabaseClient } from "@supabase/supabase-js";

export interface DemographicBreakdown {
  ageBuckets: { name: string; count: number }[];
  denominations: { name: string; value: number }[];
  totalAttendees: number;
  avgAge: number | null;
  hasChildrenPct: number;
  avgChildren: number | null;
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
    avgAge: null, // Could compute from DOB
    hasChildrenPct,
    avgChildren,
  };
}

/**
 * Get demographic breakdown for a specific event's attendees.
 */
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

/**
 * Get aggregate breakdown for all events of a given type within an org.
 */
/**
 * Get aggregate breakdown for all events of a given type within an org
 * (includes the current event — this represents the full org picture).
 */
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

  // Get all attendees across these events (deduplicated by person)
  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("person_id")
    .in("event_id", eventIds);

  if (!attendees || attendees.length === 0) return buildBreakdown([]);

  // Deduplicate person IDs
  const uniquePersonIds = [...new Set(attendees.map((a) => a.person_id))];

  const { data: profiles } = await supabase
    .from("people_profiles")
    .select("age_bucket, denomination, has_children, number_of_children")
    .in("id", uniquePersonIds);

  return buildBreakdown(profiles || []);
}

/**
 * Get aggregate breakdown for all events of a given type across ALL orgs.
 */
export async function getCommunityTypeBreakdown(
  supabase: SupabaseClient,
  eventType: string
): Promise<DemographicBreakdown> {
  // Use service client to bypass RLS for cross-org aggregation
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
