import { cookies } from "next/headers";
import { PageHead, Panel } from "@/components/layout/page-primitives";
import { BarChart3 } from "lucide-react";
import { CommunityInsights } from "@/components/insights/community-insights";

export default async function InsightsPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo_mode")?.value === "true";

  if (isDemo) {
    return (
      <div>
        <PageHead
          breadcrumb={[{ label: "Workspace" }, { label: "Community Insights" }]}
          title="Community Insights"
          subtitle="Cross-organizational analytics across the Greater Boston Jewish community."
        />
        <CommunityInsights />
      </div>
    );
  }

  return (
    <div>
      <PageHead
        breadcrumb={[{ label: "Workspace" }, { label: "Community Insights" }]}
        title="Community Insights"
        subtitle="Cross-organizational benchmarks and community-wide analytics."
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
            Community insights are still being composed.
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
            Cross-org benchmarking and community-wide analytics arrive once
            multiple organizations are uploading data.
          </p>
        </div>
      </Panel>
    </div>
  );
}
