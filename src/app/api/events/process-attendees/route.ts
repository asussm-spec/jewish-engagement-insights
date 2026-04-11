import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Use service role for people_identities (locked down by RLS)
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

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated
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

    // Verify user owns this event's org
    const { data: event } = await supabase
      .from("events")
      .select("id, organization_id")
      .eq("id", eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const serviceClient = getServiceClient();

    // Find which columns map to which fields
    const columnMap: Record<string, string> = {};
    for (const [col, field] of Object.entries(mappings as Record<string, string>)) {
      if (field !== "skip") {
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

      // Upsert into people_identities (private secure database)
      const { data: identity } = await serviceClient
        .from("people_identities")
        .upsert(
          {
            email,
            first_name: firstName || undefined,
            last_name: lastName || undefined,
          },
          { onConflict: "email" }
        )
        .select("id")
        .single();

      if (!identity) continue;

      // Build anonymized profile data
      const profileUpdate: Record<string, unknown> = { id: identity.id };

      if (columnMap.age) {
        const age = parseInt(row[columnMap.age], 10);
        if (!isNaN(age)) {
          profileUpdate.age_bucket = computeAgeBucket(age);
        }
      }

      if (columnMap.date_of_birth) {
        const dob = row[columnMap.date_of_birth]?.toString().trim();
        if (dob) {
          profileUpdate.date_of_birth = dob;
          // Compute age bucket from DOB
          const birthDate = new Date(dob);
          if (!isNaN(birthDate.getTime())) {
            const age = Math.floor(
              (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
            );
            profileUpdate.age_bucket = computeAgeBucket(age);
          }
        }
      }

      if (columnMap.denomination) {
        const denom = row[columnMap.denomination]?.toString().trim().toLowerCase();
        const validDenoms = [
          "reform",
          "conservative",
          "orthodox",
          "reconstructionist",
          "just_jewish",
        ];
        if (denom) {
          const normalized = denom.replace(/\s+/g, "_");
          profileUpdate.denomination = validDenoms.includes(normalized)
            ? normalized
            : "other";
        }
      }

      if (columnMap.num_children) {
        const numKids = parseInt(row[columnMap.num_children], 10);
        if (!isNaN(numKids)) {
          profileUpdate.has_children = numKids > 0;
          profileUpdate.number_of_children = numKids;
        }
      }

      // Upsert anonymized people profile
      await serviceClient
        .from("people_profiles")
        .upsert(profileUpdate, { onConflict: "id" });

      // Add to event_attendees
      await serviceClient.from("event_attendees").upsert(
        {
          event_id: eventId,
          person_id: identity.id,
          raw_data: row,
        },
        { onConflict: "event_id,person_id" }
      );

      processedCount++;
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
