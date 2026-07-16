import { PageHead } from "@/components/layout/page-primitives";
import { EngagementDepth } from "@/components/population/engagement-depth";
import { MOCK_ENGAGEMENT_DEPTH } from "@/lib/mock-engagement-depth";

export default function EngagementDepthPage() {
  return (
    <div>
      <PageHead
        breadcrumb={[{ label: "Workspace" }, { label: "Engagement Depth" }]}
        eyebrow="Concept"
        title="Engagement Depth"
        subtitle="Of the people in each part of the JCC — who else are they Jewishly? Frequency and Jewish depth are surfaced side by side, on illustrative data."
      />
      <EngagementDepth data={MOCK_ENGAGEMENT_DEPTH} />
    </div>
  );
}
