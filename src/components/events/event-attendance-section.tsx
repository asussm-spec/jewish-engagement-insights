"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
import type {
  AttendanceComparison,
  AttendanceDistribution,
} from "@/lib/event-analytics";
import {
  peerGroupLabel,
  otherGroupLabel,
  orgTypeLabel,
} from "@/lib/event-analytics";
import { TakeawayLead } from "./event-section";

const COLORS = {
  thisEvent: "#1e2d6f", // navy
  orgEvents: "#c8922a", // gold
  peer: "#4a7c6f", // teal — orgs like yours
  other: "#c05746", // coral — other institution types
  neutral: "#8a8279", // warm gray
};

interface EventListing {
  id: string;
  name: string;
  event_date: string;
  attendee_count: number;
  short_description: string | null;
}

interface Props {
  attendance: AttendanceComparison;
  distribution: AttendanceDistribution;
  orgName: string;
  eventTypeLabel: string;
  organizationId: string;
  eventType: string;
}

// Turn the raw comparison into a one-line judgment, preferring the closest
// peer benchmark (orgs like yours) over the broad community average.
function buildAttendanceTakeaway(
  a: AttendanceComparison,
  typeLabel: string
): { tone: "growth" | "below" | "neutral"; text: string } {
  const type = typeLabel.toLowerCase();

  const read = (
    thisN: number,
    avg: number,
    phrase: string
  ): { tone: "growth" | "below" | "neutral"; text: string } => {
    const diff = Math.round(((thisN - avg) / avg) * 100);
    if (diff >= 15)
      return { tone: "growth", text: `Strong turnout — ${thisN} attended, ${diff}% above the average of ${avg} across ${phrase}.` };
    if (diff <= -15)
      return { tone: "below", text: `Light turnout — ${thisN} attended, ${Math.abs(diff)}% below the average of ${avg} across ${phrase}.` };
    return { tone: "neutral", text: `Solid turnout — ${thisN} attended, about in line with the average of ${avg} across ${phrase}.` };
  };

  // 1. Peers like you (other JCCs) — the most relevant benchmark.
  if (a.peerTypeCount >= 2 && a.peerTypeAvg > 0) {
    return read(a.thisEvent, a.peerTypeAvg, `${a.peerTypeCount} other ${orgTypeLabel(a.orgType)} ${type} events`);
  }
  // 2. The whole community.
  if (a.communityEventTypeCount >= 2 && a.communityEventTypeAvg > 0) {
    return read(a.thisEvent, a.communityEventTypeAvg, `${a.communityEventTypeCount} ${type} events community-wide`);
  }
  // 3. Your own history.
  if (a.orgEventTypeCount > 1 && a.orgEventTypeAvg > 0) {
    const r = read(a.thisEvent, a.orgEventTypeAvg, `your own ${type} events`);
    return { tone: r.tone, text: `${r.text} Not enough peer data yet to benchmark against other ${orgTypeLabel(a.orgType, true)}.` };
  }
  // 4. Nothing to compare against.
  return {
    tone: "neutral",
    text: `${a.thisEvent} attended. As more ${type} events are logged across the community, we'll be able to tell you whether that's a strong turnout for a ${orgTypeLabel(a.orgType)}.`,
  };
}

export function EventAttendanceSection({
  attendance,
  distribution,
  orgName,
  eventTypeLabel,
  organizationId,
  eventType,
}: Props) {
  const typeLabel = eventTypeLabel.charAt(0).toUpperCase() + eventTypeLabel.slice(1);
  const peerLabel = peerGroupLabel(attendance.orgType);
  const otherLabel = otherGroupLabel(attendance.orgType);
  const takeaway = buildAttendanceTakeaway(attendance, typeLabel);

  // Org events dialog (drill into your own events of this type).
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [events, setEvents] = useState<EventListing[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const orgLabel = `${orgName} (n=${attendance.orgEventTypeCount})`;

  type Row = { key: string; name: string; value: number; fill: string; clickable?: boolean };
  const rows: Row[] = [
    { key: "this", name: "This Event", value: attendance.thisEvent, fill: COLORS.thisEvent },
    { key: "org", name: orgLabel, value: attendance.orgEventTypeAvg, fill: COLORS.orgEvents, clickable: true },
  ];
  if (attendance.peerTypeCount > 0)
    rows.push({ key: "peer", name: `${peerLabel} (n=${attendance.peerTypeCount})`, value: attendance.peerTypeAvg, fill: COLORS.peer });
  if (attendance.otherTypeCount > 0)
    rows.push({ key: "other", name: `${otherLabel} (n=${attendance.otherTypeCount})`, value: attendance.otherTypeAvg, fill: COLORS.other });

  const rowByName = new Map(rows.map((r) => [r.name, r]));

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

  function renderYTick(props: { x: number; y: number; payload: { value: string } }) {
    const { x, y, payload } = props;
    const row = rowByName.get(payload.value);
    const clickable = !!row?.clickable;
    return (
      <text
        x={x}
        y={y}
        textAnchor="end"
        fontSize={12}
        dominantBaseline="middle"
        fill={clickable ? COLORS.orgEvents : "#666"}
        style={clickable ? { cursor: "pointer", textDecoration: "underline" } : undefined}
        onClick={() => clickable && setOrgDialogOpen(true)}
      >
        {payload.value}
      </text>
    );
  }

  return (
    <div className="space-y-4">
      <TakeawayLead tone={takeaway.tone}>{takeaway.text}</TakeawayLead>

      {/* Average-attendance comparison across peer groups */}
      <Card>
        <CardContent className="pt-6">
          <ChartContainer
            config={{ value: { label: "Avg. Attendees" } }}
            className="w-full"
            style={{ height: Math.max(180, rows.length * 52) }}
          >
            <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 30, top: 5, bottom: 5 }}>
              <XAxis
                type="number"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                label={{ value: "Avg. attendees per event", position: "bottom", fontSize: 12, fill: "#888" }}
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
                barSize={32}
                onClick={(d) => {
                  const row = rowByName.get((d as { name: string }).name);
                  if (row?.clickable) setOrgDialogOpen(true);
                }}
              >
                {rows.map((r) => (
                  <Cell key={r.key} fill={r.fill} cursor={r.clickable ? "pointer" : "default"} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Distribution: how many events land in each attendance range */}
      <DistributionCard
        distribution={distribution}
        thisEvent={attendance.thisEvent}
        typeLabel={typeLabel}
        peerLabel={peerLabel}
        otherLabel={otherLabel}
      />

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
                      <Link href={`/dashboard/events/${event.id}`} className="font-medium hover:underline">
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
                    <TableCell className="text-right font-medium">{event.attendee_count || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Distribution histogram with peer-group scope toggle ──

type Scope = "all" | "peer" | "other";

function DistributionCard({
  distribution,
  thisEvent,
  typeLabel,
  peerLabel,
  otherLabel,
}: {
  distribution: AttendanceDistribution;
  thisEvent: number;
  typeLabel: string;
  peerLabel: string;
  otherLabel: string;
}) {
  const { buckets, thisEventBucket, totals } = distribution;

  const scopes = (
    [
      { key: "all", label: "All community", color: COLORS.neutral },
      { key: "peer", label: peerLabel, color: COLORS.peer },
      { key: "other", label: otherLabel, color: COLORS.other },
    ] as { key: Scope; label: string; color: string }[]
  ).filter((s) => totals[s.key] > 0);

  const [scope, setScope] = useState<Scope>(
    totals.peer > 0 ? "peer" : "all"
  );

  if (buckets.length === 0 || scopes.length === 0) return null;

  const active = scopes.find((s) => s.key === scope) ?? scopes[0];
  const data = buckets
    .map((b) => ({ range: b.range, count: b[active.key] }))
    .filter((b) => b.count > 0);

  // Rough placement: share of this scope's events with fewer attendees.
  const scopeTotal = totals[active.key];
  const belowIdx = buckets.findIndex((b) => b.range === thisEventBucket);
  const below =
    belowIdx > 0
      ? buckets.slice(0, belowIdx).reduce((s, b) => s + b[active.key], 0)
      : 0;
  const pctBelow = scopeTotal > 0 ? Math.round((below / scopeTotal) * 100) : 0;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Attendance distribution</h3>
            <p className="text-sm text-muted-foreground">
              How many {typeLabel.toLowerCase()} events land in each attendance range
            </p>
          </div>
          {scopes.length > 1 && (
            <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
              {scopes.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setScope(s.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    scope === s.key
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.thisEvent }} />
          <span className="font-medium">Your event ({thisEvent} attendees)</span>
          <span className="text-muted-foreground">
            falls in the {thisEventBucket} range
            {scopeTotal >= 5 && ` — ahead of ~${pctBelow}% of ${active.label.toLowerCase()}`}
          </span>
        </div>

        <ChartContainer
          config={{ count: { label: "Events", color: active.color } }}
          className="h-[280px] w-full"
        >
          <BarChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
            <XAxis
              dataKey="range"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: "Attendees per event", position: "bottom", offset: 5, fontSize: 12, fill: "#888" }}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              label={{ value: "Number of events", angle: -90, position: "insideLeft", fontSize: 12, fill: "#888" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((b, i) => (
                <Cell key={i} fill={b.range === thisEventBucket ? COLORS.thisEvent : active.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
