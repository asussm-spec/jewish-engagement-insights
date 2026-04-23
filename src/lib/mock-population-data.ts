/**
 * Mock population data for Temple Beth Shalom.
 * Realistic demographics for a mid-size Reform synagogue (~420 member households).
 *
 * `comparisonPeriods` contains delta data for multiple lookback windows.
 * Each period maps item names to their delta vs. that snapshot.
 */

export interface QuarterlyChange {
  delta: number;
  previous: number;
}

export interface ComparisonPeriod {
  key: string;
  label: string;         // e.g. "3 months"
  snapshotDate: string;  // ISO date of the comparison snapshot
  changes: Record<string, QuarterlyChange>;
}

export interface PopulationSummary {
  orgName: string;
  uploadName: string;
  uploadDate: string;
  totalMembers: number;
  totalHouseholds: number;
  membershipTypes: { name: string; value: number }[];
  ageBuckets: { name: string; value: number }[];
  programParticipation: { name: string; value: number }[];
  joinYearBuckets: { name: string; value: number }[];
  zipCodes: { name: string; value: number }[];
  familyStats: {
    percentWithChildren: number;
    avgChildrenPerFamily: number;
    totalChildren: number;
    childAgeBuckets: { name: string; value: number }[];
  };
  engagementTiers: { name: string; value: number; description: string }[];
  genderSplit: { name: string; value: number }[];
  dataCompleteness: { field: string; coverage: number }[];
  comparisonPeriods: ComparisonPeriod[];
}

export const TEMPLE_BETH_SHALOM_POPULATION: PopulationSummary = {
  orgName: "Temple Beth Shalom",
  uploadName: "2025–26 Membership List",
  uploadDate: "2026-03-15",
  totalMembers: 847,
  totalHouseholds: 418,

  membershipTypes: [
    { name: "Family", value: 262 },
    { name: "Individual", value: 89 },
    { name: "Senior/Retired", value: 42 },
    { name: "Young Professional", value: 25 },
  ],

  ageBuckets: [
    { name: "0–5", value: 64 },
    { name: "6–12", value: 91 },
    { name: "13–17", value: 58 },
    { name: "18–25", value: 32 },
    { name: "26–35", value: 67 },
    { name: "36–45", value: 148 },
    { name: "46–55", value: 132 },
    { name: "56–65", value: 108 },
    { name: "66–75", value: 89 },
    { name: "76+", value: 58 },
  ],

  programParticipation: [
    { name: "Shabbat Services", value: 186 },
    { name: "Holiday Events", value: 247 },
    { name: "Family Programs", value: 164 },
    { name: "Adult Learning", value: 93 },
    { name: "Social / Community", value: 112 },
    { name: "Youth Programs", value: 78 },
    { name: "Volunteer / Tikkun Olam", value: 65 },
  ],

  joinYearBuckets: [
    { name: "Before 2010", value: 87 },
    { name: "2010–2014", value: 52 },
    { name: "2015–2019", value: 94 },
    { name: "2020–2022", value: 108 },
    { name: "2023–2024", value: 56 },
    { name: "2025–2026", value: 21 },
  ],

  zipCodes: [
    { name: "02138 (Cambridge)", value: 74 },
    { name: "02139 (Cambridge)", value: 62 },
    { name: "02140 (Cambridge)", value: 45 },
    { name: "02144 (Somerville)", value: 38 },
    { name: "02134 (Allston)", value: 31 },
    { name: "02135 (Brighton)", value: 28 },
    { name: "02148 (Malden)", value: 22 },
    { name: "02155 (Medford)", value: 19 },
    { name: "02143 (Somerville)", value: 17 },
    { name: "Other", value: 82 },
  ],

  familyStats: {
    percentWithChildren: 52,
    avgChildrenPerFamily: 2.1,
    totalChildren: 287,
    childAgeBuckets: [
      { name: "0–2 (infant)", value: 31 },
      { name: "3–5 (preschool)", value: 48 },
      { name: "6–9 (elementary)", value: 72 },
      { name: "10–12 (preteen)", value: 56 },
      { name: "13–17 (teen)", value: 80 },
    ],
  },

  engagementTiers: [
    { name: "Highly Engaged", value: 89, description: "5+ events/year" },
    { name: "Regularly Engaged", value: 156, description: "2–4 events/year" },
    { name: "Occasionally Engaged", value: 204, description: "1 event/year" },
    { name: "Members Only", value: 398, description: "No events attended" },
  ],

  genderSplit: [
    { name: "Female", value: 452 },
    { name: "Male", value: 381 },
    { name: "Non-binary", value: 14 },
  ],

  dataCompleteness: [
    { field: "Name", coverage: 1.0 },
    { field: "Email", coverage: 0.97 },
    { field: "Date of birth", coverage: 0.82 },
    { field: "Address / Zip", coverage: 0.74 },
    { field: "Program data", coverage: 0.68 },
    { field: "Membership type", coverage: 0.59 },
    { field: "Join date", coverage: 0.49 },
    { field: "Gender", coverage: 0.44 },
    { field: "Children info", coverage: 0.38 },
    { field: "Phone", coverage: 0.31 },
  ],

  comparisonPeriods: [
    // ── 3 months ago (Dec 2025) ─────────────────────────
    {
      key: "3mo",
      label: "3 months",
      snapshotDate: "2025-12-10",
      changes: {
        totalMembers:   { delta: 23,  previous: 824 },
        totalHouseholds: { delta: 12,  previous: 406 },
        totalChildren:  { delta: 8,   previous: 279 },
        "26–35": { delta: 11, previous: 56 },
        "36–45": { delta: 8,  previous: 140 },
        "0–5":   { delta: 6,  previous: 58 },
        "18–25": { delta: -5, previous: 37 },
        "76+":   { delta: -4, previous: 62 },
        "Family":             { delta: 9,  previous: 253 },
        "Young Professional": { delta: 4,  previous: 21 },
        "Senior/Retired":     { delta: -3, previous: 45 },
        "02144 (Somerville)": { delta: 7,  previous: 31 },
        "02143 (Somerville)": { delta: 4,  previous: 13 },
        "02135 (Brighton)":   { delta: -5, previous: 33 },
        "02148 (Malden)":     { delta: -3, previous: 25 },
        "Adult Learning":          { delta: 18, previous: 75 },
        "Family Programs":         { delta: 12, previous: 152 },
        "Shabbat Services":        { delta: 8,  previous: 178 },
        "Volunteer / Tikkun Olam": { delta: -6, previous: 71 },
        "Youth Programs":          { delta: -8, previous: 86 },
        "Highly Engaged":    { delta: 12,  previous: 77 },
        "Regularly Engaged": { delta: 8,   previous: 148 },
        "Members Only":      { delta: -15, previous: 413 },
        "0–2 (infant)":    { delta: 5, previous: 26 },
        "3–5 (preschool)": { delta: 4, previous: 44 },
        "13–17 (teen)":    { delta: -3, previous: 83 },
      },
    },

    // ── 6 months ago (Sep 2025) ─────────────────────────
    {
      key: "6mo",
      label: "6 months",
      snapshotDate: "2025-09-08",
      changes: {
        totalMembers:    { delta: 41,  previous: 806 },
        totalHouseholds: { delta: 22,  previous: 396 },
        totalChildren:   { delta: 15,  previous: 272 },
        "0–5":   { delta: 11, previous: 53 },
        "6–12":  { delta: 7,  previous: 84 },
        "26–35": { delta: 18, previous: 49 },
        "36–45": { delta: 14, previous: 134 },
        "18–25": { delta: -8, previous: 40 },
        "76+":   { delta: -7, previous: 65 },
        "66–75": { delta: -4, previous: 93 },
        "Family":             { delta: 16, previous: 246 },
        "Young Professional": { delta: 7,  previous: 18 },
        "Individual":         { delta: 3,  previous: 86 },
        "Senior/Retired":     { delta: -6, previous: 48 },
        "02144 (Somerville)": { delta: 12, previous: 26 },
        "02143 (Somerville)": { delta: 6,  previous: 11 },
        "02138 (Cambridge)":  { delta: 5,  previous: 69 },
        "02135 (Brighton)":   { delta: -8, previous: 36 },
        "02148 (Malden)":     { delta: -5, previous: 27 },
        "02155 (Medford)":    { delta: -3, previous: 22 },
        "Adult Learning":          { delta: 28, previous: 65 },
        "Family Programs":         { delta: 22, previous: 142 },
        "Shabbat Services":        { delta: 14, previous: 172 },
        "Social / Community":      { delta: 8,  previous: 104 },
        "Holiday Events":          { delta: 5,  previous: 242 },
        "Youth Programs":          { delta: -12, previous: 90 },
        "Volunteer / Tikkun Olam": { delta: -9,  previous: 74 },
        "Highly Engaged":      { delta: 22,  previous: 67 },
        "Regularly Engaged":   { delta: 16,  previous: 140 },
        "Occasionally Engaged": { delta: 8,  previous: 196 },
        "Members Only":        { delta: -32, previous: 430 },
        "0–2 (infant)":    { delta: 8,  previous: 23 },
        "3–5 (preschool)": { delta: 7,  previous: 41 },
        "6–9 (elementary)": { delta: 4,  previous: 68 },
        "13–17 (teen)":    { delta: -5, previous: 85 },
      },
    },

    // ── 12 months ago (Mar 2025) ────────────────────────
    {
      key: "12mo",
      label: "12 months",
      snapshotDate: "2025-03-12",
      changes: {
        totalMembers:    { delta: 68,  previous: 779 },
        totalHouseholds: { delta: 38,  previous: 380 },
        totalChildren:   { delta: 29,  previous: 258 },
        "0–5":   { delta: 18, previous: 46 },
        "6–12":  { delta: 12, previous: 79 },
        "26–35": { delta: 24, previous: 43 },
        "36–45": { delta: 22, previous: 126 },
        "46–55": { delta: 6,  previous: 126 },
        "18–25": { delta: -11, previous: 43 },
        "76+":   { delta: -10, previous: 68 },
        "66–75": { delta: -8,  previous: 97 },
        "56–65": { delta: -5,  previous: 113 },
        "Family":             { delta: 28, previous: 234 },
        "Young Professional": { delta: 12, previous: 13 },
        "Individual":         { delta: 5,  previous: 84 },
        "Senior/Retired":     { delta: -9, previous: 51 },
        "02144 (Somerville)": { delta: 16, previous: 22 },
        "02143 (Somerville)": { delta: 9,  previous: 8 },
        "02138 (Cambridge)":  { delta: 8,  previous: 66 },
        "02139 (Cambridge)":  { delta: 6,  previous: 56 },
        "02140 (Cambridge)":  { delta: 4,  previous: 41 },
        "02135 (Brighton)":   { delta: -12, previous: 40 },
        "02148 (Malden)":     { delta: -8,  previous: 30 },
        "02155 (Medford)":    { delta: -5,  previous: 24 },
        "Adult Learning":          { delta: 41, previous: 52 },
        "Family Programs":         { delta: 38, previous: 126 },
        "Shabbat Services":        { delta: 22, previous: 164 },
        "Social / Community":      { delta: 15, previous: 97 },
        "Holiday Events":          { delta: 12, previous: 235 },
        "Youth Programs":          { delta: -18, previous: 96 },
        "Volunteer / Tikkun Olam": { delta: -14, previous: 79 },
        "Highly Engaged":      { delta: 34,  previous: 55 },
        "Regularly Engaged":   { delta: 28,  previous: 128 },
        "Occasionally Engaged": { delta: 14, previous: 190 },
        "Members Only":        { delta: -52, previous: 450 },
        "0–2 (infant)":     { delta: 12, previous: 19 },
        "3–5 (preschool)":  { delta: 10, previous: 38 },
        "6–9 (elementary)": { delta: 8,  previous: 64 },
        "10–12 (preteen)":  { delta: 4,  previous: 52 },
        "13–17 (teen)":     { delta: -6, previous: 86 },
      },
    },
  ],
};
