import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export interface ValidationResult {
  totalRows: number;
  skippedRows: number; // no valid email
  newMembers: number;
  updatedMembers: number;
  unchangedMembers: number;
  samples: {
    status: "new" | "updated" | "unchanged";
    email: string; // masked: j***@example.com
    name: string;
    updatedFields?: string[];
  }[];
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local[0]}***@${domain}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mappings, rows, organizationId } = await request.json();

    if (!mappings || !rows) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build column map
    const columnMap: Record<string, string> = {};
    for (const [col, field] of Object.entries(mappings as Record<string, string>)) {
      if (field !== "skip" && field !== "__new__") {
        columnMap[field] = col;
      }
    }

    if (!columnMap.email) {
      return NextResponse.json({ error: "Email column mapping is required" }, { status: 400 });
    }

    // Identity fields that go into people_identities
    const IDENTITY_FIELDS = new Set(["email", "first_name", "last_name", "full_name", "address"]);
    const CORE_PROFILE_FIELDS = new Set(["date_of_birth", "age", "denomination", "num_children"]);

    let newMembers = 0;
    let updatedMembers = 0;
    let unchangedMembers = 0;
    let skippedRows = 0;
    const samples: ValidationResult["samples"] = [];
    const MAX_SAMPLES = 10;

    for (const row of rows) {
      const email = row[columnMap.email]?.toString().trim().toLowerCase();
      if (!email || !email.includes("@")) {
        skippedRows++;
        continue;
      }

      // Check if this person exists
      const { data: existing } = await serviceClient
        .from("people_identities")
        .select("id, first_name, last_name")
        .eq("email", email)
        .single();

      // Build name for display
      let firstName = columnMap.first_name ? row[columnMap.first_name]?.toString().trim() : null;
      let lastName = columnMap.last_name ? row[columnMap.last_name]?.toString().trim() : null;
      if (!firstName && !lastName && columnMap.full_name) {
        const parts = row[columnMap.full_name]?.toString().trim().split(" ");
        if (parts && parts.length > 0) {
          firstName = parts[0];
          lastName = parts.slice(1).join(" ") || null;
        }
      }
      const displayName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown";

      if (!existing) {
        newMembers++;
        if (samples.length < MAX_SAMPLES) {
          samples.push({ status: "new", email: maskEmail(email), name: displayName });
        }
      } else {
        // Check what fields would change
        const updatedFields: string[] = [];

        // Check identity fields
        if (firstName && existing.first_name !== firstName) updatedFields.push("First name");
        if (lastName && existing.last_name !== lastName) updatedFields.push("Last name");

        // Check profile fields
        const { data: profile } = await serviceClient
          .from("people_profiles")
          .select("date_of_birth, denomination, attributes")
          .eq("id", existing.id)
          .single();

        for (const [fieldKey, colName] of Object.entries(columnMap)) {
          if (IDENTITY_FIELDS.has(fieldKey) || fieldKey === "email") continue;
          const rawValue = row[colName]?.toString().trim();
          if (!rawValue) continue;

          if (CORE_PROFILE_FIELDS.has(fieldKey)) {
            if (fieldKey === "date_of_birth" && profile?.date_of_birth !== rawValue) {
              updatedFields.push("Date of birth");
            } else if (fieldKey === "denomination") {
              const normalized = rawValue.toLowerCase().replace(/\s+/g, "_");
              if (profile?.denomination !== normalized) updatedFields.push("Denomination");
            }
          } else {
            const attrs = (profile?.attributes as Record<string, unknown>) || {};
            if (attrs[fieldKey] !== rawValue) {
              // Find readable label
              const label = fieldKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              updatedFields.push(label);
            }
          }
        }

        if (updatedFields.length > 0) {
          updatedMembers++;
          if (samples.length < MAX_SAMPLES) {
            samples.push({ status: "updated", email: maskEmail(email), name: displayName, updatedFields });
          }
        } else {
          unchangedMembers++;
          if (samples.length < MAX_SAMPLES && samples.filter((s) => s.status === "unchanged").length < 2) {
            samples.push({ status: "unchanged", email: maskEmail(email), name: displayName });
          }
        }
      }
    }

    const result: ValidationResult = {
      totalRows: rows.length,
      skippedRows,
      newMembers,
      updatedMembers,
      unchangedMembers,
      samples,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Validate members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
