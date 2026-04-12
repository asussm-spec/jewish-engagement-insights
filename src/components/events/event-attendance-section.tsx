"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { AttendanceComparison } from "@/lib/event-analytics";

const COLORS = {
  thisEvent: "#1e2d6f",
  orgEvents: "#c8922a",
  community: "#4a7c6f",
};

interface EventListing {
  id: string;
  name: string;
  event_date: string;
  attendee_count: number;
  short_description: string | null;
}

interface DistributionBucket {
  range: string;
  count: number;
}

interface Props {
  attendance: AttendanceComparison;
  orgName: string;
  eventTypeLabel: string;
  organizationId: string;
  eventType: string;
}

export function EventAttendanceSection({
  attendance,
  orgName,
  eventTypeLabel,
  organizationId,
  eventType,
}: Props) {
  const typeLabel = eventTypeLabel.charAt(0).toUpperCase() + eventTypeLabel.slice(1);
  const orgLabel = `${orgName} ${typeLabel} (n=${attendance.orgEventTypeCount})`;
  const communityLabel = `All Communal ${typeLabel} (n=${attendance.communityEventTypeCount})`;

  // Org events dialog
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [events, setEvents] = useState<EventListing[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Community distribution dialog
  const [communityDialogOpen, setCommunityDialogOpen] = useState(false);
  const [distribution, setDistribution] = useState<DistributionBucket[]>([]);
  const [communityTotalEvents, setCommunityTotalEvents] = useState(0);
  const [loadingDistribution, setLoadingDistribution] = useState(false);

  const data = [
    {
      name: "This Event",
      value: attendance.thisEvent,
      fill: COLORS.thisEvent,
    },
    {
      name: orgLabel,
      value: attendance.orgEventTypeAvg,
      fill: COLORS.orgEvents,
    },
    {
      name: communityLabel,
      value: attendance.communityEventTypeAvg,
      fill: COLORS.community,
    },
  ];

  const chartConfig = {
    value: { label: "Avg. Attendees" },
  };

  // Fetch org event listing when org dialog opens
  useEffect(() => {
    if (!orgDialogOpen) return;
    async function fetchEvents() {
      setLoadingEvents(true);
      try {
        const params = new URLSearchParams({
          orgId: organizationId,
          eventType,
        });
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

  // Fetch community distribution when community dialog opens
  useEffect(() => {
    if (!communityDialogOpen) return;
    async function fetchDistribution() {
      setLoadingDistribution(true);
      try {
        const params = new URLSearchParams({ eventType });
        const res = await fetch(`/api/events/community-distribution?${params}`);
        if (res.ok) {
          const data = await res.json();
          setDistribution(data.distribution || []);
          setCommunityTotalEvents(data.totalEvents || 0);
        }
      } catch (err) {
        console.error("Failed to fetch distribution:", err);
      } finally {
        setLoadingDistribution(false);
      }
    }
    fetchDistribution();
  }, [communityDialogOpen, eventType]);

  function handleBarClick(barData: { name: string }) {
    if (barData.name === orgLabel) setOrgDialogOpen(true);
    if (barData.name === communityLabel) setCommunityDialogOpen(true);
  }

  function renderYTick(props: { x: number; y: number; payload: { value: string } }) {
    const { x, y, payload } = props;
    const isClickable = payload.value === orgLabel || payload.value === communityLabel;
    const color = payload.value === orgLabel
      ? COLORS.orgEvents
      : payload.value === communityLabel
        ? COLORS.community
        : "#666";
    return (
      <text
        x={x}
        y={y}
        textAnchor="end"
        fontSize={12}
        dominantBaseline="middle"
        fill={color}
        style={isClickable ? { cursor: "pointer", textDecoration: "underline" } : undefined}
        onClick={() => {
          if (payload.value === orgLabel) setOrgDialogOpen(true);
          if (payload.value === communityLabel) setCommunityDialogOpen(true);
        }}
      >
        {payload.value}
      </text>
    );
  }

  const distributionChartConfig = {
    count: { label: "Events", color: COLORS.community },
  };

  // Match the bucket ranges from the API
  function thisEventBucket(count: number): string {
    if (count <= 10) return "1–10";
    if (count <= 20) return "11–20";
    if (count <= 30) return "21–30";
    if (count <= 40) return "31–40";
    if (count <= 50) return "41–50";
    if (count <= 75) return "51–75";
    if (count <= 100) return "76–100";
    return "100+";
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 0, right: 30, top: 5, bottom: 5 }}
            >
              <XAxis
                type="number"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                label={{ value: "Avg. Attendees", position: "bottom", fontSize: 12, fill: "#888" }}
              />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={280}
                tick={renderYTick as never}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                barSize={36}
                cursor="pointer"
                onClick={(barData) => handleBarClick(barData as { name: string })}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Org events listing dialog */}
      <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {orgName} — <span className="capitalize">{typeLabel}</span> Events
            </DialogTitle>
          </DialogHeader>
          {loadingEvents ? (
            <p className="text-sm text-muted-foreground py-4">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No events found.</p>
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

      {/* Community distribution dialog */}
      <Dialog open={communityDialogOpen} onOpenChange={setCommunityDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Communal <span className="capitalize">{typeLabel}</span> Event Attendance Distribution
            </DialogTitle>
            <DialogDescription>
              Attendance ranges across {communityTotalEvents} community-wide {typeLabel.toLowerCase()} events
            </DialogDescription>
          </DialogHeader>
          {loadingDistribution ? (
            <p className="text-sm text-muted-foreground py-4">Loading distribution...</p>
          ) : distribution.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No data available.</p>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: COLORS.thisEvent }}
                />
                <span className="font-medium">Your event ({attendance.thisEvent} attendees)</span>
                <span className="text-muted-foreground">
                  falls in the {thisEventBucket(attendance.thisEvent)} range
                </span>
              </div>
              <ChartContainer config={distributionChartConfig} className="h-[300px] w-full">
                <BarChart
                  data={distribution}
                  margin={{ left: 10, right: 10, top: 10, bottom: 20 }}
                >
                  <XAxis
                    dataKey="range"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: "Attendees per Event", position: "bottom", offset: 5, fontSize: 12, fill: "#888" }}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    label={{ value: "Number of Events", angle: -90, position: "insideLeft", fontSize: 12, fill: "#888" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {distribution.map((bucket, i) => (
                      <Cell
                        key={i}
                        fill={bucket.range === thisEventBucket(attendance.thisEvent) ? COLORS.thisEvent : COLORS.community}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
