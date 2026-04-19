import Link from "next/link";
import {
  Upload,
  Shield,
  Fingerprint,
  Sparkles,
  GitCompareArrows,
  Users,
  Layers,
  BarChart3,
  Building2,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { DemoLauncher } from "@/components/demo-launcher";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "Privacy", href: "#privacy" },
  { label: "Log in", href: "/login" },
];

const capabilityPoints = [
  { label: "Anonymized", value: "100%", note: "No PII leaves the vault" },
  { label: "Any format", value: "CSV / XLSX", note: "AI-mapped columns" },
  { label: "Cross-org", value: "Peer benchmarks", note: "Community-wide comparisons" },
];

const howSteps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload your data",
    body: "Drop in a spreadsheet of event attendees or members. The system maps your columns automatically — names, emails, ages, whatever you track.",
  },
  {
    num: "02",
    icon: Shield,
    title: "PII is isolated",
    body: "Personally identifiable fields — names, emails, addresses — are stored in a separate identity vault that never touches the analytics database.",
  },
  {
    num: "03",
    icon: Fingerprint,
    title: "Each person gets an anonymous ID",
    body: "The same person across uploads gets the same anonymous number. That ID is the only identifier used for analytics, across orgs and over time.",
  },
  {
    num: "04",
    icon: Sparkles,
    title: "Analytics accumulate",
    body: "Charts show demographics, attendance, and engagement patterns — all without exposing who anyone is. The more data, the richer the picture.",
  },
];

const features = [
  {
    icon: Upload,
    title: "Smart spreadsheet ingestion",
    body: "Upload CSVs or Excel files in any format. AI identifies columns — no reformatting required before upload.",
    tag: "Data entry",
  },
  {
    icon: Shield,
    title: "Privacy-first architecture",
    body: "Personal details live in an isolated vault. Analytics are generated from anonymized, aggregated data that cannot identify individuals.",
    tag: "Security",
  },
  {
    icon: BarChart3,
    title: "Event attendee profiles",
    body: "Demographics, denomination breakdowns, and cross-org engagement for any event — enriched with composite data from the whole community.",
    tag: "Analytics",
  },
  {
    icon: GitCompareArrows,
    title: "Cross-event comparison",
    body: "Compare your events against similar programs across the community. See how your Hanukkah event stacks up against other holiday programs.",
    tag: "Benchmarking",
  },
  {
    icon: Users,
    title: "Population profiles",
    body: "Upload your membership list to see a composite demographic view — affiliation, engagement frequency, household composition — without exposing PII.",
    tag: "Members",
  },
  {
    icon: Layers,
    title: "Network effect",
    body: "Every upload enriches the community dataset. The more organizations participate, the richer and more accurate the view becomes for everyone.",
    tag: "Community",
  },
];

const personas = [
  {
    icon: Users,
    role: "Program Managers",
    body: "See how an event compares to similar events across the ecosystem, and gain a richer understanding of attendees beyond the fields you collected.",
    points: [
      "Upload event attendance data",
      "See attendee demographics and engagement",
      "Compare events to similar programs",
      "Upload population data for deeper analysis",
    ],
  },
  {
    icon: Building2,
    role: "Organizational Leaders",
    body: "See aggregate event performance and understand your population beyond the variables you track — leveraging community-wide data on the same individuals.",
    points: [
      "View aggregate event performance",
      "Understand who your org serves",
      "Hold programs accountable with data",
      "See cross-org engagement of your members",
    ],
  },
  {
    icon: TrendingUp,
    role: "Communal Leaders",
    body: "Develop a picture of engagement across the entire community with an accumulated understanding of local demographics.",
    points: [
      "See community-wide engagement patterns",
      "Understand how orgs serve the community",
      "Identify gaps in programming",
      "Make data-informed investment decisions",
    ],
  },
];

const privacyPoints = [
  {
    num: "— Isolated vault",
    title: "Names live in a separate database.",
    body: "The identity vault stores PII and nothing else. It powers lookup and anonymous-ID assignment — nothing else reads from it.",
  },
  {
    num: "— Only IDs cross",
    title: "Analytics only ever see anonymous IDs.",
    body: "No names, emails, or addresses ever reach the analytics database. Charts, comparisons, and segmentation run entirely on anonymized identifiers.",
  },
  {
    num: "— You stay in control",
    title: "Delete your data at any time.",
    body: "One request clears your organization's records from both databases. No hidden retention, no aggregated residue tied to your org.",
  },
];

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#1d2a5e" />
      <path
        d="M7 9.5L14 6L21 9.5V18.5L14 22L7 18.5V9.5Z"
        stroke="#b8892c"
        strokeWidth="1.4"
      />
      <circle cx="14" cy="14" r="2.2" fill="#b8892c" />
    </svg>
  );
}

function MarketingNav() {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md"
      style={{
        background: "rgba(251,248,242,0.92)",
        borderBottom: "1px solid var(--ds-border)",
        padding: "18px 0",
      }}
    >
      <div className="container mx-auto max-w-[1200px] px-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-inherit no-underline"
        >
          <BrandMark />
          <span
            className="font-serif"
            style={{
              fontWeight: 500,
              fontSize: 17,
              color: "var(--ink-800)",
              letterSpacing: "-0.01em",
            }}
          >
            Jewish Engagement Insights
          </span>
        </Link>
        <nav
          className="hidden md:flex gap-7 text-[13px]"
          style={{ color: "var(--stone-500)" }}
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="hover:text-[color:var(--ink-700)] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-[6px] px-4 py-2 text-[13px] font-medium text-[color:var(--paper-50)] transition-colors hover:bg-[color:var(--ink-700)]"
          style={{ background: "var(--ink-600)" }}
        >
          Get started
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}

function HeroScreenshot() {
  return (
    <div
      className="mt-16 mx-auto"
      style={{
        maxWidth: 1080,
        background: "var(--ds-bg-elevated)",
        border: "1px solid var(--ds-border)",
        borderRadius: 14,
        boxShadow: "var(--shadow-lg)",
        padding: "20px 24px",
      }}
    >
      <div className="flex gap-1.5 mb-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: "var(--paper-200)" }}
          />
        ))}
      </div>
      <div
        style={{
          background: "var(--paper-50)",
          border: "1px solid var(--ds-border)",
          borderRadius: 6,
          padding: "18px 22px",
        }}
      >
        <div
          className="flex items-center justify-between mb-3"
        >
          <div>
            <div
              className="font-semibold uppercase"
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "var(--ds-fg-muted)",
                marginBottom: 2,
              }}
            >
              Event · Purim carnival 2026
            </div>
            <div
              className="font-serif"
              style={{
                fontWeight: 500,
                fontSize: 17,
                color: "var(--ink-800)",
                letterSpacing: "-0.01em",
              }}
            >
              Attendance by age — attended vs. population
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--ds-fg-muted)" }}>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ background: "#1d2a5e" }}
              />
              Attended
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ background: "#d6cfbe" }}
              />
              Population
            </span>
          </div>
        </div>
        <svg viewBox="0 0 640 220" width="100%" height="220">
          <g stroke="#e8e0cc" strokeWidth="1">
            <line x1="40" y1="30" x2="630" y2="30" />
            <line x1="40" y1="80" x2="630" y2="80" />
            <line x1="40" y1="130" x2="630" y2="130" />
            <line x1="40" y1="180" x2="630" y2="180" />
          </g>
          <g fontFamily="Inter Tight" fontSize="10" fill="#8a8273">
            <text x="34" y="184" textAnchor="end">0%</text>
            <text x="34" y="134" textAnchor="end">10</text>
            <text x="34" y="84" textAnchor="end">20</text>
            <text x="34" y="34" textAnchor="end">30%</text>
            <text x="85" y="200" textAnchor="middle">0–12</text>
            <text x="170" y="200" textAnchor="middle">13–24</text>
            <text x="255" y="200" textAnchor="middle">25–39</text>
            <text x="340" y="200" textAnchor="middle">40–54</text>
            <text x="425" y="200" textAnchor="middle">55–69</text>
            <text x="510" y="200" textAnchor="middle">70+</text>
          </g>
          <g fill="#d6cfbe">
            <rect x="55" y="120" width="28" height="60" />
            <rect x="140" y="140" width="28" height="40" />
            <rect x="225" y="90" width="28" height="90" />
            <rect x="310" y="70" width="28" height="110" />
            <rect x="395" y="80" width="28" height="100" />
            <rect x="480" y="110" width="28" height="70" />
          </g>
          <g fill="#1d2a5e">
            <rect x="87" y="90" width="28" height="90" />
            <rect x="172" y="130" width="28" height="50" />
            <rect x="257" y="55" width="28" height="125" />
            <rect x="342" y="105" width="28" height="75" />
            <rect x="427" y="125" width="28" height="55" />
            <rect x="512" y="155" width="28" height="25" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ padding: "96px 0 80px" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 700px 400px at 20% 0%, rgba(184,137,44,0.06), transparent 60%)",
        }}
      />
      <div className="container relative mx-auto max-w-[1200px] px-8">
        <div
          className="font-semibold uppercase"
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--ochre-500)",
          }}
        >
          For Jewish organizations and communal leaders
        </div>
        <h1
          className="font-serif"
          style={{
            fontWeight: 500,
            fontSize: "clamp(44px, 7vw, 72px)",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            color: "var(--ink-800)",
            margin: "20px 0 24px",
            maxWidth: 1000,
          }}
        >
          See the full picture of{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--ochre-500)",
              fontWeight: 400,
            }}
          >
            community engagement
          </em>
          .
        </h1>
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.5,
            color: "var(--stone-500)",
            maxWidth: 680,
            margin: "0 0 32px",
          }}
        >
          Upload event attendance and membership data. Get back anonymized
          analytics that show who you serve, how your programs perform, and
          how you compare to peer organizations across the community — all
          with privacy built in.
        </p>
        <div className="flex gap-3.5 items-center flex-wrap">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[15px] font-medium text-[color:var(--paper-50)] transition-colors hover:bg-[color:var(--ink-700)]"
            style={{ background: "var(--ink-600)" }}
          >
            Start uploading data
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[15px] font-medium transition-colors hover:bg-[color:var(--paper-100)]"
            style={{ color: "var(--ink-700)" }}
          >
            See how it works
          </a>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-[60px] pt-8"
          style={{ borderTop: "1px solid var(--ds-border)" }}
        >
          {capabilityPoints.map((m) => (
            <div key={m.label}>
              <div
                className="font-semibold uppercase"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  color: "var(--ds-fg-muted)",
                  marginBottom: 8,
                }}
              >
                {m.label}
              </div>
              <div
                className="font-serif"
                style={{
                  fontSize: 26,
                  fontWeight: 500,
                  color: "var(--ink-800)",
                  letterSpacing: "-0.01em",
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--stone-500)",
                  marginTop: 4,
                }}
              >
                {m.note}
              </div>
            </div>
          ))}
        </div>

        <HeroScreenshot />
      </div>
    </section>
  );
}

function HowItWorksBand() {
  return (
    <section
      id="how-it-works"
      style={{ padding: "96px 0", borderTop: "1px solid var(--ds-border)" }}
    >
      <div className="container mx-auto max-w-[1200px] px-8">
        <div className="mb-12">
          <div
            className="font-semibold uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--ochre-500)",
            }}
          >
            How it works
          </div>
          <h2
            className="font-serif"
            style={{
              fontWeight: 500,
              fontSize: "clamp(32px, 4.5vw, 44px)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "var(--ink-800)",
              margin: "10px 0 0",
              maxWidth: 720,
            }}
          >
            From raw spreadsheets to anonymized analytics.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.num}>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color: "var(--ochre-400)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {s.num}
                  </span>
                  <div
                    className="flex h-9 w-9 items-center justify-center"
                    style={{
                      background: "var(--paper-100)",
                      borderRadius: 8,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "var(--ink-600)" }} />
                  </div>
                </div>
                <h3
                  className="font-serif"
                  style={{
                    fontWeight: 500,
                    fontSize: 19,
                    letterSpacing: "-0.01em",
                    color: "var(--ink-800)",
                    margin: "0 0 8px",
                    lineHeight: 1.3,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--stone-500)",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesBand() {
  return (
    <section
      id="features"
      style={{
        padding: "96px 0",
        background: "var(--paper-100)",
        borderTop: "1px solid var(--ds-border)",
      }}
    >
      <div className="container mx-auto max-w-[1200px] px-8">
        <div className="mb-12">
          <div
            className="font-semibold uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--ochre-500)",
            }}
          >
            Features
          </div>
          <h2
            className="font-serif"
            style={{
              fontWeight: 500,
              fontSize: "clamp(32px, 4.5vw, 44px)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "var(--ink-800)",
              margin: "10px 0 0",
              maxWidth: 720,
            }}
          >
            Built for the way Jewish orgs actually work.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                style={{
                  background: "var(--ds-bg-elevated)",
                  border: "1px solid var(--ds-border)",
                  borderRadius: 10,
                  padding: "22px 24px",
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center mb-4"
                  style={{
                    background: "var(--paper-100)",
                    borderRadius: 8,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: "var(--ink-600)" }} />
                </div>
                <div
                  className="font-semibold uppercase mb-1.5"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    color: "var(--ds-fg-muted)",
                  }}
                >
                  {f.tag}
                </div>
                <h3
                  className="font-serif"
                  style={{
                    fontWeight: 500,
                    fontSize: 18,
                    letterSpacing: "-0.01em",
                    color: "var(--ink-800)",
                    margin: "0 0 8px",
                    lineHeight: 1.3,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--stone-500)",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhoItsForBand() {
  return (
    <section
      id="who-its-for"
      style={{ padding: "96px 0", borderTop: "1px solid var(--ds-border)" }}
    >
      <div className="container mx-auto max-w-[1200px] px-8">
        <div className="mb-12">
          <div
            className="font-semibold uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--ochre-500)",
            }}
          >
            Who it&apos;s for
          </div>
          <h2
            className="font-serif"
            style={{
              fontWeight: 500,
              fontSize: "clamp(32px, 4.5vw, 44px)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "var(--ink-800)",
              margin: "10px 0 0",
              maxWidth: 720,
            }}
          >
            Tailored views for every role.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.role}
                style={{
                  background: "var(--ds-bg-elevated)",
                  border: "1px solid var(--ds-border)",
                  borderRadius: 10,
                  padding: "28px 28px",
                }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center mb-4"
                  style={{ background: "var(--ochre-100)", borderRadius: 8 }}
                >
                  <Icon className="h-5 w-5" style={{ color: "var(--ochre-500)" }} />
                </div>
                <h3
                  className="font-serif"
                  style={{
                    fontWeight: 500,
                    fontSize: 20,
                    color: "var(--ink-800)",
                    letterSpacing: "-0.01em",
                    margin: "0 0 10px",
                  }}
                >
                  {p.role}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--stone-500)",
                    lineHeight: 1.55,
                    margin: "0 0 16px",
                  }}
                >
                  {p.body}
                </p>
                <div
                  style={{
                    height: 1,
                    background: "var(--ds-border)",
                    margin: "16px 0",
                  }}
                />
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {p.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-2.5"
                      style={{
                        fontSize: 13,
                        color: "var(--stone-500)",
                        padding: "6px 0",
                      }}
                    >
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 mt-0.5"
                        style={{ color: "var(--ochre-400)" }}
                      />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PrivacyBand() {
  return (
    <section
      id="privacy"
      style={{
        padding: "96px 0",
        background: "var(--ink-800)",
        color: "var(--paper-100)",
      }}
    >
      <div className="container mx-auto max-w-[1200px] px-8">
        <div className="mb-12">
          <div
            className="font-semibold uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--ochre-300)",
            }}
          >
            Privacy by design
          </div>
          <h2
            className="font-serif"
            style={{
              fontWeight: 500,
              fontSize: "clamp(32px, 4.5vw, 44px)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "var(--paper-100)",
              margin: "10px 0 0",
              maxWidth: 720,
            }}
          >
            Two databases. Only anonymous IDs cross between them.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {privacyPoints.map((f) => (
            <div key={f.num}>
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: "var(--ochre-300)",
                  marginBottom: 14,
                  letterSpacing: "0.08em",
                }}
              >
                {f.num}
              </div>
              <h3
                className="font-serif"
                style={{
                  fontWeight: 500,
                  fontSize: 20,
                  letterSpacing: "-0.01em",
                  color: "var(--paper-50)",
                  margin: "0 0 10px",
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--paper-300)",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section
      className="text-center"
      style={{
        padding: "96px 0",
        background: "var(--paper-100)",
        borderTop: "1px solid var(--ds-border)",
      }}
    >
      <div className="container mx-auto max-w-[1200px] px-8">
        <h2
          className="font-serif"
          style={{
            fontWeight: 500,
            fontSize: "clamp(32px, 4.5vw, 44px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "var(--ink-800)",
            margin: "0 0 16px",
          }}
        >
          Ready to see your community more clearly?
        </h2>
        <p
          className="mx-auto"
          style={{
            fontSize: 16,
            color: "var(--stone-500)",
            maxWidth: 560,
            margin: "0 auto 28px",
            lineHeight: 1.55,
          }}
        >
          Start uploading your event data today. The more organizations that
          participate, the more useful the insights become for everyone.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[15px] font-medium text-[color:var(--paper-50)] transition-colors hover:bg-[color:var(--ink-700)]"
            style={{ background: "var(--ink-600)" }}
          >
            Create your account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function MarketingFooter() {
  return (
    <footer
      style={{
        background: "var(--ink-800)",
        color: "var(--paper-300)",
        padding: "40px 0",
      }}
    >
      <div className="container mx-auto max-w-[1200px] px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <BrandMark size={24} />
          <span
            className="font-serif"
            style={{
              fontWeight: 500,
              fontSize: 16,
              color: "var(--paper-50)",
            }}
          >
            Jewish Engagement Insights
          </span>
        </div>
        <div style={{ fontSize: 13, color: "var(--paper-300)" }}>
          Building a clearer understanding of Jewish community engagement.
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-full" style={{ background: "var(--paper-50)" }}>
      <MarketingNav />
      <main>
        <Hero />
        <HowItWorksBand />
        <FeaturesBand />
        <WhoItsForBand />
        <DemoLauncher />
        <PrivacyBand />
        <CtaBand />
      </main>
      <MarketingFooter />
    </div>
  );
}
