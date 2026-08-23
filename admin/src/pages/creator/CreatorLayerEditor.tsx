import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Eye,
  FileText,
  Loader2,
  PenLine,
  Redo2,
  Rows3,
  Send,
  Sparkles,
  Undo2,
  UploadCloud,
} from "lucide-react";

import { CreatorShell } from "@/components/creator/CreatorShell";
import { StatusPill } from "@/components/creator/primitives";
import { LayerPreview } from "@/components/creator/layerPreviews";
import {
  ActionPlanEditor,
  DeepReadEditor,
  FlashdeckEditor,
  InfosummaryEditor,
  MasteryEditor,
  RecallEditor,
  SnapshotEditor,
} from "@/components/creator/layerEditors";
import { creatorService } from "@/services/creatorService";
import { LAYER_META, getLayerMeta, type LayerKey } from "@/mocks/data/creatorLayers";
import { cn } from "@/lib/utils";

type Mode = "edit" | "split" | "preview";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AI_INSERT: Record<LayerKey, (content: any) => any> = {
  snapshot: (c) => ({ ...c, keyPoints: [...(c.keyPoints ?? []), { order: (c.keyPoints?.length ?? 0) + 1, heading: "AI-drafted insight", description: "Edit this AI draft before publishing — replace with your own paraphrase." }] }),
  flashdeck: (c) => ({ ...c, cards: [...(c.cards ?? []), { order: (c.cards?.length ?? 0) + 1, title: "AI-drafted card", body: "Edit this AI draft before publishing." }] }),
  infographic: (c) => ({ ...c, description: `${c.description ?? ""}${c.description ? " " : ""}AI suggestion: consider a loop diagram for this framework.`.trim() }),
  deepread: (c) => ({ ...c, chapters: [...(c.chapters ?? []), { title: "AI-drafted chapter", narrativeSummary: "Edit this AI draft before publishing." }] }),
  mastery: (c) => ({ ...c, questions: [...(c.questions ?? []), { id: `q${Date.now()}`, order: (c.questions?.length ?? 0) + 1, difficulty: "EASY", question: "AI-drafted question — edit before publishing", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }] }),
  actionplan: (c) => ({ ...c, daily: { ...(c.daily ?? { title: "Daily", sections: [] }), sections: [...(c.daily?.sections ?? []), { title: "AI-drafted prompt", prompt: "Edit this AI draft before publishing." }] } }),
  recall: (c) => ({ ...c, richText: `${c.richText ?? ""}\n\n## AI draft\nEdit this section before publishing.`.trim() }),
};

const AI_COMMAND_LABEL: Record<LayerKey, string> = {
  snapshot: "Draft a key point",
  flashdeck: "Draft a card",
  infographic: "Suggest a caption",
  deepread: "Draft a chapter",
  mastery: "Draft a question",
  actionplan: "Draft a prompt",
  recall: "Draft a section",
};

export default function CreatorLayerEditor() {
  const { bookId = "", layer = "" } = useParams<{ bookId: string; layer: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const meta = getLayerMeta(layer);
  const level = meta?.level ?? 1;

  const { data: layersData } = useQuery({
    queryKey: ["creator-layers", bookId],
    queryFn: () => creatorService.getLayers(bookId).then((r) => r.data),
    enabled: !!bookId,
  });
  const { data: levelData, isLoading } = useQuery({
    queryKey: ["creator-level", bookId, level],
    queryFn: () => creatorService.getLevel(bookId, level).then((r) => r.data.data),
    enabled: !!bookId && !!meta,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<any>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("split");
  const [ai, setAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const originalRef = useRef<string>("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!levelData) return;
    const c = levelData.content ?? {};
    setContent(c);
    setHistory([c]);
    setHistoryIndex(0);
    originalRef.current = JSON.stringify(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelData, layer]);

  const status = layersData?.layers.find((l) => l.meta.key === layer)?.status ?? "Draft";
  const dirty = content != null && JSON.stringify(content) !== originalRef.current;

  const pushHistory = (next: unknown) => {
    setHistory((h) => [...h.slice(0, historyIndex + 1), next].slice(-30));
    setHistoryIndex((i) => Math.min(i + 1, 29));
  };

  const applyChange = (next: object) => {
    setContent(next);
    pushHistory(next);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const i = historyIndex - 1;
    setHistoryIndex(i);
    setContent(history[i]);
  };
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const i = historyIndex + 1;
    setHistoryIndex(i);
    setContent(history[i]);
  };

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["creator-layers", bookId] });
    void qc.invalidateQueries({ queryKey: ["creator-books"] });
  };

  const save = async (silent = false) => {
    if (!content) return;
    setSaving(true);
    try {
      await creatorService.updateLevel(bookId, level, content);
      originalRef.current = JSON.stringify(content);
      setSavedAt(new Date().toLocaleTimeString());
      invalidate();
      if (!silent) toast.success(`${meta?.name} saved`);
    } catch {
      if (!silent) toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Autosave shortly after edits stop.
  useEffect(() => {
    if (!dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void save(true), 1200);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "z" && e.shiftKey) { e.preventDefault(); redo(); }
      else if (e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
      else if (e.key.toLowerCase() === "s") { e.preventDefault(); void save(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const submit = async () => {
    await save(true);
    await creatorService.submit(bookId, level);
    invalidate();
    toast.success(`${meta?.name} submitted for review`);
  };
  const publish = async () => {
    await save(true);
    await creatorService.publish(bookId, level);
    invalidate();
    toast.success(`${meta?.name} published`);
  };

  const editor = useMemo(() => {
    if (!content || !meta) return null;
    switch (meta.key) {
      case "snapshot": return <SnapshotEditor content={content} onChange={applyChange} />;
      case "flashdeck": return <FlashdeckEditor content={content} onChange={applyChange} />;
      case "infographic": return <InfosummaryEditor content={content} onChange={applyChange} />;
      case "deepread": return <DeepReadEditor content={content} onChange={applyChange} />;
      case "mastery": return <MasteryEditor content={content} onChange={applyChange} />;
      case "actionplan": return <ActionPlanEditor content={content} onChange={applyChange} />;
      case "recall": return <RecallEditor content={content} onChange={applyChange} />;
      default: return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, meta]);

  if (!meta) {
    return (
      <CreatorShell wide>
        <p className="text-sm text-ink-3">Unknown layer.</p>
      </CreatorShell>
    );
  }

  const bookTitle = layersData?.book.title ?? bookId;

  return (
    <CreatorShell wide>
      <div className="space-y-4">
        <header className="sticky top-16 z-30 -mx-2 rounded-2xl border border-border bg-card/95 px-4 py-3 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <Link to={`/creator/books/${bookId}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3 transition hover:text-primary">
              <ArrowLeft className="size-3.5" /> {bookTitle} / Creator Studio
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-ink-1">
                <span className="mr-2 text-ink-4 tabular-nums">{String(meta.level).padStart(2, "0")}</span>
                {meta.name}
              </h1>
              <p className="truncate text-xs text-ink-3">{meta.tagline}</p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <StatusPill status={status} />
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", saving ? "bg-warning-light text-warning" : dirty ? "bg-surface-3 text-ink-3" : "bg-success-light text-success")}>
                {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                {saving ? "Saving…" : dirty ? "Unsaved" : savedAt ? `Saved ${savedAt}` : "Saved"}
              </span>

              <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
                <IconBtn label="Undo (⌘Z)" disabled={historyIndex <= 0} onClick={undo}><Undo2 className="size-3.5" /></IconBtn>
                <IconBtn label="Redo (⌘⇧Z)" disabled={historyIndex >= history.length - 1} onClick={redo}><Redo2 className="size-3.5" /></IconBtn>
              </div>

              <div className="hidden items-center gap-0.5 rounded-lg border border-border p-0.5 lg:flex">
                <ModeBtn active={mode === "edit"} onClick={() => setMode("edit")} icon={<PenLine className="size-3.5" />}>Edit</ModeBtn>
                <ModeBtn active={mode === "split"} onClick={() => setMode("split")} icon={<Rows3 className="size-3.5" />}>Split</ModeBtn>
                <ModeBtn active={mode === "preview"} onClick={() => setMode("preview")} icon={<Eye className="size-3.5" />}>Preview</ModeBtn>
              </div>

              <button onClick={() => setAi((v) => !v)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary-light px-3 text-xs font-semibold text-primary-dark transition hover:border-primary">
                <Sparkles className="size-3.5" /> AI Assistant
              </button>
              <button onClick={() => void save()} title="⌘S" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-ink-2 transition hover:border-primary/40 hover:text-primary">
                Save
              </button>
              <button onClick={() => void submit()} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-ink-2 transition hover:border-primary/40 hover:text-primary">
                <Send className="size-3.5" /> Submit for review
              </button>
              <button onClick={() => void publish()} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-white transition hover:bg-primary-dark">
                <UploadCloud className="size-3.5" /> Publish
              </button>
            </div>
          </div>
        </header>

        {/* Layer navigator strip */}
        <div className="scroll-slim flex gap-1.5 overflow-x-auto pb-1">
          {LAYER_META.map((m) => {
            const stat = layersData?.layers.find((l) => l.meta.key === m.key);
            const active = m.key === layer;
            return (
              <button
                key={m.key}
                onClick={() => { void save(true); navigate(`/creator/layers/${bookId}/${m.key}`); }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  active ? "border-primary bg-primary-light text-primary-dark" : "border-border text-ink-2 hover:border-primary/40",
                )}
              >
                <span className={cn("size-1.5 rounded-full", stat?.status === "Published" ? "bg-success" : stat?.status === "In Review" ? "bg-primary" : stat?.status === "Approved" ? "bg-info" : "bg-ink-4")} />
                L{m.level} {m.name}
                {stat && <span className="text-[10px] text-ink-4">{stat.percent}%</span>}
              </button>
            );
          })}
        </div>

        {ai && (
          <div className="rounded-2xl border border-primary/25 bg-primary-light/40 p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary-dark">AI Assistant</p>
                <p className="text-xs text-ink-3">Drafts stay fully editable — nothing publishes automatically.</p>
              </div>
              <button aria-label="Close" onClick={() => setAi(false)} className="text-ink-3 hover:text-ink-1">✕</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Generate from source", AI_COMMAND_LABEL[meta.key], "Simplify", "Expand", "Translate to Hindi"].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => { applyChange(AI_INSERT[meta.key](content)); toast.success("AI draft inserted — edit before publishing"); }}
                  className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-ink-2 transition hover:border-primary/50 hover:text-primary"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading || !content ? (
          <p className="text-sm text-ink-3">Loading layer…</p>
        ) : (
          <div className={cn("grid gap-6", mode === "split" && "lg:grid-cols-2")}>
            {mode !== "preview" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card">
                  <header className="flex items-center gap-3 border-b border-border px-4 py-3">
                    <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-3 uppercase">Source PDF</p>
                    {content.pdfUrl && (
                      <a href={content.pdfUrl} target="_blank" rel="noreferrer" className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-[11px] font-semibold text-ink-2 hover:border-primary/40 hover:text-primary">
                        <FileText className="size-3.5" /> Open full size
                      </a>
                    )}
                  </header>
                  <div className="p-3">
                    {content.pdfUrl ? (
                      <iframe src={content.pdfUrl} title={`${meta.name} source`} className="h-64 w-full rounded-xl border border-border" />
                    ) : (
                      <p className="p-6 text-center text-xs text-ink-3">No source PDF for this book/level.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-ink-3 uppercase">{meta.blockLabel}s</p>
                  {editor}
                  <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2.5 text-xs leading-relaxed text-ink-3">{meta.guidance}</p>
                </div>
              </div>
            )}
            {mode !== "edit" && (
              <div className="rounded-2xl border border-border bg-card">
                <header className="border-b border-border px-4 py-3">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-3 uppercase">Live learner preview</p>
                  <p className="text-sm font-semibold text-ink-1">{bookTitle} · {meta.name}</p>
                </header>
                <div className="max-h-[70vh] overflow-y-auto bg-surface-2/60">
                  <LayerPreview layerKey={meta.key} content={content} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CreatorShell>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick} className="grid size-7 place-items-center rounded-md text-ink-3 transition hover:bg-surface-2 hover:text-ink-1 disabled:opacity-35">
      {children}
    </button>
  );
}
function ModeBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition", active ? "bg-primary text-white" : "text-ink-3 hover:bg-surface-2")}>
      {icon}{children}
    </button>
  );
}
