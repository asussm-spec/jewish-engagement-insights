"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Legend,
  Line,
  LineChart,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Users,
  Building2,
  TrendingUp,
  Layers,
  ArrowUp,
  ArrowDown,
  Baby,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import {
  COMMUNITY_OVERVIEW,
  ENGAGEMENT_FUNNEL,
  EVENT_TYPE_HEATMAP,
  ENGAGEMENT_TRENDS,
  RISING_STARS,
  COMMUNITY_AGE_DISTRIBUTION,
  FAMILY_PIPELINE,
  GEOGRAPHIC_CLUSTERS,
  ENGAGEMENT_DROPOFF,
} from "@/lib/mock-community-insights";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "engagement", label: "Engagement" },
  { key: "demographics", label: "Demographics" },
  { key: "retention", label: "Retention & Pipeline" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const NAVY = "#1e2d6f";
const GOLD = "#c8922a";
const TEAL = "#4a7c6f";
const CORAL = "#c05746";

export function CommunityInsights() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <div className="space-y-6">
      {/* Tab picker */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-navy shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewSection />}
      {activeTab === "engagement" && <EngagementSection />}
      {activeTab === "demographics" && <DemographicsSection />}
      {activeTab === "retention" && <RetentionSection />}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────

function OverviewSection() {
  const ov = COMMUNITY_OVERVIEW;
  const coveragePct = Math.round((ov.totalUniqueIndividuals / ov.estimatedJewishPopulation) * 100);
  const totalOrgs = ov.participatingOrgs.reduce((s, o) => s + o.count, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard icon={<Users className="h-5 w-5" />} label="Unique Individuals" value={ov.totalUniqueIndividuals.toLocaleString()} sub={`${coveragePct}% of est. ${ov.estimatedJewishPopulation.toLocaleString()} Jewish population`} />
        <KpiCard icon={<Building2 className="h-5 w-5" />} label="Participating Orgs" value={String(totalOrgs)} sub={ov.participatingOrgs.map((o) => `${o.count} ${o.type}`).join(", ")} />
        <KpiCard icon={<Layers className="h-5 w-5" />} label="Cross-Org Overlap" value={ov.crossOrgOverlap.toLocaleString()} sub={`${Math.round((ov.crossOrgOverlap / ov.totalUniqueIndividuals) * 100)}% appear in 2+ orgs`} />
        <KpiCard icon={<Baby className="h-5 w-5" />} label="Children in System" value={ov.totalChildren.toLocaleString()} sub={`${ov.totalHouseholds.toLocaleString()} households`} />
      </div>

      {/* Participating orgs breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Participating Organizations</CardTitle>
          <CardDescription>{totalOrgs} organizations contributing data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ov.participatingOrgs.map((orgType) => (
              <div key={orgType.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{orgType.type}</span>
                  <Badge variant="secondary" className="text-xs">{orgType.count}</Badge>
                </div>
                <div className="space-y-1">
                  {orgType.names.map((name) => (
                    <p key={name} className="text-xs text-muted-foreground">{name}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Community Engagement Funnel</CardTitle>
          <CardDescription>How many events individuals attended across all organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 pt-1">
            {ENGAGEMENT_FUNNEL.tiers.map((tier, i) => {
              const colors = ["#27ae60", TEAL, GOLD, "#8a8279"];
              return (
                <div key={tier.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{tier.label}</span>
                    <span className="text-sm tabular-nums">{tier.count.toLocaleString()} ({tier.pct}%)</span>
                  </div>
                  <div className="h-5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${tier.pct}%`, backgroundColor: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Engagement ────────────────────────────────────────

function EngagementSection() {
  return (
    <div className="space-y-6">
      {/* Event type heat map */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Program Participation Across Community</CardTitle>
          <CardDescription>Total participants by program type across all organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ totalParticipants: { label: "Participants", color: NAVY } }} className="h-[360px]">
            <BarChart data={EVENT_TYPE_HEATMAP.programs} layout="vertical" margin={{ left: 10, right: 40 }}>
              <XAxis type="number" fontSize={11} tickLine={false} />
              <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} width={130} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const prog = item.payload;
                      return `${value} participants (${prog.pctOfCommunity}% of community, offered by ${prog.orgCount} orgs)`;
                    }}
                  />
                }
              />
              <Bar dataKey="totalParticipants" fill={NAVY} radius={[0, 4, 4, 0]}>
                {EVENT_TYPE_HEATMAP.programs.map((p) => (
                  <Cell key={p.name} fill={p.pctOfCommunity >= 20 ? NAVY : p.pctOfCommunity >= 10 ? TEAL : "#8a8279"} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: NAVY }} /> 20%+ of community</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: TEAL }} /> 10–19%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: "#8a8279" }} /> &lt;10%</span>
          </div>
        </CardContent>
      </Card>

      {/* Engagement trends */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Engagement Trends</CardTitle>
          <CardDescription>Quarterly unique participants and total event attendances</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              uniqueParticipants: { label: "Unique participants", color: NAVY },
              totalEventAttendances: { label: "Total attendances", color: GOLD },
            }}
            className="h-[280px]"
          >
            <LineChart data={ENGAGEMENT_TRENDS.quarters}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="label" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="uniqueParticipants" stroke={NAVY} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="totalEventAttendances" stroke={GOLD} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Rising stars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rising Stars</CardTitle>
          <CardDescription>Organizations and programs with fastest growth (year over year)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {RISING_STARS.map((star) => (
              <div key={star.name} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{star.name}</span>
                  <Badge variant={star.type === "org" ? "outline" : "secondary"} className="text-[10px]">
                    {star.type === "org" ? "Org" : "Program"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUp className="h-3.5 w-3.5" />
                    {star.growth}%
                  </span>
                  <span className="text-xs text-muted-foreground">{star.metric}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {star.previous.toLocaleString()} → {star.current.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Demographics ──────────────────────────────────────

function DemographicsSection() {
  return (
    <div className="space-y-6">
      {/* Age distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Community Age Distribution</CardTitle>
          <CardDescription>All known individuals across participating organizations (n={COMMUNITY_AGE_DISTRIBUTION.reduce((s, b) => s + b.count, 0).toLocaleString()})</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ count: { label: "Individuals", color: NAVY } }} className="h-[280px]">
            <BarChart data={COMMUNITY_AGE_DISTRIBUTION}>
              <XAxis dataKey="name" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value, _name, item) => `${value} (${item.payload.pct}%)`} />}
              />
              <Bar dataKey="count" fill={NAVY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Family pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">School-Age Pipeline</CardTitle>
          <CardDescription>
            {FAMILY_PIPELINE.totalChildren.toLocaleString()} children in {FAMILY_PIPELINE.totalFamilies.toLocaleString()} families — upcoming milestones by cohort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 pt-1">
            {FAMILY_PIPELINE.cohorts.map((cohort, i) => {
              const maxCount = Math.max(...FAMILY_PIPELINE.cohorts.map((c) => c.count));
              const widthPct = Math.round((cohort.count / maxCount) * 100);
              const colors = [NAVY, GOLD, TEAL, CORAL, "#6b5fa0", "#8a8279"];
              return (
                <div key={cohort.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{cohort.label}</span>
                      <span className="text-xs text-muted-foreground">({cohort.ageRange})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm tabular-nums font-medium">{cohort.count}</span>
                      <span className="text-xs text-muted-foreground">→ {cohort.nextMilestone}</span>
                    </div>
                  </div>
                  <div className="h-4 bg-muted rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${widthPct}%`, backgroundColor: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Geographic clusters */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Geographic Clusters</CardTitle>
          </div>
          <CardDescription>Where community members live — households by zip code</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ households: { label: "Households", color: NAVY } }} className="h-[360px]">
            <BarChart
              data={[...GEOGRAPHIC_CLUSTERS].sort((a, b) => b.households - a.households)}
              layout="vertical"
              margin={{ left: 10, right: 30 }}
            >
              <XAxis type="number" fontSize={11} tickLine={false} />
              <YAxis
                dataKey="zipCode"
                type="category"
                fontSize={10}
                tickLine={false}
                width={55}
                tickFormatter={(v) => v}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const cluster = item.payload;
                      return `${value} households (${cluster.individuals} people, ${cluster.area}, avg ${cluster.avgEngagement} events/person)`;
                    }}
                  />
                }
              />
              <Bar dataKey="households" fill={NAVY} radius={[0, 4, 4, 0]}>
                {[...GEOGRAPHIC_CLUSTERS].sort((a, b) => b.households - a.households).map((c) => (
                  <Cell key={c.zipCode} fill={c.avgEngagement >= 2.5 ? NAVY : c.avgEngagement >= 2.0 ? TEAL : "#8a8279"} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: NAVY }} /> High engagement (2.5+)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: TEAL }} /> Moderate (2.0–2.4)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: "#8a8279" }} /> Lower (&lt;2.0)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Retention & Pipeline ──────────────────────────────

function RetentionSection() {
  const dropoffData = ENGAGEMENT_DROPOFF.ageGroups.map((g) => ({
    ...g,
    change: g.dropoff > 0 ? -g.dropoff : Math.abs(g.dropoff),
  }));

  return (
    <div className="space-y-6">
      {/* Engagement dropoff chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Engagement by Life Stage</CardTitle>
          <CardDescription>% of each age group that attended 1+ event — this year vs. last year</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              thisYearPct: { label: "This year", color: NAVY },
              lastYearPct: { label: "Last year", color: "#c4c4c4" },
            }}
            className="h-[300px]"
          >
            <BarChart data={ENGAGEMENT_DROPOFF.ageGroups}>
              <XAxis dataKey="name" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} unit="%" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="lastYearPct" fill="#c4c4c4" radius={[2, 2, 0, 0]} name="Last year" />
              <Bar dataKey="thisYearPct" fill={NAVY} radius={[2, 2, 0, 0]} name="This year" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Key dropoff callouts */}
      <div className="grid gap-4 md:grid-cols-3">
        {ENGAGEMENT_DROPOFF.ageGroups
          .filter((g) => g.dropoff >= 5)
          .sort((a, b) => b.dropoff - a.dropoff)
          .map((g) => (
            <Card key={g.name} className="border-amber-200 bg-amber-50/30">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Ages {g.name}</span>
                </div>
                <p className="text-2xl font-bold text-amber-700">
                  <ArrowDown className="h-4 w-4 inline" /> {g.dropoff}pt drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {g.lastYearPct}% last year → {g.thisYearPct}% this year
                </p>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Growth callouts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Bright Spots</CardTitle>
          <CardDescription>Age groups where engagement is growing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {ENGAGEMENT_DROPOFF.ageGroups
              .filter((g) => g.dropoff < 0)
              .sort((a, b) => a.dropoff - b.dropoff)
              .map((g) => (
                <div key={g.name} className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-3">
                  <span className="text-sm font-medium">Ages {g.name}</span>
                  <p className="text-lg font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <ArrowUp className="h-3.5 w-3.5" /> {Math.abs(g.dropoff)}pt growth
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {g.lastYearPct}% → {g.thisYearPct}%
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Shared ────────────────────────────────────────────

function KpiCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">{icon}</div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
        {sub && <p className="mt-2 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
