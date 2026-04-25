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
  /** Label for one person in this segment, e.g. "Members", "Non-members", "People". Defaults to "Members". */
  entityLabel?: string;
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
  entityLabel: "Members",
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

// ────────────────────────────────────────────────────────────
// Non-member segment — people who attended ≥1 event but have
// never been on a membership roster. Skews younger, lighter
// data coverage, no membership-type breakdown, no "Members Only"
// engagement tier (everyone here has attended something).
// ────────────────────────────────────────────────────────────
export const TEMPLE_BETH_SHALOM_NON_MEMBERS: PopulationSummary = {
  orgName: "Temple Beth Shalom",
  uploadName: "Event attendees (non-members)",
  uploadDate: "2026-03-15",
  entityLabel: "Non-members",
  totalMembers: 432,
  totalHouseholds: 0, // household structure unknown for event-only attendees

  membershipTypes: [], // not applicable

  ageBuckets: [
    { name: "0–5", value: 18 },
    { name: "6–12", value: 24 },
    { name: "13–17", value: 16 },
    { name: "18–25", value: 47 },
    { name: "26–35", value: 96 },
    { name: "36–45", value: 84 },
    { name: "46–55", value: 58 },
    { name: "56–65", value: 41 },
    { name: "66–75", value: 28 },
    { name: "76+", value: 20 },
  ],

  programParticipation: [
    { name: "Holiday Events", value: 218 },
    { name: "Social / Community", value: 142 },
    { name: "Adult Learning", value: 76 },
    { name: "Family Programs", value: 61 },
    { name: "Shabbat Services", value: 54 },
    { name: "Volunteer / Tikkun Olam", value: 38 },
    { name: "Youth Programs", value: 22 },
  ],

  joinYearBuckets: [
    { name: "Before 2010", value: 8 },
    { name: "2010–2014", value: 14 },
    { name: "2015–2019", value: 31 },
    { name: "2020–2022", value: 78 },
    { name: "2023–2024", value: 142 },
    { name: "2025–2026", value: 159 },
  ],

  zipCodes: [
    { name: "02139 (Cambridge)", value: 52 },
    { name: "02144 (Somerville)", value: 47 },
    { name: "02138 (Cambridge)", value: 38 },
    { name: "02143 (Somerville)", value: 32 },
    { name: "02134 (Allston)", value: 28 },
    { name: "02140 (Cambridge)", value: 24 },
    { name: "02135 (Brighton)", value: 22 },
    { name: "02148 (Malden)", value: 14 },
    { name: "02155 (Medford)", value: 11 },
    { name: "Other", value: 164 },
  ],

  familyStats: {
    percentWithChildren: 28,
    avgChildrenPerFamily: 1.4,
    totalChildren: 58,
    childAgeBuckets: [
      { name: "0–2 (infant)", value: 9 },
      { name: "3–5 (preschool)", value: 12 },
      { name: "6–9 (elementary)", value: 16 },
      { name: "10–12 (preteen)", value: 11 },
      { name: "13–17 (teen)", value: 10 },
    ],
  },

  engagementTiers: [
    { name: "Highly Engaged", value: 28, description: "5+ events/year" },
    { name: "Regularly Engaged", value: 89, description: "2–4 events/year" },
    { name: "Occasionally Engaged", value: 315, description: "1 event/year" },
  ],

  genderSplit: [
    { name: "Female", value: 158 },
    { name: "Male", value: 132 },
    { name: "Non-binary", value: 11 },
  ],

  dataCompleteness: [
    { field: "Name", coverage: 0.94 },
    { field: "Email", coverage: 1.0 },
    { field: "Date of birth", coverage: 0.41 },
    { field: "Address / Zip", coverage: 0.62 },
    { field: "Program data", coverage: 1.0 },
    { field: "Membership type", coverage: 0.0 },
    { field: "Join date", coverage: 0.0 },
    { field: "Gender", coverage: 0.23 },
    { field: "Children info", coverage: 0.18 },
    { field: "Phone", coverage: 0.14 },
  ],

  comparisonPeriods: [
    {
      key: "3mo",
      label: "3 months",
      snapshotDate: "2025-12-10",
      changes: {
        totalMembers: { delta: 47, previous: 385 },
        "26–35": { delta: 18, previous: 78 },
        "18–25": { delta: 9, previous: 38 },
        "Holiday Events": { delta: 32, previous: 186 },
        "Social / Community": { delta: 21, previous: 121 },
        "Highly Engaged": { delta: 6, previous: 22 },
        "Occasionally Engaged": { delta: 38, previous: 277 },
      },
    },
    {
      key: "6mo",
      label: "6 months",
      snapshotDate: "2025-09-08",
      changes: {
        totalMembers: { delta: 96, previous: 336 },
        "26–35": { delta: 31, previous: 65 },
        "18–25": { delta: 16, previous: 31 },
        "Holiday Events": { delta: 64, previous: 154 },
        "Social / Community": { delta: 42, previous: 100 },
        "Highly Engaged": { delta: 11, previous: 17 },
        "Regularly Engaged": { delta: 24, previous: 65 },
      },
    },
    {
      key: "12mo",
      label: "12 months",
      snapshotDate: "2025-03-12",
      changes: {
        totalMembers: { delta: 168, previous: 264 },
        "26–35": { delta: 52, previous: 44 },
        "18–25": { delta: 28, previous: 19 },
        "Holiday Events": { delta: 102, previous: 116 },
        "Social / Community": { delta: 71, previous: 71 },
        "Adult Learning": { delta: 38, previous: 38 },
        "Highly Engaged": { delta: 16, previous: 12 },
        "Regularly Engaged": { delta: 41, previous: 48 },
        "Occasionally Engaged": { delta: 111, previous: 204 },
      },
    },
  ],
};

// ────────────────────────────────────────────────────────────
// All people — members ∪ non-members (deduplicated by person).
// Numbers approximate the union of the two segments above.
// ────────────────────────────────────────────────────────────
export const TEMPLE_BETH_SHALOM_ALL_PEOPLE: PopulationSummary = {
  orgName: "Temple Beth Shalom",
  uploadName: "All people the org interacts with",
  uploadDate: "2026-03-15",
  entityLabel: "People",
  totalMembers: 1279,
  totalHouseholds: 418,

  membershipTypes: [
    { name: "Family", value: 262 },
    { name: "Individual", value: 89 },
    { name: "Senior/Retired", value: 42 },
    { name: "Young Professional", value: 25 },
    { name: "Non-member", value: 432 },
  ],

  ageBuckets: [
    { name: "0–5", value: 82 },
    { name: "6–12", value: 115 },
    { name: "13–17", value: 74 },
    { name: "18–25", value: 79 },
    { name: "26–35", value: 163 },
    { name: "36–45", value: 232 },
    { name: "46–55", value: 190 },
    { name: "56–65", value: 149 },
    { name: "66–75", value: 117 },
    { name: "76+", value: 78 },
  ],

  programParticipation: [
    { name: "Holiday Events", value: 465 },
    { name: "Shabbat Services", value: 240 },
    { name: "Family Programs", value: 225 },
    { name: "Social / Community", value: 254 },
    { name: "Adult Learning", value: 169 },
    { name: "Volunteer / Tikkun Olam", value: 103 },
    { name: "Youth Programs", value: 100 },
  ],

  joinYearBuckets: [
    { name: "Before 2010", value: 95 },
    { name: "2010–2014", value: 66 },
    { name: "2015–2019", value: 125 },
    { name: "2020–2022", value: 186 },
    { name: "2023–2024", value: 198 },
    { name: "2025–2026", value: 180 },
  ],

  zipCodes: [
    { name: "02138 (Cambridge)", value: 112 },
    { name: "02139 (Cambridge)", value: 114 },
    { name: "02144 (Somerville)", value: 85 },
    { name: "02140 (Cambridge)", value: 69 },
    { name: "02134 (Allston)", value: 59 },
    { name: "02143 (Somerville)", value: 49 },
    { name: "02135 (Brighton)", value: 50 },
    { name: "02148 (Malden)", value: 36 },
    { name: "02155 (Medford)", value: 30 },
    { name: "Other", value: 246 },
  ],

  familyStats: {
    percentWithChildren: 44,
    avgChildrenPerFamily: 1.9,
    totalChildren: 345,
    childAgeBuckets: [
      { name: "0–2 (infant)", value: 40 },
      { name: "3–5 (preschool)", value: 60 },
      { name: "6–9 (elementary)", value: 88 },
      { name: "10–12 (preteen)", value: 67 },
      { name: "13–17 (teen)", value: 90 },
    ],
  },

  engagementTiers: [
    { name: "Highly Engaged", value: 117, description: "5+ events/year" },
    { name: "Regularly Engaged", value: 245, description: "2–4 events/year" },
    { name: "Occasionally Engaged", value: 519, description: "1 event/year" },
    { name: "Members Only", value: 398, description: "Member, no events attended" },
  ],

  genderSplit: [
    { name: "Female", value: 610 },
    { name: "Male", value: 513 },
    { name: "Non-binary", value: 25 },
  ],

  dataCompleteness: [
    { field: "Name", coverage: 0.98 },
    { field: "Email", coverage: 0.98 },
    { field: "Date of birth", coverage: 0.68 },
    { field: "Address / Zip", coverage: 0.7 },
    { field: "Program data", coverage: 0.79 },
    { field: "Membership type", coverage: 0.66 },
    { field: "Join date", coverage: 0.49 },
    { field: "Gender", coverage: 0.37 },
    { field: "Children info", coverage: 0.31 },
    { field: "Phone", coverage: 0.25 },
  ],

  comparisonPeriods: [
    {
      key: "3mo",
      label: "3 months",
      snapshotDate: "2025-12-10",
      changes: {
        totalMembers: { delta: 70, previous: 1209 },
        totalHouseholds: { delta: 12, previous: 406 },
        totalChildren: { delta: 12, previous: 333 },
        "26–35": { delta: 29, previous: 134 },
        "36–45": { delta: 8, previous: 224 },
        "Holiday Events": { delta: 41, previous: 424 },
        "Adult Learning": { delta: 22, previous: 147 },
        "Highly Engaged": { delta: 18, previous: 99 },
        "Regularly Engaged": { delta: 14, previous: 231 },
      },
    },
    {
      key: "6mo",
      label: "6 months",
      snapshotDate: "2025-09-08",
      changes: {
        totalMembers: { delta: 137, previous: 1142 },
        totalHouseholds: { delta: 22, previous: 396 },
        "26–35": { delta: 49, previous: 114 },
        "Holiday Events": { delta: 84, previous: 381 },
        "Adult Learning": { delta: 38, previous: 131 },
        "Highly Engaged": { delta: 33, previous: 84 },
      },
    },
    {
      key: "12mo",
      label: "12 months",
      snapshotDate: "2025-03-12",
      changes: {
        totalMembers: { delta: 236, previous: 1043 },
        totalHouseholds: { delta: 38, previous: 380 },
        "26–35": { delta: 76, previous: 87 },
        "Holiday Events": { delta: 152, previous: 313 },
        "Adult Learning": { delta: 79, previous: 90 },
        "Highly Engaged": { delta: 50, previous: 67 },
      },
    },
  ],
};

export type PopulationSegment = "all" | "members" | "non_members";

export const TEMPLE_BETH_SHALOM_SEGMENTS: Record<PopulationSegment, PopulationSummary> = {
  all: TEMPLE_BETH_SHALOM_ALL_PEOPLE,
  members: TEMPLE_BETH_SHALOM_POPULATION,
  non_members: TEMPLE_BETH_SHALOM_NON_MEMBERS,
};
