import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";

import { CreatorShell, CreatorPageHeader } from "@/components/creator/CreatorShell";
import { Panel } from "@/components/creator/primitives";
import { creatorService } from "@/services/creatorService";
import { getLayerMetaByLevel } from "@/mocks/data/creatorLayers";

export default function CreatorRawFiles() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["creator-raw-files"],
    queryFn: () => creatorService.rawFiles().then((r) => r.data.files),
  });
  const files = data ?? [];
  const q = query.trim().toLowerCase();
  const filtered = q
    ? files.filter((f) => f.bookTitle.toLowerCase().includes(q) || f.layer.toLowerCase().includes(q))
    : files;

  return (
    <CreatorShell wide>
      <CreatorPageHeader
        eyebrow="Assets"
        title="Raw Files"
        description="Every source PDF backing a published or in-progress layer, across all your books."
      />

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Search className="size-4 text-ink-3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by book or layer…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-4"
        />
      </div>

      <Panel title={`${filtered.length} source files`}>
        {isLoading ? (
          <p className="text-xs text-ink-3">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-ink-3">No source files match “{query}”.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {filtered.map((f) => (
              <li key={f.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
                  <FileText className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-1">{f.bookTitle}</p>
                  <p className="text-[11px] text-ink-3">Level {f.level} · {f.layer} · PDF</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[11px] font-semibold transition hover:border-primary/40 hover:text-primary"
                    >
                      Open
                    </a>
                    <Link
                      to={`/creator/layers/${f.bookId}/${getLayerMetaByLevel(f.level)?.key ?? f.level}`}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[11px] font-semibold transition hover:border-primary/40 hover:text-primary"
                    >
                      Edit layer
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </CreatorShell>
  );
}
