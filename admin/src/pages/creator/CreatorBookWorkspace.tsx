import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, PenSquare } from "lucide-react";

import { CreatorShell, CreatorPageHeader } from "@/components/creator/CreatorShell";
import { Panel, StatusPill } from "@/components/creator/primitives";
import { creatorService } from "@/services/creatorService";

export default function CreatorBookWorkspace() {
  const { bookId = "" } = useParams<{ bookId: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["creator-layers", bookId],
    queryFn: () => creatorService.getLayers(bookId).then((r) => r.data),
    enabled: !!bookId,
  });

  if (isLoading || !data) {
    return (
      <CreatorShell wide>
        <p className="text-sm text-ink-3">Loading workspace…</p>
      </CreatorShell>
    );
  }

  const { book, layers, overall } = data;

  return (
    <CreatorShell wide>
      <Link
        to="/creator/books"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3 hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> All books
      </Link>
      <CreatorPageHeader
        eyebrow="Layer workspace"
        title={book.title}
        description={`${book.author} · ${overall}% of the seven-layer build is complete. Each layer is authored from its own reading level content.`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          {layers.map((s) => (
            <div key={s.meta.key} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-light text-sm font-semibold text-primary-dark">
                {s.meta.level}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-ink-1">{s.meta.name}</h3>
                  <StatusPill status={s.status} />
                </div>
                <p className="text-xs text-ink-3">
                  {s.meta.tagline} · {s.meta.duration}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 w-40 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${s.percent}%` }} />
                  </div>
                  <span className="text-[11px] text-ink-3">
                    {s.count}/{s.target} {s.meta.blockLabel.toLowerCase()}s
                  </span>
                </div>
              </div>
              <Link
                to={`/creator/layers/${bookId}/${s.meta.key}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3.5 text-xs font-semibold text-ink-2 transition hover:border-primary/40 hover:text-primary"
              >
                <PenSquare className="size-3.5" /> Edit layer
              </Link>
            </div>
          ))}
        </div>

        <Panel title="Source PDFs">
          <ul className="space-y-3 text-sm">
            {layers.map((s) => (
              <li key={s.meta.key} className="flex gap-3">
                {s.pdfUrl ? (
                  <a
                    href={s.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-12 w-9 shrink-0 place-items-center rounded-md border border-border text-primary hover:border-primary/40"
                  >
                    <FileText className="size-4" />
                  </a>
                ) : (
                  <span className="grid h-12 w-9 shrink-0 place-items-center rounded-md border border-dashed border-border">
                    <FileText className="size-4 text-ink-4" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink-1">
                    Level {s.meta.level} · {s.meta.name}
                  </span>
                  <span className="text-xs text-ink-3">{s.pdfUrl ? "Source PDF available" : "Not uploaded"}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </CreatorShell>
  );
}
