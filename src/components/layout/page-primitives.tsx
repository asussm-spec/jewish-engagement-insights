import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Page head — breadcrumb + serif H1 + subtitle + action slot
   ───────────────────────────────────────────────────────────── */

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <div className="text-[12px] mb-1" style={{ color: "var(--ds-fg-muted)" }}>
      {items.map((it, i) => (
        <span key={i}>
          {it.href ? (
            <Link
              href={it.href}
              className="no-underline hover:underline"
              style={{ color: "var(--ds-fg-muted)" }}
            >
              {it.label}
            </Link>
          ) : (
            <span>{it.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-1.5">/</span>}
        </span>
      ))}
    </div>
  );
}

export function PageHead({
  breadcrumb,
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  breadcrumb?: { label: string; href?: string }[];
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-8 mb-7">
      <div className="min-w-0">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        {eyebrow && (
          <div
            className="font-semibold uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--ochre-500)",
              marginBottom: 4,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          className="font-serif"
          style={{
            fontWeight: 500,
            fontSize: 32,
            letterSpacing: "-0.015em",
            color: "var(--ink-800)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div
            style={{
              color: "var(--stone-500)",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Stat card — label + big serif value + delta/note
   ───────────────────────────────────────────────────────────── */

export function StatCard({
  label,
  value,
  unit,
  delta,
  note,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: { direction: "up" | "down" | "flat"; text: string };
  note?: string;
}) {
  const deltaColor =
    delta?.direction === "up"
      ? "var(--moss-600)"
      : delta?.direction === "down"
      ? "var(--clay-600)"
      : "var(--ds-fg-muted)";
  const arrow =
    delta?.direction === "up" ? "↑" : delta?.direction === "down" ? "↓" : "—";

  return (
    <div
      style={{
        background: "var(--ds-bg-elevated)",
        border: "1px solid var(--ds-border)",
        borderRadius: 10,
        padding: "18px 20px",
      }}
    >
      <div
        className="font-semibold uppercase"
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          color: "var(--ds-fg-muted)",
        }}
      >
        {label}
      </div>
      <div
        className="font-serif mt-2.5"
        style={{
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1,
          color: "var(--ink-800)",
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: 20, color: "var(--stone-400)" }}>{unit}</span>
        )}
      </div>
      {(delta || note) && (
        <div className="flex items-center gap-2 mt-2.5" style={{ fontSize: 12 }}>
          {delta && (
            <span
              className="inline-flex items-center gap-0.5 font-medium"
              style={{ color: deltaColor }}
            >
              {arrow} {delta.text}
            </span>
          )}
          {note && <span style={{ color: "var(--ds-fg-muted)" }}>{note}</span>}
        </div>
      )}
    </div>
  );
}

export function StatGrid({
  children,
  cols = 4,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const colClasses: Record<number, string> = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };
  return <div className={cn("grid gap-4 mb-6", colClasses[cols])}>{children}</div>;
}

/* ─────────────────────────────────────────────────────────────
   Panel — primary container with header + body
   ───────────────────────────────────────────────────────────── */

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{
        background: "var(--ds-bg-elevated)",
        border: "1px solid var(--ds-border)",
        borderRadius: 10,
      }}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4"
      style={{
        padding: "18px 20px 14px",
        borderBottom: "1px solid var(--ds-border)",
      }}
    >
      <div>
        <h3
          className="font-serif"
          style={{
            fontWeight: 500,
            fontSize: 18,
            color: "var(--ink-800)",
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          {title}
        </h3>
        {sub && (
          <div
            style={{ fontSize: 12, color: "var(--ds-fg-muted)", marginTop: 2 }}
          >
            {sub}
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PanelBody({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={className} style={padded ? { padding: 20 } : undefined}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Insight card — left-border callout
   ───────────────────────────────────────────────────────────── */

type InsightTone = "pattern" | "growth" | "at-risk";

export function InsightCard({
  tone = "pattern",
  kicker,
  title,
  children,
}: {
  tone?: InsightTone;
  kicker?: string;
  title: string;
  children?: ReactNode;
}) {
  const color =
    tone === "growth"
      ? "var(--moss-400)"
      : tone === "at-risk"
      ? "var(--clay-400)"
      : "var(--ochre-400)";
  const kickerColor =
    tone === "growth"
      ? "var(--moss-600)"
      : tone === "at-risk"
      ? "var(--clay-600)"
      : "var(--ochre-500)";
  const kickerText = kicker ?? (
    tone === "growth" ? "Growth" : tone === "at-risk" ? "At risk" : "Pattern"
  );
  return (
    <div
      style={{
        padding: 20,
        borderLeft: `2px solid ${color}`,
        background: "var(--paper-50)",
        borderRadius: "0 6px 6px 0",
      }}
    >
      <div
        className="font-semibold uppercase"
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          color: kickerColor,
          marginBottom: 6,
        }}
      >
        {kickerText}
      </div>
      <div
        className="font-serif"
        style={{
          fontSize: 18,
          fontWeight: 500,
          color: "var(--ink-800)",
          margin: "0 0 6px",
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
      {children && (
        <div
          style={{
            fontSize: 13,
            color: "var(--stone-600)",
            lineHeight: 1.55,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Chip — pill tag
   ───────────────────────────────────────────────────────────── */

type ChipTone = "default" | "ochre" | "moss" | "clay" | "ink";

export function Chip({
  tone = "default",
  children,
}: {
  tone?: ChipTone;
  children: ReactNode;
}) {
  const styles: Record<ChipTone, { bg: string; fg: string; border: string }> = {
    default: {
      bg: "var(--paper-100)",
      fg: "var(--ink-700)",
      border: "var(--ds-border)",
    },
    ochre: {
      bg: "var(--ochre-100)",
      fg: "var(--ochre-600)",
      border: "var(--ochre-200)",
    },
    moss: { bg: "#e5ece1", fg: "var(--moss-600)", border: "#cedac7" },
    clay: { bg: "#f2ded7", fg: "var(--clay-600)", border: "#e2c4b9" },
    ink: {
      bg: "var(--ink-600)",
      fg: "var(--paper-50)",
      border: "var(--ink-600)",
    },
  };
  const s = styles[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Button helpers (lightweight; use shadcn Button for forms)
   ───────────────────────────────────────────────────────────── */

export function DsButton({
  variant = "primary",
  size = "md",
  as: Comp = "button",
  href,
  className,
  children,
  ...props
}: {
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  as?: "button" | "a";
  href?: string;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const sizeStyles =
    size === "sm"
      ? { padding: "6px 12px", fontSize: 13 }
      : size === "lg"
      ? { padding: "12px 22px", fontSize: 15 }
      : { padding: "9px 16px", fontSize: 14 };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--ink-600)",
      color: "var(--paper-50)",
      border: "1px solid transparent",
    },
    secondary: {
      background: "var(--ds-bg-elevated)",
      color: "var(--ink-700)",
      border: "1px solid var(--ds-border-strong)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ink-700)",
      border: "1px solid transparent",
    },
    accent: {
      background: "var(--ochre-400)",
      color: "var(--ink-800)",
      border: "1px solid transparent",
      fontWeight: 600,
    },
  };

  const style = {
    ...sizeStyles,
    ...variantStyles[variant],
    borderRadius: 6,
    fontWeight: variantStyles[variant].fontWeight ?? 500,
    lineHeight: 1,
    whiteSpace: "nowrap" as const,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "background 0.14s, border-color 0.14s, color 0.14s",
  };

  if (Comp === "a" || href) {
    return (
      <Link
        href={href || "#"}
        className={cn("no-underline", className)}
        style={style}
      >
        {children}
      </Link>
    );
  }
  return (
    <button className={className} style={style} {...props}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Progress bar — for engagement funnel, segment breakdowns
   ───────────────────────────────────────────────────────────── */

export function ProgressRow({
  label,
  value,
  pct,
  tone = "ink",
}: {
  label: string;
  value: ReactNode;
  pct: number;
  tone?: "ink" | "ochre" | "moss";
}) {
  const fillColor =
    tone === "ochre"
      ? "var(--ochre-400)"
      : tone === "moss"
      ? "var(--moss-400)"
      : "var(--ink-600)";
  return (
    <div
      className="grid items-center py-2.5"
      style={{
        gridTemplateColumns: "140px 1fr 60px",
        gap: 14,
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--ink-700)", fontWeight: 500 }}>{label}</span>
      <div
        style={{
          height: 8,
          background: "var(--paper-100)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: fillColor,
            borderRadius: 999,
            width: `${Math.max(0, Math.min(100, pct))}%`,
          }}
        />
      </div>
      <span
        style={{
          fontVariantNumeric: "tabular-nums",
          fontSize: 12,
          color: "var(--ds-fg-muted)",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
