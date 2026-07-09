"use client";

import { Panel, PanelBody } from "@/components/layout/page-primitives";
import { TakeawayLead } from "./event-section";
import type { EventReach } from "@/lib/event-analytics";

const SEGMENTS = [
  {
    key: "newToCommunity" as const,
    label: "New to the community",
    hint: "First time we've seen them anywhere",
    color: "#2f855a", // green — growing the tent
  },
  {
    key: "newToOrg" as const,
    label: "New to you",
    hint: "Active elsewhere, first time with your org",
    color: "#c8922a", // gold — drawn from the wider community
  },
  {
    key: "returning" as const,
    label: "Returning",
    hint: "Attended a prior event of yours",
    color: "#1e2d6f", // navy — your regulars
  },
];

function pct(n: number, total: number) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

function buildTakeaway(reach: EventReach, orgName: string): {
  tone: "growth" | "below" | "neutral";
  text: string;
} {
  const { total, newToCommunity, newToOrg, returning, hasHistory } = reach;
  const newCommPct = pct(newToCommunity, total);
  const returningPct = pct(returning, total);
  const newAnyPct = pct(newToCommunity + newToOrg, total);

  if (!hasHistory) {
    return {
      tone: "neutral",
      text:
        "This is among the earliest events on record, so there's no prior history to compare against yet — everyone reads as new. New-vs-returning will sharpen as more events are logged across the community.",
    };
  }
  if (newCommPct >= 25) {
    return {
      tone: "growth",
      text: `This event grew the tent — ${newCommPct}% of attendees were new to the Jewish community here, not just new to ${orgName}.`,
    };
  }
  if (newAnyPct >= 40) {
    return {
      tone: "growth",
      text: `This event reached widely — ${newAnyPct}% of attendees were new to ${orgName}, drawn largely from people already active elsewhere in the community.`,
    };
  }
  if (returningPct >= 65) {
    return {
      tone: "neutral",
      text: `This event mostly re-engaged your regulars — ${returningPct}% had been to a prior ${orgName} event. That makes it a retention ritual more than an acquisition channel.`,
    };
  }
  return {
    tone: "neutral",
    text: `A balanced mix — ${returningPct}% returning and ${newAnyPct}% new to ${orgName}.`,
  };
}

export function EventReachSection({
  reach,
  orgName,
}: {
  reach: EventReach;
  orgName: string;
}) {
  const { total } = reach;
  const takeaway = buildTakeaway(reach, orgName);

  const rows = SEGMENTS.map((s) => ({
    ...s,
    count: reach[s.key],
    percent: pct(reach[s.key], total),
  }));

  return (
    <div className="space-y-4">
      <TakeawayLead tone={takeaway.tone}>{takeaway.text}</TakeawayLead>

      <Panel>
        <PanelBody>
          {/* Stacked segment bar */}
          <div
            className="flex w-full overflow-hidden"
            style={{ height: 34, borderRadius: 8 }}
            role="img"
            aria-label={rows
              .map((r) => `${r.label}: ${r.count} (${r.percent}%)`)
              .join(", ")}
          >
            {rows.map((r) =>
              r.count > 0 ? (
                <div
                  key={r.key}
                  title={`${r.label}: ${r.count} (${r.percent}%)`}
                  style={{
                    width: `${r.percent}%`,
                    background: r.color,
                    minWidth: r.count > 0 ? 3 : 0,
                  }}
                />
              ) : null
            )}
          </div>

          {/* Legend / breakdown */}
          <div className="grid gap-4 mt-5 sm:grid-cols-3">
            {rows.map((r) => (
              <div key={r.key} className="flex items-start gap-2.5">
                <span
                  className="shrink-0"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: r.color,
                    marginTop: 4,
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="font-serif"
                      style={{
                        fontSize: 24,
                        fontWeight: 500,
                        color: "var(--ink-800)",
                        lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {r.count}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--ds-fg-muted)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {r.percent}%
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--ink-700)",
                      marginTop: 3,
                    }}
                  >
                    {r.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--stone-500)", marginTop: 1 }}>
                    {r.hint}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
