import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

export default async function EventsByTypePage({
  searchParams,
}: {
  searchParams: Promise<{ orgId?: string; eventType?: string; orgName?: string }>;
}) {
  const { orgId, eventType, orgName } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!orgId || !eventType) notFound();

  const { data: events } = await supabase
    .from("events")
    .select("id, name, event_date, event_type, attendee_count, short_description")
    .eq("organization_id", orgId)
    .eq("event_type", eventType)
    .order("event_date", { ascending: false });

  const typeLabel = eventType.replace("_", " ");
  const displayOrgName = orgName || "Organization";

  return (
    <div>
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {displayOrgName} — <span className="capitalize">{typeLabel}</span> Events
        </h1>
        <p className="mt-1 text-muted-foreground">
          {events?.length || 0} events
        </p>
      </div>

      {!events || events.length === 0 ? (
        <p className="text-muted-foreground">No events found.</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Attendees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="font-medium hover:underline"
                    >
                      {event.name}
                    </Link>
                    {event.short_description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                        {event.short_description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(event.event_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {event.attendee_count || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
