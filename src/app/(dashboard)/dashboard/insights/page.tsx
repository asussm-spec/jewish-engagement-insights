import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function InsightsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="mt-1 text-muted-foreground">
          Cross-organizational benchmarks and community-wide analytics
        </p>
      </div>
      <Card className="border-dashed">
        <CardHeader className="text-center py-12">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5">
            <BarChart3 className="h-6 w-6 text-navy" />
          </div>
          <CardTitle className="text-lg">Coming soon</CardTitle>
          <CardDescription>
            Cross-org benchmarking and community insights will be available once
            multiple organizations are uploading data.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
