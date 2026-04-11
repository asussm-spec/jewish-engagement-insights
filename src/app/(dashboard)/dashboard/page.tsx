import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarDays, Upload, Users, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
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

  // If user hasn't joined an org yet, redirect to onboarding
  if (!profile?.organization_id) {
    redirect("/dashboard/onboarding");
  }

  // Get event count for this org
  const { count: eventCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", profile.organization_id);

  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {profile.organizations?.name} &middot;{" "}
          {profile.role?.replace("_", " ")}
        </p>
      </div>

      {eventCount === 0 ? (
        /* Empty state — first time */
        <Card className="border-dashed">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Log your first event</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Upload attendance data from a recent event to start building
              insights about your community.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Link
              href="/dashboard/events/new"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-4"
              )}
            >
              <Upload className="mr-2 h-4 w-4" />
              Log an event
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Quick actions */
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/dashboard/events/new" className="group">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 mb-2">
                  <CalendarDays className="h-5 w-5 text-navy" />
                </div>
                <CardTitle className="text-base flex items-center gap-2">
                  Log new event
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription>
                  Upload attendance data from a recent event
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/population" className="group">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 mb-2">
                  <Users className="h-5 w-5 text-navy" />
                </div>
                <CardTitle className="text-base flex items-center gap-2">
                  Upload population
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription>
                  Import your membership or contact list
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/events" className="group">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 mb-2">
                  <Upload className="h-5 w-5 text-navy" />
                </div>
                <CardTitle className="text-base flex items-center gap-2">
                  View events ({eventCount})
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription>
                  See all events and their insights
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
