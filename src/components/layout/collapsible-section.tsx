"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  sub?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Lightweight collapsible section. Closed by default.
 *
 * Used to de-emphasize secondary content (e.g. internal demographics
 * on the population page) without removing it.
 */
export function CollapsibleSection({
  title,
  sub,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: "var(--ds-bg-elevated)",
        border: "1px solid var(--ds-border)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start gap-3 text-left"
        style={{
          padding: "16px 20px",
          background: open ? "var(--paper-100)" : "transparent",
          borderBottom: open ? "1px solid var(--ds-border)" : "none",
          transition: "background 0.15s ease",
          cursor: "pointer",
        }}
      >
        <ChevronDown
          className="h-4 w-4 mt-0.5 shrink-0"
          style={{
            color: "var(--ink-600)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s ease",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            className="font-serif"
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "var(--ink-800)",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            {title}
          </div>
          {sub && (
            <div
              style={{
                fontSize: 13,
                color: "var(--stone-500)",
                marginTop: 4,
                lineHeight: 1.45,
              }}
            >
              {sub}
            </div>
          )}
        </div>
      </button>
      {open && <div style={{ padding: "20px" }}>{children}</div>}
    </div>
  );
}
