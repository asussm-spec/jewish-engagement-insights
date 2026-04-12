import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Upload, Users, CalendarDays } from "lucide-react";
import { EventAttendanceWithFilter } from "@/components/events/event-attendance-with-filter";
import { EventDemographicsSection } from "@/components/events/event-demographics-section";
import {
  getAttendanceComparison,
  getEventDemographics,
  getAvailableYears,
} from "@/lib/event-analytics";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("*, organizations(name)")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const eventTypeLabel = event.event_type?.replace("_", " ") || "event";
  const orgName = event.organizations?.name || "Your org";

  // Service client for cross-org community queries (bypasses RLS)
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Load all data in parallel
  const [attendance, demographics, availableYears] = await Promise.all([
    getAttendanceComparison(supabase, id, event.organization_id, event.event_type, undefined, serviceClient),
    getEventDemographics(supabase, id),
    getAvailableYears(supabase, event.organization_id),
  ]);

  const hasData = attendance.thisEvent > 0;

  return (
    <div>
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      {/* Event header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className="capitalize">
              {eventTypeLabel}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(event.event_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {event.attendee_count} attendees
            </span>
          </div>
          {event.short_description && (
            <p className="mt-3 text-muted-foreground">
              {event.short_description}
            </p>
          )}
        </div>
        <Link
          href={`/dashboard/events/${id}/upload`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload more data
        </Link>
      </div>

      {hasData ? (
        <div className="space-y-10">
          {/* Section 1: Event Attendance */}
          <EventAttendanceWithFilter
            initialAttendance={attendance}
            eventId={id}
            organizationId={event.organization_id}
            eventType={event.event_type}
            orgName={orgName}
            eventTypeLabel={eventTypeLabel}
            availableYears={availableYears}
          />

          {/* Section 2: Event Demographics */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">Event Demographics</h2>
            <EventDemographicsSection
              fields={demographics}
              totalAttendees={attendance.thisEvent}
            />
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <CardTitle className="text-lg">No attendee data yet</CardTitle>
            <CardDescription>
              Upload a spreadsheet of attendees to see insights and comparisons.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
