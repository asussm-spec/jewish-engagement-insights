"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell, Legend } from "recharts";
import type { DemographicField } from "@/lib/event-analytics";

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
  "#e67e22", // orange
  "#27ae60", // green
  "#8e44ad", // dark purple
];

// Show up to this many charts by default; the rest go in the picker
const DEFAULT_CHART_COUNT = 4;

interface Props {
  fields: DemographicField[];
  totalAttendees: number;
}

export function EventDemographicsSection({ fields, totalAttendees }: Props) {
  // Default: show the first N fields (highest coverage)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(() => {
    const defaultKeys = new Set<string>();
    fields.slice(0, DEFAULT_CHART_COUNT).forEach((f) => defaultKeys.add(f.key));
    return defaultKeys;
  });

  const [showPicker, setShowPicker] = useState(false);

  const visibleFields = fields.filter((f) => visibleKeys.has(f.key));
  const hiddenFields = fields.filter((f) => !visibleKeys.has(f.key));

  function toggleField(key: string) {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  if (fields.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center py-8">
          <CardTitle className="text-lg">No demographic data available</CardTitle>
          <CardDescription>
            Demographic insights will appear as more attendee data is collected across events.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Field picker toggle */}
      {fields.length > DEFAULT_CHART_COUNT && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Showing:</span>
          {fields.map((field) => (
            <Badge
              key={field.key}
              variant={visibleKeys.has(field.key) ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => toggleField(field.key)}
            >
              {field.label}
              <span className="ml-1 text-[10px] opacity-70">
                {Math.round(field.coverage * 100)}%
              </span>
            </Badge>
          ))}
        </div>
      )}

      {/* Chart grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {visibleFields.map((field) => (
          <DemographicPieChart
            key={field.key}
            field={field}
            totalAttendees={totalAttendees}
          />
        ))}
      </div>
    </div>
  );
}

function DemographicPieChart({
  field,
  totalAttendees,
}: {
  field: DemographicField;
  totalAttendees: number;
}) {
  const chartConfig = Object.fromEntries(
    field.segments.map((s, i) => [
      s.name,
      { label: s.name, color: COLORS[i % COLORS.length] },
    ])
  );

  const coveragePct = Math.round(field.coverage * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{field.label}</CardTitle>
          <div className="flex items-baseline gap-1.5 text-xs shrink-0">
            <span className="font-semibold tabular-nums">n={field.total}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground tabular-nums">
              {coveragePct}% of {totalAttendees}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const pct = field.total > 0
                      ? Math.round(((value as number) / field.total) * 100)
                      : 0;
                    return `${value} (${pct}%)`;
                  }}
                />
              }
            />
            <Pie
              data={field.segments}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
              fontSize={11}
            >
              {field.segments.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
