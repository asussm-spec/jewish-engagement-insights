"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import type { AttendanceComparison } from "@/lib/event-analytics";

const COLORS = {
  thisEvent: "#1e2d6f",   // navy
  orgEvents: "#c8922a",   // gold
  community: "#4a7c6f",   // teal
};

interface Props {
  attendance: AttendanceComparison;
  orgName: string;
  eventTypeLabel: string;
}

export function EventAttendanceSection({ attendance, orgName, eventTypeLabel }: Props) {
  const typeLabel = eventTypeLabel.charAt(0).toUpperCase() + eventTypeLabel.slice(1);

  const data = [
    {
      name: `This Event`,
      value: attendance.thisEvent,
      detail: `${attendance.thisEvent} attendees`,
      fill: COLORS.thisEvent,
    },
    {
      name: `Avg. ${orgName} ${typeLabel} Event (n=${attendance.orgEventTypeCount})`,
      value: attendance.orgEventTypeAvg,
      detail: `${attendance.orgEventTypeAvg} avg. attendees across ${attendance.orgEventTypeCount} events`,
      fill: COLORS.orgEvents,
    },
    {
      name: `Avg. Communal ${typeLabel} Event (n=${attendance.communityEventTypeCount})`,
      value: attendance.communityEventTypeAvg,
      detail: `${attendance.communityEventTypeAvg} avg. attendees across ${attendance.communityEventTypeCount} events`,
      fill: COLORS.community,
    },
  ];

  const chartConfig = {
    value: { label: "Unique Attendees" },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Labels above the chart */}
        <div className="space-y-6 mb-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-sm text-muted-foreground">
                — {item.detail}
              </span>
            </div>
          ))}
        </div>
        <ChartContainer config={chartConfig} className="h-[160px]">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" fontSize={12} tickLine={false} allowDecimals={false} />
            <YAxis hide />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
