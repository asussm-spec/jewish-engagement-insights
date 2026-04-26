"use client";

import { useState } from "react";
import { PopulationProfile } from "./population-profile";
import { CrossOrgInsightsView } from "./cross-org-insights";
import { CollapsibleSection } from "@/components/layout/collapsible-section";
import { StatGrid, StatCard } from "@/components/layout/page-primitives";
import type {
  PopulationSegment,
  PopulationSummary,
} from "@/lib/mock-population-data";
import type { CrossOrgInsights } from "@/lib/population-aggregator";

interface Props {
  segments: Record<PopulationSegment, PopulationSummary>;
  crossOrg?: Record<PopulationSegment, CrossOrgInsights>;
  orgName?: string;
  defaultSegment?: PopulationSegment;
}

const SEGMENT_LABELS: Record<PopulationSegment, string> = {
  all: "Everyone you serve",
  members: "Your members",
  non_members: "Non-members",
};

// Surfaced in the toggle; non_members is still computed but not shown
// (implicit as Everyone − Members).
const SEGMENT_ORDER: PopulationSegment[] = ["all", "members"];

export function PopulationDashboard({
  segments,
  crossOrg,
  orgName = "this org",
  defaultSegment = "all",
}: Props) {
  const [segment, setSegment] = useState<PopulationSegment>(defaultSegment);
  const data = segments[segment];
  const crossOrgData = crossOrg?.[segment];
  const segmentLabel =
    segment === "members" ? "Members" : segment === "non_members" ? "Non-members" : "People";

  const segmentTotal = data?.totalMembers ?? 0;

  // "With cross-org data" = anyone we have at least one other-org affiliation
  // for. Computed from engagementBreadth as everyone NOT in the "1 (only this
  // org)" bucket. The "1 (only this org)" group genuinely could mean people
  // we just don't have data on yet, so we explicitly frame this as coverage
  // rather than as "exclusive".
  const withCrossOrgData =
    (crossOrgData?.engagementBreadth ?? [])
      .filter((b) => b.bucket !== "1 (only this org)")
      .reduce((s, b) => s + b.count, 0);

  const coveragePct = segmentTotal > 0 ? Math.round((withCrossOrgData / segmentTotal) * 100) : 0;
  const distinctOtherOrgs = crossOrgData?.totalEcosystemOrgs ?? 0;

  const memberLabel =
    segment === "members" ? "your members" : "people";

  return (
    <div className="space-y-6">
      {/* ── Segment toggle ── */}
      <div
        className="inline-flex items-center gap-1 rounded-md p-1"
        style={{
          background: "var(--paper-100)",
          border: "1px solid var(--ds-border)",
        }}
      >
        {SEGMENT_ORDER.map((key) => {
          const active = key === segment;
          const count = segments[key]?.totalMembers ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSegment(key)}
              className="rounded-md px-3 py-1.5 text-sm transition-colors"
              style={{
                background: active ? "var(--ink-800)" : "transparent",
                color: active ? "var(--paper-50)" : "var(--ink-700)",
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
              }}
            >
              {SEGMENT_LABELS[key]}
              <span
                className="ml-2 tabular-nums"
                style={{
                  fontSize: 11,
                  color: active ? "var(--paper-200)" : "var(--ds-fg-muted)",
                }}
              >
                {count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Top KPIs: cross-org headlines ── */}
      {crossOrgData && (
        <StatGrid cols={3}>
          <StatCard
            label="Total"
            value={segmentTotal.toLocaleString()}
            note={`${segmentLabel} in scope`}
          />
          <StatCard
            label="With cross-org data"
            value={withCrossOrgData.toLocaleString()}
            note={`${coveragePct}% of ${memberLabel} have ≥1 other-org affiliation`}
          />
          <StatCard
            label="Other orgs in view"
            value={distinctOtherOrgs.toLocaleString()}
            note={`Distinct orgs we see your ${memberLabel} engaging with`}
          />
        </StatGrid>
      )}

      {/* ── Cross-org section (3 panels + breadth + program share) ── */}
      {crossOrgData && (
        <CrossOrgInsightsView
          data={crossOrgData}
          segmentLabel={segmentLabel}
          segmentTotal={segmentTotal}
          coverageCount={withCrossOrgData}
          coveragePct={coveragePct}
          thisOrgName={orgName}
        />
      )}

      {/* ── Internal demographics (collapsed) ── */}
      <CollapsibleSection
        title="Internal demographics"
        sub="Age, membership types, programs, geography, family profile, gender, completeness — the kinds of cuts most CRMs already give you."
      >
        <PopulationProfile data={data} />
      </CollapsibleSection>
    </div>
  );
}
