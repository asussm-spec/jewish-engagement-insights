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
  allEvents: "#c8922a",   // gold
  eventType: "#4a7c6f",   // teal
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
      name: "All Events",
      value: attendance.allOrgEvents,
      fill: COLORS.allEvents,
    },
    {
      name: `All ${eventTypeLabel} Events`,
      value: attendance.orgEventTypeEvents,
      fill: COLORS.eventType,
    },
  ];

  const chartConfig = {
    value: { label: "Unique Attendees" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Compared to {orgName} Attendance
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
