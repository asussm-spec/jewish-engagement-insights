"use client";

import { useState } from "react";
import { PopulationProfile } from "./population-profile";
import { CrossOrgInsightsView } from "./cross-org-insights";
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

  return (
    <div className="space-y-6">
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

      {crossOrgData && (
        <CrossOrgInsightsView
          data={crossOrgData}
          segmentLabel={segmentLabel}
          thisOrgName={orgName}
        />
      )}

      <PopulationProfile data={data} />
    </div>
  );
}
