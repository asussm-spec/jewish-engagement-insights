"use client";

import { useState } from "react";
import {
  StatGrid,
  StatCard,
  Panel,
  PanelHeader,
  InsightCard,
} from "@/components/layout/page-primitives";
import type {
  EngagementDepthData,
  PeopleScope,
  DepthTier,
  Provenance,
} from "@/lib/mock-engagement-depth";

interface Props {
  data: EngagementDepthData;
}

const SCOPE_LABELS: Record<PeopleScope, string> = {
  everyone: "Everyone we serve",
  members: "Members",
};

const DEPTH_STYLES: Record<
  DepthTier,
  { label: string; bg: string; fg: string; border: string }
> = {
  deep: { label: "Deep", bg: "#e5ece1", fg: "var(--moss-600)", border: "#cedac7" },
  medium: {
    label: "Medium",
    bg: "var(--ochre-100)",
    fg: "var(--ochre-600)",
    border: "var(--ochre-200)",
  },
  light: {
    label: "Light",
    bg: "var(--paper-100)",
    fg: "var(--ds-fg-muted)",
    border: "var(--ds-border-strong)",
  },
};

const PROVENANCE_STYLES: Record<
  Provenance,
  { label: string; bg: string; fg: string; border: string; dashed?: boolean }
> = {
  have: {
    label: "Have today",
    bg: "#e5ece1",
    fg: "var(--moss-600)",
    border: "#cedac7",
  },
  network: {
    label: "Cross-org network",
    bg: "var(--ochre-100)",
    fg: "var(--ochre-600)",
    border: "var(--ochre-200)",
  },
  survey: {
    label: "Survey",
    bg: "var(--plum-bg, #f1ebf0)",
    fg: "var(--plum-400)",
    border: "#d8c8d6",
    dashed: true,
  },
};

function ProvenanceTag({ kind }: { kind: Provenance }) {
  const s = PROVENANCE_STYLES[kind];
  return (
    <span
      className="uppercase"
      style={{
        fontSize: 10,
        letterSpacing: "0.05em",
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        border: `1px ${s.dashed ? "dashed" : "solid"} ${s.border}`,
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      {s.label}
    </span>
  );
}

/** A percentage cell rendered as a small inline meter + value. */
function MeterCell({ pct }: { pct: number }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ fontVariantNumeric: "tabular-nums" }}>
      <span
        style={{
          width: 52,
          height: 8,
          background: "var(--paper-100)",
          borderRadius: 999,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${Math.max(0, Math.min(100, pct))}%`,
            background: "var(--ink-600)",
            borderRadius: 999,
          }}
        />
      </span>
      {pct}%
    </span>
  );
}

export function EngagementDepth({ data }: Props) {
  const [scope, setScope] = useState<PeopleScope>("everyone");
  const summary = data.scope[scope];
  const isMembers = scope === "members";

  const th: React.CSSProperties = {
    textAlign: "left",
    padding: "11px 12px",
    borderBottom: "1px solid var(--ds-border)",
    fontSize: 10.5,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "var(--ds-fg-subtle)",
    fontWeight: 600,
    verticalAlign: "bottom",
    whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    padding: "11px 12px",
    borderBottom: "1px solid var(--ds-border)",
    fontSize: 13,
    color: "var(--ink-800)",
    verticalAlign: "middle",
  };
  const tdNum: React.CSSProperties = {
    ...td,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <div className="space-y-6">
      {/* ── Scope toggle ── */}
      <div
        className="inline-flex items-center gap-1 rounded-md p-1"
        style={{ background: "var(--paper-100)", border: "1px solid var(--ds-border)" }}
      >
        {(["everyone", "members"] as PeopleScope[]).map((key) => {
          const active = key === scope;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setScope(key)}
              className="rounded-md px-3 py-1.5 text-sm transition-colors"
              style={{
                background: active ? "var(--ink-800)" : "transparent",
                color: active ? "var(--paper-50)" : "var(--ink-700)",
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
              }}
            >
              {SCOPE_LABELS[key]}
              <span
                className="ml-2 tabular-nums"
                style={{
                  fontSize: 11,
                  color: active ? "var(--paper-200)" : "var(--ds-fg-muted)",
                }}
              >
                {data.scope[key].people.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── KPI band (responds to scope) ── */}
      <StatGrid cols={4}>
        <StatCard
          label="In view"
          value={summary.people.toLocaleString()}
          note={isMembers ? "Hold an active membership" : "Unique people, past 12 months"}
        />
        <StatCard
          label="Households"
          value={summary.households.toLocaleString()}
          note={isMembers ? "Member households" : "The family, not the individual"}
        />
        <StatCard
          label="Avg touches / yr"
          value={summary.avgTouches}
          note={isMembers ? "But mostly the gym" : "Half touch us once or twice"}
        />
        <StatCard
          label="Visible Jewish tie"
          value={`${summary.visibleJewishTiePct}%`}
          note="Engaging Jewishly beyond the JCC"
        />
      </StatGrid>

      {/* ── The matrix ── */}
      <Panel>
        <PanelHeader
          title="How deeply Jewish is each business unit?"
          sub="Frequency and Jewish depth are not the same thing"
          actions={
            <div className="flex items-center gap-1.5">
              <ProvenanceTag kind="have" />
              <ProvenanceTag kind="network" />
            </div>
          }
        />

        {isMembers && (
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--ds-border)",
              background: "var(--paper-50)",
              fontSize: 12.5,
              color: "var(--ds-fg-muted)",
            }}
          >
            Members are almost entirely the{" "}
            <b style={{ color: "var(--ink-800)" }}>Fitness &amp; wellness</b> row below
            (highlighted) — high frequency, lowest Jewish depth. The unit matrix itself
            describes everyone the JCC serves, where the strategic room to grow lives.
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              minWidth: 720,
            }}
          >
            <thead>
              <tr>
                <th style={th}>Business unit</th>
                <th style={{ ...th, textAlign: "right" }}>People / yr</th>
                <th style={{ ...th, textAlign: "right" }}>Touches / yr</th>
                <th style={th}>Synagogue-affiliated</th>
                <th style={{ ...th, textAlign: "right" }}>Fed. donor</th>
                <th style={{ ...th, textAlign: "right" }}>Other Jewish camp</th>
                <th style={th}>Jewish depth</th>
              </tr>
            </thead>
            <tbody>
              {data.units.map((u) => {
                const highlight = isMembers && u.key === data.memberUnitKey;
                const depth = DEPTH_STYLES[u.depth];
                return (
                  <tr
                    key={u.key}
                    style={{
                      background: highlight ? "var(--ochre-50, #faf4e6)" : "transparent",
                    }}
                  >
                    <td style={{ ...td, fontWeight: 600 }}>
                      {u.name}
                      {u.note && (
                        <small style={{ color: "var(--ds-fg-subtle)", fontWeight: 400 }}>
                          {" "}
                          ({u.note})
                        </small>
                      )}
                    </td>
                    <td style={tdNum}>{u.peoplePerYear.toLocaleString()}</td>
                    <td style={tdNum}>{u.touchesPerYear}</td>
                    <td style={td}>
                      <MeterCell pct={u.synagogueAffiliatedPct} />
                    </td>
                    <td style={tdNum}>{u.federationDonorPct}%</td>
                    <td style={tdNum}>
                      {u.otherJewishCampPct === null ? "—" : `${u.otherJewishCampPct}%`}
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background: depth.bg,
                          color: depth.fg,
                          border: `1px solid ${depth.border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {depth.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ── Insight ── */}
      <InsightCard
        tone="growth"
        kicker="Action"
        title="The gym is your highest-frequency, lowest-Jewish-depth room"
      >
        2,050 members average 46 visits a year but only 34% have a visible synagogue
        tie — a captive, warm audience for Jewish programming they&apos;ve never been
        invited to. Conversely, <b>Early Learning and camp families are already deep</b>{" "}
        (71% / 58% affiliated, high Federation giving): treat them as the JCC&apos;s
        relationship core, not just program revenue.
      </InsightCard>
    </div>
  );
}
