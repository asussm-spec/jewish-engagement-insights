import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Upload, Users, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            <span className="text-lg font-semibold">
              Jewish Engagement Insights
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              Log in
            </Link>
            <Link href="/signup" className={cn(buttonVariants())}>
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center gap-8 px-4 py-24 text-center">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Understand Jewish engagement across your community
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Upload event attendance data, see how your programs compare, and
            build a richer picture of community engagement — all while keeping
            participant data private.
          </p>
          <div className="flex gap-3">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Get started
            </Link>
            <Link
              href="#features"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Learn more
            </Link>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="container mx-auto grid gap-6 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Card>
            <CardHeader>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <CardTitle>Easy data upload</CardTitle>
              <CardDescription>
                Upload any spreadsheet of event attendees. Our system
                intelligently maps your columns — no reformatting required.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-muted-foreground mb-2" />
              <CardTitle>Privacy first</CardTitle>
              <CardDescription>
                Email addresses are stored in a secure, separate database.
                Insights are generated from anonymized, aggregated data only.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
              <CardTitle>Cross-org insights</CardTitle>
              <CardDescription>
                See how your event demographics compare to similar programs
                across the community. The more orgs participate, the richer the
                data.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-muted-foreground mb-2" />
              <CardTitle>Population profiles</CardTitle>
              <CardDescription>
                Build a composite view of your members — demographics,
                engagement patterns, and cross-organizational participation.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event comparison</CardTitle>
              <CardDescription>
                Compare attendance patterns, age distributions, and engagement
                levels across event types and time periods.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role-based views</CardTitle>
              <CardDescription>
                Program managers, org leaders, and communal leaders each get
                tailored dashboards with the insights they need.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Jewish Engagement Insights
        </div>
      </footer>
    </div>
  );
}
