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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Building2, GraduationCap, Tent, Network, Users } from "lucide-react";
import type { CrossOrgInsights as CrossOrgData } from "@/lib/population-aggregator";

interface Props {
  data: CrossOrgData;
  segmentLabel: string;
  segmentTotal: number;
  /** People with ≥1 cross-org affiliation in our data */
  coverageCount: number;
  /** % of segment we have any cross-org data for */
  coveragePct: number;
  thisOrgName: string;
}

const BREADTH_COLORS: Record<string, string> = {
  "1 (only this org)": "#8a8279",
  "2 orgs": "#4a7c6f",
  "3 orgs": "#c8922a",
  "4+ orgs": "#1e2d6f",
};

const SUBTYPE_LABELS: Record<string, string> = {
  reform: "Reform",
  conservative: "Conservative",
  orthodox: "Orthodox",
  modern_orthodox: "Modern Orthodox",
  reconstructionist: "Reconstructionist",
  pluralistic: "Pluralistic",
  independent: "Independent",
};

interface OrgEntry {
  orgId: string;
  name: string;
  subtype: string | null;
  count: number;
}

function labelForSubtype(subtype: string | null): string {
  if (!subtype) return "Other";
  return SUBTYPE_LABELS[subtype] ?? subtype;
}

export function CrossOrgInsightsView({
  data,
  segmentLabel,
  segmentTotal,
  coverageCount,
  coveragePct,
  thisOrgName,
}: Props) {
  const segmentLower = segmentLabel.toLowerCase();
  const noData =
    data.affiliationByType.length === 0 &&
    data.programShare.length === 0 &&
    data.engagementBreadth.length === 0;

  if (noData) {
    return null;
  }

  const synagogues = data.topOverlappingOrgs.filter((o) => o.orgType === "synagogue");
  const daySchools = data.topOverlappingOrgs.filter((o) => o.orgType === "day_school");
  const camps = data.topOverlappingOrgs.filter((o) => o.orgType === "camp");

  // Unique-person counts per type (from affiliationByType, which dedupes within type)
  const uniqueByType = new Map<string, { count: number; pct: number }>();
  for (const row of data.affiliationByType) {
    uniqueByType.set(row.orgType, { count: row.count, pct: row.pctOfSegment });
  }

  return (
    <div className="space-y-6">
      <div>
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
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            background: "var(--paper-100)",
            border: "1px solid var(--ds-border)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--ink-700)",
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 600 }}>
            Cross-org coverage: {coverageCount.toLocaleString()} of{" "}
            {segmentTotal.toLocaleString()} ({coveragePct}%)
          </span>
          {" — "}
          <span style={{ color: "var(--stone-500)" }}>
            we have at least one other-org affiliation for these {segmentLower}.
            The remaining {(segmentTotal - coverageCount).toLocaleString()} may
            belong to other orgs we don&apos;t see yet.
          </span>
        </div>
      </div>

      {/* ── 3 per-org-type panels ── */}
      <div className="grid gap-5 md:grid-cols-3">
        <OrgTypePanel
          title="Synagogues"
          headingNoun="synagogue"
          icon={<Building2 className="h-4 w-4" style={{ color: "var(--ink-600)" }} />}
          orgs={synagogues}
          uniquePeople={uniqueByType.get("synagogue")}
          groupingLabel="By denomination"
        />
        <OrgTypePanel
          title="Day Schools"
          headingNoun="day school"
          icon={<GraduationCap className="h-4 w-4" style={{ color: "var(--ink-600)" }} />}
          orgs={daySchools}
          uniquePeople={uniqueByType.get("day_school")}
          groupingLabel="By type"
        />
        <OrgTypePanel
          title="Camps"
          headingNoun="Jewish camp"
          icon={<Tent className="h-4 w-4" style={{ color: "var(--ink-600)" }} />}
          orgs={camps}
          uniquePeople={uniqueByType.get("camp")}
          groupingLabel="By category"
        />
      </div>

      {/* ── Engagement breadth ── */}
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

      {/* ── Program share ── */}
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

function OrgTypePanel({
  title,
  headingNoun,
  icon,
  orgs,
  uniquePeople,
  groupingLabel,
}: {
  title: string;
  headingNoun: string;
  icon: React.ReactNode;
  orgs: OrgEntry[];
  /** Unique people overlap (from affiliationByType) — dedupes within type */
  uniquePeople?: { count: number; pct: number };
  groupingLabel: string;
}) {
  const [showAll, setShowAll] = useState(false);

  const totalPeople = uniquePeople?.count ?? 0;
  const overallPct = uniquePeople?.pct ?? 0;

  // Sum of per-org counts (overcounts people in multiple orgs of same type)
  // Used only as the denominator for grouping percentages.
  const totalOrgMentions = orgs.reduce((s, o) => s + o.count, 0);

  // Group by subtype
  const groupCounts = new Map<string, number>();
  for (const o of orgs) {
    const label = labelForSubtype(o.subtype);
    groupCounts.set(label, (groupCounts.get(label) ?? 0) + o.count);
  }
  const groupings = Array.from(groupCounts.entries())
    .map(([label, count]) => ({
      label,
      count,
      pct: totalOrgMentions > 0 ? Math.round((count / totalOrgMentions) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const initialOrgsShown = 5;
  const visibleOrgs = showAll ? orgs : orgs.slice(0, initialOrgsShown);
  const hiddenCount = orgs.length - initialOrgsShown;

  return (
    <div
      style={{
        background: "var(--ds-bg-elevated)",
        border: "1px solid var(--ds-border)",
        borderRadius: 10,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* ── Header ── */}
      <div>
        <div
          className="flex items-center gap-2 font-semibold uppercase"
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--ds-fg-muted)",
            marginBottom: 10,
          }}
        >
          {icon}
          <span>{title}</span>
        </div>
        {orgs.length === 0 || totalPeople === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: "var(--stone-500)",
              lineHeight: 1.5,
            }}
          >
            No {headingNoun} affiliations found yet for this segment.
          </div>
        ) : (
          <>
            <div
              className="font-serif"
              style={{
                fontSize: 22,
                fontWeight: 500,
                lineHeight: 1.15,
                color: "var(--ink-800)",
                letterSpacing: "-0.01em",
              }}
            >
              {totalPeople.toLocaleString()} of your {title === "Camps" ? "members' families" : "members"}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--stone-500)",
                marginTop: 4,
                lineHeight: 1.45,
              }}
            >
              also belong to a {headingNoun}
              {" · "}
              <span style={{ fontWeight: 600, color: "var(--ink-700)" }}>{overallPct}%</span>{" "}
              of segment
            </div>
          </>
        )}
      </div>

      {/* ── Groupings ── */}
      {groupings.length > 0 && (
        <div>
          <div
            className="font-semibold uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "var(--stone-400)",
              marginBottom: 8,
            }}
          >
            {groupingLabel}
          </div>
          <div className="space-y-2">
            {groupings.map((g) => (
              <div key={g.label} className="flex items-center gap-2.5">
                <div
                  style={{
                    flex: "0 0 auto",
                    fontSize: 12,
                    color: "var(--ink-700)",
                    minWidth: 130,
                  }}
                >
                  {g.label}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    background: "var(--paper-100)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${g.pct}%`,
                      height: "100%",
                      background: "var(--ink-500)",
                    }}
                  />
                </div>
                <div
                  className="tabular-nums"
                  style={{
                    flex: "0 0 auto",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink-800)",
                    minWidth: 56,
                    textAlign: "right",
                  }}
                >
                  {g.count} ({g.pct}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top orgs ── */}
      {orgs.length > 0 && (
        <div>
          <div
            className="font-semibold uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "var(--stone-400)",
              marginBottom: 8,
            }}
          >
            Top {title.toLowerCase()}
          </div>
          <div>
            {visibleOrgs.map((org, i) => (
              <div
                key={org.orgId}
                className="flex items-baseline gap-2"
                style={{
                  padding: "6px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--ds-border)",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    color: "var(--ink-800)",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {org.name}
                  {org.subtype && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 400,
                        color: "var(--stone-500)",
                        marginLeft: 6,
                      }}
                    >
                      · {labelForSubtype(org.subtype)}
                    </span>
                  )}
                </div>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--ink-700)",
                    flex: "0 0 auto",
                  }}
                >
                  {org.count}
                </div>
              </div>
            ))}
          </div>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              style={{
                marginTop: 10,
                fontSize: 12,
                fontWeight: 500,
                color: "var(--ochre-700, #8a6418)",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              {showAll ? "Show fewer" : `Show all (${orgs.length}) →`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
