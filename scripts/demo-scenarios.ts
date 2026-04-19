/**
 * Demo event scenario library.
 *
 * Each scenario describes a realistic JCC event and how to build an attendee
 * CSV for it — which existing members to pick, how many new people to invent,
 * and which columns to include. The goal is for each scenario to tell a
 * *distinct* story in the dashboard (different demographic skew, first-timer
 * ratio, or column mix) so the program manager can demo several flavors of
 * event analysis.
 *
 * Add a new scenario by appending to the `scenarios` array below.
 */

// ─── Shared helpers ─────────────────────────────────────────────
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}
export function randomPhone(): string {
  return `(617) ${randomInt(200, 999)}-${String(randomInt(0, 9999)).padStart(4, "0")}`;
}

// ─── Shared name + zip pools ────────────────────────────────────
const firstNamesNew = [
  "Jennifer", "Brian", "Ashley", "Matthew", "Emily", "Ryan", "Rebecca",
  "Kevin", "Lauren", "Jacob", "Rachel", "Adam", "Melissa", "Joshua",
  "Megan", "Nathan", "Katherine", "Daniel", "Nicole", "Scott",
];
const firstNamesSenior = [
  "Rosalie", "Arthur", "Bernice", "Harold", "Sylvia", "Stanley", "Miriam",
  "Morris", "Selma", "Sheldon", "Phyllis", "Harvey", "Eleanor", "Murray",
  "Shirley", "Seymour", "Estelle", "Saul", "Beatrice", "Bernard",
];
const firstNamesTeen = [
  "Noa", "Eli", "Maya", "Ari", "Talia", "Jonah", "Zoe", "Asher",
  "Ruby", "Levi", "Hannah", "Ben", "Ella", "Caleb", "Olive", "Ezra",
  "Shira", "Nathan", "Ilana", "Micah",
];
const lastNamesNew = [
  "Weinstein-Chen", "Patel-Cohen", "O'Brien-Levy", "Kim-Goldberg",
  "Nguyen-Stern", "Rossi-Kaplan", "Garcia-Friedman", "Thompson-Adler",
  "Sullivan-Rubin", "Martinez-Klein", "Diaz-Goldstein", "Park-Schwartz",
];
const lastNamesClassic = [
  "Cohen", "Levy", "Goldstein", "Shapiro", "Friedman", "Katz", "Rosen",
  "Schwartz", "Klein", "Weiss", "Stern", "Berger", "Goldman", "Silverman",
  "Greenberg", "Kaplan", "Epstein", "Bloom", "Stein", "Meyer",
];
const kidNames = [
  "Asher", "Eliana", "Noa", "Ezra", "Talia", "Levi", "Maya", "Jonah",
  "Shira", "Ari", "Ruby", "Sam", "Zoe", "Leo", "Olive", "Ben",
];
const zips = [
  "02445", "02446", "02458", "02459", "02462", "02464", "02468", "02135",
  "02138", "02139", "02140", "02481",
];

// ─── Person types ───────────────────────────────────────────────
export type Identity = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};
export type Profile = {
  id: string;
  date_of_birth: string | null;
  has_children: boolean | null;
  attributes: Record<string, string> | null;
};

export type Scenario = {
  id: string;
  title: string;
  eventName: string;
  eventType:
    | "holiday"
    | "shabbat"
    | "educational"
    | "social"
    | "fundraiser"
    | "family"
    | "youth"
    | "cultural"
    | "worship"
    | "volunteer"
    | "health_wellness"
    | "arts_culture"
    | "community_social"
    | "youth_family"
    | "learning_education"
    | "holiday_calendar"
    | "institutional";
  description: string;
  existingCount: number;
  newCount: number;
  /**
   * Narrow the candidate pool of existing members before random sampling.
   * Useful for picking only parents, only seniors, etc.
   */
  audienceFilter: (p: Profile) => boolean;
  /** Build a CSV row from an existing member. */
  rowFromExisting: (ident: Identity, prof: Profile) => Record<string, string>;
  /** Invent a new-attendee row. */
  rowFromNew: () => Record<string, string>;
};

// ─── Helper: age from DOB ───────────────────────────────────────
function ageFrom(dob: string | null): number {
  if (!dob) return 40;
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (365.25 * 86_400_000)
  );
}

// ─── Helper: invent a new-person row (common fields) ────────────
function makeNewRow(opts: {
  firstNames: string[];
  lastNames: string[];
  ageRange: [number, number];
}): {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  zip: string;
} {
  const firstName = pick(opts.firstNames);
  const lastName = pick(opts.lastNames);
  const slug = lastName.toLowerCase().replace(/[^a-z]/g, "");
  const email = `${firstName.toLowerCase()}.${slug}${randomInt(100, 999)}@example.com`;
  const currentYear = new Date().getFullYear();
  const age = randomInt(opts.ageRange[0], opts.ageRange[1]);
  const dob = `${currentYear - age}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`;
  return { firstName, lastName, email, dob, zip: pick(zips) };
}

// ─── Scenarios ──────────────────────────────────────────────────

// Scenario 1 — Young family event
const springFamily: Scenario = {
  id: "spring-family-festival",
  title: "Spring Family Festival",
  eventName: "Spring Family Festival",
  eventType: "youth_family",
  description:
    "Sunday-morning family festival: music, crafts, playground open house, and bagels. Young-family skew with a meaningful first-timer bump.",
  existingCount: 45,
  newCount: 22,
  audienceFilter: (p) => Boolean(p.has_children),
  rowFromExisting: (id, p) => {
    const a = p.attributes ?? {};
    return {
      "First Name": id.first_name ?? "",
      "Last Name": id.last_name ?? "",
      "Email Address": id.email,
      "Phone": randomPhone(),
      "Adult DOB": formatDate(p.date_of_birth ?? ""),
      "ZIP": a.zip_code ?? pick(zips),
      "Membership Type": "Family",
      "Child 1 Name": a.child_1_name ?? pick(kidNames),
      "Child 1 DOB": a.child_1_dob ? formatDate(a.child_1_dob) : "",
      "Child 2 Name": a.child_2_name ?? "",
      "Child 2 DOB": a.child_2_dob ? formatDate(a.child_2_dob) : "",
      "Dietary Notes": pick(["", "", "", "Vegetarian", "Nut allergy", "Gluten-free", "Dairy-free"]),
      "Registration Channel": pick(["Online RSVP", "Online RSVP", "Walk-in", "Phone"]),
    };
  },
  rowFromNew: () => {
    const n = makeNewRow({
      firstNames: firstNamesNew,
      lastNames: lastNamesNew,
      ageRange: [30, 44],
    });
    const currentYear = new Date().getFullYear();
    const kid1Age = randomInt(2, 9);
    const hasKid2 = Math.random() < 0.55;
    return {
      "First Name": n.firstName,
      "Last Name": n.lastName,
      "Email Address": n.email,
      "Phone": randomPhone(),
      "Adult DOB": formatDate(n.dob),
      "ZIP": n.zip,
      "Membership Type": pick(["Non-Member", "Non-Member", "Day Pass"]),
      "Child 1 Name": pick(kidNames),
      "Child 1 DOB": formatDate(`${currentYear - kid1Age}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`),
      "Child 2 Name": hasKid2 ? pick(kidNames) : "",
      "Child 2 DOB": hasKid2
        ? formatDate(`${currentYear - randomInt(1, 7)}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`)
        : "",
      "Dietary Notes": pick(["", "Vegetarian", "Nut allergy", "Dairy-free"]),
      "Registration Channel": pick(["Online RSVP", "Walk-in", "Word of mouth"]),
    };
  },
};

// Scenario 2 — Senior lunch
const seniorLunch: Scenario = {
  id: "senior-lunch-april",
  title: "Senior Lunch — April",
  eventName: "Senior Lunch — April",
  eventType: "community_social",
  description:
    "Weekly senior lunch with a speaker on healthy aging. Attendees skew heavily 65+, many are recurring members, short local ZIP footprint.",
  existingCount: 55,
  newCount: 12,
  audienceFilter: (p) => ageFrom(p.date_of_birth) >= 60,
  rowFromExisting: (id, p) => {
    const a = p.attributes ?? {};
    return {
      "First Name": id.first_name ?? "",
      "Last Name": id.last_name ?? "",
      "Email": id.email,
      "Phone": randomPhone(),
      "Birth Year": p.date_of_birth ? p.date_of_birth.slice(0, 4) : "",
      "ZIP Code": a.zip_code ?? pick(zips),
      "Member Tier": a["org:membership_tier"] ?? pick(["Senior", "Senior Couple", "Individual"]),
      "Transportation": pick(["Drives self", "Drives self", "Drove with a friend", "JCC shuttle", "Walked", "MBTA"]),
      "Mobility Assistance": pick(["", "", "", "", "Walker", "Cane", "Wheelchair accessible seating"]),
      "Dietary Notes": pick(["", "", "Low sodium", "Diabetic-friendly", "Vegetarian", "Gluten-free"]),
      "RSVP'd Ahead": pick(["Yes", "Yes", "Yes", "No (walk-in)"]),
    };
  },
  rowFromNew: () => {
    const n = makeNewRow({
      firstNames: firstNamesSenior,
      lastNames: lastNamesClassic,
      ageRange: [65, 88],
    });
    return {
      "First Name": n.firstName,
      "Last Name": n.lastName,
      "Email": n.email,
      "Phone": randomPhone(),
      "Birth Year": n.dob.slice(0, 4),
      "ZIP Code": n.zip,
      "Member Tier": pick(["Non-Member", "Guest of Member", "Day Pass"]),
      "Transportation": pick(["Drives self", "Brought by family", "JCC shuttle"]),
      "Mobility Assistance": pick(["", "", "Walker", "Cane"]),
      "Dietary Notes": pick(["", "Low sodium", "Kosher"]),
      "RSVP'd Ahead": pick(["Yes", "No (walk-in)"]),
    };
  },
};

// Scenario 3 — Teen tryouts (mostly new identities — teens aren't in population)
const maccabiTryouts: Scenario = {
  id: "maccabi-tryouts",
  title: "Maccabi Tryouts",
  eventName: "JCC Maccabi Regional Tryouts",
  eventType: "youth",
  description:
    "Teen tryouts for the JCC Maccabi Games delegation. Attendees are mostly brand-new teen identities — the adult roster doesn't include them yet. A few are siblings of existing members (parent email on file).",
  existingCount: 14,
  newCount: 52,
  audienceFilter: (p) => {
    const a = p.attributes ?? {};
    // Parents whose youngest child is ~12-17 (so they have a teen eligible)
    for (let i = 1; i <= 4; i++) {
      const dob = a[`child_${i}_dob`];
      if (dob) {
        const age = ageFrom(dob);
        if (age >= 12 && age <= 17) return true;
      }
    }
    return false;
  },
  rowFromExisting: (id, p) => {
    // Use the teen's info for attendee; parent email on a separate column
    const a = p.attributes ?? {};
    const lastName = id.last_name ?? "";
    let teenName = pick(firstNamesTeen);
    for (let i = 1; i <= 4; i++) {
      const dob = a[`child_${i}_dob`];
      const name = a[`child_${i}_name`];
      if (dob && name) {
        const age = ageFrom(dob);
        if (age >= 12 && age <= 17) {
          teenName = name;
          break;
        }
      }
    }
    // Generate a teen email (not the parent's) — they get their own identity
    const teenEmail = `${teenName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}${randomInt(100, 999)}@example.com`;
    const currentYear = new Date().getFullYear();
    const teenAge = randomInt(13, 17);
    const teenDob = `${currentYear - teenAge}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`;
    return {
      "Teen Name": `${teenName} ${lastName}`,
      "Teen Email": teenEmail,
      "Teen DOB": formatDate(teenDob),
      "Grade": String(randomInt(7, 11)),
      "Sport": pick(["Basketball", "Soccer", "Tennis", "Swim", "Track", "Dance", "Volleyball"]),
      "T-Shirt Size": pick(["YL", "AS", "AM", "AL"]),
      "Parent Name": `${id.first_name ?? ""} ${lastName}`,
      "Parent Email": id.email,
      "Parent Phone": randomPhone(),
      "Member Status": "Family",
    };
  },
  rowFromNew: () => {
    const firstName = pick(firstNamesTeen);
    const lastName = pick([...lastNamesClassic, ...lastNamesNew]);
    const slug = lastName.toLowerCase().replace(/[^a-z]/g, "");
    const teenEmail = `${firstName.toLowerCase()}.${slug}${randomInt(100, 999)}@example.com`;
    const parentFirst = pick(firstNamesNew);
    const parentEmail = `${parentFirst.toLowerCase()}.${slug}${randomInt(100, 999)}@example.com`;
    const currentYear = new Date().getFullYear();
    const teenAge = randomInt(13, 17);
    const teenDob = `${currentYear - teenAge}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`;
    return {
      "Teen Name": `${firstName} ${lastName}`,
      "Teen Email": teenEmail,
      "Teen DOB": formatDate(teenDob),
      "Grade": String(randomInt(7, 11)),
      "Sport": pick(["Basketball", "Soccer", "Tennis", "Swim", "Track", "Dance", "Volleyball"]),
      "T-Shirt Size": pick(["YL", "AS", "AM", "AL", "AXL"]),
      "Parent Name": `${parentFirst} ${lastName}`,
      "Parent Email": parentEmail,
      "Parent Phone": randomPhone(),
      "Member Status": pick(["Non-Member", "Day Pass", "Guest"]),
    };
  },
};

// Scenario 4 — Annual gala (large, donor-heavy)
const annualGala: Scenario = {
  id: "annual-gala",
  title: "Annual Gala 2026",
  eventName: "Annual Gala 2026",
  eventType: "fundraiser",
  description:
    "The JCC's signature fundraiser — 350+ attendees with heavy donor overlay, seating assignments, and meal choices. Existing members dominate but sponsors bring first-time guests.",
  existingCount: 260,
  newCount: 90,
  audienceFilter: (p) => {
    // Skew toward donors + adults; keep everyone eligible but weight higher
    return ageFrom(p.date_of_birth) >= 30;
  },
  rowFromExisting: (id, p) => {
    const a = p.attributes ?? {};
    const isDonor = Boolean(a["org:is_donor"]);
    return {
      "First Name": id.first_name ?? "",
      "Last Name": id.last_name ?? "",
      "Email": id.email,
      "Table Number": String(randomInt(1, 44)),
      "Ticket Type": pick(["Gala Seat", "Gala Seat", "Patron Table", "Leadership Table", "Sponsor"]),
      "Donor Level": isDonor
        ? a["org:donor_level"] ?? pick(["Sustaining", "Supporting", "Patron"])
        : "",
      "Contribution": isDonor ? `$${randomInt(10, 250) * 100}` : "",
      "Meal Choice": pick(["Salmon", "Chicken", "Vegetarian", "Vegan"]),
      "Dietary Notes": pick(["", "", "", "Gluten-free", "Nut allergy", "Kosher"]),
      "Plus One": pick(["", "", "Spouse", "Guest", "Partner"]),
    };
  },
  rowFromNew: () => {
    const n = makeNewRow({
      firstNames: firstNamesNew,
      lastNames: [...lastNamesNew, ...lastNamesClassic],
      ageRange: [35, 72],
    });
    const sponsor = Math.random() < 0.4;
    return {
      "First Name": n.firstName,
      "Last Name": n.lastName,
      "Email": n.email,
      "Table Number": String(randomInt(1, 44)),
      "Ticket Type": sponsor ? pick(["Sponsor", "Sponsor Guest"]) : "Gala Seat",
      "Donor Level": sponsor ? pick(["Sponsor", "Leadership"]) : "",
      "Contribution": sponsor ? `$${randomInt(50, 500) * 100}` : "",
      "Meal Choice": pick(["Salmon", "Chicken", "Vegetarian"]),
      "Dietary Notes": pick(["", "", "Gluten-free", "Nut allergy"]),
      "Plus One": pick(["Spouse", "Guest", "Partner", ""]),
    };
  },
};

// Scenario 5 — Book festival author talk
const bookFestival: Scenario = {
  id: "book-festival-author-talk",
  title: "Book Festival — Spring Author Talk",
  eventName: "Book Festival — Spring Author Talk",
  eventType: "arts_culture",
  description:
    "Author conversation in the arts series. Draws Jewish community from the full region — heavy on adults 45–70, meaningful share of first-timers from outside the membership.",
  existingCount: 85,
  newCount: 55,
  audienceFilter: (p) => {
    const age = ageFrom(p.date_of_birth);
    return age >= 35 && age <= 78;
  },
  rowFromExisting: (id, p) => {
    const a = p.attributes ?? {};
    return {
      "Name": `${id.first_name ?? ""} ${id.last_name ?? ""}`.trim(),
      "Email": id.email,
      "Ticket Type": pick(["Member", "Member", "Member", "Guest of Member"]),
      "Session": "Evening · 7pm",
      "ZIP": a.zip_code ?? pick(zips),
      "How Did You Hear": pick([
        "JCC email",
        "JCC email",
        "JCC member portal",
        "Festival brochure",
        "Word of mouth",
      ]),
      "Add to Book Festival List": pick(["Yes", "Yes", "Already on list", "No"]),
      "Signed Copy Requested": pick(["", "", "", "Yes", "Yes"]),
    };
  },
  rowFromNew: () => {
    const n = makeNewRow({
      firstNames: [...firstNamesNew, ...firstNamesSenior.slice(0, 8)],
      lastNames: [...lastNamesClassic, ...lastNamesNew],
      ageRange: [38, 74],
    });
    return {
      "Name": `${n.firstName} ${n.lastName}`,
      "Email": n.email,
      "Ticket Type": pick([
        "Non-Member",
        "Non-Member",
        "Student",
        "Non-Member",
        "Guest of Member",
      ]),
      "Session": "Evening · 7pm",
      "ZIP": n.zip,
      "How Did You Hear": pick([
        "Friend",
        "Publisher promo",
        "Library flyer",
        "Social media",
        "News article",
      ]),
      "Add to Book Festival List": pick(["Yes", "No", "Yes"]),
      "Signed Copy Requested": pick(["", "", "Yes"]),
    };
  },
};

export const scenarios: Scenario[] = [
  springFamily,
  seniorLunch,
  maccabiTryouts,
  annualGala,
  bookFestival,
];

// ─── CSV row writer ─────────────────────────────────────────────
export function rowsToCsv(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string) => {
    if (v == null) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => escape(r[h] ?? "")).join(","));
  }
  return lines.join("\n");
}
