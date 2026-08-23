import { useQuery } from "@tanstack/react-query";
import { Maximize2 } from "lucide-react";

import { CreatorShell, CreatorPageHeader } from "@/components/creator/CreatorShell";
import { Panel } from "@/components/creator/primitives";
import { creatorService } from "@/services/creatorService";

export default function CreatorMedia() {
  const { data, isLoading } = useQuery({
    queryKey: ["creator-media"],
    queryFn: () => creatorService.media().then((r) => r.data.media),
  });
  const media = data ?? [];

  return (
    <CreatorShell wide>
      <CreatorPageHeader
        eyebrow="Assets"
        title="Media Library"
        description="Cover art and infographic images used across your books."
      />
      <Panel title={`${media.length} assets`}>
        {isLoading ? (
          <p className="text-xs text-ink-3">Loading…</p>
        ) : media.length === 0 ? (
          <p className="text-xs text-ink-3">No media uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((m) => (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-surface-2">
                  <img src={m.url} alt={m.bookTitle} className="size-full object-cover transition group-hover:scale-105" loading="lazy" />
                  <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-md bg-card/90 opacity-0 transition group-hover:opacity-100">
                    <Maximize2 className="size-3.5" />
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-semibold text-ink-1">{m.bookTitle}</p>
                  <p className="text-[11px] text-ink-3">{m.kind}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </Panel>
    </CreatorShell>
  );
}
