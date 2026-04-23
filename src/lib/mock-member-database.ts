/**
 * Mock "database" of existing members for demo mode.
 * When a user uploads a CSV in demo mode, we check against this
 * to determine which rows are new, updated, or unchanged.
 */

export interface MockMember {
  email: string;
  first_name: string;
  last_name: string;
  membership_type?: string;
  zip_code?: string;
  child_1_name?: string;
  child_1_dob?: string;
  child_2_name?: string;
  child_2_dob?: string;
}

// ~60 existing members — a realistic subset of a synagogue membership
export const MOCK_EXISTING_MEMBERS: MockMember[] = [
  { email: "sarah.cohen42@example.com", first_name: "Sarah", last_name: "Cohen", membership_type: "Family", zip_code: "02134", child_1_name: "Emma", child_1_dob: "2018-03-15" },
  { email: "david.levy7@example.com", first_name: "David", last_name: "Levy", membership_type: "Individual", zip_code: "02139" },
  { email: "rachel.shapiro12@example.com", first_name: "Rachel", last_name: "Shapiro", membership_type: "Family", zip_code: "02140", child_1_name: "Lily", child_1_dob: "2019-11-03" },
  { email: "michael.friedman5@example.com", first_name: "Michael", last_name: "Friedman", membership_type: "Family", zip_code: "02140", child_1_name: "Jack", child_1_dob: "2017-06-28" },
  { email: "rebecca.katz18@example.com", first_name: "Rebecca", last_name: "Katz", membership_type: "Individual", zip_code: "02135" },
  { email: "daniel.rosen33@example.com", first_name: "Daniel", last_name: "Rosen", membership_type: "Family", zip_code: "02138", child_1_name: "Zoe", child_1_dob: "2020-01-10" },
  { email: "leah.schwartz9@example.com", first_name: "Leah", last_name: "Schwartz", membership_type: "Family", zip_code: "02139", child_1_name: "Ben", child_1_dob: "2016-04-07" },
  { email: "joshua.goldman61@example.com", first_name: "Joshua", last_name: "Goldman", membership_type: "Individual", zip_code: "02144" },
  { email: "hannah.klein22@example.com", first_name: "Hannah", last_name: "Klein", membership_type: "Family", zip_code: "02140" },
  { email: "benjamin.stern15@example.com", first_name: "Benjamin", last_name: "Stern", membership_type: "Family", zip_code: "02138", child_1_name: "Eli", child_1_dob: "2017-08-12" },
  { email: "samuel.silverman8@example.com", first_name: "Samuel", last_name: "Silverman", membership_type: "Family", zip_code: "02134" },
  { email: "esther.greenberg71@example.com", first_name: "Esther", last_name: "Greenberg", membership_type: "Senior/Retired", zip_code: "02155" },
  { email: "aaron.kaplan29@example.com", first_name: "Aaron", last_name: "Kaplan", membership_type: "Family", zip_code: "02148", child_1_name: "Talia", child_1_dob: "2018-10-04" },
  { email: "naomi.epstein3@example.com", first_name: "Naomi", last_name: "Epstein", membership_type: "Family", zip_code: "02138" },
  { email: "eli.bloom56@example.com", first_name: "Eli", last_name: "Bloom", membership_type: "Individual", zip_code: "02139" },
  { email: "abigail.stein40@example.com", first_name: "Abigail", last_name: "Stein", membership_type: "Family", zip_code: "02140", child_1_name: "Caleb", child_1_dob: "2016-12-01" },
  { email: "ruth.blum87@example.com", first_name: "Ruth", last_name: "Blum", membership_type: "Senior/Retired", zip_code: "02135" },
  { email: "isaac.frank14@example.com", first_name: "Isaac", last_name: "Frank", membership_type: "Family", zip_code: "02144" },
  { email: "maya.gross62@example.com", first_name: "Maya", last_name: "Gross", membership_type: "Family", zip_code: "02138", child_1_name: "Levi", child_1_dob: "2018-05-20" },
  { email: "ethan.kohn37@example.com", first_name: "Ethan", last_name: "Kohn", membership_type: "Individual", zip_code: "02139" },
  { email: "sophie.segal25@example.com", first_name: "Sophie", last_name: "Segal", membership_type: "Family", zip_code: "02140" },
  { email: "jacob.feldman48@example.com", first_name: "Jacob", last_name: "Feldman", membership_type: "Family", zip_code: "02148" },
  { email: "liam.lieberman66@example.com", first_name: "Liam", last_name: "Lieberman", membership_type: "Family", zip_code: "02134" },
  { email: "ava.marcus53@example.com", first_name: "Ava", last_name: "Marcus", membership_type: "Family", zip_code: "02138", child_1_name: "Simon", child_1_dob: "2018-01-26" },
  { email: "oliver.peretz2@example.com", first_name: "Oliver", last_name: "Peretz", membership_type: "Individual", zip_code: "02155" },
  { email: "mia.rubin78@example.com", first_name: "Mia", last_name: "Rubin", membership_type: "Family", zip_code: "02143" },
  { email: "alexander.schneider30@example.com", first_name: "Alexander", last_name: "Schneider", membership_type: "Family", zip_code: "02140", child_1_name: "Tamar", child_1_dob: "2017-03-14" },
  // These members exist but have OLDER data — uploads with new data for them will show as "updated"
  { email: "miriam.berger44@example.com", first_name: "Miriam", last_name: "Berger", membership_type: "Individual", zip_code: "02143" },
  { email: "noah.adler19@example.com", first_name: "Noah", last_name: "Adler", membership_type: "Individual", zip_code: "02143" },
  // Additional existing members not in the sample CSV (background population)
  { email: "talia.diamond99@example.com", first_name: "Talia", last_name: "Diamond", membership_type: "Family", zip_code: "02138" },
  { email: "jonah.weiss12@example.com", first_name: "Jonah", last_name: "Weiss", membership_type: "Family", zip_code: "02139" },
  { email: "shira.abrams45@example.com", first_name: "Shira", last_name: "Abrams", membership_type: "Individual", zip_code: "02144" },
  { email: "max.becker77@example.com", first_name: "Max", last_name: "Becker", membership_type: "Young Professional", zip_code: "02143" },
  { email: "dina.solomon23@example.com", first_name: "Dina", last_name: "Solomon", membership_type: "Family", zip_code: "02140" },
  { email: "leo.strauss58@example.com", first_name: "Leo", last_name: "Strauss", membership_type: "Senior/Retired", zip_code: "02155" },
  { email: "yael.weil31@example.com", first_name: "Yael", last_name: "Weil", membership_type: "Family", zip_code: "02134" },
  { email: "asher.zimmerman64@example.com", first_name: "Asher", last_name: "Zimmerman", membership_type: "Family", zip_code: "02148" },
];

/**
 * Look up existing member by email. Returns null if not found.
 */
export function findMockMember(email: string): MockMember | null {
  return MOCK_EXISTING_MEMBERS.find((m) => m.email === email.toLowerCase()) ?? null;
}

/**
 * Compare an uploaded row against an existing mock member.
 * Returns list of field labels that would change, or empty array if unchanged.
 */
export function diffMockMember(
  existing: MockMember,
  uploadedRow: Record<string, string>,
  columnMap: Record<string, string> // field_key → spreadsheet column name
): string[] {
  const changed: string[] = [];

  const FIELD_LABELS: Record<string, string> = {
    first_name: "First Name",
    last_name: "Last Name",
    membership_type: "Membership Type",
    zip_code: "Zip Code",
    child_1_name: "Child 1 Name",
    child_1_dob: "Child 1 DOB",
    child_2_name: "Child 2 Name",
    child_2_dob: "Child 2 DOB",
  };

  for (const [fieldKey, colName] of Object.entries(columnMap)) {
    if (fieldKey === "email") continue;
    const newVal = uploadedRow[colName]?.toString().trim();
    if (!newVal) continue;

    const existingVal = (existing as unknown as Record<string, string | undefined>)[fieldKey];

    if (!existingVal && newVal) {
      // New data for a field the member didn't have before
      changed.push(FIELD_LABELS[fieldKey] || fieldKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    } else if (existingVal && existingVal !== newVal) {
      // Changed value
      changed.push(FIELD_LABELS[fieldKey] || fieldKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  }

  return changed;
}
