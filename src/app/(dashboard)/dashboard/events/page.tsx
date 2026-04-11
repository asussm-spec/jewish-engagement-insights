import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Plus, CalendarDays } from "lucide-react";

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage your organization&apos;s events
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className={cn(buttonVariants())}
        >
          <Plus className="mr-2 h-4 w-4" />
          Log new event
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5">
              <CalendarDays className="h-6 w-6 text-navy" />
            </div>
            <CardTitle className="text-lg">No events yet</CardTitle>
            <CardDescription>
              Log your first event to start getting insights.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
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
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {event.event_type?.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
