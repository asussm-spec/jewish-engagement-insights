"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Users, Loader2, ArrowRight } from "lucide-react";

type Persona = {
  key: string;
  email: string;
  password: string;
  name: string;
  role: string;
  org: string;
  blurb: string;
  icon: React.ElementType;
};

const personas: Persona[] = [
  {
    key: "jcc-pm",
    email: "demo.jcc.pm@example.com",
    password: "demo-jcc-pm-2026",
    name: "Maya Stern",
    role: "Program Manager",
    org: "Greater Boston JCC",
    blurb:
      "Runs family programming at a 1,600-member JCC. See how events compare, who shows up, and which segments are shifting.",
    icon: Users,
  },
];

export function DemoLauncher() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function launch(persona: Persona) {
    setError(null);
    setLoading(persona.key);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: persona.email,
      password: persona.password,
    });
    if (error) {
      setError(`Couldn't launch demo: ${error.message}`);
      setLoading(null);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section
      id="demo"
      style={{
        padding: "96px 0",
        background: "var(--paper-100)",
        borderTop: "1px solid var(--ds-border)",
      }}
    >
      <div className="container mx-auto max-w-[1200px] px-8">
        <div className="mb-10">
          <div
            className="font-semibold uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--ochre-500)",
            }}
          >
            See it in action
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
            Step into a live demo workspace.
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--stone-500)",
              lineHeight: 1.55,
              marginTop: 12,
              maxWidth: 640,
            }}
          >
            One click and you&apos;re logged in as a sample user with realistic
            membership, events, and attendance data. Explore the dashboard the
            way someone in that role would.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {personas.map((p) => {
            const Icon = p.icon;
            const isLoading = loading === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => launch(p)}
                disabled={!!loading}
                className="text-left transition-shadow hover:shadow-md disabled:opacity-60 disabled:cursor-wait"
                style={{
                  background: "var(--ds-bg-elevated)",
                  border: "1px solid var(--ds-border)",
                  borderRadius: 10,
                  padding: "24px 26px",
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center mb-4"
                  style={{
                    background: "var(--ochre-100)",
                    borderRadius: 8,
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: "var(--ochre-500)" }}
                  />
                </div>
                <div
                  className="font-semibold uppercase mb-1"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    color: "var(--ds-fg-muted)",
                  }}
                >
                  {p.role}
                </div>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: "var(--ink-800)",
                    letterSpacing: "-0.01em",
                    margin: "0 0 4px",
                  }}
                >
                  {p.name}
                </h3>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--stone-500)",
                    marginBottom: 14,
                  }}
                >
                  {p.org}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--stone-600)",
                    lineHeight: 1.55,
                    margin: "0 0 18px",
                  }}
                >
                  {p.blurb}
                </p>
                <div
                  className="inline-flex items-center gap-1.5"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--ink-700)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        style={{ color: "var(--ochre-500)" }}
                      />
                      Launching…
                    </>
                  ) : (
                    <>
                      Launch demo
                      <ArrowRight
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--ochre-500)" }}
                      />
                    </>
                  )}
                </div>
              </button>
            );
          })}

          {/* Placeholder cards for the two upcoming demos */}
          <ComingSoonCard
            role="Organizational Leader"
            label="JCC CEO"
            blurb="Aggregate org-wide engagement, peer benchmarks, and the health of the JCC's full program portfolio."
          />
          <ComingSoonCard
            role="Communal Leader"
            label="Federation"
            blurb="Cross-org visibility across synagogues, JCCs, and day schools in a metro community."
          />
        </div>

        {error && (
          <div
            className="mt-6"
            style={{
              fontSize: 13,
              color: "var(--clay-600)",
              background: "#f2ded7",
              border: "1px solid #e2c4b9",
              borderRadius: 6,
              padding: "10px 14px",
              maxWidth: 720,
            }}
          >
            {error}
          </div>
        )}
      </div>
    </section>
  );
}

function ComingSoonCard({
  role,
  label,
  blurb,
}: {
  role: string;
  label: string;
  blurb: string;
}) {
  return (
    <div
      style={{
        border: "1px dashed var(--ds-border-strong)",
        borderRadius: 10,
        padding: "24px 26px",
        background: "transparent",
      }}
    >
      <div
        className="font-semibold uppercase mb-1"
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          color: "var(--ds-fg-muted)",
        }}
      >
        {role}
      </div>
      <h3
        className="font-serif"
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: "var(--stone-500)",
          letterSpacing: "-0.01em",
          margin: "0 0 10px",
        }}
      >
        {label}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--stone-500)",
          lineHeight: 1.55,
          margin: "0 0 14px",
        }}
      >
        {blurb}
      </p>
      <div
        className="font-mono"
        style={{
          fontSize: 11,
          color: "var(--ds-fg-muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Coming soon
      </div>
    </div>
  );
}
