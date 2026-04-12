import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Upload,
  Users,
  Shield,
  ArrowRight,
  Layers,
  GitCompareArrows,
  Building2,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HowItWorks } from "@/components/marketing/how-it-works";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Jewish Engagement Insights
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#who-its-for" className="transition-colors hover:text-foreground">
              Who it&#39;s for
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "font-medium"
              )}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "sm" }),
                "font-medium"
              )}
            >
              Get started
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-navy via-navy to-navy-light">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }} />
          <div className="relative container mx-auto px-6 py-24 md:py-32 lg:py-40">
            <div className="mx-auto max-w-3xl text-center">
              <Badge
                variant="secondary"
                className="mb-6 bg-white/10 text-white/90 border-white/20 hover:bg-white/15 px-4 py-1.5 text-sm"
              >
                For Jewish organizations and communal leaders
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                See the full picture of{" "}
                <span className="text-gold-light">community engagement</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/70 md:text-xl">
                Upload event attendance data from your organization. Get back
                cross-community insights that help you understand who you serve,
                how your programs perform, and where to grow — all with
                privacy built in.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-gold text-navy hover:bg-gold-light h-12 px-8 text-base font-semibold shadow-lg shadow-gold/20"
                  )}
                >
                  Start uploading data
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "border-white/20 text-white hover:bg-white/10 hover:text-white h-12 px-8 text-base"
                  )}
                >
                  See how it works
                </Link>
              </div>
            </div>

            {/* Stats row */}
            <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-8 border-t border-white/10 pt-10">
              {[
                { value: "100%", label: "Anonymized insights" },
                { value: "Any format", label: "Spreadsheet upload" },
                { value: "Cross-org", label: "Community-wide data" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-gold-light">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <HowItWorks />

        {/* Features */}
        <section id="features" className="border-b">
          <div className="container mx-auto px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-gold">
                Platform capabilities
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Built for the way Jewish orgs actually work
              </h2>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
              {[
                {
                  icon: Upload,
                  title: "Smart spreadsheet ingestion",
                  description:
                    "Upload CSVs or Excel files in any format. The system uses AI to identify columns — no need to reformat your data before uploading.",
                  tag: "Data entry",
                },
                {
                  icon: Shield,
                  title: "Privacy-first architecture",
                  description:
                    "Email addresses never leave a secure, isolated database. All insights are generated from anonymized, aggregated data that cannot identify individuals.",
                  tag: "Security",
                },
                {
                  icon: BarChart3,
                  title: "Event attendee profiles",
                  description:
                    "See demographics, denomination breakdowns, and cross-org engagement patterns for any event — enriched with composite data from the whole community.",
                  tag: "Analytics",
                },
                {
                  icon: GitCompareArrows,
                  title: "Cross-event comparison",
                  description:
                    "Compare your events against similar programs across the community. See how your Hanukkah event attendance stacks up against other holiday programs.",
                  tag: "Benchmarking",
                },
                {
                  icon: Users,
                  title: "Population profiles",
                  description:
                    "Upload your membership list to see a composite demographic view — synagogue affiliation, day school enrollment, engagement frequency — without exposing PII.",
                  tag: "Members",
                },
                {
                  icon: Layers,
                  title: "Ever-growing intelligence",
                  description:
                    "Every upload enriches the community dataset. The more organizations participate, the richer and more accurate the insights become for everyone.",
                  tag: "Network effect",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group flex gap-5 rounded-xl border bg-white p-6 transition-all hover:border-gold/30 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy/5 transition-colors group-hover:bg-navy/10">
                    <feature.icon className="h-6 w-6 text-navy" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {feature.tag}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section id="who-its-for" className="border-b bg-cream">
          <div className="container mx-auto px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-gold">
                Who it&#39;s for
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Tailored views for every role
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Different stakeholders need different insights. Each role gets a
                dashboard designed for their decisions.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
              {[
                {
                  icon: Users,
                  role: "Program Managers",
                  benefit:
                    "See how your event compares to similar events across the ecosystem, and gain a richer understanding of your attendees — not just the variables you collect, but accumulated data from across the community on those same people.",
                  points: [
                    "Upload event attendance data",
                    "See attendee demographics and engagement",
                    "Compare events to similar programs",
                    "Upload population data for deeper analysis",
                  ],
                },
                {
                  icon: Building2,
                  role: "Organizational Leaders",
                  benefit:
                    "See the effectiveness of your events as a whole and understand your population beyond just the variables you collect — leveraging community-wide data accumulated on those same individuals.",
                  points: [
                    "View aggregate event performance",
                    "Understand who your org serves",
                    "Hold programs accountable with data",
                    "See cross-org engagement of your members",
                  ],
                },
                {
                  icon: TrendingUp,
                  role: "Communal Leaders",
                  benefit:
                    "Develop a picture of engagement across the entire community with an accumulated understanding of the demographic makeup of your local population.",
                  points: [
                    "See community-wide engagement patterns",
                    "Understand how orgs serve the community",
                    "Identify gaps in programming",
                    "Make data-informed investment decisions",
                  ],
                },
              ].map((persona) => (
                <div
                  key={persona.role}
                  className="rounded-2xl border bg-white p-8 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                    <persona.icon className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{persona.role}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {persona.benefit}
                  </p>
                  <Separator className="my-4" />
                  <ul className="space-y-3">
                    {persona.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy">
          <div className="container mx-auto px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to see your community more clearly?
              </h2>
              <p className="mt-4 text-lg text-white/60">
                Start uploading your event data today. The more organizations
                that participate, the more powerful the insights become for
                everyone.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-gold text-navy hover:bg-gold-light h-12 px-8 text-base font-semibold shadow-lg shadow-gold/20"
                  )}
                >
                  Create your account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-white">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="font-semibold">Jewish Engagement Insights</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Building a richer understanding of Jewish community engagement.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
