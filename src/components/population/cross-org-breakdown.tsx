"use client";

import { useState } from "react";
import { Building2, GraduationCap, Tent } from "lucide-react";
import type { OrgTypeBreakdown } from "@/lib/mock-cross-org-breakdown";

interface Props {
  synagogues: OrgTypeBreakdown;
  daySchools: OrgTypeBreakdown;
  camps: OrgTypeBreakdown;
}

export function CrossOrgBreakdown({ synagogues, daySchools, camps }: Props) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <OrgTypePanel
        breakdown={synagogues}
        icon={<Building2 className="h-4 w-4" style={{ color: "var(--ink-600)" }} />}
        title="Synagogues"
      />
      <OrgTypePanel
        breakdown={daySchools}
        icon={<GraduationCap className="h-4 w-4" style={{ color: "var(--ink-600)" }} />}
        title="Day Schools"
      />
      <OrgTypePanel
        breakdown={camps}
        icon={<Tent className="h-4 w-4" style={{ color: "var(--ink-600)" }} />}
        title="Camps"
      />
    </div>
  );
}

function OrgTypePanel({
  breakdown,
  icon,
  title,
}: {
  breakdown: OrgTypeBreakdown;
  icon: React.ReactNode;
  title: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const initialOrgsShown = 5;
  const visibleOrgs = showAll ? breakdown.orgs : breakdown.orgs.slice(0, initialOrgsShown);
  const hiddenCount = breakdown.orgs.length - initialOrgsShown;
  const overallPct = Math.round((breakdown.totalMembers / breakdown.rosterTotal) * 100);

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
          {breakdown.totalMembers} of your members
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--stone-500)",
            marginTop: 4,
            lineHeight: 1.45,
          }}
        >
          also belong to a {breakdown.headingNoun}
          {" · "}
          <span style={{ fontWeight: 600, color: "var(--ink-700)" }}>
            {overallPct}%
          </span>{" "}
          of your roster
        </div>
      </div>

      {/* ── Groupings ── */}
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
          {breakdown.groupingLabel}
        </div>
        <div className="space-y-2">
          {breakdown.groupings.map((g) => (
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

      {/* ── Top orgs ── */}
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
              key={org.name}
              className="flex items-baseline gap-3"
              style={{
                padding: "8px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--ds-border)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ink-800)",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {org.name}
                </div>
                {org.tag && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--stone-500)",
                      marginTop: 1,
                    }}
                  >
                    {org.tag}
                  </div>
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
            {showAll ? "Show fewer" : `Show all (${breakdown.orgs.length}) →`}
          </button>
        )}
      </div>
    </div>
  );
}
