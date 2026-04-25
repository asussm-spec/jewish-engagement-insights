"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Building2, Network, Users } from "lucide-react";
import type { CrossOrgInsights as CrossOrgData } from "@/lib/population-aggregator";

interface Props {
  data: CrossOrgData;
  segmentLabel: string;
  thisOrgName: string;
}

const ORG_TYPE_COLORS: Record<string, string> = {
  synagogue: "#1e2d6f",
  day_school: "#c8922a",
  camp: "#4a7c6f",
  jcc: "#c05746",
  federation: "#6b5fa0",
  youth_org: "#2a3d8f",
  social_service: "#8a8279",
  other: "#dbb35c",
};

const BREADTH_COLORS: Record<string, string> = {
  "1 (only this org)": "#8a8279",
  "2 orgs": "#4a7c6f",
  "3 orgs": "#c8922a",
  "4+ orgs": "#1e2d6f",
};

export function CrossOrgInsightsView({ data, segmentLabel, thisOrgName }: Props) {
  const segmentLower = segmentLabel.toLowerCase();
  const noData =
    data.affiliationByType.length === 0 &&
    data.programShare.length === 0 &&
    data.engagementBreadth.length === 0;

  if (noData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h2
          className="font-serif"
          style={{
            fontWeight: 500,
            fontSize: 22,
            color: "var(--ink-800)",
            letterSpacing: "-0.01em",
          }}
        >
          Cross-organizational footprint
        </h2>
        <p style={{ fontSize: 13, color: "var(--ds-fg-muted)" }}>
          How {segmentLower} interact across the broader Jewish ecosystem ·{" "}
          {data.totalEcosystemOrgs} other orgs in scope
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Cross-affiliation */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Where else do they belong?</CardTitle>
            </div>
            <CardDescription>
              Share of {segmentLower} who also belong to or interact with another org type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-1">
              {data.affiliationByType.map((row) => (
                <div key={row.orgType}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: ORG_TYPE_COLORS[row.orgType] ?? "#888" }}
                      />
                      <span className="text-sm font-medium">{row.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm tabular-nums font-medium">
                        {row.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">
                        {row.pctOfSegment}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.pctOfSegment}%`,
                        backgroundColor: ORG_TYPE_COLORS[row.orgType] ?? "#888",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {data.topOverlappingOrgs.length > 0 && (
              <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--ds-border)" }}>
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Top overlapping orgs
                </p>
                <div className="space-y-1">
                  {data.topOverlappingOrgs.slice(0, 5).map((o) => (
                    <div key={o.orgId} className="flex items-center justify-between text-xs">
                      <span style={{ color: "var(--ink-700)" }}>{o.name}</span>
                      <span className="tabular-nums" style={{ color: "var(--ds-fg-muted)" }}>
                        {o.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Engagement breadth */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">How wide is their footprint?</CardTitle>
            </div>
            <CardDescription>
              Distinct orgs each {segmentLower.replace(/s$/, "")} touches via membership or events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-1">
              {data.engagementBreadth.map((row) => (
                <div key={row.bucket}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{row.bucket}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm tabular-nums font-medium">
                        {row.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">
                        {row.pctOfSegment}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.pctOfSegment}%`,
                        backgroundColor: BREADTH_COLORS[row.bucket] ?? "#888",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card 3: Program share */}
      {data.programShare.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                Where do they go for what?
              </CardTitle>
            </div>
            <CardDescription>
              Distinct {segmentLower} attending each program category at {thisOrgName} vs. at any
              other org (past 12 months, deduplicated per person)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                thisOrg: { label: thisOrgName, color: "#1e2d6f" },
                otherOrgs: { label: "Other orgs", color: "#c8922a" },
              }}
              className="h-[340px]"
            >
              <BarChart
                data={data.programShare}
                layout="vertical"
                margin={{ left: 10, right: 30 }}
              >
                <XAxis type="number" fontSize={11} tickLine={false} allowDecimals={false} />
                <YAxis
                  dataKey="category"
                  type="category"
                  fontSize={11}
                  tickLine={false}
                  width={140}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const label = name === "thisOrg" ? thisOrgName : "Other orgs";
                        return `${label}: ${value} ${segmentLower}`;
                      }}
                    />
                  }
                />
                <Bar dataKey="thisOrg" fill="#1e2d6f" radius={[0, 0, 0, 0]} />
                <Bar dataKey="otherOrgs" fill="#c8922a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
            <div className="mt-3 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#1e2d6f" }} />
                <span style={{ color: "var(--ink-700)" }}>At {thisOrgName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#c8922a" }} />
                <span style={{ color: "var(--ink-700)" }}>At other orgs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
