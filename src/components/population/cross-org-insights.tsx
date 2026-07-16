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
import {
  Building2,
  GraduationCap,
  Tent,
  Network,
  Users,
  ListOrdered,
  ChevronRight,
} from "lucide-react";
import type { CrossOrgInsights as CrossOrgData } from "@/lib/population-aggregator";

interface Props {
  data: CrossOrgData;
  segmentLabel: string;
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

/** Fixed display order for the synagogue denomination breakdown. */
const DENOMINATION_ORDER = ["reform", "conservative", "modern_orthodox", "orthodox"];

const ORG_TYPE_BADGE_LABELS: Record<string, string> = {
  synagogue: "Synagogue",
  day_school: "Day school",
  camp: "Camp",
  jcc: "JCC",
  federation: "Federation",
  youth_org: "Youth org",
  social_service: "Social service",
  other: "Other",
};

type OrgEntry = CrossOrgData["topOverlappingOrgs"][number];
type TypeStats = CrossOrgData["affiliationByType"][number];

function labelForSubtype(subtype: string | null): string {
  if (!subtype) return "Other";
  return SUBTYPE_LABELS[subtype] ?? subtype;
}

export function CrossOrgInsightsView({ data, segmentLabel, thisOrgName }: Props) {
  const segmentLower = segmentLabel.toLowerCase();
  const noData =
    data.affiliationByType.length === 0 &&
    data.programShare.length === 0 &&
    data.engagementBreadth.length === 0;

  if (noData) {
    return null;
  }

  const { coverage } = data;
  const coveragePct =
    coverage.totalPeople > 0
      ? Math.round((coverage.peopleWithData / coverage.totalPeople) * 100)
      : 0;

  const synagogues = data.topOverlappingOrgs.filter((o) => o.orgType === "synagogue");
  const daySchools = data.topOverlappingOrgs.filter((o) => o.orgType === "day_school");
  const camps = data.topOverlappingOrgs.filter((o) => o.orgType === "camp");

  const statsByType = new Map<string, TypeStats>();
  for (const row of data.affiliationByType) {
    statsByType.set(row.orgType, row);
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
            Cross-org coverage: {coverage.peopleWithData.toLocaleString()} of{" "}
            {coverage.totalPeople.toLocaleString()} {segmentLower} ({coveragePct}
            %)
            {coverage.totalHouseholds > 0 && (
              <>
                {" · "}
                {coverage.householdsWithData.toLocaleString()} of{" "}
                {coverage.totalHouseholds.toLocaleString()} families
              </>
            )}
          </span>
          {" — "}
          <span style={{ color: "var(--stone-500)" }}>
            we have at least one other-org affiliation for these {segmentLower}.
            Affiliation rates below are computed against this covered group, since
            the rest may belong to orgs we don&apos;t see yet.
          </span>
        </div>
      </div>

      {/* ── High-level: footprint distribution + top overlapping orgs ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Engagement breadth */}
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

        {/* Top overlapping orgs (flat ranked list across all org types) */}
        {data.topOverlappingOrgs.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Top overlapping orgs</CardTitle>
              </div>
              <CardDescription>
                Other orgs your {segmentLower} most often belong to or attend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                {data.topOverlappingOrgs.slice(0, 10).map((org, i) => (
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
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: "var(--stone-500)",
                          marginLeft: 6,
                        }}
                      >
                        · {ORG_TYPE_BADGE_LABELS[org.orgType] ?? org.orgType}
                      </span>
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
                      {org.people}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── 3 per-org-type panels ── */}
      <div className="grid gap-5 md:grid-cols-3">
        <OrgTypePanel
          title="Synagogues"
          icon={<Building2 className="h-4 w-4" style={{ color: "var(--ink-600)" }} />}
          verbPhrase="also belong to a synagogue"
          emptyNoun="synagogue"
          orgs={synagogues}
          stats={statsByType.get("synagogue")}
          coverage={coverage}
          groupingLabel="By denomination"
          fixedSubtypeOrder={DENOMINATION_ORDER}
          thisOrgName={thisOrgName}
        />
        <OrgTypePanel
          title="Day Schools"
          icon={<GraduationCap className="h-4 w-4" style={{ color: "var(--ink-600)" }} />}
          verbPhrase="have a child at a Jewish day school"
          emptyNoun="day school"
          orgs={daySchools}
          stats={statsByType.get("day_school")}
          coverage={coverage}
          groupingLabel="By type"
          thisOrgName={thisOrgName}
        />
        <OrgTypePanel
          title="Camps"
          icon={<Tent className="h-4 w-4" style={{ color: "var(--ink-600)" }} />}
          verbPhrase="send a child to another Jewish camp"
          emptyNoun="Jewish camp"
          orgs={camps}
          stats={statsByType.get("camp")}
          coverage={coverage}
          groupingLabel="By category"
          thisOrgName={thisOrgName}
        />
      </div>

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

/**
 * Order the subtype breakdown for display. With `fixedOrder` (denominations),
 * known subtypes appear in that canonical order and everything else is merged
 * into a trailing "Other"; otherwise subtypes sort by household count.
 */
function orderSubtypes(
  bySubtype: TypeStats["bySubtype"],
  fixedOrder?: string[]
): { label: string; households: number; pct: number }[] {
  if (!fixedOrder) {
    return bySubtype.map((s) => ({
      label: labelForSubtype(s.subtype),
      households: s.households,
      pct: s.pct,
    }));
  }
  const ordered: { label: string; households: number; pct: number }[] = [];
  for (const key of fixedOrder) {
    const row = bySubtype.find((s) => s.subtype === key);
    if (row) {
      ordered.push({
        label: labelForSubtype(row.subtype),
        households: row.households,
        pct: row.pct,
      });
    }
  }
  const rest = bySubtype.filter((s) => !fixedOrder.includes(s.subtype ?? ""));
  const otherHouseholds = rest.reduce((sum, s) => sum + s.households, 0);
  const otherPct = rest.reduce((sum, s) => sum + s.pct, 0);
  if (otherHouseholds > 0) {
    ordered.push({ label: "Other", households: otherHouseholds, pct: otherPct });
  }
  return ordered;
}

function OrgTypePanel({
  title,
  icon,
  verbPhrase,
  emptyNoun,
  orgs,
  stats,
  coverage,
  groupingLabel,
  fixedSubtypeOrder,
  thisOrgName,
}: {
  title: string;
  icon: React.ReactNode;
  /** Completes "NN% of your families …", e.g. "also belong to a synagogue" */
  verbPhrase: string;
  emptyNoun: string;
  orgs: OrgEntry[];
  stats?: TypeStats;
  coverage: CrossOrgData["coverage"];
  groupingLabel: string;
  /** Canonical subtype order (denominations); others merge into "Other" */
  fixedSubtypeOrder?: string[];
  thisOrgName: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null);

  const households = stats?.households ?? 0;
  const people = stats?.people ?? 0;
  const pctHouseholds = stats?.pctOfCoveredHouseholds ?? 0;

  const allGroupings = orderSubtypes(stats?.bySubtype ?? [], fixedSubtypeOrder);
  // A lone "Other" bucket (no real subtype data) adds nothing — hide it.
  const groupings =
    allGroupings.length === 1 && allGroupings[0].label === "Other" ? [] : allGroupings;

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
        {orgs.length === 0 || people === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: "var(--stone-500)",
              lineHeight: 1.5,
            }}
          >
            No {emptyNoun} affiliations found yet for this segment.
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
              {pctHouseholds}% of your families
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--stone-500)",
                marginTop: 4,
                lineHeight: 1.45,
              }}
            >
              {verbPhrase}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--ds-fg-muted)",
                marginTop: 6,
                lineHeight: 1.45,
              }}
            >
              n ={" "}
              <span style={{ fontWeight: 600, color: "var(--ink-700)" }}>
                {households.toLocaleString()}
              </span>{" "}
              of the {coverage.householdsWithData.toLocaleString()} families with
              cross-org data · {people.toLocaleString()} people
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
                  {g.households} ({g.pct}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top orgs (click to see what they do at this org) ── */}
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
            Top {title.toLowerCase()} · families
          </div>
          <div>
            {visibleOrgs.map((org, i) => {
              const expanded = expandedOrgId === org.orgId;
              const maxUnit = Math.max(1, ...org.unitBreakdown.map((u) => u.people));
              return (
                <div
                  key={org.orgId}
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--ds-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedOrgId(expanded ? null : org.orgId)}
                    aria-expanded={expanded}
                    className="flex w-full items-baseline gap-2 text-left"
                    style={{
                      padding: "6px 0",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronRight
                      className="h-3 w-3 flex-none self-center transition-transform"
                      style={{
                        color: "var(--stone-400)",
                        transform: expanded ? "rotate(90deg)" : undefined,
                      }}
                    />
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
                      {org.households}
                    </div>
                  </button>
                  {expanded && (
                    <div
                      style={{
                        margin: "2px 0 10px 20px",
                        padding: "10px 12px",
                        background: "var(--paper-50)",
                        border: "1px solid var(--ds-border)",
                        borderRadius: 8,
                      }}
                    >
                      <div
                        className="font-semibold uppercase"
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          color: "var(--stone-400)",
                          marginBottom: 8,
                        }}
                      >
                        What they do at {thisOrgName}
                      </div>
                      {org.unitBreakdown.length === 0 ? (
                        <div style={{ fontSize: 12, color: "var(--stone-500)" }}>
                          No activity at {thisOrgName} on record yet.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {org.unitBreakdown.map((u) => (
                            <div key={u.unit} className="flex items-center gap-2">
                              <div
                                style={{
                                  flex: "0 0 auto",
                                  fontSize: 11.5,
                                  color: "var(--ink-700)",
                                  minWidth: 110,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {u.unit}
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  height: 6,
                                  background: "var(--paper-200)",
                                  borderRadius: 3,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.round((u.people / maxUnit) * 100)}%`,
                                    height: "100%",
                                    background: "var(--ochre-400)",
                                  }}
                                />
                              </div>
                              <div
                                className="tabular-nums"
                                style={{
                                  flex: "0 0 auto",
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  color: "var(--ink-800)",
                                  minWidth: 28,
                                  textAlign: "right",
                                }}
                              >
                                {u.people}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
