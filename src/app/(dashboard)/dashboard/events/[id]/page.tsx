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
import { DemographicComparisonSection } from "@/components/events/demographic-comparison-section";

const typeToneMap: Record<string, "ochre" | "default" | "moss"> = {
  shabbat: "ochre",
  education: "default",
  social: "moss",
  holiday: "ochre",
  life_cycle: "default",
};
import {
  getAttendanceDistribution,
  getDemographicComparison,
  getBusinessUnitEngagement,
  getEventDemographics,
  getAvailableYears,
} from "@/lib/event-analytics";

// Fields now covered by the curated comparison charts (or removed on purpose,
// like membership status) — excluded from the dynamic "more demographics" grid.
const CURATED_FIELD_KEYS = new Set(["age_bucket", "denomination", "has_children", "is_member"]);
const CURATED_ATTR_PATTERNS = [/day_school_enrolled/i, /hebrew_school/i];

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
  const [distribution, comparison, businessUnits, demographics, availableYears] =
    await Promise.all([
      getAttendanceDistribution(supabase, id, event.organization_id, event.event_type, undefined, serviceClient),
      getDemographicComparison(supabase, id, event.organization_id, event.event_type, serviceClient),
      getBusinessUnitEngagement(supabase, id, event.organization_id),
      getEventDemographics(supabase, id),
      getAvailableYears(supabase, event.organization_id),
    ]);

  const hasData = distribution.thisEvent > 0;

  // Only surface dynamic fields not already covered by curated comparisons
  const extraDemographics = demographics.filter(
    (f) =>
      !CURATED_FIELD_KEYS.has(f.key) &&
      !CURATED_ATTR_PATTERNS.some((re) => re.test(f.key))
  );

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
            initialDistribution={distribution}
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
              How this crowd compares
            </h2>
            <DemographicComparisonSection
              fields={comparison}
              businessUnits={businessUnits}
              orgName={orgName}
              eventTypeLabel={eventTypeLabel}
              totalAttendees={distribution.thisEvent}
            />
          </div>

          {extraDemographics.length > 0 && (
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
                More demographics
              </h2>
              <EventDemographicsSection
                fields={extraDemographics}
                totalAttendees={distribution.thisEvent}
              />
            </div>
          )}
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
