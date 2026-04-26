import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import {
  PageHead,
  Panel,
  DsButton,
} from "@/components/layout/page-primitives";
import { Plus, Users } from "lucide-react";
import { PopulationDashboard } from "@/components/population/population-dashboard";
import {
  getPopulationByOrgName,
  getPopulationForOrg,
  type AggregatedPopulation,
} from "@/lib/population-aggregator";

const DEMO_ORG_NAME = "Greater Boston JCC";

const getCachedDemo = unstable_cache(
  async () => {
    const service = createServiceClient();
    return getPopulationByOrgName(service, DEMO_ORG_NAME);
  },
  ["population-demo-v5"],
  { revalidate: 300, tags: ["population"] }
);

const getCachedReal = unstable_cache(
  async (orgId: string) => {
    const service = createServiceClient();
    return getPopulationForOrg(service, orgId);
  },
  ["population-real-v5"],
  { revalidate: 300, tags: ["population"] }
);

export default async function PopulationPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo_mode")?.value === "true";

  if (isDemo) {
    const result = await getCachedDemo();
    if (!result) {
      return <NoOrgState orgName={DEMO_ORG_NAME} />;
    }
    return (
      <PopulationView
        orgName={result.orgName}
        total={result.segments.all.totalMembers}
        segments={result.segments}
        crossOrg={result.crossOrg}
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) redirect("/dashboard/onboarding");

  const result = await getCachedReal(profile.organization_id);
  if (result.segments.all.totalMembers === 0) {
    return <EmptyState />;
  }

  return (
    <PopulationView
      orgName={result.orgName}
      total={result.segments.all.totalMembers}
      segments={result.segments}
      crossOrg={result.crossOrg}
    />
  );
}

function PopulationView({
  orgName,
  total,
  segments,
  crossOrg,
}: {
  orgName: string;
  total: number;
  segments: AggregatedPopulation["segments"];
  crossOrg: AggregatedPopulation["crossOrg"];
}) {
  return (
    <div>
      <PageHead
        breadcrumb={[{ label: "Workspace" }, { label: "Population" }]}
        title="Population"
        subtitle={`${total.toLocaleString()} people the org interacts with at ${orgName}.`}
        actions={
          <DsButton href="/dashboard/population/new" variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add population data
          </DsButton>
        }
      />
      <PopulationDashboard
        segments={segments}
        crossOrg={crossOrg}
        orgName={orgName}
        defaultSegment="all"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div>
      <PageHead
        breadcrumb={[{ label: "Workspace" }, { label: "Population" }]}
        title="Population"
        subtitle="Everyone your organization interacts with — members and event attendees, deduplicated."
        actions={
          <DsButton href="/dashboard/population/new" variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add population data
          </DsButton>
        }
      />
      <Panel>
        <div className="text-center" style={{ padding: "48px 40px", borderStyle: "dashed" }}>
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center"
            style={{ background: "var(--paper-100)", borderRadius: 10 }}
          >
            <Users className="h-5 w-5" style={{ color: "var(--ink-600)" }} />
          </div>
          <div
            className="font-serif"
            style={{
              fontWeight: 500,
              fontSize: 20,
              color: "var(--ink-800)",
              letterSpacing: "-0.01em",
              marginBottom: 6,
            }}
          >
            No population data yet.
          </div>
          <p
            className="mx-auto"
            style={{
              fontSize: 14,
              color: "var(--stone-500)",
              maxWidth: 520,
              lineHeight: 1.55,
            }}
          >
            Add a membership list or upload event attendance to start building
            your unified population profile.
          </p>
        </div>
      </Panel>
    </div>
  );
}

function NoOrgState({ orgName }: { orgName: string }) {
  return (
    <div>
      <PageHead
        breadcrumb={[{ label: "Workspace" }, { label: "Population" }]}
        title="Population"
        subtitle={`Demo org "${orgName}" not found in the database.`}
      />
      <Panel>
        <div style={{ padding: "32px" }}>
          <p style={{ color: "var(--ink-700)", fontSize: 14 }}>
            Run <code>npx tsx scripts/seed-jcc.ts</code> to seed the demo data.
          </p>
        </div>
      </Panel>
    </div>
  );
}
