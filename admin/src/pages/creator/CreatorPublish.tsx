import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, X } from "lucide-react";

import { CreatorShell, CreatorPageHeader } from "@/components/creator/CreatorShell";
import { Panel } from "@/components/creator/primitives";
import { creatorService } from "@/services/creatorService";
import { getLayerMetaByLevel } from "@/mocks/data/creatorLayers";

export default function CreatorPublish() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["creator-publish-queue"],
    queryFn: () => creatorService.publishQueue().then((r) => r.data.queue),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["creator-publish-queue"] });
    void qc.invalidateQueries({ queryKey: ["creator-books"] });
    void qc.invalidateQueries({ queryKey: ["creator-analytics"] });
  };

  const approve = useMutation({
    mutationFn: ({ bookId, level }: { bookId: string; level: number }) => creatorService.approve(bookId, level).then((r) => creatorService.publish(bookId, level).then(() => r)),
    onSuccess: () => { toast.success("Layer approved and published"); invalidate(); },
  });
  const reject = useMutation({
    mutationFn: ({ bookId, level }: { bookId: string; level: number }) => creatorService.revert(bookId, level),
    onSuccess: () => { toast.success("Sent back to draft"); invalidate(); },
  });

  const queue = data ?? [];

  return (
    <CreatorShell wide>
      <CreatorPageHeader
        eyebrow="Publishing"
        title="Review & Publish"
        description="Layers submitted for review, waiting on an editorial pass before they go live."
      />
      <Panel title={`${queue.length} pending`}>
        {isLoading ? (
          <p className="text-xs text-ink-3">Loading…</p>
        ) : queue.length === 0 ? (
          <p className="text-xs text-ink-3">Nothing is waiting for review right now.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {queue.map((q) => (
              <li key={`${q.bookId}-${q.level}`} className="flex items-center justify-between gap-3 py-3">
                <Link
                  to={`/creator/layers/${q.bookId}/${getLayerMetaByLevel(q.level)?.key ?? q.level}`}
                  className="min-w-0 flex-1 hover:text-primary"
                >
                  <span className="block truncate font-medium text-ink-1">{q.bookTitle}</span>
                  <span className="block truncate text-xs text-ink-3">
                    Level {q.level} · {q.layer} · updated {new Date(q.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => approve.mutate({ bookId: q.bookId, level: q.level })}
                    disabled={approve.isPending}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                  >
                    <ShieldCheck className="size-3.5" /> Approve & publish
                  </button>
                  <button
                    onClick={() => reject.mutate({ bookId: q.bookId, level: q.level })}
                    disabled={reject.isPending}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-ink-2 transition hover:border-danger/40 hover:text-danger disabled:opacity-60"
                  >
                    <X className="size-3.5" /> Send back
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </CreatorShell>
  );
}
