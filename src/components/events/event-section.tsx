import type { ReactNode } from "react";

/* Numbered, question-framed section header for the post-event dashboard.
   The three questions a program manager asks after uploading event data:
   1. Was this well attended?  2. Who participated?  3. Did we reach anyone new? */

export function QuestionSection({
  n,
  question,
  subtitle,
  children,
}: {
  n: number;
  question: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span
          className="font-serif shrink-0 inline-flex items-center justify-center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            border: "1px solid var(--ds-border-strong)",
            background: "var(--paper-100)",
            color: "var(--ochre-600)",
            fontSize: 15,
            fontWeight: 500,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {n}
        </span>
        <div className="min-w-0">
          <h2
            className="font-serif"
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: "var(--ink-800)",
              letterSpacing: "-0.01em",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {question}
          </h2>
          {subtitle && (
            <div style={{ fontSize: 13, color: "var(--stone-500)", marginTop: 3 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

/* Plain-language "answer" that leads each section — this is the product's core
   promise: hand back judgment, not just a count. A colored dot signals whether
   the read is positive (growth), a caution (below), or just neutral context. */

type LeadTone = "growth" | "below" | "neutral";

export function TakeawayLead({
  tone = "neutral",
  children,
}: {
  tone?: LeadTone;
  children: ReactNode;
}) {
  const dot =
    tone === "growth"
      ? "var(--moss-500)"
      : tone === "below"
      ? "var(--clay-500)"
      : "var(--ochre-400)";
  return (
    <div
      className="flex items-start gap-2.5"
      style={{
        padding: "12px 16px",
        background: "var(--paper-50)",
        border: "1px solid var(--ds-border)",
        borderRadius: 8,
      }}
    >
      <span
        className="shrink-0"
        style={{
          width: 9,
          height: 9,
          borderRadius: 999,
          background: dot,
          marginTop: 5,
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.5,
          color: "var(--ink-700)",
        }}
      >
        {children}
      </p>
    </div>
  );
}
