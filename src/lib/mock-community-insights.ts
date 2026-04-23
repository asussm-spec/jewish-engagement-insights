/**
 * Mock data for the Community Insights page.
 * Represents aggregated, deduplicated community-wide analytics
 * across all participating organizations.
 */

export interface CommunityOverview {
  totalUniqueIndividuals: number;
  totalHouseholds: number;
  totalChildren: number;
  estimatedJewishPopulation: number; // denominator for coverage %
  crossOrgOverlap: number; // individuals appearing in 2+ orgs
  participatingOrgs: { type: string; count: number; names: string[] }[];
}

export interface EngagementFunnel {
  tiers: { label: string; count: number; pct: number }[];
}

export interface EventTypeHeatMap {
  programs: {
    name: string;
    totalParticipants: number;
    orgCount: number; // how many orgs offer this
    avgPerOrg: number;
    pctOfCommunity: number;
  }[];
}

export interface EngagementTrend {
  quarters: {
    label: string;
    uniqueParticipants: number;
    totalEventAttendances: number;
    avgEventsPerPerson: number;
  }[];
}

export interface RisingStar {
  name: string;
  type: "org" | "program";
  metric: string;
  growth: number; // % change
  current: number;
  previous: number;
}

export interface AgeBucket {
  name: string;
  count: number;
  pct: number;
}

export interface FamilyPipeline {
  cohorts: {
    label: string;
    ageRange: string;
    count: number;
    nextMilestone: string;
  }[];
  totalChildren: number;
  totalFamilies: number;
}

export interface GeographicCluster {
  zipCode: string;
  area: string;
  households: number;
  individuals: number;
  avgEngagement: number; // events per person
}

export interface EngagementDropoff {
  ageGroups: {
    name: string;
    lastYearPct: number;
    thisYearPct: number;
    dropoff: number;
  }[];
}

// ── Mock data ────────────────────────────────────────

export const COMMUNITY_OVERVIEW: CommunityOverview = {
  totalUniqueIndividuals: 4832,
  totalHouseholds: 2145,
  totalChildren: 1640,
  estimatedJewishPopulation: 12500,
  crossOrgOverlap: 812,
  participatingOrgs: [
    { type: "Synagogues", count: 8, names: ["Temple Beth Shalom", "Temple Israel", "Kehillat Shalom", "Beth El", "Mishkan Tefila", "Temple Emanu-El", "B'nai Torah", "Temple Sinai"] },
    { type: "JCCs", count: 2, names: ["Greater Boston JCC", "Brookline JCC"] },
    { type: "Day Schools", count: 3, names: ["Solomon Schechter", "Rashi School", "Maimonides"] },
    { type: "Camps", count: 2, names: ["Camp Ramah NE", "Camp Yavneh"] },
  ],
};

export const ENGAGEMENT_FUNNEL: EngagementFunnel = {
  tiers: [
    { label: "5+ events", count: 486, pct: 10 },
    { label: "2–4 events", count: 924, pct: 19 },
    { label: "1 event", count: 1208, pct: 25 },
    { label: "No events (members only)", count: 2214, pct: 46 },
  ],
};

export const EVENT_TYPE_HEATMAP: EventTypeHeatMap = {
  programs: [
    { name: "Holiday Events", totalParticipants: 2180, orgCount: 14, avgPerOrg: 156, pctOfCommunity: 45 },
    { name: "Shabbat Services", totalParticipants: 1620, orgCount: 10, avgPerOrg: 162, pctOfCommunity: 34 },
    { name: "Family Programs", totalParticipants: 1085, orgCount: 12, avgPerOrg: 90, pctOfCommunity: 22 },
    { name: "Social / Community", totalParticipants: 892, orgCount: 11, avgPerOrg: 81, pctOfCommunity: 18 },
    { name: "Adult Learning", totalParticipants: 845, orgCount: 10, avgPerOrg: 85, pctOfCommunity: 17 },
    { name: "Youth Programs", totalParticipants: 628, orgCount: 9, avgPerOrg: 70, pctOfCommunity: 13 },
    { name: "Volunteer / Tikkun Olam", totalParticipants: 512, orgCount: 10, avgPerOrg: 51, pctOfCommunity: 11 },
    { name: "Day School Programs", totalParticipants: 420, orgCount: 3, avgPerOrg: 140, pctOfCommunity: 9 },
    { name: "Camp Activities", totalParticipants: 385, orgCount: 2, avgPerOrg: 193, pctOfCommunity: 8 },
    { name: "Israel Programming", totalParticipants: 215, orgCount: 6, avgPerOrg: 36, pctOfCommunity: 4 },
  ],
};

export const ENGAGEMENT_TRENDS: EngagementTrend = {
  quarters: [
    { label: "Q1 2025", uniqueParticipants: 1980, totalEventAttendances: 5420, avgEventsPerPerson: 2.7 },
    { label: "Q2 2025", uniqueParticipants: 1650, totalEventAttendances: 4180, avgEventsPerPerson: 2.5 },
    { label: "Q3 2025", uniqueParticipants: 1420, totalEventAttendances: 3650, avgEventsPerPerson: 2.6 },
    { label: "Q4 2025", uniqueParticipants: 2210, totalEventAttendances: 6380, avgEventsPerPerson: 2.9 },
    { label: "Q1 2026", uniqueParticipants: 2618, totalEventAttendances: 7540, avgEventsPerPerson: 2.9 },
  ],
};

export const RISING_STARS: RisingStar[] = [
  { name: "Adult Learning", type: "program", metric: "participants", growth: 32, current: 845, previous: 640 },
  { name: "Temple Beth Shalom", type: "org", metric: "engagement rate", growth: 18, current: 53, previous: 45 },
  { name: "Family Programs", type: "program", metric: "participants", growth: 24, current: 1085, previous: 875 },
  { name: "Greater Boston JCC", type: "org", metric: "unique attendees", growth: 15, current: 680, previous: 591 },
  { name: "Dorshei Tzedek", type: "org", metric: "engagement rate", growth: 14, current: 72, previous: 63 },
  { name: "Israel Programming", type: "program", metric: "participants", growth: 28, current: 215, previous: 168 },
];

export const COMMUNITY_AGE_DISTRIBUTION: AgeBucket[] = [
  { name: "0–5", count: 382, pct: 8 },
  { name: "6–12", count: 548, pct: 11 },
  { name: "13–17", count: 395, pct: 8 },
  { name: "18–25", count: 245, pct: 5 },
  { name: "26–35", count: 462, pct: 10 },
  { name: "36–45", count: 892, pct: 18 },
  { name: "46–55", count: 785, pct: 16 },
  { name: "56–65", count: 548, pct: 11 },
  { name: "66–75", count: 382, pct: 8 },
  { name: "76+", count: 193, pct: 4 },
];

export const FAMILY_PIPELINE: FamilyPipeline = {
  totalChildren: 1640,
  totalFamilies: 945,
  cohorts: [
    { label: "Infants & toddlers", ageRange: "0–2", count: 185, nextMilestone: "Preschool enrollment" },
    { label: "Preschool", ageRange: "3–5", count: 290, nextMilestone: "Kindergarten / day school" },
    { label: "Elementary", ageRange: "6–9", count: 385, nextMilestone: "Hebrew school intensifies" },
    { label: "Pre-B'nai Mitzvah", ageRange: "10–12", count: 312, nextMilestone: "Bar/Bat Mitzvah (12–13)" },
    { label: "Post-B'nai Mitzvah", ageRange: "13–15", count: 248, nextMilestone: "Confirmation / youth group" },
    { label: "High school", ageRange: "16–17", count: 220, nextMilestone: "College departure" },
  ],
};

export const GEOGRAPHIC_CLUSTERS: GeographicCluster[] = [
  { zipCode: "02138", area: "Cambridge", households: 285, individuals: 610, avgEngagement: 2.8 },
  { zipCode: "02139", area: "Cambridge", households: 220, individuals: 478, avgEngagement: 2.5 },
  { zipCode: "02140", area: "Cambridge", households: 165, individuals: 355, avgEngagement: 2.2 },
  { zipCode: "02144", area: "Somerville", households: 142, individuals: 298, avgEngagement: 2.9 },
  { zipCode: "02134", area: "Allston", households: 118, individuals: 245, avgEngagement: 1.8 },
  { zipCode: "02135", area: "Brighton", households: 105, individuals: 228, avgEngagement: 1.6 },
  { zipCode: "02148", area: "Malden", households: 92, individuals: 195, avgEngagement: 2.1 },
  { zipCode: "02155", area: "Medford", households: 85, individuals: 178, avgEngagement: 1.9 },
  { zipCode: "02143", area: "Somerville", households: 78, individuals: 162, avgEngagement: 3.1 },
  { zipCode: "02446", area: "Brookline", households: 245, individuals: 520, avgEngagement: 3.2 },
  { zipCode: "02445", area: "Brookline", households: 168, individuals: 358, avgEngagement: 2.7 },
  { zipCode: "02467", area: "Chestnut Hill", households: 95, individuals: 205, avgEngagement: 2.4 },
];

export const ENGAGEMENT_DROPOFF: EngagementDropoff = {
  ageGroups: [
    { name: "0–5", lastYearPct: 42, thisYearPct: 45, dropoff: -3 },
    { name: "6–12", lastYearPct: 58, thisYearPct: 62, dropoff: -4 },
    { name: "13–15", lastYearPct: 55, thisYearPct: 48, dropoff: 7 },
    { name: "16–17", lastYearPct: 42, thisYearPct: 28, dropoff: 14 },
    { name: "18–22", lastYearPct: 18, thisYearPct: 8, dropoff: 10 },
    { name: "23–30", lastYearPct: 22, thisYearPct: 25, dropoff: -3 },
    { name: "31–45", lastYearPct: 48, thisYearPct: 52, dropoff: -4 },
    { name: "46–55", lastYearPct: 45, thisYearPct: 44, dropoff: 1 },
    { name: "56–65", lastYearPct: 38, thisYearPct: 36, dropoff: 2 },
    { name: "66–75", lastYearPct: 35, thisYearPct: 32, dropoff: 3 },
    { name: "76+", lastYearPct: 28, thisYearPct: 22, dropoff: 6 },
  ],
};
