/**
 * Mock cross-organizational breakdown for the population page.
 *
 * For a given org's population, this captures what fraction of their
 * members also engage with other orgs in the community, broken out by
 * org type (synagogues, day schools, camps).
 *
 * Each breakdown has a high-level grouping (denomination for synagogues,
 * grade range for day schools, category for camps) and a ranked list of
 * the specific orgs members belong to.
 *
 * Numbers are demo data for Temple Beth Shalom (the existing demo org,
 * 847 total members). They reflect what a synagogue's cross-org footprint
 * might look like — small secondary-synagogue overlap, meaningful
 * day-school and camp footprint via member families with kids.
 */

export interface OrgTypeGrouping {
  label: string;
  count: number; // members of yours falling into this grouping
  pct: number; // % of the panel total (not of total roster)
}

export interface OrgTypeEntry {
  name: string;
  count: number; // members of yours also at this org
  tag?: string; // small secondary label, e.g. denomination or grade range
}

export interface OrgTypeBreakdown {
  type: "synagogues" | "day_schools" | "camps";
  /** Heading shown at the top of the panel */
  headingNoun: string; // "synagogue" | "day school" | "Jewish camp"
  /** Total of YOUR members with at least one affiliation of this type */
  totalMembers: number;
  /** Your full member roster (denominator) */
  rosterTotal: number;
  /** Top-of-panel grouping (denomination / grade range / category) */
  groupingLabel: string;
  groupings: OrgTypeGrouping[];
  /** Ranked list of specific orgs */
  orgs: OrgTypeEntry[];
}

const TBS_ROSTER = 847;

export const TBS_SYNAGOGUE_BREAKDOWN: OrgTypeBreakdown = {
  type: "synagogues",
  headingNoun: "synagogue",
  totalMembers: 62,
  rosterTotal: TBS_ROSTER,
  groupingLabel: "By denomination",
  groupings: [
    { label: "Reform", count: 24, pct: 39 },
    { label: "Conservative", count: 22, pct: 36 },
    { label: "Orthodox", count: 11, pct: 18 },
    { label: "Reconstructionist", count: 5, pct: 8 },
  ],
  orgs: [
    { name: "Temple Israel", count: 14, tag: "Reform" },
    { name: "Temple Emanu-El", count: 11, tag: "Reform" },
    { name: "Congregation B'nai Torah", count: 8, tag: "Conservative" },
    { name: "Young Israel of Sharon", count: 7, tag: "Orthodox" },
    { name: "Temple Beth El", count: 6, tag: "Reform" },
    { name: "Tremont Street Shul", count: 5, tag: "Orthodox" },
    { name: "Dorshei Tzedek", count: 5, tag: "Reconstructionist" },
    { name: "Temple Sinai", count: 3, tag: "Reform" },
    { name: "Temple Shalom Medford", count: 3, tag: "Reform" },
  ],
};

export const TBS_DAY_SCHOOL_BREAKDOWN: OrgTypeBreakdown = {
  type: "day_schools",
  headingNoun: "day school",
  totalMembers: 142,
  rosterTotal: TBS_ROSTER,
  groupingLabel: "By grade range",
  groupings: [
    { label: "K–8", count: 74, pct: 52 },
    { label: "K–12", count: 44, pct: 31 },
    { label: "High School", count: 24, pct: 17 },
  ],
  orgs: [
    { name: "Solomon Schechter Day School", count: 48, tag: "K–8" },
    { name: "Rashi School", count: 39, tag: "K–8" },
    { name: "Maimonides School", count: 28, tag: "K–12" },
    { name: "Gann Academy", count: 18, tag: "High School" },
    { name: "JCDS Boston", count: 9, tag: "K–8" },
  ],
};

export const TBS_CAMP_BREAKDOWN: OrgTypeBreakdown = {
  type: "camps",
  headingNoun: "Jewish camp",
  totalMembers: 184,
  rosterTotal: TBS_ROSTER,
  groupingLabel: "By category",
  groupings: [
    { label: "Denominational overnight", count: 96, pct: 52 },
    { label: "Independent overnight", count: 52, pct: 28 },
    { label: "Specialty", count: 36, pct: 20 },
  ],
  orgs: [
    { name: "Camp Ramah New England", count: 42, tag: "Conservative" },
    { name: "URJ Eisner Camp", count: 31, tag: "Reform" },
    { name: "Camp Yavneh", count: 28, tag: "Pluralistic" },
    { name: "Camp Tevya", count: 22, tag: "Independent" },
    { name: "Camp Pembroke", count: 18, tag: "Independent" },
    { name: "Camp Tel Noar", count: 16, tag: "Independent" },
    { name: "Camp JRF", count: 12, tag: "Reconstructionist" },
    { name: "Capital Camps", count: 9, tag: "Specialty" },
    { name: "Camp Ramah in the Berkshires", count: 6, tag: "Conservative" },
  ],
};

/**
 * Headline numbers for the population page top KPIs.
 * Cross-org focused — these are the things only this product can show.
 */
export interface PopulationHeadline {
  totalMembers: number;
  membersAt2PlusOrgs: number;
  membersExclusive: number;
  newCrossOrgJoinsLastQuarter: number;
}

export const TBS_HEADLINE: PopulationHeadline = {
  totalMembers: TBS_ROSTER,
  membersAt2PlusOrgs: 318, // sum of members with any cross-org affiliation, deduped
  membersExclusive: TBS_ROSTER - 318,
  newCrossOrgJoinsLastQuarter: 24,
};
