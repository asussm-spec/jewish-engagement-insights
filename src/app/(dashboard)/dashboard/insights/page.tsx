import { PageHead, Panel } from "@/components/layout/page-primitives";
import { BarChart3 } from "lucide-react";

export default function InsightsPage() {
  return (
    <div>
      <PageHead
        breadcrumb={[{ label: "Workspace" }, { label: "Insights" }]}
        eyebrow="Quarterly memo"
        title="What we learned this quarter."
        subtitle="A memo for rabbis and lay leaders. Skim in 3 minutes; read in 10."
      />
      <Panel>
        <div
          className="text-center"
          style={{ padding: "56px 40px", borderStyle: "dashed" }}
        >
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center"
            style={{ background: "var(--paper-100)", borderRadius: 10 }}
          >
            <BarChart3 className="h-5 w-5" style={{ color: "var(--ink-600)" }} />
          </div>
          <div
            className="font-serif"
            style={{
              fontWeight: 500,
              fontSize: 22,
              color: "var(--ink-800)",
              letterSpacing: "-0.01em",
              marginBottom: 8,
            }}
          >
            Your first memo is still being composed.
          </div>
          <p
            className="mx-auto"
            style={{
              fontSize: 14,
              color: "var(--stone-500)",
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            Insights arrive once you have a population file and at least three
            events logged. The system will surface three things worth acting
            on — each with evidence, a suggested next step, and the list of
            people it&apos;s about.
          </p>
        </div>
      </Panel>
    </div>
  );
}
