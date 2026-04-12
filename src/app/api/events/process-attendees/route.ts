import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function computeAgeBucket(age: number): string {
  if (age <= 5) return "0-5";
  if (age <= 10) return "6-10";
  if (age <= 15) return "11-15";
  if (age <= 20) return "16-20";
  if (age <= 30) return "21-30";
  if (age <= 40) return "31-40";
  if (age <= 50) return "41-50";
  if (age <= 60) return "51-60";
  return "61+";
}

// Core fields that have their own columns on people_profiles
const CORE_PROFILE_FIELDS = new Set([
  "date_of_birth",
  "age",
  "denomination",
  "num_children",
]);

// Identity fields that go into people_identities
const IDENTITY_FIELDS = new Set([
  "email",
  "first_name",
  "last_name",
  "full_name",
  "address",
]);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, mappings, rows } = await request.json();

    if (!eventId || !mappings || !rows) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: event } = await supabase
      .from("events")
      .select("id, organization_id")
      .eq("id", eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const serviceClient = getServiceClient();

    // Build column map: field_key -> spreadsheet_column_name
    const columnMap: Record<string, string> = {};
    for (const [col, field] of Object.entries(
      mappings as Record<string, string>
    )) {
      if (field !== "skip" && field !== "__new__") {
        columnMap[field] = col;
      }
    }

    if (!columnMap.email) {
      return NextResponse.json(
        { error: "Email column mapping is required" },
        { status: 400 }
      );
    }

    let processedCount = 0;

    for (const row of rows) {
      const email = row[columnMap.email]?.toString().trim().toLowerCase();
      if (!email || !email.includes("@")) continue;

      // Build names
      let firstName = columnMap.first_name
        ? row[columnMap.first_name]?.toString().trim()
        : null;
      let lastName = columnMap.last_name
        ? row[columnMap.last_name]?.toString().trim()
        : null;

      if (!firstName && !lastName && columnMap.full_name) {
        const parts = row[columnMap.full_name]?.toString().trim().split(" ");
        if (parts && parts.length > 0) {
          firstName = parts[0];
          lastName = parts.slice(1).join(" ") || null;
        }
      }

      // Extract address if mapped
      const address = columnMap.address
        ? row[columnMap.address]?.toString().trim() || null
        : null;

      // Upsert into people_identities (private secure database)
      const identityData: Record<string, unknown> = { email };
      if (firstName) identityData.first_name = firstName;
      if (lastName) identityData.last_name = lastName;
      if (address) identityData.address = address;

      const { data: identity } = await serviceClient
        .from("people_identities")
        .upsert(identityData, { onConflict: "email" })
        .select("id")
        .single();

      if (!identity) continue;

      // Build profile update — core columns + flexible attributes
      const profileUpdate: Record<string, unknown> = { id: identity.id };
      const attributes: Record<string, unknown> = {};

      for (const [fieldKey, colName] of Object.entries(columnMap)) {
        if (IDENTITY_FIELDS.has(fieldKey)) continue; // Already handled above

        const rawValue = row[colName]?.toString().trim();
        if (!rawValue) continue;

        if (CORE_PROFILE_FIELDS.has(fieldKey)) {
          // Handle core fields with their own columns
          switch (fieldKey) {
            case "age": {
              const age = parseInt(rawValue, 10);
              if (!isNaN(age)) {
                profileUpdate.age_bucket = computeAgeBucket(age);
              }
              break;
            }
            case "date_of_birth": {
              profileUpdate.date_of_birth = rawValue;
              const birthDate = new Date(rawValue);
              if (!isNaN(birthDate.getTime())) {
                const age = Math.floor(
                  (Date.now() - birthDate.getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
                );
                profileUpdate.age_bucket = computeAgeBucket(age);
              }
              break;
            }
            case "denomination": {
              const denom = rawValue.toLowerCase();
              const validDenoms = [
                "reform",
                "conservative",
                "orthodox",
                "reconstructionist",
                "just_jewish",
              ];
              const normalized = denom.replace(/\s+/g, "_");
              profileUpdate.denomination = validDenoms.includes(normalized)
                ? normalized
                : "other";
              break;
            }
            case "num_children": {
              const numKids = parseInt(rawValue, 10);
              if (!isNaN(numKids)) {
                profileUpdate.has_children = numKids > 0;
                profileUpdate.number_of_children = numKids;
              }
              break;
            }
          }
        } else {
          // All other fields go into the flexible attributes JSONB
          attributes[fieldKey] = rawValue;
        }
      }

      // Merge attributes with any existing ones
      if (Object.keys(attributes).length > 0) {
        // Fetch existing attributes to merge
        const { data: existing } = await serviceClient
          .from("people_profiles")
          .select("attributes")
          .eq("id", identity.id)
          .single();

        const merged = {
          ...((existing?.attributes as Record<string, unknown>) || {}),
          ...attributes,
        };
        profileUpdate.attributes = merged;
      }

      // Upsert anonymized people profile
      await serviceClient
        .from("people_profiles")
        .upsert(profileUpdate, { onConflict: "id" });

      // Add parent to event_attendees
      await serviceClient.from("event_attendees").upsert(
        {
          event_id: eventId,
          person_id: identity.id,
          raw_data: row,
        },
        { onConflict: "event_id,person_id" }
      );

      processedCount++;

      // Process children as separate event attendees
      // Look for child_N_name and child_N_dob fields in the mapped data
      for (let childNum = 1; childNum <= 10; childNum++) {
        const childNameCol = columnMap[`child_${childNum}_name`];
        const childDobCol = columnMap[`child_${childNum}_dob`];

        // Skip if no child name or DOB column is mapped for this number
        if (!childNameCol && !childDobCol) continue;

        const childName = childNameCol ? row[childNameCol]?.toString().trim() : null;
        const childDob = childDobCol ? row[childDobCol]?.toString().trim() : null;

        // Skip if both are empty for this row
        if (!childName && !childDob) continue;

        // Create a synthetic identity for the child (no real email)
        const childSyntheticEmail = `child_${childNum}_of_${email}`;

        const { data: childIdentity } = await serviceClient
          .from("people_identities")
          .upsert(
            {
              email: childSyntheticEmail,
              first_name: childName || `Child ${childNum}`,
              last_name: lastName || null,
            },
            { onConflict: "email" }
          )
          .select("id")
          .single();

        if (!childIdentity) continue;

        // Build a minimal profile for the child
        const childProfile: Record<string, unknown> = {
          id: childIdentity.id,
          attributes: { is_child: "true", parent_id: identity.id },
        };

        if (childDob) {
          const birthDate = new Date(childDob);
          if (!isNaN(birthDate.getTime())) {
            childProfile.date_of_birth = childDob;
            const age = Math.floor(
              (Date.now() - birthDate.getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            );
            childProfile.age_bucket = computeAgeBucket(age);
          }
        }

        await serviceClient
          .from("people_profiles")
          .upsert(childProfile, { onConflict: "id" });

        // Add child as event attendee
        await serviceClient.from("event_attendees").upsert(
          {
            event_id: eventId,
            person_id: childIdentity.id,
            raw_data: { child_of: email, child_name: childName, child_dob: childDob },
          },
          { onConflict: "event_id,person_id" }
        );

        processedCount++;
      }
    }

    // Update attendee count on the event
    await supabase
      .from("events")
      .update({ attendee_count: processedCount })
      .eq("id", eventId);

    return NextResponse.json({ processedCount });
  } catch (err) {
    console.error("Process attendees error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
