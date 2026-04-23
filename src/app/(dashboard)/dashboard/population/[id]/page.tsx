import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, CalendarDays, Upload } from "lucide-react";
import { PopulationProfile } from "@/components/population/population-profile";
import { TEMPLE_BETH_SHALOM_POPULATION } from "@/lib/mock-population-data";

export default async function PopulationProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO: fetch real population upload from Supabase by id
  // For now, always return mock data
  const data = TEMPLE_BETH_SHALOM_POPULATION;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/population"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-4 -ml-2 text-muted-foreground"
          )}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Population
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{data.orgName}</h1>
              <Badge variant="outline" className="text-xs">
                {data.totalHouseholds} households
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground">{data.uploadName}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Upload className="h-4 w-4" />
            Uploaded{" "}
            {new Date(data.uploadDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <PopulationProfile data={data} />
    </div>
  );
}
