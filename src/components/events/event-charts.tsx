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
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";

interface Profile {
  age_bucket: string | null;
  denomination: string | null;
}

const AGE_ORDER = [
  "0-5",
  "6-10",
  "11-15",
  "16-20",
  "21-30",
  "31-40",
  "41-50",
  "51-60",
  "61+",
];

const DENOM_LABELS: Record<string, string> = {
  reform: "Reform",
  conservative: "Conservative",
  orthodox: "Orthodox",
  reconstructionist: "Reconstructionist",
  just_jewish: "Just Jewish",
  other: "Other",
  unknown: "Unknown",
};

const COLORS = [
  "#1e2d6f",
  "#c8922a",
  "#4a7c6f",
  "#c05746",
  "#6b5fa0",
  "#2a3d8f",
  "#dbb35c",
  "#8a8279",
  "#3b58f5",
];

function countBy<T>(items: T[], key: (item: T) => string | null): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const val = key(item) || "Unknown";
    counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
}

export function EventCharts({ profiles }: { profiles: Profile[] }) {
  // Age distribution
  const ageCounts = countBy(profiles, (p) => p.age_bucket);
  const ageData = AGE_ORDER.filter((bucket) => ageCounts[bucket])
    .map((bucket) => ({
      name: bucket,
      count: ageCounts[bucket] || 0,
    }));

  // Denomination distribution
  const denomCounts = countBy(profiles, (p) => p.denomination);
  const denomData = Object.entries(denomCounts)
    .filter(([key]) => key !== "unknown" && key !== "Unknown")
    .map(([key, value]) => ({
      name: DENOM_LABELS[key] || key,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const ageChartConfig: Record<string, { label: string; color: string }> = {};
  AGE_ORDER.forEach((bucket, i) => {
    ageChartConfig[bucket] = {
      label: bucket,
      color: COLORS[i % COLORS.length],
    };
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Age distribution */}
      {ageData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Age distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Attendees", color: "#1e2d6f" },
              }}
              className="h-[280px]"
            >
              <BarChart data={ageData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#1e2d6f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Denomination breakdown */}
      {denomData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Denomination</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={Object.fromEntries(
                denomData.map((d, i) => [
                  d.name,
                  { label: d.name, color: COLORS[i % COLORS.length] },
                ])
              )}
              className="h-[280px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={denomData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  fontSize={11}
                >
                  {denomData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary stats */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-navy">
                {profiles.length}
              </p>
              <p className="text-sm text-muted-foreground">Total attendees</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy">
                {ageData.length}
              </p>
              <p className="text-sm text-muted-foreground">Age groups represented</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy">
                {denomData.length}
              </p>
              <p className="text-sm text-muted-foreground">Denominations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
