import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  PageHead,
  Chip,
  DsButton,
  Panel,
} from "@/components/layout/page-primitives";
import { Upload, Users, CalendarDays } from "lucide-react";
import { EventAttendanceWithFilter } from "@/components/events/event-attendance-with-filter";
import { EventDemographicsSection } from "@/components/events/event-demographics-section";

const typeToneMap: Record<string, "ochre" | "default" | "moss"> = {
  shabbat: "ochre",
  education: "default",
  social: "moss",
  holiday: "ochre",
  life_cycle: "default",
};
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
  const serviceClient = createServiceClient();

  // Load all data in parallel
  const [attendance, demographics, availableYears] = await Promise.all([
    getAttendanceComparison(supabase, id, event.organization_id, event.event_type, undefined, serviceClient),
    getEventDemographics(supabase, id),
    getAvailableYears(supabase, event.organization_id),
  ]);

  const hasData = attendance.thisEvent > 0;

  const dateStr = new Date(event.event_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      <PageHead
        breadcrumb={[
          { label: "Events", href: "/dashboard/events" },
          { label: event.name },
        ]}
        title={event.name}
        subtitle={
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Chip tone={typeToneMap[event.event_type ?? ""] ?? "default"}>
              <span className="capitalize">{eventTypeLabel}</span>
            </Chip>
            <Chip>
              <CalendarDays className="h-3 w-3" />
              {dateStr}
            </Chip>
            <Chip>
              <Users className="h-3 w-3" />
              {event.attendee_count ?? 0} attendees
            </Chip>
            {event.short_description && (
              <span
                style={{ fontSize: 13, color: "var(--stone-500)" }}
              >
                {event.short_description}
              </span>
            )}
          </div>
        }
        actions={
          <DsButton
            href={`/dashboard/events/${id}/upload`}
            variant="secondary"
            size="sm"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload more data
          </DsButton>
        }
      />

      {hasData ? (
        <div className="space-y-8">
          <EventAttendanceWithFilter
            initialAttendance={attendance}
            eventId={id}
            organizationId={event.organization_id}
            eventType={event.event_type}
            orgName={orgName}
            eventTypeLabel={eventTypeLabel}
            availableYears={availableYears}
          />

          <div className="space-y-4">
            <h2
              className="font-serif"
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: "var(--ink-800)",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Event demographics
            </h2>
            <EventDemographicsSection
              fields={demographics}
              totalAttendees={attendance.thisEvent}
            />
          </div>
        </div>
      ) : (
        <Panel>
          <div
            className="text-center"
            style={{ padding: "56px 40px", borderStyle: "dashed" }}
          >
            <div
              className="font-serif"
              style={{
                fontWeight: 500,
                fontSize: 20,
                color: "var(--ink-800)",
                letterSpacing: "-0.01em",
                marginBottom: 6,
              }}
            >
              No attendee data yet.
            </div>
            <p
              className="mx-auto"
              style={{
                fontSize: 14,
                color: "var(--stone-500)",
                maxWidth: 440,
                lineHeight: 1.55,
              }}
            >
              Upload a spreadsheet of attendees to see insights and
              comparisons.
            </p>
          </div>
        </Panel>
      )}
    </div>
  );
}
