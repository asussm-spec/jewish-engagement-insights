import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PageHead,
  Panel,
  StatGrid,
  StatCard,
  DsButton,
} from "@/components/layout/page-primitives";
import { Plus, Users } from "lucide-react";
import { PopulationProfile } from "@/components/population/population-profile";
import { PopulationComparison } from "@/components/population/population-comparison";
import { CrossOrgBreakdown } from "@/components/population/cross-org-breakdown";
import { CollapsibleSection } from "@/components/layout/collapsible-section";
import { TEMPLE_BETH_SHALOM_POPULATION } from "@/lib/mock-population-data";
import { SYNAGOGUE_BENCHMARKS } from "@/lib/mock-community-data";
import {
  TBS_SYNAGOGUE_BREAKDOWN,
  TBS_DAY_SCHOOL_BREAKDOWN,
  TBS_CAMP_BREAKDOWN,
  TBS_HEADLINE,
} from "@/lib/mock-cross-org-breakdown";

export default async function PopulationPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo_mode")?.value === "true";

  if (isDemo) {
    const data = TEMPLE_BETH_SHALOM_POPULATION;
    const headline = TBS_HEADLINE;
    const exclusivePct = Math.round(
      (headline.membersExclusive / headline.totalMembers) * 100
    );
    const cross2plusPct = Math.round(
      (headline.membersAt2PlusOrgs / headline.totalMembers) * 100
    );
    return (
      <div>
        <PageHead
          breadcrumb={[{ label: "Workspace" }, { label: "Population" }]}
          title="Population"
          subtitle={`${data.totalMembers.toLocaleString()} members at ${data.orgName}.`}
          actions={
            <DsButton href="/dashboard/population/new" variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Upload new member data
            </DsButton>
          }
        />

        {/* ── Top KPIs: cross-org headline numbers ── */}
        <StatGrid cols={4}>
          <StatCard
            label="Total members"
            value={headline.totalMembers.toLocaleString()}
            note="Your roster"
          />
          <StatCard
            label="Active at 2+ orgs"
            value={headline.membersAt2PlusOrgs.toLocaleString()}
            note={`${cross2plusPct}% of your members`}
          />
          <StatCard
            label="Exclusive to your org"
            value={headline.membersExclusive.toLocaleString()}
            note={`${exclusivePct}% of your members`}
          />
          <StatCard
            label="New cross-org joins"
            value={headline.newCrossOrgJoinsLastQuarter.toLocaleString()}
            note="Members who joined a 2nd org last quarter"
          />
        </StatGrid>

        {/* ── Cross-org breakdown: per org type ── */}
        <CrossOrgBreakdown
          synagogues={TBS_SYNAGOGUE_BREAKDOWN}
          daySchools={TBS_DAY_SCHOOL_BREAKDOWN}
          camps={TBS_CAMP_BREAKDOWN}
        />

        {/* ── Peer comparison (also cross-org) ── */}
        <div className="mt-8">
          <PopulationComparison
            myOrgId="tbs"
            myOrg={SYNAGOGUE_BENCHMARKS.find((s) => s.id === "tbs")!}
          />
        </div>

        {/* ── Internal demographics (collapsed) ── */}
        <div className="mt-8">
          <CollapsibleSection
            title="Internal demographics"
            sub="Age, membership types, programs, geography, family profile, gender, completeness — the kinds of cuts most CRMs already give you."
          >
            <PopulationProfile data={data} hideKpis />
          </CollapsibleSection>
        </div>
      </div>
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

  const { data: uploads } = await supabase
    .from("population_uploads")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHead
        breadcrumb={[{ label: "Workspace" }, { label: "Population" }]}
        title="Population"
        subtitle="Upload and analyze your membership and contact data."
        actions={
          <DsButton href="/dashboard/population/new" variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Upload population data
          </DsButton>
        }
      />

      {!uploads || uploads.length === 0 ? (
        <Panel>
          <div
            className="text-center"
            style={{ padding: "48px 40px", borderStyle: "dashed" }}
          >
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
                maxWidth: 480,
                lineHeight: 1.55,
              }}
            >
              Upload a membership list or contact spreadsheet to start building
              your population profile. People who already exist from event
              uploads will be enriched with the new data.
            </p>
          </div>
        </Panel>
      ) : (
        <Panel>
          <table
            className="w-full"
            style={{ borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr>
                <Th>Upload</Th>
                <Th>Date uploaded</Th>
                <Th className="text-right">Members</Th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr
                  key={upload.id}
                  style={{ borderBottom: "1px solid var(--ds-border)" }}
                  className="hover:bg-[color:var(--paper-100)] transition-colors"
                >
                  <Td>
                    <Link
                      href={`/dashboard/population/${upload.id}`}
                      className="no-underline"
                      style={{ color: "var(--ink-800)", fontWeight: 500 }}
                    >
                      {upload.name}
                    </Link>
                    {upload.description && (
                      <p
                        className="truncate max-w-sm"
                        style={{
                          fontSize: 12,
                          color: "var(--ds-fg-muted)",
                          marginTop: 2,
                        }}
                      >
                        {upload.description}
                      </p>
                    )}
                  </Td>
                  <Td style={{ color: "var(--ds-fg-muted)" }}>
                    {new Date(upload.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Td>
                  <Td
                    style={{
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {upload.member_count || 0}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={className}
      style={{
        textAlign: "left",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "var(--ds-fg-muted)",
        padding: "10px 16px",
        borderBottom: "1px solid var(--ds-border)",
        background: "var(--paper-50)",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        padding: "14px 16px",
        verticalAlign: "middle",
        color: "var(--ink-700)",
        ...style,
      }}
    >
      {children}
    </td>
  );
}
