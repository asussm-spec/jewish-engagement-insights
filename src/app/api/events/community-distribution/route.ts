import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const BUCKETS = [
  { label: "1–10", min: 1, max: 10 },
  { label: "11–20", min: 11, max: 20 },
  { label: "21–30", min: 21, max: 30 },
  { label: "31–40", min: 31, max: 40 },
  { label: "41–50", min: 41, max: 50 },
  { label: "51–75", min: 51, max: 75 },
  { label: "76–100", min: 76, max: 100 },
  { label: "100+", min: 101, max: Infinity },
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventType = request.nextUrl.searchParams.get("eventType");
    if (!eventType) {
      return NextResponse.json({ error: "Missing eventType" }, { status: 400 });
    }

    // Use service client to see all orgs
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: events } = await serviceClient
      .from("events")
      .select("attendee_count")
      .eq("event_type", eventType)
      .gt("attendee_count", 0);

    if (!events || events.length === 0) {
      return NextResponse.json({ distribution: [], totalEvents: 0 });
    }

    // Build distribution
    const distribution = BUCKETS.map((bucket) => {
      const count = events.filter(
        (e) => e.attendee_count >= bucket.min && e.attendee_count <= bucket.max
      ).length;
      return { range: bucket.label, count };
    }).filter((d) => d.count > 0);

    return NextResponse.json({
      distribution,
      totalEvents: events.length,
    });
  } catch (err) {
    console.error("Community distribution API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
