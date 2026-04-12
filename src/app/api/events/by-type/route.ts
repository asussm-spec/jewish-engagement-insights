import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get("orgId");
    const eventType = searchParams.get("eventType");

    if (!orgId || !eventType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { data: events } = await supabase
      .from("events")
      .select("id, name, event_date, attendee_count, short_description")
      .eq("organization_id", orgId)
      .eq("event_type", eventType)
      .order("event_date", { ascending: false });

    return NextResponse.json({ events: events || [] });
  } catch (err) {
    console.error("Events by type API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
