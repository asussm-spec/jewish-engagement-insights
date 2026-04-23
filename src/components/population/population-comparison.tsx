"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Legend } from "recharts";
import { Separator } from "@/components/ui/separator";
import {
  SYNAGOGUE_BENCHMARKS,
  aggregateBenchmarks,
  type SynagogueBenchmark,
} from "@/lib/mock-community-data";

const COMPARISON_COLORS = {
  yours: "#1e2d6f",     // navy
  comparison: "#c8922a", // gold
};

const AGE_ORDER = [
  "0–5", "6–12", "13–17", "18–25", "26–35",
  "36–45", "46–55", "56–65", "66–75", "76+",
];

const PROGRAM_ORDER = [
  "Holiday Events", "Shabbat Services", "Family Programs",
  "Social / Community", "Adult Learning", "Youth Programs",
  "Volunteer / Tikkun Olam",
];

interface Props {
  myOrgId: string;
  myOrg: SynagogueBenchmark;
}

export function PopulationComparison({ myOrgId, myOrg }: Props) {
  const [filterType, setFilterType] = useState<string>("all");
  const [denominationFilter, setDenominationFilter] = useState<string>(myOrg.denomination);
  const [sizeFilter, setSizeFilter] = useState<string>(myOrg.sizeCategory);

  const filteredSynagogues = useMemo(() => {
    if (filterType === "all") return SYNAGOGUE_BENCHMARKS;
    if (filterType === "denomination") return SYNAGOGUE_BENCHMARKS.filter((s) => s.denomination === denominationFilter);
    if (filterType === "size") return SYNAGOGUE_BENCHMARKS.filter((s) => s.sizeCategory === sizeFilter);
    return SYNAGOGUE_BENCHMARKS;
  }, [filterType, denominationFilter, sizeFilter]);

  const benchmark = useMemo(
    () => aggregateBenchmarks(filteredSynagogues, myOrgId),
    [filteredSynagogues, myOrgId]
  );

  const comparisonLabel = useMemo(() => {
    if (filterType === "all") return `All synagogues (${benchmark.count})`;
    if (filterType === "denomination") return `${denominationFilter} synagogues (${benchmark.count})`;
    if (filterType === "size") return `${sizeFilter} synagogues (${benchmark.count})`;
    return "Comparison";
  }, [filterType, denominationFilter, sizeFilter, benchmark.count]);

  // Age distribution comparison — percentages for fair comparison
  const myAgeTotal = Object.values(myOrg.ageBuckets).reduce((a, b) => a + b, 0);
  const ageComparisonData = AGE_ORDER.map((bucket) => ({
    name: bucket,
    [myOrg.name]: myAgeTotal > 0 ? Math.round(((myOrg.ageBuckets[bucket] || 0) / myAgeTotal) * 100) : 0,
    [comparisonLabel]: benchmark.ageBucketPcts[bucket] || 0,
  }));

  // Member count comparison
  const memberComparisonData = [
    { name: "Members", [myOrg.name]: myOrg.totalMembers, [comparisonLabel]: benchmark.avgMembers },
    { name: "Households", [myOrg.name]: myOrg.totalHouseholds, [comparisonLabel]: benchmark.avgHouseholds },
  ];

  // Engagement comparison
  const engagementComparisonData = [
    { name: "Engagement rate", [myOrg.name]: myOrg.engagementRate, [comparisonLabel]: benchmark.avgEngagementRate },
    { name: "% with children", [myOrg.name]: myOrg.percentWithChildren, [comparisonLabel]: benchmark.avgPercentWithChildren },
  ];

  // Program participation comparison — as % of membership
  const programComparisonData = PROGRAM_ORDER.map((prog) => ({
    name: prog,
    [myOrg.name]: myOrg.totalMembers > 0 ? Math.round(((myOrg.programParticipation[prog] || 0) / myOrg.totalMembers) * 100) : 0,
    [comparisonLabel]: benchmark.programParticipationPcts[prog] || 0,
  }));

  const chartConfig = {
    [myOrg.name]: { label: myOrg.name, color: COMPARISON_COLORS.yours },
    [comparisonLabel]: { label: comparisonLabel, color: COMPARISON_COLORS.comparison },
  };

  return (
    <div className="space-y-6">
      <Separator />

      {/* Section header with filter controls */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Community Comparison</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            How {myOrg.name} compares to other synagogues in the community
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Compare to</span>
          <Select value={filterType} onValueChange={(v) => v && setFilterType(v)}>
            <SelectTrigger className="w-[160px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All synagogues</SelectItem>
              <SelectItem value="denomination">By denomination</SelectItem>
              <SelectItem value="size">By size</SelectItem>
            </SelectContent>
          </Select>

          {filterType === "denomination" && (
            <Select value={denominationFilter} onValueChange={(v) => v && setDenominationFilter(v)}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reform">Reform</SelectItem>
                <SelectItem value="Conservative">Conservative</SelectItem>
                <SelectItem value="Orthodox">Orthodox</SelectItem>
                <SelectItem value="Reconstructionist">Reconstructionist</SelectItem>
              </SelectContent>
            </Select>
          )}

          {filterType === "size" && (
            <Select value={sizeFilter} onValueChange={(v) => v && setSizeFilter(v)}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small">Small (&lt;200)</SelectItem>
                <SelectItem value="Mid-size">Mid-size (200–500)</SelectItem>
                <SelectItem value="Large">Large (500+)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* KPI comparison row */}
      <div className="grid gap-4 md:grid-cols-4">
        <ComparisonKpi
          label="Members"
          yours={myOrg.totalMembers}
          comparison={benchmark.avgMembers}
          comparisonLabel={comparisonLabel}
        />
        <ComparisonKpi
          label="Engagement rate"
          yours={myOrg.engagementRate}
          comparison={benchmark.avgEngagementRate}
          comparisonLabel={comparisonLabel}
          unit="%"
        />
        <ComparisonKpi
          label="% with children"
          yours={myOrg.percentWithChildren}
          comparison={benchmark.avgPercentWithChildren}
          comparisonLabel={comparisonLabel}
          unit="%"
        />
        <ComparisonKpi
          label="Avg children / family"
          yours={myOrg.avgChildrenPerFamily}
          comparison={benchmark.avgChildrenPerFamily}
          comparisonLabel={comparisonLabel}
        />
      </div>

      {/* Age distribution comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Age Distribution (% of members)</CardTitle>
          <CardDescription>{myOrg.name} vs. {comparisonLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={ageComparisonData}>
              <XAxis dataKey="name" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} unit="%" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey={myOrg.name} fill={COMPARISON_COLORS.yours} radius={[2, 2, 0, 0]} />
              <Bar dataKey={comparisonLabel} fill={COMPARISON_COLORS.comparison} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Program participation comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Program Participation (% of members)</CardTitle>
          <CardDescription>{myOrg.name} vs. {comparisonLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={programComparisonData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" fontSize={11} tickLine={false} unit="%" />
              <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} width={130} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey={myOrg.name} fill={COMPARISON_COLORS.yours} radius={[0, 2, 2, 0]} />
              <Bar dataKey={comparisonLabel} fill={COMPARISON_COLORS.comparison} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ComparisonKpi({
  label,
  yours,
  comparison,
  comparisonLabel,
  unit = "",
}: {
  label: string;
  yours: number;
  comparison: number;
  comparisonLabel: string;
  unit?: string;
}) {
  const diff = +(yours - comparison).toFixed(1);
  const isHigher = diff > 0;
  const diffDisplay = diff === 0 ? "same" : `${isHigher ? "+" : ""}${diff}${unit}`;
  const diffColor = diff === 0 ? "text-muted-foreground" : isHigher ? "text-emerald-600" : "text-amber-600";

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold" style={{ color: COMPARISON_COLORS.yours }}>
              {yours}{unit}
            </p>
            <p className="text-[10px] text-muted-foreground">Your synagogue</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold" style={{ color: COMPARISON_COLORS.comparison }}>
              {comparison}{unit}
            </p>
            <p className="text-[10px] text-muted-foreground">Avg ({comparisonLabel.split(" (")[0]})</p>
          </div>
        </div>
        <p className={`text-xs font-medium mt-2 ${diffColor}`}>{diffDisplay} vs. comparison</p>
      </CardContent>
    </Card>
  );
}
