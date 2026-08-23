import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, PenSquare } from "lucide-react";

import { CreatorShell, CreatorPageHeader } from "@/components/creator/CreatorShell";
import { Panel, Progress, StatCard } from "@/components/creator/primitives";
import { creatorService } from "@/services/creatorService";
import { getLayerMetaByLevel } from "@/mocks/data/creatorLayers";

export default function CreatorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["creator-books"],
    queryFn: () => creatorService.listBooks().then((r) => r.data.books),
  });
  const { data: queue } = useQuery({
    queryKey: ["creator-publish-queue"],
    queryFn: () => creatorService.publishQueue().then((r) => r.data.queue),
  });
  const { data: analytics } = useQuery({
    queryKey: ["creator-analytics"],
    queryFn: () => creatorService.analytics().then((r) => r.data),
  });

  const books = data ?? [];
  const featured = books[0];
  const inProgress = books.filter((b) => b.overall < 100);

  return (
    <CreatorShell wide>
      <CreatorPageHeader
        eyebrow="GrowVio"
        title="Creator Dashboard"
        description="Drafts, submissions, published books and performance in one publishing studio."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Books authored" value={String(books.length)} />
        <StatCard
          icon={CheckCircle2}
          label="Published layers"
          value={String(analytics?.publishedLayers ?? 0)}
          tone="up"
        />
        <StatCard icon={Clock3} label="Awaiting review" value={String(queue?.length ?? 0)} />
        <StatCard
          icon={PenSquare}
          label="Total reads"
          value={(analytics?.totalReads ?? 0).toLocaleString("en-IN")}
          hint={analytics ? `${analytics.avgRating}★ average rating` : undefined}
        />
      </div>

      {featured && (
        <div className="mt-6">
          <Panel
            title="Continue authoring"
            action={
              <Link to="/creator/books" className="text-xs font-semibold text-primary hover:underline">
                All books
              </Link>
            }
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-[220px] flex-1">
                <p className="text-sm font-semibold text-ink-1">{featured.title}</p>
                <p className="text-xs text-ink-3">{featured.overall}% of the seven-layer build complete</p>
                <Progress value={featured.overall} className="mt-2" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/creator/books/${featured.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-white transition hover:bg-primary-dark"
                >
                  <PenSquare className="size-3.5" /> Open workspace
                </Link>
                <Link
                  to="/creator/raw-files"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3.5 text-xs font-semibold text-ink-2 transition hover:border-primary/40 hover:text-primary"
                >
                  Raw files <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </Panel>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Pipeline" action={<span className="text-xs text-ink-3">{inProgress.length} in progress</span>}>
          {isLoading ? (
            <p className="text-xs text-ink-3">Loading…</p>
          ) : inProgress.length === 0 ? (
            <p className="text-xs text-ink-3">Every book is fully built out. Nice work.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {inProgress.slice(0, 6).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link to={`/creator/books/${b.id}`} className="min-w-0 flex-1 hover:text-primary">
                    <span className="block truncate font-medium text-ink-1">{b.title}</span>
                    <span className="block truncate text-xs text-ink-3">
                      {b.done}/7 layers published
                    </span>
                  </Link>
                  <span className="shrink-0 text-xs font-semibold text-ink-2">{b.overall}%</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Awaiting review" action={<span className="text-xs text-ink-3">{queue?.length ?? 0} items</span>}>
          {!queue || queue.length === 0 ? (
            <p className="text-xs text-ink-3">Nothing is waiting on an editor right now.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {queue.slice(0, 6).map((q) => (
                <li key={`${q.bookId}-${q.level}`} className="flex items-center justify-between gap-3 py-2.5">
                  <Link
                    to={`/creator/layers/${q.bookId}/${getLayerMetaByLevel(q.level)?.key ?? q.level}`}
                    className="min-w-0 flex-1 hover:text-primary"
                  >
                    <span className="block truncate font-medium text-ink-1">{q.bookTitle}</span>
                    <span className="block truncate text-xs text-ink-3">Level {q.level} · {q.layer}</span>
                  </Link>
                  <span className="shrink-0 rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-semibold text-primary-dark">
                    In Review
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </CreatorShell>
  );
}
