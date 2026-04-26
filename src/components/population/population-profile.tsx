"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
  LabelList,
} from "recharts";
import { Users, Home, Baby, TrendingUp, MapPin, Database, ArrowUp, ArrowDown } from "lucide-react";
import type { PopulationSummary, QuarterlyChange } from "@/lib/mock-population-data";

const PIE_COLORS = [
  "#1e2d6f", // navy
  "#c8922a", // gold
  "#4a7c6f", // teal
  "#c05746", // coral
  "#6b5fa0", // purple
  "#2a3d8f", // blue
  "#dbb35c", // light gold
  "#8a8279", // warm gray
];

const ENGAGEMENT_COLORS: Record<string, string> = {
  "Highly Engaged": "#27ae60",
  "Regularly Engaged": "#4a7c6f",
  "Occasionally Engaged": "#c8922a",
  "Members Only": "#8a8279",
};

const CHILD_AGE_COLORS = ["#1e2d6f", "#c8922a", "#4a7c6f", "#c05746", "#6b5fa0"];

interface Props {
  data: PopulationSummary;
}

function DeltaBadge({ change, className = "" }: { change?: QuarterlyChange; className?: string }) {
  if (!change || change.delta === 0) return null;
  const up = change.delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums ${
        up ? "text-emerald-600" : "text-red-500"
      } ${className}`}
    >
      {up ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {up ? "+" : ""}{change.delta}
    </span>
  );
}

function deltaLabel(changes: Record<string, QuarterlyChange>, name: string): string {
  const c = changes[name];
  if (!c || c.delta === 0) return "";
  return c.delta > 0 ? `+${c.delta}` : `${c.delta}`;
}

function QuarterBadge({ date }: { date: string }) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return (
    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
      vs. {label}
    </span>
  );
}

export function PopulationProfile({ data }: Props) {
  const [periodKey, setPeriodKey] = useState(data.comparisonPeriods[0]?.key ?? "");
  const selectedPeriod = data.comparisonPeriods.find((p) => p.key === periodKey) ?? data.comparisonPeriods[0];
  const qc = selectedPeriod?.changes ?? {};
  const snapshotDate = selectedPeriod?.snapshotDate ?? "";
  const entityLabel = data.entityLabel ?? "Members";
  const entityLabelLower = entityLabel.toLowerCase();
  const showMembershipTypes = data.membershipTypes.length > 0;
  const showHouseholds = data.totalHouseholds > 0;
  const showGender = data.genderSplit.length > 0;
  const showTenure = data.joinYearBuckets.length > 0;
  const showCompleteness = data.dataCompleteness.length > 0;
  const showProgramParticipation = data.programParticipation.length > 0;
  const row4Cols = [showTenure, showGender, showCompleteness].filter(Boolean).length;
  const row4Class = row4Cols === 3 ? "md:grid-cols-3" : row4Cols === 2 ? "md:grid-cols-2" : "";

  // Enrich bar data with delta labels for Recharts LabelList
  const ageBucketsWithDelta = data.ageBuckets.map((b) => ({
    ...b,
    delta: deltaLabel(qc, b.name),
  }));

  const programsWithDelta = data.programParticipation.map((p) => ({
    ...p,
    delta: deltaLabel(qc, p.name),
  }));

  const zipCodesWithDelta = data.zipCodes.map((z) => ({
    ...z,
    delta: deltaLabel(qc, z.name),
  }));

  return (
    <div className="space-y-6">
      {/* Comparison period selector */}
      {data.comparisonPeriods.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Compare to</span>
          <Select value={periodKey} onValueChange={(v) => v && setPeriodKey(v)}>
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.comparisonPeriods.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label} ago
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            ({new Date(snapshotDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})
          </span>
        </div>
      )}

      {/* KPI summary row */}
      <div className={`grid gap-4 ${showHouseholds ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label={`Total ${entityLabel}`}
          value={data.totalMembers.toLocaleString()}
          change={qc.totalMembers}
        />
        {showHouseholds && (
          <KpiCard
            icon={<Home className="h-5 w-5" />}
            label="Households"
            value={data.totalHouseholds.toLocaleString()}
            change={qc.totalHouseholds}
          />
        )}
        <KpiCard
          icon={<Baby className="h-5 w-5" />}
          label="Children"
          value={data.familyStats.totalChildren.toLocaleString()}
          sub={
            showHouseholds
              ? `${data.familyStats.percentWithChildren}% of households have children`
              : `${data.familyStats.percentWithChildren}% of ${entityLabelLower} have children`
          }
          change={qc.totalChildren}
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Engaged (1+ event)"
          value={`${Math.round((data.engagementTiers.filter((t) => t.name !== "Members Only").reduce((s, t) => s + t.value, 0) / data.totalMembers) * 100)}%`}
          sub={`${data.engagementTiers.filter((t) => t.name !== "Members Only").reduce((s, t) => s + t.value, 0)} of ${data.totalMembers} ${entityLabelLower}`}
        />
      </div>

      {/* Row 1: Age distribution + Membership types */}
      <div className={`grid gap-6 ${showMembershipTypes ? "md:grid-cols-2" : ""}`}>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Age Distribution</CardTitle>
                <CardDescription>
                  All {entityLabelLower} by age bracket (n={data.ageBuckets.reduce((s, b) => s + b.value, 0)})
                </CardDescription>
              </div>
              <QuarterBadge date={snapshotDate} />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: "Members", color: "#1e2d6f" } }}
              className="h-[280px]"
            >
              <BarChart data={ageBucketsWithDelta}>
                <XAxis dataKey="name" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => {
                        const total = data.ageBuckets.reduce((s, b) => s + b.value, 0);
                        const pct = Math.round(((value as number) / total) * 100);
                        const change = qc[item.payload.name];
                        const changeStr = change ? ` (${change.delta > 0 ? "+" : ""}${change.delta} vs last quarter)` : "";
                        return `${value} (${pct}%)${changeStr}`;
                      }}
                    />
                  }
                />
                <Bar dataKey="value" fill="#1e2d6f" radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="delta"
                    position="top"
                    fontSize={9}
                    fontWeight={600}
                    fill="#059669"
                    content={({ x, y, width, value }: any) => {
                      if (!value) return null;
                      const isNeg = String(value).startsWith("-");
                      return (
                        <text
                          x={x + width / 2}
                          y={y - 4}
                          textAnchor="middle"
                          fontSize={9}
                          fontWeight={600}
                          fill={isNeg ? "#ef4444" : "#059669"}
                        >
                          {value}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {showMembershipTypes && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Membership Types</CardTitle>
                <CardDescription>
                  {showHouseholds
                    ? `${data.totalHouseholds.toLocaleString()} households`
                    : `${data.membershipTypes.reduce((s, m) => s + m.value, 0).toLocaleString()} ${entityLabelLower}`}
                </CardDescription>
              </div>
              <QuarterBadge date={snapshotDate} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.membershipTypes.map((type, i) => {
                const total = data.membershipTypes.reduce((s, m) => s + m.value, 0);
                const pct = Math.round((type.value / total) * 100);
                const change = qc[type.name];
                return (
                  <div key={type.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-sm flex-1">{type.name}</span>
                    <span className="text-sm tabular-nums font-medium">{type.value} ({pct}%)</span>
                    <DeltaBadge change={change} />
                  </div>
                );
              })}
            </div>
            <ChartContainer
              config={Object.fromEntries(
                data.membershipTypes.map((m, i) => [m.name, { label: m.name, color: PIE_COLORS[i] }])
              )}
              className="h-[200px] mt-2"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => {
                        const total = data.membershipTypes.reduce((s, m) => s + m.value, 0);
                        const pct = Math.round(((value as number) / total) * 100);
                        return `${value} (${pct}%)`;
                      }}
                    />
                  }
                />
                <Pie
                  data={data.membershipTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fontSize={10}
                >
                  {data.membershipTypes.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Row 2: Program Participation + Engagement tiers */}
      <div className={`grid gap-6 ${showProgramParticipation ? "md:grid-cols-2" : ""}`}>
        {showProgramParticipation && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Program Participation</CardTitle>
                <CardDescription>
                  {entityLabel} who attended 1+ event by program type (past 12 months)
                </CardDescription>
              </div>
              <QuarterBadge date={snapshotDate} />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: "Members", color: "#1e2d6f" } }}
              className="h-[280px]"
            >
              <BarChart data={programsWithDelta} layout="vertical" margin={{ left: 10, right: 35 }}>
                <XAxis type="number" fontSize={11} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} width={130} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => {
                        const pct = Math.round(((value as number) / data.totalMembers) * 100);
                        const change = qc[item.payload.name];
                        const changeStr = change ? ` (${change.delta > 0 ? "+" : ""}${change.delta} vs last quarter)` : "";
                        return `${value} members (${pct}%)${changeStr}`;
                      }}
                    />
                  }
                />
                <Bar dataKey="value" fill="#1e2d6f" radius={[0, 4, 4, 0]}>
                  <LabelList
                    dataKey="delta"
                    position="right"
                    content={({ x, y, width, height, value }: any) => {
                      if (!value) return null;
                      const isNeg = String(value).startsWith("-");
                      return (
                        <text
                          x={x + width + 4}
                          y={y + height / 2 + 3}
                          fontSize={9}
                          fontWeight={600}
                          fill={isNeg ? "#ef4444" : "#059669"}
                        >
                          {value}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Engagement Tiers</CardTitle>
                <CardDescription>Based on event attendance in the past 12 months</CardDescription>
              </div>
              <QuarterBadge date={snapshotDate} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-1">
              {data.engagementTiers.map((tier) => {
                const pct = Math.round((tier.value / data.totalMembers) * 100);
                const change = qc[tier.name];
                return (
                  <div key={tier.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tier.name}</span>
                        <span className="text-xs text-muted-foreground">{tier.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DeltaBadge change={change} />
                        <span className="text-sm font-medium tabular-nums">{tier.value} ({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: ENGAGEMENT_COLORS[tier.name] || "#8a8279",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Family profile + Geography */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Family Profile</CardTitle>
                <CardDescription>Children and family composition</CardDescription>
              </div>
              <QuarterBadge date={snapshotDate} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-navy">{data.familyStats.percentWithChildren}%</p>
                  <p className="text-xs text-muted-foreground">Have children</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy">{data.familyStats.avgChildrenPerFamily}</p>
                  <p className="text-xs text-muted-foreground">Avg per family</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-2xl font-bold text-navy">{data.familyStats.totalChildren}</p>
                    <DeltaBadge change={qc.totalChildren} />
                  </div>
                  <p className="text-xs text-muted-foreground">Total children</p>
                </div>
              </div>

              {data.familyStats.totalChildren > 0 && data.familyStats.childAgeBuckets.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Children by age group</p>
                <div className="space-y-1.5">
                  {data.familyStats.childAgeBuckets.map((bucket, i) => {
                    const maxVal = Math.max(...data.familyStats.childAgeBuckets.map((b) => b.value));
                    const widthPct = Math.round((bucket.value / maxVal) * 100);
                    const pct = Math.round((bucket.value / data.familyStats.totalChildren) * 100);
                    const change = qc[bucket.name];
                    return (
                      <div key={bucket.name} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-28 shrink-0">{bucket.name}</span>
                        <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${widthPct}%`,
                              backgroundColor: CHILD_AGE_COLORS[i],
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums w-14 text-right shrink-0">{bucket.value} ({pct}%)</span>
                        <span className="w-8 shrink-0"><DeltaBadge change={change} /></span>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Geographic Distribution</CardTitle>
              </div>
              <QuarterBadge date={snapshotDate} />
            </div>
            <CardDescription>
              Top zip codes by {showHouseholds ? "household" : entityLabelLower.replace(/s$/, "")} count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: "Households", color: "#1e2d6f" } }}
              className="h-[300px]"
            >
              <BarChart data={zipCodesWithDelta} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" fontSize={11} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} width={120} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => {
                        const denom = showHouseholds ? data.totalHouseholds : data.totalMembers;
                        const pct = Math.round(((value as number) / denom) * 100);
                        const change = qc[item.payload.name];
                        const changeStr = change ? ` (${change.delta > 0 ? "+" : ""}${change.delta} vs last quarter)` : "";
                        return `${value} ${showHouseholds ? "households" : entityLabelLower} (${pct}%)${changeStr}`;
                      }}
                    />
                  }
                />
                <Bar dataKey="value" fill="#1e2d6f" radius={[0, 4, 4, 0]}>
                  <LabelList
                    dataKey="delta"
                    position="right"
                    content={({ x, y, width, height, value }: any) => {
                      if (!value) return null;
                      const isNeg = String(value).startsWith("-");
                      return (
                        <text
                          x={x + width + 4}
                          y={y + height / 2 + 3}
                          fontSize={9}
                          fontWeight={600}
                          fill={isNeg ? "#ef4444" : "#059669"}
                        >
                          {value}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Join year + Gender + Data completeness */}
      {row4Cols > 0 && (
      <div className={`grid gap-6 ${row4Class}`}>
        {showTenure && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Membership Tenure</CardTitle>
            <CardDescription>When {entityLabelLower} joined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 pt-1">
              {data.joinYearBuckets.map((bucket) => {
                const maxVal = Math.max(...data.joinYearBuckets.map((b) => b.value));
                const widthPct = Math.round((bucket.value / maxVal) * 100);
                return (
                  <div key={bucket.name} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">{bucket.name}</span>
                    <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${widthPct}%`, backgroundColor: "#4a7c6f" }}
                      />
                    </div>
                    <span className="text-xs font-medium tabular-nums w-7 text-right shrink-0">{bucket.value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        )}

        {showGender && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gender</CardTitle>
            <CardDescription>
              {data.totalMembers > 0
                ? Math.round((data.genderSplit.reduce((s, g) => s + g.value, 0) / data.totalMembers) * 100)
                : 0}% coverage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-1">
              {data.genderSplit.map((g, i) => {
                const total = data.genderSplit.reduce((s, x) => s + x.value, 0);
                const pct = Math.round((g.value / total) * 100);
                return (
                  <div key={g.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                        <span className="text-sm">{g.name}</span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{g.value} ({pct}%)</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        )}

        {showCompleteness && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Data Completeness</CardTitle>
            </div>
            <CardDescription>Coverage by field across all {entityLabelLower}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 pt-1">
              {data.dataCompleteness.map((field) => {
                const pct = Math.round(field.coverage * 100);
                const color = pct >= 80 ? "#27ae60" : pct >= 50 ? "#c8922a" : "#c05746";
                return (
                  <div key={field.field} className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground w-[88px] shrink-0 truncate">{field.field}</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-[11px] font-medium tabular-nums w-9 text-right shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
      )}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  change?: QuarterlyChange;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {change && <DeltaBadge change={change} className="text-xs" />}
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
        {sub && <p className="mt-2 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
