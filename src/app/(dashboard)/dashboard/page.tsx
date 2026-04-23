import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PageHead,
  StatGrid,
  StatCard,
  Panel,
  PanelHeader,
  PanelBody,
  InsightCard,
  DsButton,
} from "@/components/layout/page-primitives";
import { CalendarDays, Upload, Users, Plus } from "lucide-react";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo_mode")?.value === "true";

  let firstName = "Sarah";
  let orgName = "Temple Beth Shalom";
  let eventCount: number | null = 12;
  let populationCount: number | null = 412;

  if (!isDemo) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, organizations(*)")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) redirect("/dashboard/onboarding");

    const { count: eventCountResult } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id);

    const { count: populationCountResult } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id);

    firstName = profile.full_name?.split(" ")[0] || "there";
    orgName = profile.organizations?.name || "";
    eventCount = eventCountResult;
    populationCount = populationCountResult;
  }

  return (
    <div>
      <PageHead
        breadcrumb={[
          { label: "Workspace" },
          { label: "Dashboard" },
        ]}
        title={`Good morning, ${firstName}.`}
        subtitle={
          orgName
            ? `Here's what's been happening at ${orgName}.`
            : "Here's what's been happening."
        }
        actions={
          <DsButton variant="primary" size="sm" href="/dashboard/events/new">
            <Plus className="h-3.5 w-3.5" />
            Add event
          </DsButton>
        }
      />

      {eventCount === 0 ? (
        <EmptyState />
      ) : (
        <>
          <StatGrid cols={4}>
            <StatCard
              label="Population"
              value={populationCount?.toLocaleString() ?? "—"}
              note="Unique participants"
            />
            <StatCard
              label="Events hosted"
              value={eventCount ?? 0}
              note="Lifetime"
            />
            <StatCard
              label="Latest upload"
              value="—"
              note="No data yet"
            />
            <StatCard
              label="Engagement index"
              value="—"
              note="Needs more events"
            />
          </StatGrid>

          <div className="grid gap-4 md:grid-cols-3">
            <QuickAction
              href="/dashboard/events/new"
              icon={CalendarDays}
              title="Log new event"
              body="Upload attendance data from a recent event."
            />
            <QuickAction
              href="/dashboard/population"
              icon={Users}
              title="Upload population"
              body="Import your membership or contact list."
            />
            <QuickAction
              href="/dashboard/events"
              icon={Upload}
              title={`View events (${eventCount ?? 0})`}
              body="See all events and their insights."
            />
          </div>

          <div className="mt-6">
            <Panel>
              <PanelHeader
                title="Signals worth noticing"
                sub="Auto-generated as your data grows"
              />
              <PanelBody padded={false}>
                <div style={{ padding: "14px 20px" }}>
                  <InsightCard tone="pattern" title="No signals yet.">
                    Upload 2–3 events and a population file. We&apos;ll
                    surface patterns, growth areas, and at-risk segments here
                    automatically.
                  </InsightCard>
                </div>
              </PanelBody>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="no-underline transition-shadow hover:shadow-md"
      style={{
        display: "block",
        background: "var(--ds-bg-elevated)",
        border: "1px solid var(--ds-border)",
        borderRadius: 10,
        padding: "20px 22px",
      }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center mb-3"
        style={{
          background: "var(--paper-100)",
          borderRadius: 8,
        }}
      >
        <Icon className="h-5 w-5" style={{ color: "var(--ink-600)" }} />
      </div>
      <div
        className="font-serif"
        style={{
          fontSize: 17,
          fontWeight: 500,
          color: "var(--ink-800)",
          letterSpacing: "-0.01em",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--stone-500)",
          lineHeight: 1.5,
        }}
      >
        {body}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <Panel>
      <div
        style={{
          padding: "48px 40px",
          textAlign: "center",
          borderStyle: "dashed",
        }}
      >
        <div
          className="font-serif"
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "var(--ink-800)",
            letterSpacing: "-0.01em",
            marginBottom: 8,
          }}
        >
          Log your first event.
        </div>
        <p
          className="mx-auto"
          style={{
            fontSize: 14,
            color: "var(--stone-500)",
            maxWidth: 480,
            lineHeight: 1.55,
            marginBottom: 20,
          }}
        >
          Upload attendance data from a recent event to start building
          insights about your community.
        </p>
        <DsButton variant="primary" href="/dashboard/events/new">
          <Upload className="h-4 w-4" />
          Log an event
        </DsButton>
      </div>
    </Panel>
  );
}
