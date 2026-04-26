/**
 * Mock community benchmark data — 15 synagogues in the Greater Boston area.
 * Used for cross-synagogue comparison on the population page.
 */

export interface SynagogueBenchmark {
  id: string;
  name: string;
  denomination: "Reform" | "Conservative" | "Orthodox" | "Reconstructionist";
  sizeCategory: "Small" | "Mid-size" | "Large"; // <200, 200-500, 500+
  totalMembers: number;
  totalHouseholds: number;
  ageBuckets: Record<string, number>; // bucket name → count
  engagementRate: number; // % who attended 1+ event
  percentWithChildren: number;
  avgChildrenPerFamily: number;
  programParticipation: Record<string, number>; // program → member count
}

export const SYNAGOGUE_BENCHMARKS: SynagogueBenchmark[] = [
  {
    id: "tbs", name: "Temple Beth Shalom", denomination: "Reform", sizeCategory: "Large",
    totalMembers: 847, totalHouseholds: 418,
    ageBuckets: { "0–5": 64, "6–12": 91, "13–17": 58, "18–25": 32, "26–35": 67, "36–45": 148, "46–55": 132, "56–65": 108, "66–75": 89, "76+": 58 },
    engagementRate: 53, percentWithChildren: 52, avgChildrenPerFamily: 2.1,
    programParticipation: { "Shabbat Services": 186, "Holiday Events": 247, "Family Programs": 164, "Adult Learning": 93, "Social / Community": 112, "Youth Programs": 78, "Volunteer / Tikkun Olam": 65 },
  },
  {
    id: "ti", name: "Temple Israel", denomination: "Reform", sizeCategory: "Large",
    totalMembers: 1120, totalHouseholds: 540,
    ageBuckets: { "0–5": 78, "6–12": 112, "13–17": 85, "18–25": 48, "26–35": 92, "36–45": 198, "46–55": 168, "56–65": 142, "66–75": 118, "76+": 79 },
    engagementRate: 58, percentWithChildren: 48, avgChildrenPerFamily: 2.0,
    programParticipation: { "Shabbat Services": 268, "Holiday Events": 340, "Family Programs": 195, "Adult Learning": 142, "Social / Community": 156, "Youth Programs": 108, "Volunteer / Tikkun Olam": 98 },
  },
  {
    id: "cks", name: "Congregation Kehillat Shalom", denomination: "Conservative", sizeCategory: "Mid-size",
    totalMembers: 385, totalHouseholds: 192,
    ageBuckets: { "0–5": 22, "6–12": 38, "13–17": 28, "18–25": 15, "26–35": 32, "36–45": 68, "46–55": 62, "56–65": 52, "66–75": 42, "76+": 26 },
    engagementRate: 62, percentWithChildren: 44, avgChildrenPerFamily: 2.3,
    programParticipation: { "Shabbat Services": 142, "Holiday Events": 168, "Family Programs": 82, "Adult Learning": 65, "Social / Community": 58, "Youth Programs": 45, "Volunteer / Tikkun Olam": 38 },
  },
  {
    id: "be", name: "Temple Beth El", denomination: "Reform", sizeCategory: "Mid-size",
    totalMembers: 412, totalHouseholds: 205,
    ageBuckets: { "0–5": 28, "6–12": 42, "13–17": 32, "18–25": 18, "26–35": 38, "36–45": 72, "46–55": 65, "56–65": 54, "66–75": 38, "76+": 25 },
    engagementRate: 49, percentWithChildren: 46, avgChildrenPerFamily: 1.9,
    programParticipation: { "Shabbat Services": 98, "Holiday Events": 152, "Family Programs": 88, "Adult Learning": 52, "Social / Community": 72, "Youth Programs": 42, "Volunteer / Tikkun Olam": 35 },
  },
  {
    id: "mt", name: "Mishkan Tefila", denomination: "Conservative", sizeCategory: "Large",
    totalMembers: 680, totalHouseholds: 328,
    ageBuckets: { "0–5": 38, "6–12": 58, "13–17": 48, "18–25": 28, "26–35": 52, "36–45": 118, "46–55": 108, "56–65": 92, "66–75": 82, "76+": 56 },
    engagementRate: 55, percentWithChildren: 42, avgChildrenPerFamily: 2.2,
    programParticipation: { "Shabbat Services": 198, "Holiday Events": 262, "Family Programs": 128, "Adult Learning": 108, "Social / Community": 92, "Youth Programs": 68, "Volunteer / Tikkun Olam": 58 },
  },
  {
    id: "ys", name: "Young Israel of Sharon", denomination: "Orthodox", sizeCategory: "Mid-size",
    totalMembers: 290, totalHouseholds: 125,
    ageBuckets: { "0–5": 32, "6–12": 45, "13–17": 28, "18–25": 12, "26–35": 28, "36–45": 52, "46–55": 35, "56–65": 25, "66–75": 18, "76+": 15 },
    engagementRate: 78, percentWithChildren: 68, avgChildrenPerFamily: 3.1,
    programParticipation: { "Shabbat Services": 185, "Holiday Events": 210, "Family Programs": 95, "Adult Learning": 82, "Social / Community": 45, "Youth Programs": 62, "Volunteer / Tikkun Olam": 42 },
  },
  {
    id: "dh", name: "Dorshei Tzedek", denomination: "Reconstructionist", sizeCategory: "Small",
    totalMembers: 145, totalHouseholds: 72,
    ageBuckets: { "0–5": 12, "6–12": 18, "13–17": 10, "18–25": 5, "26–35": 14, "36–45": 28, "46–55": 22, "56–65": 18, "66–75": 12, "76+": 6 },
    engagementRate: 72, percentWithChildren: 55, avgChildrenPerFamily: 1.8,
    programParticipation: { "Shabbat Services": 62, "Holiday Events": 88, "Family Programs": 48, "Adult Learning": 38, "Social / Community": 52, "Youth Programs": 22, "Volunteer / Tikkun Olam": 45 },
  },
  {
    id: "ohr", name: "Congregation Or Atid", denomination: "Conservative", sizeCategory: "Small",
    totalMembers: 178, totalHouseholds: 88,
    ageBuckets: { "0–5": 10, "6–12": 18, "13–17": 14, "18–25": 8, "26–35": 15, "36–45": 32, "46–55": 28, "56–65": 22, "66–75": 18, "76+": 13 },
    engagementRate: 58, percentWithChildren: 40, avgChildrenPerFamily: 2.0,
    programParticipation: { "Shabbat Services": 68, "Holiday Events": 92, "Family Programs": 42, "Adult Learning": 35, "Social / Community": 28, "Youth Programs": 18, "Volunteer / Tikkun Olam": 22 },
  },
  {
    id: "sha", name: "Temple Shalom Medford", denomination: "Reform", sizeCategory: "Small",
    totalMembers: 165, totalHouseholds: 82,
    ageBuckets: { "0–5": 8, "6–12": 14, "13–17": 10, "18–25": 6, "26–35": 12, "36–45": 28, "46–55": 25, "56–65": 24, "66–75": 22, "76+": 16 },
    engagementRate: 44, percentWithChildren: 38, avgChildrenPerFamily: 1.7,
    programParticipation: { "Shabbat Services": 42, "Holiday Events": 68, "Family Programs": 32, "Adult Learning": 28, "Social / Community": 35, "Youth Programs": 15, "Volunteer / Tikkun Olam": 18 },
  },
  {
    id: "ema", name: "Temple Emanu-El", denomination: "Reform", sizeCategory: "Large",
    totalMembers: 920, totalHouseholds: 445,
    ageBuckets: { "0–5": 62, "6–12": 88, "13–17": 72, "18–25": 42, "26–35": 78, "36–45": 162, "46–55": 148, "56–65": 118, "66–75": 95, "76+": 55 },
    engagementRate: 51, percentWithChildren: 45, avgChildrenPerFamily: 2.0,
    programParticipation: { "Shabbat Services": 225, "Holiday Events": 310, "Family Programs": 172, "Adult Learning": 118, "Social / Community": 138, "Youth Programs": 92, "Volunteer / Tikkun Olam": 78 },
  },
  {
    id: "bnai", name: "Congregation B'nai Torah", denomination: "Conservative", sizeCategory: "Mid-size",
    totalMembers: 320, totalHouseholds: 158,
    ageBuckets: { "0–5": 18, "6–12": 28, "13–17": 22, "18–25": 12, "26–35": 25, "36–45": 55, "46–55": 52, "56–65": 45, "66–75": 38, "76+": 25 },
    engagementRate: 56, percentWithChildren: 41, avgChildrenPerFamily: 2.1,
    programParticipation: { "Shabbat Services": 112, "Holiday Events": 148, "Family Programs": 68, "Adult Learning": 58, "Social / Community": 48, "Youth Programs": 35, "Volunteer / Tikkun Olam": 32 },
  },
  {
    id: "mai", name: "Congregation Maimonides", denomination: "Orthodox", sizeCategory: "Mid-size",
    totalMembers: 350, totalHouseholds: 142,
    ageBuckets: { "0–5": 42, "6–12": 55, "13–17": 38, "18–25": 18, "26–35": 35, "36–45": 62, "46–55": 38, "56–65": 28, "66–75": 20, "76+": 14 },
    engagementRate: 82, percentWithChildren: 72, avgChildrenPerFamily: 3.4,
    programParticipation: { "Shabbat Services": 245, "Holiday Events": 285, "Family Programs": 118, "Adult Learning": 95, "Social / Community": 52, "Youth Programs": 78, "Volunteer / Tikkun Olam": 48 },
  },
  {
    id: "sin", name: "Temple Sinai", denomination: "Reform", sizeCategory: "Mid-size",
    totalMembers: 285, totalHouseholds: 142,
    ageBuckets: { "0–5": 15, "6–12": 22, "13–17": 18, "18–25": 10, "26–35": 22, "36–45": 48, "46–55": 45, "56–65": 42, "66–75": 38, "76+": 25 },
    engagementRate: 46, percentWithChildren: 40, avgChildrenPerFamily: 1.8,
    programParticipation: { "Shabbat Services": 72, "Holiday Events": 108, "Family Programs": 55, "Adult Learning": 42, "Social / Community": 48, "Youth Programs": 28, "Volunteer / Tikkun Olam": 25 },
  },
  {
    id: "trs", name: "Tremont Street Shul", denomination: "Orthodox", sizeCategory: "Small",
    totalMembers: 128, totalHouseholds: 55,
    ageBuckets: { "0–5": 15, "6–12": 18, "13–17": 12, "18–25": 8, "26–35": 15, "36–45": 22, "46–55": 15, "56–65": 10, "66–75": 8, "76+": 5 },
    engagementRate: 85, percentWithChildren: 65, avgChildrenPerFamily: 2.8,
    programParticipation: { "Shabbat Services": 92, "Holiday Events": 105, "Family Programs": 45, "Adult Learning": 48, "Social / Community": 22, "Youth Programs": 28, "Volunteer / Tikkun Olam": 18 },
  },
  {
    id: "kol", name: "Congregation Kol Nefesh", denomination: "Reconstructionist", sizeCategory: "Small",
    totalMembers: 110, totalHouseholds: 55,
    ageBuckets: { "0–5": 8, "6–12": 12, "13–17": 8, "18–25": 4, "26–35": 10, "36–45": 20, "46–55": 18, "56–65": 14, "66–75": 10, "76+": 6 },
    engagementRate: 68, percentWithChildren: 50, avgChildrenPerFamily: 1.7,
    programParticipation: { "Shabbat Services": 45, "Holiday Events": 62, "Family Programs": 32, "Adult Learning": 28, "Social / Community": 38, "Youth Programs": 15, "Volunteer / Tikkun Olam": 35 },
  },
];

export type ComparisonFilter = "all" | "denomination" | "size";

export interface AggregatedBenchmark {
  label: string;
  count: number; // number of synagogues in the comparison set
  avgMembers: number;
  avgHouseholds: number;
  avgEngagementRate: number;
  avgPercentWithChildren: number;
  avgChildrenPerFamily: number;
  ageBucketPcts: Record<string, number>; // bucket → avg % across synagogues
  programParticipationPcts: Record<string, number>; // program → avg % of members
}

/**
 * Aggregate benchmarks for a comparison set.
 * Returns averaged metrics across the matching synagogues (excluding the user's own).
 */
export function aggregateBenchmarks(
  synagogues: SynagogueBenchmark[],
  excludeId: string
): AggregatedBenchmark {
  const filtered = synagogues.filter((s) => s.id !== excludeId);
  if (filtered.length === 0) {
    return {
      label: "No comparison data",
      count: 0,
      avgMembers: 0,
      avgHouseholds: 0,
      avgEngagementRate: 0,
      avgPercentWithChildren: 0,
      avgChildrenPerFamily: 0,
      ageBucketPcts: {},
      programParticipationPcts: {},
    };
  }

  const n = filtered.length;
  const avgMembers = Math.round(filtered.reduce((s, x) => s + x.totalMembers, 0) / n);
  const avgHouseholds = Math.round(filtered.reduce((s, x) => s + x.totalHouseholds, 0) / n);
  const avgEngagementRate = Math.round(filtered.reduce((s, x) => s + x.engagementRate, 0) / n);
  const avgPercentWithChildren = Math.round(filtered.reduce((s, x) => s + x.percentWithChildren, 0) / n);
  const avgChildrenPerFamily = +(filtered.reduce((s, x) => s + x.avgChildrenPerFamily, 0) / n).toFixed(1);

  // Compute average age distribution as percentages
  const allBuckets = new Set<string>();
  filtered.forEach((s) => Object.keys(s.ageBuckets).forEach((b) => allBuckets.add(b)));

  const ageBucketPcts: Record<string, number> = {};
  for (const bucket of allBuckets) {
    const avgPct = filtered.reduce((sum, s) => {
      const total = Object.values(s.ageBuckets).reduce((a, b) => a + b, 0);
      const val = s.ageBuckets[bucket] || 0;
      return sum + (total > 0 ? (val / total) * 100 : 0);
    }, 0) / n;
    ageBucketPcts[bucket] = Math.round(avgPct);
  }

  // Compute average program participation as % of members
  const allPrograms = new Set<string>();
  filtered.forEach((s) => Object.keys(s.programParticipation).forEach((p) => allPrograms.add(p)));

  const programParticipationPcts: Record<string, number> = {};
  for (const prog of allPrograms) {
    const avgPct = filtered.reduce((sum, s) => {
      const val = s.programParticipation[prog] || 0;
      return sum + (s.totalMembers > 0 ? (val / s.totalMembers) * 100 : 0);
    }, 0) / n;
    programParticipationPcts[prog] = Math.round(avgPct);
  }

  return {
    label: `${n} synagogue${n === 1 ? "" : "s"}`,
    count: n,
    avgMembers,
    avgHouseholds,
    avgEngagementRate,
    avgPercentWithChildren,
    avgChildrenPerFamily,
    ageBucketPcts,
    programParticipationPcts,
  };
}
