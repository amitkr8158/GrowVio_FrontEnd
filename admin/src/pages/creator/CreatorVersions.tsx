import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { CreatorShell, CreatorPageHeader } from "@/components/creator/CreatorShell";
import { DataTable, Panel, StatusPill } from "@/components/creator/primitives";
import { creatorService } from "@/services/creatorService";
import { getLayerMetaByLevel } from "@/mocks/data/creatorLayers";

export default function CreatorVersions() {
  const { data, isLoading } = useQuery({
    queryKey: ["creator-versions"],
    queryFn: () => creatorService.versions().then((r) => r.data.versions),
  });
  const versions = data ?? [];

  return (
    <CreatorShell wide>
      <CreatorPageHeader
        eyebrow="Publishing"
        title="Version History"
        description="Every time a layer is published, a new version is recorded here."
      />
      <Panel title={`${versions.length} published versions`}>
        {isLoading ? (
          <p className="text-xs text-ink-3">Loading…</p>
        ) : versions.length === 0 ? (
          <p className="text-xs text-ink-3">Nothing has been published yet — publish a layer to see it here.</p>
        ) : (
          <DataTable
            columns={["Book", "Layer", "Version", "Published", "By", "Status"]}
            rows={versions.map((v) => [
              <Link
                key="book"
                to={`/creator/layers/${v.bookId}/${getLayerMetaByLevel(v.level)?.key ?? v.level}`}
                className="font-medium text-ink-1 hover:text-primary"
              >
                {v.bookTitle}
              </Link>,
              <span key="layer" className="text-ink-2">Level {v.level} · {v.layer}</span>,
              <span key="version" className="font-mono text-xs text-ink-2">v{v.version}</span>,
              <span key="at" className="text-ink-3">{new Date(v.at).toLocaleString()}</span>,
              <span key="by" className="text-ink-3">{v.by}</span>,
              <StatusPill key="status" status="Published" />,
            ])}
          />
        )}
      </Panel>
    </CreatorShell>
  );
}
