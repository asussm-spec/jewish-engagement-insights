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
  all: "All people",
  members: "Members",
  non_members: "Non-members",
};

const SEGMENT_ORDER: PopulationSegment[] = ["all", "members", "non_members"];

// Demo placeholder until "new cross-org joins last quarter" gets a real source.
const NEW_CROSS_ORG_JOINS_DEMO = 24;

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

  // Derive "active at 2+ orgs" and "exclusive" from engagementBreadth.
  const exclusive =
    crossOrgData?.engagementBreadth.find((b) => b.bucket === "1 (only this org)")?.count ?? 0;
  const activeAtMultiple =
    (crossOrgData?.engagementBreadth ?? [])
      .filter((b) => b.bucket !== "1 (only this org)")
      .reduce((s, b) => s + b.count, 0);

  const exclusivePct = segmentTotal > 0 ? Math.round((exclusive / segmentTotal) * 100) : 0;
  const multiplePct = segmentTotal > 0 ? Math.round((activeAtMultiple / segmentTotal) * 100) : 0;

  const memberLabel =
    segment === "members"
      ? "members"
      : segment === "non_members"
      ? "non-members"
      : "people";

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
        <StatGrid cols={4}>
          <StatCard
            label="Total"
            value={segmentTotal.toLocaleString()}
            note={`${segmentLabel} in scope`}
          />
          <StatCard
            label="Active at 2+ orgs"
            value={activeAtMultiple.toLocaleString()}
            note={`${multiplePct}% of ${memberLabel}`}
          />
          <StatCard
            label="Exclusive to your org"
            value={exclusive.toLocaleString()}
            note={`${exclusivePct}% of ${memberLabel}`}
          />
          <StatCard
            label="New cross-org joins"
            value={NEW_CROSS_ORG_JOINS_DEMO.toLocaleString()}
            note="Joined a 2nd org last quarter (demo)"
          />
        </StatGrid>
      )}

      {/* ── Cross-org section (3 panels + breadth + program share) ── */}
      {crossOrgData && (
        <CrossOrgInsightsView
          data={crossOrgData}
          segmentLabel={segmentLabel}
          segmentTotal={segmentTotal}
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
