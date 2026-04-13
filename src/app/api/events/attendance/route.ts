import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getAttendanceComparison } from "@/lib/event-analytics";

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
    const eventId = searchParams.get("eventId");
    const organizationId = searchParams.get("organizationId");
    const eventType = searchParams.get("eventType");
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    if (!eventId || !organizationId || !eventType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const dateFilter = startDate || endDate
      ? { start: startDate, end: endDate }
      : undefined;

    const serviceClient = createServiceClient();

    const attendance = await getAttendanceComparison(
      supabase,
      eventId,
      organizationId,
      eventType,
      dateFilter,
      serviceClient
    );

    return NextResponse.json(attendance);
  } catch (err) {
    console.error("Attendance API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
