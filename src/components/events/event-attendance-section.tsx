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
  const data = [
    {
      name: "This Event",
      value: attendance.thisEvent,
      fill: COLORS.thisEvent,
    },
    {
      name: `All ${orgName} ${eventTypeLabel}`,
      value: attendance.orgEventTypeEvents,
      fill: COLORS.orgEvents,
    },
    {
      name: `All Communal ${eventTypeLabel}`,
      value: attendance.communityEventTypeEvents,
      fill: COLORS.community,
    },
  ];

  const chartConfig = {
    value: { label: "Unique Attendees" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Event Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px]">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" fontSize={12} tickLine={false} allowDecimals={false} />
            <YAxis
              dataKey="name"
              type="category"
              fontSize={12}
              tickLine={false}
              width={140}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
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
