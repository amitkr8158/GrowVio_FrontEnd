import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, Clock3, Star } from "lucide-react";

import { CreatorShell, CreatorPageHeader } from "@/components/creator/CreatorShell";
import { DataTable, Panel, StatCard } from "@/components/creator/primitives";
import { creatorService } from "@/services/creatorService";

export default function CreatorAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["creator-analytics"],
    queryFn: () => creatorService.analytics().then((r) => r.data),
  });

  return (
    <CreatorShell wide>
      <CreatorPageHeader
        eyebrow="Publishing"
        title="Analytics"
        description="How readers are engaging with the books you have authored."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total reads" value={(data?.totalReads ?? 0).toLocaleString("en-IN")} />
        <StatCard icon={Star} label="Average rating" value={data ? `${data.avgRating}★` : "—"} />
        <StatCard icon={CheckCircle2} label="Published layers" value={String(data?.publishedLayers ?? 0)} tone="up" />
        <StatCard icon={Clock3} label="Awaiting review" value={String(data?.inReviewLayers ?? 0)} />
      </div>

      <div className="mt-6">
        <Panel title="Top performing books">
          {isLoading ? (
            <p className="text-xs text-ink-3">Loading…</p>
          ) : (
            <DataTable
              columns={["Book", "Reads", "Rating"]}
              rows={(data?.byBook ?? []).map((b) => [
                <span key="title" className="font-medium text-ink-1">{b.title}</span>,
                <span key="reads" className="text-ink-2">{b.reads.toLocaleString("en-IN")}</span>,
                <span key="rating" className="text-ink-2">{b.rating}★</span>,
              ])}
            />
          )}
        </Panel>
      </div>
    </CreatorShell>
  );
}
