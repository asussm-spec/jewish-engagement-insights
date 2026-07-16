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
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import type {
  BusinessUnitEngagement,
  ComparisonField,
  ComparisonSeries,
} from "@/lib/event-analytics";
import { SERIES_COLORS } from "./event-attendance-section";

// Sequential ramp (single hue, light→dark) for the ordinal number-of-children
// segments. Distinct from the three scope colors.
const CHILD_RAMP = ["#e3e0f0", "#b4aad6", "#8879b8", "#5f4d99"];
const NOT_ENROLLED_COLOR = "var(--stone-200)";

interface ScopeMeta {
  key: "event" | "org" | "community";
  label: string;
  color: string;
}

interface Props {
  fields: ComparisonField[];
  businessUnits: {
    units: BusinessUnitEngagement[];
    withInterestData: number;
    totalAttendees: number;
  };
  orgName: string;
  eventTypeLabel: string;
  totalAttendees: number;
}

export function DemographicComparisonSection({
  fields,
  businessUnits,
  orgName,
  eventTypeLabel,
  totalAttendees,
}: Props) {
  const typeLabel =
    eventTypeLabel.charAt(0).toUpperCase() + eventTypeLabel.slice(1);
  const scopes: ScopeMeta[] = [
    { key: "event", label: "This event", color: SERIES_COLORS.thisEvent },
    {
      key: "org",
      label: `${orgName} ${typeLabel.toLowerCase()} events`,
      color: SERIES_COLORS.org,
    },
    {
      key: "community",
      label: `All communal ${typeLabel.toLowerCase()} events`,
      color: SERIES_COLORS.community,
    },
  ];

  const byKey = Object.fromEntries(fields.map((f) => [f.key, f]));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {byKey.age && (
          <GroupedComparisonCard
            field={byKey.age}
            scopes={scopes}
            totalAttendees={totalAttendees}
            helper="Did this event skew younger or hit its core demographic?"
          />
        )}
        {byKey.denomination && (
          <GroupedComparisonCard
            field={byKey.denomination}
            scopes={scopes}
            totalAttendees={totalAttendees}
          />
        )}
      </div>

      {byKey.children && (
        <StackedScopeCard
          field={byKey.children}
          scopes={scopes}
          totalAttendees={totalAttendees}
          colors={CHILD_RAMP}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {byKey.day_school && (
          <EnrollmentCard
            field={byKey.day_school}
            scopes={scopes}
            totalAttendees={totalAttendees}
          />
        )}
        {byKey.hebrew_school && (
          <EnrollmentCard
            field={byKey.hebrew_school}
            scopes={scopes}
            totalAttendees={totalAttendees}
          />
        )}
      </div>

      <BusinessUnitCard
        data={businessUnits}
        orgName={orgName}
      />
    </div>
  );
}

// ── Shared bits ──

function CoverageCaption({
  series,
  scopes,
  totalAttendees,
}: {
  series: ComparisonSeries[];
  scopes: ScopeMeta[];
  totalAttendees: number;
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
      {series.map((s, i) => (
        <span
          key={s.scope}
          className="inline-flex items-center gap-1.5 text-[11px]"
          style={{ color: "var(--stone-500)" }}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: scopes[i].color }}
          />
          {scopes[i].label}:{" "}
          <span className="tabular-nums">
            {s.scope === "event"
              ? `n=${s.n} of ${totalAttendees}`
              : `n=${s.n.toLocaleString()} across ${s.eventCount} events`}
          </span>
        </span>
      ))}
    </div>
  );
}

function NoEventData({ label }: { label: string }) {
  return (
    <p className="text-sm text-muted-foreground py-8 text-center">
      No {label.toLowerCase()} data for this event&apos;s attendees yet.
    </p>
  );
}

// ── Grouped % comparison (age, denomination) ──

function GroupedComparisonCard({
  field,
  scopes,
  totalAttendees,
  helper,
}: {
  field: ComparisonField;
  scopes: ScopeMeta[];
  totalAttendees: number;
  helper?: string;
}) {
  const [eventS, orgS, communityS] = field.series;
  const rows = field.segmentOrder
    .map((name) => {
      const pctFor = (s: ComparisonSeries) =>
        s.segments.find((x) => x.name === name)?.pct ?? 0;
      return {
        name,
        event: pctFor(eventS),
        org: pctFor(orgS),
        community: pctFor(communityS),
      };
    })
    .filter((r) => r.event > 0 || r.org > 0 || r.community > 0);

  const chartConfig = Object.fromEntries(
    scopes.map((s) => [s.key, { label: s.label, color: s.color }])
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{field.label}</CardTitle>
        {helper && (
          <p className="text-xs text-muted-foreground">{helper}</p>
        )}
      </CardHeader>
      <CardContent>
        {eventS.n === 0 ? (
          <NoEventData label={field.label} />
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <BarChart
                data={rows}
                margin={{ left: 0, right: 8, top: 8, bottom: 4 }}
                barCategoryGap="22%"
                barGap={2}
              >
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  tickFormatter={(v) => `${v}%`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const scope = scopes.find((s) => s.key === name);
                        return [`${value}%`, scope?.label ?? String(name)];
                      }}
                    />
                  }
                />
                <Legend
                  formatter={(value) =>
                    scopes.find((s) => s.key === value)?.label ?? value
                  }
                  wrapperStyle={{ fontSize: 11 }}
                />
                {scopes.map((s) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    fill={s.color}
                    radius={[3, 3, 0, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
            <CoverageCaption
              series={field.series}
              scopes={scopes}
              totalAttendees={totalAttendees}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── 100% stacked rows per scope (number of children) ──

function StackedScopeCard({
  field,
  scopes,
  totalAttendees,
  colors,
}: {
  field: ComparisonField;
  scopes: ScopeMeta[];
  totalAttendees: number;
  colors: string[];
}) {
  const [eventS] = field.series;
  const rows = field.series.map((s, i) => {
    const row: Record<string, string | number> = {
      scope: scopes[i].label,
    };
    for (const name of field.segmentOrder) {
      row[name] = s.segments.find((x) => x.name === name)?.pct ?? 0;
    }
    return row;
  });

  const chartConfig = Object.fromEntries(
    field.segmentOrder.map((name, i) => [
      name,
      { label: name, color: colors[i % colors.length] },
    ])
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{field.label}</CardTitle>
      </CardHeader>
      <CardContent>
        {eventS.n === 0 ? (
          <NoEventData label={field.label} />
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[190px] w-full">
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ left: 0, right: 8, top: 4, bottom: 4 }}
                barCategoryGap="28%"
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  dataKey="scope"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={210}
                  fontSize={11}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [`${value}%`, String(name)]}
                    />
                  }
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {field.segmentOrder.map((name, i) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    stackId="scope"
                    fill={colors[i % colors.length]}
                    stroke="var(--paper-50)"
                    strokeWidth={2}
                  >
                    <LabelList
                      dataKey={name}
                      position="center"
                      formatter={(v) => (Number(v) >= 10 ? `${v}%` : "")}
                      style={{
                        fontSize: 10,
                        fill: i >= 2 ? "#ffffff" : "var(--ink-800)",
                      }}
                    />
                  </Bar>
                ))}
              </BarChart>
            </ChartContainer>
            <CoverageCaption
              series={field.series}
              scopes={scopes}
              totalAttendees={totalAttendees}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Enrollment (day school / Hebrew school): filled share per scope row ──

function EnrollmentCard({
  field,
  scopes,
  totalAttendees,
}: {
  field: ComparisonField;
  scopes: ScopeMeta[];
  totalAttendees: number;
}) {
  const [eventS] = field.series;
  const rows = field.series.map((s, i) => ({
    scope: scopes[i].label,
    enrolled: s.segments.find((x) => x.name === "Enrolled")?.pct ?? 0,
    notEnrolled: s.segments.find((x) => x.name === "Not enrolled")?.pct ?? 0,
    n: s.n,
  }));

  const chartConfig = {
    enrolled: { label: "Enrolled" },
    notEnrolled: { label: "Not enrolled" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{field.label}</CardTitle>
      </CardHeader>
      <CardContent>
        {eventS.n === 0 ? (
          <NoEventData label={field.label} />
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[170px] w-full">
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ left: 0, right: 8, top: 4, bottom: 4 }}
                barCategoryGap="28%"
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  dataKey="scope"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={210}
                  fontSize={11}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        `${value}%`,
                        name === "enrolled" ? "Enrolled" : "Not enrolled",
                      ]}
                    />
                  }
                />
                <Bar
                  dataKey="enrolled"
                  stackId="scope"
                  stroke="var(--paper-50)"
                  strokeWidth={2}
                >
                  {rows.map((_, i) => (
                    <Cell key={i} fill={scopes[i].color} />
                  ))}
                  <LabelList
                    dataKey="enrolled"
                    position="center"
                    formatter={(v) => (Number(v) >= 8 ? `${v}%` : "")}
                    style={{ fontSize: 10, fill: "#ffffff" }}
                  />
                </Bar>
                <Bar
                  dataKey="notEnrolled"
                  stackId="scope"
                  fill={NOT_ENROLLED_COLOR}
                  stroke="var(--paper-50)"
                  strokeWidth={2}
                />
              </BarChart>
            </ChartContainer>
            <CoverageCaption
              series={field.series}
              scopes={scopes}
              totalAttendees={totalAttendees}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Business-unit engagement (this event's attendees at this org) ──

function BusinessUnitCard({
  data,
  orgName,
}: {
  data: {
    units: BusinessUnitEngagement[];
    withInterestData: number;
    totalAttendees: number;
  };
  orgName: string;
}) {
  const rows = data.units.map((u) => ({
    name: `${u.unit} (kids ${u.ageRange})`,
    pct: u.pct,
    engaged: u.engaged,
    eligible: u.eligible,
  }));

  const chartConfig = { pct: { label: "% of eligible families" } };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          What else do these families do at {orgName}?
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Share of attendees with age-eligible kids who engage with each
          program area. Based on {data.withInterestData} of{" "}
          {data.totalAttendees} attendees with program data.
        </p>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No attendees with age-eligible kids and program data yet.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: 60 + rows.length * 44 }}
          >
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ left: 0, right: 48, top: 4, bottom: 4 }}
              barCategoryGap="30%"
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={190}
                fontSize={11}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const p = item?.payload as {
                        engaged?: number;
                        eligible?: number;
                      };
                      return `${value}% — ${p?.engaged} of ${p?.eligible} eligible families`;
                    }}
                  />
                }
              />
              <Bar
                dataKey="pct"
                fill={SERIES_COLORS.thisEvent}
                radius={[0, 3, 3, 0]}
                barSize={22}
              >
                <LabelList
                  dataKey="pct"
                  position="right"
                  formatter={(v) => `${v}%`}
                  style={{ fontSize: 11, fill: "var(--ink-800)" }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
