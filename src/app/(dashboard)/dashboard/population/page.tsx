import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

export default function PopulationPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Population</h1>
        <p className="mt-1 text-muted-foreground">
          Upload and analyze your membership data
        </p>
      </div>
      <Card className="border-dashed">
        <CardHeader className="text-center py-12">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5">
            <Users className="h-6 w-6 text-navy" />
          </div>
          <CardTitle className="text-lg">Coming soon</CardTitle>
          <CardDescription>
            Population upload and analysis will be available in a future update.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
