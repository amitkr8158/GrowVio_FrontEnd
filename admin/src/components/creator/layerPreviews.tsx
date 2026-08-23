// Learner-facing preview renderers, one per layer key — a lightweight
// approximation of what BookReading.tsx actually shows, kept in sync with
// the live edited content so authors see the real shape as they type.
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LayerKey } from "@/mocks/data/creatorLayers";

function EmptyPreview() {
  return <p className="p-10 text-center text-sm text-ink-3">Nothing to preview yet — start authoring on the left.</p>;
}

function SnapshotPreview({ content }: { content: { keyPoints?: { heading: string; description: string; emoji?: string }[] } }) {
  const points = content.keyPoints ?? [];
  if (!points.length) return <EmptyPreview />;
  return (
    <div className="space-y-3 p-5">
      {points.map((p, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-border bg-surface-2 p-3.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">{i + 1}</span>
          <div>
            <p className="font-semibold text-ink-1">{p.heading || "Untitled"}</p>
            <p className="mt-0.5 text-sm text-ink-3">{p.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FlashdeckPreview({ content }: { content: { cards?: { title: string; body: string; quote?: string }[] } }) {
  const cards = content.cards ?? [];
  const [i, setI] = useState(0);
  if (!cards.length) return <EmptyPreview />;
  const c = cards[Math.min(i, cards.length - 1)]!;
  return (
    <div className="p-5">
      <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-border bg-gradient-hero p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Card {i + 1} / {cards.length}</p>
        <h3 className="mt-2 text-xl font-semibold">{c.title || "Untitled card"}</h3>
        <p className="mt-2 text-sm opacity-90">{c.body}</p>
        {c.quote && <p className="mt-3 border-t border-white/20 pt-3 text-xs italic opacity-80">“{c.quote}”</p>}
      </div>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} className="grid size-8 place-items-center rounded-full border border-border disabled:opacity-30">
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex gap-1">
          {cards.map((_, k) => (
            <span key={k} className={cn("h-1.5 rounded-full transition-all", k === i ? "w-5 bg-primary" : "w-1.5 bg-border")} />
          ))}
        </div>
        <button onClick={() => setI((x) => Math.min(cards.length - 1, x + 1))} disabled={i >= cards.length - 1} className="grid size-8 place-items-center rounded-full border border-border disabled:opacity-30">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function InfosummaryPreview({ content }: { content: { infographicUrl?: string; description?: string } }) {
  if (!content.infographicUrl) return <EmptyPreview />;
  return (
    <div className="p-5">
      <img src={content.infographicUrl} alt="Infosummary" className="mx-auto max-h-[420px] rounded-xl border border-border object-contain" loading="lazy" />
      {content.description && <p className="mt-3 text-center text-sm text-ink-3">{content.description}</p>}
    </div>
  );
}

function DeepReadPreview({ content }: { content: { overview?: string; chapters?: { title: string; narrativeSummary?: string }[] } }) {
  if (!content.overview && !(content.chapters ?? []).length) return <EmptyPreview />;
  return (
    <div className="space-y-4 p-5">
      {content.overview && <p className="text-sm leading-relaxed text-ink-2">{content.overview}</p>}
      {(content.chapters ?? []).map((c, i) => (
        <article key={i} className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold text-primary">{String(i + 1).padStart(2, "0")}</p>
          <h4 className="mt-0.5 font-semibold text-ink-1">{c.title || "Untitled chapter"}</h4>
          {c.narrativeSummary && <p className="mt-1.5 text-sm leading-relaxed text-ink-3">{c.narrativeSummary}</p>}
        </article>
      ))}
    </div>
  );
}

function MasteryPreview({ content }: { content: { questions?: { question: string; options: string[]; difficulty: string }[] } }) {
  const qs = content.questions ?? [];
  if (!qs.length) return <EmptyPreview />;
  return (
    <div className="space-y-3 p-5">
      <p className="text-xs text-ink-3">{qs.length} questions</p>
      {qs.slice(0, 4).map((q, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-3.5">
          <span className="mb-1.5 inline-block rounded-full bg-warning-light px-2 py-0.5 text-[10px] font-semibold text-warning">{q.difficulty}</span>
          <p className="text-sm font-medium text-ink-1">{q.question || "Untitled question"}</p>
          <ul className="mt-2 space-y-1 text-xs text-ink-3">
            {q.options.map((o, oi) => <li key={oi}>{String.fromCharCode(65 + oi)}. {o}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ActionPlanPreview({ content }: { content: Record<string, { title: string; sections: { title: string; prompt: string }[] } | undefined> }) {
  const daily = content.daily;
  if (!daily?.sections?.length) return <EmptyPreview />;
  return (
    <div className="space-y-3 p-5">
      <h4 className="font-semibold text-ink-1">{daily.title || "Daily habit stack"}</h4>
      {daily.sections.map((s, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-3.5">
          <p className="text-sm font-medium text-ink-1">{s.title}</p>
          <p className="mt-1 text-xs text-ink-3">{s.prompt}</p>
        </div>
      ))}
    </div>
  );
}

function RecallPreview({ content }: { content: { richText?: string } }) {
  const text = content.richText ?? "";
  if (!text) return <EmptyPreview />;
  return (
    <div className="space-y-2 p-5">
      {text.split("\n\n").map((block, i) => {
        if (block.startsWith("## ")) return <h3 key={i} className="text-lg font-semibold text-ink-1">{block.slice(3)}</h3>;
        return <p key={i} className="text-sm leading-relaxed text-ink-2">{block}</p>;
      })}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LayerPreview({ layerKey, content }: { layerKey: LayerKey; content: any }) {
  switch (layerKey) {
    case "snapshot": return <SnapshotPreview content={content} />;
    case "flashdeck": return <FlashdeckPreview content={content} />;
    case "infographic": return <InfosummaryPreview content={content} />;
    case "deepread": return <DeepReadPreview content={content} />;
    case "mastery": return <MasteryPreview content={content} />;
    case "actionplan": return <ActionPlanPreview content={content} />;
    case "recall": return <RecallPreview content={content} />;
    default: return <EmptyPreview />;
  }
}
