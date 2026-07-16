"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import {
  attendanceBucketLabel,
  type AttendanceDistribution,
} from "@/lib/event-analytics";

// Validated series palette (dataviz six-checks pass on paper surface):
// this event = indigo, org = gold, community = teal.
export const SERIES_COLORS = {
  thisEvent: "#3b52c4",
  org: "#a87a1d",
  community: "#0f8567",
};

interface EventListing {
  id: string;
  name: string;
  event_date: string;
  attendee_count: number;
  short_description: string | null;
}

interface Props {
  distribution: AttendanceDistribution;
  orgName: string;
  eventTypeLabel: string;
  organizationId: string;
  eventType: string;
}

export function EventAttendanceSection({
  distribution,
  orgName,
  eventTypeLabel,
  organizationId,
  eventType,
}: Props) {
  const typeLabel =
    eventTypeLabel.charAt(0).toUpperCase() + eventTypeLabel.slice(1);
  const thisBucket = attendanceBucketLabel(distribution.thisEvent);

  // Org events listing dialog
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [events, setEvents] = useState<EventListing[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (!orgDialogOpen) return;
    async function fetchEvents() {
      setLoadingEvents(true);
      try {
        const params = new URLSearchParams({ orgId: organizationId, eventType });
        const res = await fetch(`/api/events/by-type?${params}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, [orgDialogOpen, organizationId, eventType]);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionHistogram
          title={`How this compares at ${orgName}`}
          subtitle={
            <>
              {distribution.org.totalEvents} {typeLabel.toLowerCase()} events at{" "}
              {orgName} ·{" "}
              <button
                type="button"
                className="underline underline-offset-2 hover:text-foreground"
                onClick={() => setOrgDialogOpen(true)}
              >
                view events
              </button>
            </>
          }
          buckets={distribution.org.buckets}
          baseColor={SERIES_COLORS.org}
          thisBucket={thisBucket}
          thisEventCount={distribution.thisEvent}
        />
        <DistributionHistogram
          title="How this compares across the community"
          subtitle={`${distribution.community.totalEvents} ${typeLabel.toLowerCase()} events across all organizations`}
          buckets={distribution.community.buckets}
          baseColor={SERIES_COLORS.community}
          thisBucket={thisBucket}
          thisEventCount={distribution.thisEvent}
        />
      </div>

      {/* Org events listing dialog */}
      <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {orgName} — <span className="capitalize">{typeLabel}</span> Events
            </DialogTitle>
          </DialogHeader>
          {loadingEvents ? (
            <p className="text-sm text-muted-foreground py-4">
              Loading events...
            </p>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No events found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Attendees</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="font-medium hover:underline"
                      >
                        {event.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {event.attendee_count || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DistributionHistogram({
  title,
  subtitle,
  buckets,
  baseColor,
  thisBucket,
  thisEventCount,
}: {
  title: string;
  subtitle: React.ReactNode;
  buckets: { range: string; count: number }[];
  baseColor: string;
  thisBucket: string;
  thisEventCount: number;
}) {
  const chartConfig = { count: { label: "Events" } };
  const hasThisBucket = buckets.some((b) => b.range === thisBucket);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {buckets.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No comparable events yet.
          </p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart
                data={buckets}
                margin={{ left: 0, right: 8, top: 20, bottom: 4 }}
                barCategoryGap="18%"
              >
                <XAxis
                  dataKey="range"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  label={{
                    value: "Attendees per event",
                    position: "bottom",
                    offset: -6,
                    fontSize: 11,
                    fill: "var(--stone-500)",
                  }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => {
                        const range = (item?.payload as { range?: string })
                          ?.range;
                        const isThis = range === thisBucket;
                        return `${value} event${value === 1 ? "" : "s"}${isThis ? " — includes this event" : ""}`;
                      }}
                    />
                  }
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {buckets.map((bucket, i) => (
                    <Cell
                      key={i}
                      fill={
                        bucket.range === thisBucket
                          ? SERIES_COLORS.thisEvent
                          : baseColor
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="flex items-center gap-2 text-xs mt-2">
              <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: SERIES_COLORS.thisEvent }}
              />
              <span style={{ color: "var(--stone-500)" }}>
                <span
                  className="font-medium"
                  style={{ color: "var(--ink-800)" }}
                >
                  This event ({thisEventCount} attendees)
                </span>{" "}
                {hasThisBucket
                  ? `falls in the ${thisBucket} range`
                  : `(${thisBucket} range) is outside this distribution`}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
