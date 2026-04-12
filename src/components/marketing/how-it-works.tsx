"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Shield, Fingerprint, Sparkles } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock visuals for each step                                        */
/* ------------------------------------------------------------------ */

function SpreadsheetMockup() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-md w-full max-w-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          attendees.csv
        </span>
      </div>
      {/* Header row */}
      <div className="grid grid-cols-4 gap-1 mb-1">
        {["Name", "Email", "Age", "Zip"].map((h) => (
          <div
            key={h}
            className="rounded bg-navy/10 px-2 py-1 text-[10px] font-semibold text-navy"
          >
            {h}
          </div>
        ))}
      </div>
      {/* Data rows */}
      {[
        ["Sarah L.", "sarah@...", "34", "10021"],
        ["David K.", "david@...", "28", "10024"],
        ["Rachel M.", "rachel@...", "41", "10025"],
        ["Ari B.", "ari@...", "36", "10019"],
      ].map((row, i) => (
        <div key={i} className="grid grid-cols-4 gap-1 mb-0.5">
          {row.map((cell, j) => (
            <div
              key={j}
              className="rounded bg-cream/80 px-2 py-1 text-[10px] text-muted-foreground"
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
      {/* Upload indicator */}
      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gold/30 py-2">
        <Upload className="h-3.5 w-3.5 text-gold" />
        <span className="text-[10px] font-medium text-gold">
          Uploading...
        </span>
      </div>
    </div>
  );
}

function ScrubMockup() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-md w-full max-w-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-navy" />
        <span className="text-[10px] text-muted-foreground font-mono">
          PII removal in progress
        </span>
      </div>
      {/* Header row */}
      <div className="grid grid-cols-4 gap-1 mb-1">
        {["Name", "Email", "Age", "Zip"].map((h) => (
          <div
            key={h}
            className={`rounded px-2 py-1 text-[10px] font-semibold ${
              h === "Name" || h === "Email"
                ? "bg-red-100 text-red-600 line-through"
                : "bg-navy/10 text-navy"
            }`}
          >
            {h}
          </div>
        ))}
      </div>
      {/* Data rows with redactions */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="grid grid-cols-4 gap-1 mb-0.5">
          {/* Redacted name */}
          <div className="rounded bg-red-50 px-2 py-1">
            <div className="h-2.5 w-full rounded bg-red-200/60" />
          </div>
          {/* Redacted email */}
          <div className="rounded bg-red-50 px-2 py-1">
            <div className="h-2.5 w-full rounded bg-red-200/60" />
          </div>
          {/* Kept: age */}
          <div className="rounded bg-green-50 px-2 py-1 text-[10px] text-green-700">
            {["34", "28", "41", "36"][i]}
          </div>
          {/* Kept: zip */}
          <div className="rounded bg-green-50 px-2 py-1 text-[10px] text-green-700">
            {["10021", "10024", "10025", "10019"][i]}
          </div>
        </div>
      ))}
      {/* Status bar */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-navy/5 px-3 py-2">
        <div className="h-2 flex-1 rounded-full bg-navy/10 overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-navy animate-pulse" />
        </div>
        <span className="text-[10px] text-navy font-medium">Scrubbing PII</span>
      </div>
    </div>
  );
}

function AnonymousIdMockup() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-md w-full max-w-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2 mb-3">
        <Fingerprint className="h-4 w-4 text-navy" />
        <span className="text-[10px] text-muted-foreground font-mono">
          Identity resolution
        </span>
      </div>
      {/* ID cards */}
      {[
        { id: "a7f2c9", age: "34", zip: "10021", events: "12" },
        { id: "b3e8d1", age: "28", zip: "10024", events: "5" },
        { id: "c9a4f6", age: "41", zip: "10025", events: "23" },
        { id: "d1b7e3", age: "36", zip: "10019", events: "8" },
      ].map((person) => (
        <div
          key={person.id}
          className="mb-1.5 flex items-center gap-3 rounded-lg border bg-cream/50 px-3 py-2"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10">
            <Fingerprint className="h-3.5 w-3.5 text-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono font-semibold text-navy">
              ID: {person.id}
            </span>
            <div className="flex gap-2 mt-0.5">
              <span className="text-[9px] text-muted-foreground">
                Age {person.age}
              </span>
              <span className="text-[9px] text-muted-foreground">
                Zip {person.zip}
              </span>
              <span className="text-[9px] text-gold font-medium">
                {person.events} events
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsMockup() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-md w-full max-w-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-gold" />
        <span className="text-[10px] text-muted-foreground font-mono">
          Community insights dashboard
        </span>
      </div>
      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Total reach", value: "1,247" },
          { label: "Avg. events", value: "4.2" },
          { label: "Cross-org", value: "38%" },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-lg bg-navy/5 px-2 py-2 text-center"
          >
            <div className="text-sm font-bold text-navy">{m.value}</div>
            <div className="text-[8px] text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>
      {/* Mini bar chart */}
      <div className="rounded-lg border p-3">
        <div className="text-[9px] font-semibold text-navy mb-2">
          Attendance by program type
        </div>
        <div className="flex items-end gap-1.5 h-16">
          {[
            { h: "75%", label: "Holiday" },
            { h: "55%", label: "Shabbat" },
            { h: "90%", label: "Family" },
            { h: "40%", label: "Young Pro" },
            { h: "65%", label: "Learning" },
          ].map((bar) => (
            <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-navy to-navy-light"
                style={{ height: bar.h }}
              />
              <span className="text-[7px] text-muted-foreground leading-none">
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Mini demographics row */}
      <div className="mt-2 flex gap-2">
        <div className="flex-1 rounded-lg border p-2">
          <div className="text-[8px] text-muted-foreground mb-1">Age dist.</div>
          <div className="flex gap-0.5 h-6">
            {[
              { w: "15%", color: "bg-gold-light/40" },
              { w: "30%", color: "bg-gold-light/60" },
              { w: "35%", color: "bg-gold" },
              { w: "20%", color: "bg-gold-dark/60" },
            ].map((seg, i) => (
              <div
                key={i}
                className={`rounded-sm ${seg.color}`}
                style={{ width: seg.w, minWidth: 4 }}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 rounded-lg border p-2">
          <div className="text-[8px] text-muted-foreground mb-1">Engagement</div>
          <div className="flex gap-0.5 h-6">
            {[
              { w: "40%", color: "bg-navy/20" },
              { w: "35%", color: "bg-navy/50" },
              { w: "25%", color: "bg-navy" },
            ].map((seg, i) => (
              <div
                key={i}
                className={`rounded-sm ${seg.color}`}
                style={{ width: seg.w, minWidth: 4 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single animated step                                              */
/* ------------------------------------------------------------------ */

function Step({
  index,
  stepNum,
  icon: Icon,
  title,
  description,
  visual,
  isLast,
}: {
  index: number;
  stepNum: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  visual: React.ReactNode;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-10">
      {/* Left column (text or visual depending on even/odd) */}
      <div
        className={`flex items-center ${isEven ? "md:justify-end" : "md:order-3 md:justify-start"} transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: "100ms" }}
      >
        {isEven ? (
          <div className="max-w-md text-left md:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold text-gold/40">{stepNum}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5">
                <Icon className="h-5 w-5 text-navy" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        ) : (
          <div className="flex justify-center md:justify-start">{visual}</div>
        )}
      </div>

      {/* Center timeline */}
      <div className="hidden md:flex flex-col items-center">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-gold/30 bg-white z-10 transition-all duration-500 ${
            visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <Icon className="h-5 w-5 text-navy" />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-gold/30 to-gold/10 origin-top transition-transform duration-700"
            style={{
              transform: visible ? "scaleY(1)" : "scaleY(0)",
              transitionDelay: "300ms",
            }}
          />
        )}
      </div>

      {/* Right column */}
      <div
        className={`flex items-center ${isEven ? "md:justify-start" : "md:order-1 md:justify-end"} transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: "300ms" }}
      >
        {isEven ? (
          <div className="flex justify-center md:justify-start">{visual}</div>
        ) : (
          <div className="max-w-md text-left md:text-left">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold text-gold/40">{stepNum}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5">
                <Icon className="h-5 w-5 text-navy" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section export                                               */
/* ------------------------------------------------------------------ */

const steps = [
  {
    stepNum: "01",
    icon: Upload,
    title: "Submit your data",
    description:
      "Upload any spreadsheet of event attendees or members. Our AI maps your columns automatically — names, emails, ages, whatever you track.",
    visual: <SpreadsheetMockup />,
  },
  {
    stepNum: "02",
    icon: Shield,
    title: "PII is scrubbed",
    description:
      "The system strips all personally identifiable information — emails, names, and addresses — and stores it in a secure, isolated database that powers nothing but identity resolution.",
    visual: <ScrubMockup />,
  },
  {
    stepNum: "03",
    icon: Fingerprint,
    title: "Anonymous IDs are created",
    description:
      "Each person receives a unique anonymized user ID. This is the only identifier used going forward — it links data across uploads and organizations without ever exposing who someone is.",
    visual: <AnonymousIdMockup />,
  },
  {
    stepNum: "04",
    icon: Sparkles,
    title: "Insights are generated",
    description:
      "Anonymous IDs connect data across the community, building richer profiles over time. See who attends your events, how programs compare, and what engagement looks like — all without PII.",
    visual: <InsightsMockup />,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b bg-cream">
      <div className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            From raw data to community insights
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No data formatting required. Upload what you have and the system
            handles anonymization, identity resolution, and insight generation.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl flex flex-col gap-12 md:gap-0">
          {steps.map((step, i) => (
            <Step
              key={step.stepNum}
              index={i}
              stepNum={step.stepNum}
              icon={step.icon}
              title={step.title}
              description={step.description}
              visual={step.visual}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
