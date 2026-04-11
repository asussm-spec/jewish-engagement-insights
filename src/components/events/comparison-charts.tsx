"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell, Legend } from "recharts";
import type { DemographicBreakdown } from "@/lib/event-analytics";

const COLORS = [
  "#1e2d6f", // navy
  "#c8922a", // gold
  "#4a7c6f", // teal
  "#c05746", // coral
  "#6b5fa0", // purple
  "#2a3d8f", // blue
  "#dbb35c", // light gold
  "#8a8279", // warm gray
  "#3b58f5", // bright blue
];

const COMPARISON_COLORS = {
  thisEvent: "#1e2d6f",   // navy
  orgEvents: "#c8922a",   // gold
  community: "#4a7c6f",   // teal
};

interface Props {
  thisEvent: DemographicBreakdown;
  orgEvents: DemographicBreakdown;
  communityEvents: DemographicBreakdown;
  eventTypeLabel: string;
  orgName: string;
}

export function ComparisonCharts({
  thisEvent,
  orgEvents,
  communityEvents,
  eventTypeLabel,
  orgName,
}: Props) {
  // Build combined age data for grouped bar chart
  const allAgeBuckets = new Set<string>();
  [thisEvent, orgEvents, communityEvents].forEach((ds) =>
    ds.ageBuckets.forEach((b) => allAgeBuckets.add(b.name))
  );

  const AGE_ORDER = [
    "0-5", "6-10", "11-15", "16-20", "21-30",
    "31-40", "41-50", "51-60", "61+",
  ];

  const ageComparisonData = AGE_ORDER.filter((b) => allAgeBuckets.has(b)).map(
    (bucket) => ({
      name: bucket,
      "This event": thisEvent.ageBuckets.find((b) => b.name === bucket)?.count || 0,
      [`${orgName}`]: orgEvents.ageBuckets.find((b) => b.name === bucket)?.count || 0,
      "Community": communityEvents.ageBuckets.find((b) => b.name === bucket)?.count || 0,
    })
  );

  // Denomination data — show as percentage for fair comparison
  function toPercentage(items: { name: string; value: number }[], total: number) {
    return items.map((item) => ({
      name: item.name,
      value: total > 0 ? Math.round((item.value / total) * 100) : 0,
    }));
  }

  const DENOM_LABELS: Record<string, string> = {
    Reform: "Reform",
    Conservative: "Conservative",
    Orthodox: "Orthodox",
    Reconstructionist: "Recon.",
    "Just Jewish": "Just Jewish",
    Other: "Other",
  };

  // Build denomination comparison data
  const allDenoms = new Set<string>();
  [thisEvent, orgEvents, communityEvents].forEach((ds) =>
    ds.denominations.forEach((d) => allDenoms.add(d.name))
  );

  const denomComparisonData = [...allDenoms].map((denom) => ({
    name: DENOM_LABELS[denom] || denom,
    "This event": thisEvent.totalAttendees > 0
      ? Math.round(((thisEvent.denominations.find((d) => d.name === denom)?.value || 0) / thisEvent.totalAttendees) * 100)
      : 0,
    [`${orgName}`]: orgEvents.totalAttendees > 0
      ? Math.round(((orgEvents.denominations.find((d) => d.name === denom)?.value || 0) / orgEvents.totalAttendees) * 100)
      : 0,
    "Community": communityEvents.totalAttendees > 0
      ? Math.round(((communityEvents.denominations.find((d) => d.name === denom)?.value || 0) / communityEvents.totalAttendees) * 100)
      : 0,
  }));

  // Family comparison
  const familyComparisonData = [
    {
      name: "Have children",
      "This event": thisEvent.hasChildrenPct,
      [`${orgName}`]: orgEvents.hasChildrenPct,
      "Community": communityEvents.hasChildrenPct,
    },
  ];

  const chartConfig = {
    "This event": { label: "This event", color: COMPARISON_COLORS.thisEvent },
    [orgName]: { label: orgName, color: COMPARISON_COLORS.orgEvents },
    Community: { label: "Community", color: COMPARISON_COLORS.community },
  };

  return (
    <div className="space-y-6">
      {/* Age distribution comparison */}
      {ageComparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Age distribution — this event vs. {orgName} vs. community {eventTypeLabel} events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[320px]">
              <BarChart data={ageComparisonData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="This event" fill={COMPARISON_COLORS.thisEvent} radius={[2, 2, 0, 0]} />
                <Bar dataKey={orgName} fill={COMPARISON_COLORS.orgEvents} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Community" fill={COMPARISON_COLORS.community} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Denomination comparison */}
        {denomComparisonData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Denomination (% of attendees)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px]">
                <BarChart data={denomComparisonData} layout="vertical">
                  <XAxis type="number" fontSize={12} tickLine={false} unit="%" />
                  <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="This event" fill={COMPARISON_COLORS.thisEvent} radius={[0, 2, 2, 0]} />
                  <Bar dataKey={orgName} fill={COMPARISON_COLORS.orgEvents} radius={[0, 2, 2, 0]} />
                  <Bar dataKey="Community" fill={COMPARISON_COLORS.community} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Family / children comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Family profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 pt-2">
              {/* Percent with children */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">% with children</p>
                <div className="space-y-2">
                  {[
                    { label: "This event", value: thisEvent.hasChildrenPct, color: COMPARISON_COLORS.thisEvent },
                    { label: orgName, value: orgEvents.hasChildrenPct, color: COMPARISON_COLORS.orgEvents },
                    { label: "Community", value: communityEvents.hasChildrenPct, color: COMPARISON_COLORS.community },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-24 truncate">{item.label}</span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.value}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Average children */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Avg. children (among parents)</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "This event", value: thisEvent.avgChildren, color: COMPARISON_COLORS.thisEvent },
                    { label: orgName, value: orgEvents.avgChildren, color: COMPARISON_COLORS.orgEvents },
                    { label: "Community", value: communityEvents.avgChildren, color: COMPARISON_COLORS.community },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-2xl font-bold" style={{ color: item.color }}>
                        {item.value ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total unique attendees */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Total unique attendees</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "This event", value: thisEvent.totalAttendees, color: COMPARISON_COLORS.thisEvent },
                    { label: orgName, value: orgEvents.totalAttendees, color: COMPARISON_COLORS.orgEvents },
                    { label: "Community", value: communityEvents.totalAttendees, color: COMPARISON_COLORS.community },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-2xl font-bold" style={{ color: item.color }}>
                        {item.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
