import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Upload, Users, CalendarDays } from "lucide-react";
import { EventCharts } from "@/components/events/event-charts";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  // Get attendee profiles for charts
  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("person_id")
    .eq("event_id", id);

  const personIds = attendees?.map((a) => a.person_id) || [];

  let profileData: {
    age_bucket: string | null;
    denomination: string | null;
  }[] = [];

  if (personIds.length > 0) {
    const { data } = await supabase
      .from("people_profiles")
      .select("age_bucket, denomination")
      .in("id", personIds);
    profileData = data || [];
  }

  return (
    <div>
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      {/* Event header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className="capitalize">
              {event.event_type?.replace("_", " ")}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(event.event_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {event.attendee_count} attendees
            </span>
          </div>
          {event.short_description && (
            <p className="mt-3 text-muted-foreground">
              {event.short_description}
            </p>
          )}
        </div>
        <Link
          href={`/dashboard/events/${id}/upload`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload more data
        </Link>
      </div>

      {/* Charts */}
      {profileData.length > 0 ? (
        <EventCharts profiles={profileData} />
      ) : (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <CardTitle className="text-lg">No attendee data yet</CardTitle>
            <CardDescription>
              Upload a spreadsheet of attendees to see insights.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
