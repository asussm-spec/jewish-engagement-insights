import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PageHead,
  Panel,
  Chip,
  DsButton,
} from "@/components/layout/page-primitives";
import { Plus, CalendarDays } from "lucide-react";

const typeToneMap: Record<string, "ochre" | "default" | "moss"> = {
  shabbat: "ochre",
  education: "default",
  social: "moss",
  holiday: "ochre",
  life_cycle: "default",
};

export default async function EventsPage() {
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

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("event_date", { ascending: false });

  return (
    <div>
      <PageHead
        breadcrumb={[{ label: "Workspace" }, { label: "Events" }]}
        title="Events"
        subtitle="Every event is a comparison against itself and against peers."
        actions={
          <DsButton href="/dashboard/events/new" variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Log new event
          </DsButton>
        }
      />

      {!events || events.length === 0 ? (
        <Panel>
          <div
            className="text-center"
            style={{
              padding: "48px 40px",
              borderStyle: "dashed",
            }}
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center"
              style={{
                background: "var(--paper-100)",
                borderRadius: 10,
              }}
            >
              <CalendarDays
                className="h-5 w-5"
                style={{ color: "var(--ink-600)" }}
              />
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
              No events yet.
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--stone-500)",
                maxWidth: 400,
                margin: "0 auto",
                lineHeight: 1.55,
              }}
            >
              Log your first event to start getting insights.
            </p>
          </div>
        </Panel>
      ) : (
        <Panel>
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Event</Th>
                <Th>Type</Th>
                <Th>Date</Th>
                <Th className="text-right">Attendees</Th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const tone = typeToneMap[event.event_type ?? ""] ?? "default";
                return (
                  <tr
                    key={event.id}
                    style={{
                      borderBottom: "1px solid var(--ds-border)",
                    }}
                    className="hover:bg-[color:var(--paper-100)] transition-colors"
                  >
                    <Td>
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="no-underline"
                        style={{ color: "var(--ink-800)", fontWeight: 500 }}
                      >
                        {event.name}
                      </Link>
                      {event.short_description && (
                        <p
                          className="truncate max-w-sm"
                          style={{
                            fontSize: 12,
                            color: "var(--ds-fg-muted)",
                            marginTop: 2,
                          }}
                        >
                          {event.short_description}
                        </p>
                      )}
                    </Td>
                    <Td>
                      {event.event_type && (
                        <Chip tone={tone}>
                          <span className="capitalize">
                            {event.event_type.replace("_", " ")}
                          </span>
                        </Chip>
                      )}
                    </Td>
                    <Td style={{ color: "var(--ds-fg-muted)" }}>
                      {new Date(event.event_date).toLocaleDateString("en-US", {
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
                      {event.attendee_count || 0}
                    </Td>
                  </tr>
                );
              })}
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
