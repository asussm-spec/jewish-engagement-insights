/**
 * Mock data for the Engagement Depth view (concept).
 *
 * Answers the question: "Of the people in each part of the JCC, who else are
 * they Jewishly?" — i.e. how deeply Jewish is each business unit. Frequency
 * (touches/yr) and Jewish depth are deliberately separate columns, because the
 * headline insight is that they diverge (the gym is high-frequency, low-depth).
 *
 * Figures are illustrative. Orgs referenced elsewhere in the app are real
 * Greater Boston institutions; these counts are not.
 */

export type DepthTier = "deep" | "medium" | "light";

/** Where a metric's data comes from — surfaced as a provenance tag in the UI. */
export type Provenance = "have" | "network" | "survey";

export interface BusinessUnit {
  key: string;
  /** Display name of the JCC business unit. */
  name: string;
  /** Small qualifier shown beneath the name, e.g. "members". */
  note?: string;
  /** Distinct people touching this unit in the past 12 months. */
  peoplePerYear: number;
  /** Average JCC touches per year for people in this unit. */
  touchesPerYear: number;
  /** % with a visible synagogue affiliation (via the cross-org network). */
  synagogueAffiliatedPct: number;
  /** % who are Combined Jewish Philanthropies (Federation) donors. */
  federationDonorPct: number;
  /** % with a child at another Jewish camp (null when not applicable). */
  otherJewishCampPct: number | null;
  /** Overall Jewish-engagement depth classification. */
  depth: DepthTier;
}

export interface ScopeSummary {
  people: number;
  households: number;
  avgTouches: number;
  /** % we can already see engaging Jewishly beyond the JCC. */
  visibleJewishTiePct: number;
}

export type PeopleScope = "everyone" | "members";

export interface EngagementDepthData {
  orgName: string;
  scope: Record<PeopleScope, ScopeSummary>;
  /** Business units, ordered by descending Jewish depth. */
  units: BusinessUnit[];
  /** Which unit key corresponds to the membership base (highlighted in Members scope). */
  memberUnitKey: string;
}

export const MOCK_ENGAGEMENT_DEPTH: EngagementDepthData = {
  orgName: "Greater Boston JCC",
  memberUnitKey: "fitness",
  scope: {
    everyone: {
      people: 23800,
      households: 11400,
      avgTouches: 4.2,
      visibleJewishTiePct: 38,
    },
    members: {
      people: 2050,
      households: 1150,
      avgTouches: 46,
      visibleJewishTiePct: 52,
    },
  },
  units: [
    {
      key: "elc",
      name: "Early Learning Center",
      peoplePerYear: 620,
      touchesPerYear: 210,
      synagogueAffiliatedPct: 71,
      federationDonorPct: 44,
      otherJewishCampPct: 28,
      depth: "deep",
    },
    {
      key: "day_camp",
      name: "Day camp",
      peoplePerYear: 1500,
      touchesPerYear: 34,
      synagogueAffiliatedPct: 58,
      federationDonorPct: 31,
      otherJewishCampPct: 40,
      depth: "deep",
    },
    {
      key: "youth_teen",
      name: "Youth & teen",
      peoplePerYear: 780,
      touchesPerYear: 22,
      synagogueAffiliatedPct: 55,
      federationDonorPct: 29,
      otherJewishCampPct: 44,
      depth: "medium",
    },
    {
      key: "adult_senior",
      name: "Adult & senior",
      peoplePerYear: 3200,
      touchesPerYear: 12,
      synagogueAffiliatedPct: 47,
      federationDonorPct: 35,
      otherJewishCampPct: null,
      depth: "medium",
    },
    {
      key: "pj_library",
      name: "PJ Library families",
      note: "via CJP",
      peoplePerYear: 4100,
      touchesPerYear: 9,
      synagogueAffiliatedPct: 49,
      federationDonorPct: 27,
      otherJewishCampPct: 18,
      depth: "medium",
    },
    {
      key: "holiday",
      name: "Holiday & community",
      peoplePerYear: 6800,
      touchesPerYear: 3.1,
      synagogueAffiliatedPct: 52,
      federationDonorPct: 30,
      otherJewishCampPct: 21,
      depth: "medium",
    },
    {
      key: "aquatics",
      name: "Aquatics / swim",
      peoplePerYear: 1600,
      touchesPerYear: 18,
      synagogueAffiliatedPct: 39,
      federationDonorPct: 19,
      otherJewishCampPct: 16,
      depth: "light",
    },
    {
      key: "fitness",
      name: "Fitness & wellness",
      note: "members",
      peoplePerYear: 2050,
      touchesPerYear: 46,
      synagogueAffiliatedPct: 34,
      federationDonorPct: 22,
      otherJewishCampPct: 15,
      depth: "light",
    },
    {
      key: "arts",
      name: "Arts & culture",
      peoplePerYear: 9400,
      touchesPerYear: 2.4,
      synagogueAffiliatedPct: 41,
      federationDonorPct: 24,
      otherJewishCampPct: 17,
      depth: "light",
    },
  ],
};
