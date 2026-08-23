// Bespoke field editors for each of the 7 authoring layers — shaped to
// match the *actual* content already authored in mocks/data/books.ts
// (level1..level7), not a generic block model. Each editor is a plain
// controlled component: `content` in, `onChange(nextContent)` out.
import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";
const label = "mb-1.5 block text-[11px] font-semibold tracking-[0.1em] text-ink-3 uppercase";

function Labelled({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={label}>{text}</span>
      {children}
    </label>
  );
}

function ReorderRow({
  index,
  total,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group flex gap-2 rounded-xl border border-border bg-card p-3">
      <div className="flex flex-col items-center gap-1 pt-1">
        <GripVertical className="size-3.5 text-ink-4" />
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="Move up"
          className="text-ink-4 hover:text-primary disabled:opacity-30"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label="Move down"
          className="text-ink-4 hover:text-primary disabled:opacity-30"
        >
          <ArrowDown className="size-3.5" />
        </button>
      </div>
      <div className="min-w-0 flex-1 space-y-2">{children}</div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="self-start text-ink-4 opacity-0 transition group-hover:opacity-100 hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function AddButton({ onClick, label: text }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-border px-3 text-xs font-semibold text-ink-2 transition hover:border-primary/50 hover:text-primary"
    >
      <Plus className="size-3.5" /> {text}
    </button>
  );
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  const tmp = next[i]!;
  next[i] = next[j]!;
  next[j] = tmp;
  return next.map((x, k) => ({ ...(x as object), order: k + 1 }) as T);
}

// ── Level 1 · Snapshot ───────────────────────────────────────────────────
interface KeyPoint { order: number; heading: string; description: string; emoji?: string; impactScore?: string }

export function SnapshotEditor({ content, onChange }: { content: { keyPoints?: KeyPoint[] }; onChange: (c: object) => void }) {
  const points = content.keyPoints ?? [];
  const update = (next: KeyPoint[]) => onChange({ keyPoints: next });

  return (
    <div className="space-y-3">
      {points.map((pt, i) => (
        <ReorderRow key={i} index={i} total={points.length} onMove={(dir) => update(move(points, i, dir))} onRemove={() => update(points.filter((_, k) => k !== i).map((p, k) => ({ ...p, order: k + 1 })))}>
          <input
            className={field}
            value={pt.heading}
            placeholder="Key insight heading…"
            onChange={(e) => update(points.map((p, k) => (k === i ? { ...p, heading: e.target.value } : p)))}
          />
          <textarea
            className={cn(field, "min-h-20 resize-y")}
            value={pt.description}
            placeholder="2–3 sentence explanation…"
            onChange={(e) => update(points.map((p, k) => (k === i ? { ...p, description: e.target.value } : p)))}
          />
        </ReorderRow>
      ))}
      <AddButton label="Add key point" onClick={() => update([...points, { order: points.length + 1, heading: "", description: "" }])} />
    </div>
  );
}

// ── Level 2 · Flashdeck ──────────────────────────────────────────────────
interface FlashCard { order: number; title: string; body: string; quote?: string; cardType?: string; colorMood?: string }

export function FlashdeckEditor({ content, onChange }: { content: { cards?: FlashCard[] }; onChange: (c: object) => void }) {
  const cards = content.cards ?? [];
  const update = (next: FlashCard[]) => onChange({ cards: next });

  return (
    <div className="space-y-3">
      {cards.map((c, i) => (
        <ReorderRow key={i} index={i} total={cards.length} onMove={(dir) => update(move(cards, i, dir))} onRemove={() => update(cards.filter((_, k) => k !== i).map((x, k) => ({ ...x, order: k + 1 })))}>
          <input className={field} value={c.title} placeholder="Card title…" onChange={(e) => update(cards.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} />
          <textarea className={cn(field, "min-h-16 resize-y")} value={c.body} placeholder="Card body…" onChange={(e) => update(cards.map((x, k) => (k === i ? { ...x, body: e.target.value } : x)))} />
          <input className={cn(field, "text-xs italic")} value={c.quote ?? ""} placeholder="Optional quote…" onChange={(e) => update(cards.map((x, k) => (k === i ? { ...x, quote: e.target.value } : x)))} />
        </ReorderRow>
      ))}
      <AddButton label="Add card" onClick={() => update([...cards, { order: cards.length + 1, title: "", body: "" }])} />
    </div>
  );
}

// ── Level 3 · Infosummary ────────────────────────────────────────────────
export function InfosummaryEditor({ content, onChange }: { content: { infographicUrl?: string; description?: string }; onChange: (c: object) => void }) {
  return (
    <div className="space-y-4">
      <Labelled text="Infographic image URL">
        <input
          className={field}
          value={content.infographicUrl ?? ""}
          placeholder="https://…"
          onChange={(e) => onChange({ ...content, infographicUrl: e.target.value })}
        />
      </Labelled>
      {content.infographicUrl && (
        <img src={content.infographicUrl} alt="Infosummary preview" className="max-h-64 rounded-xl border border-border object-contain" loading="lazy" />
      )}
      <Labelled text="Caption / description">
        <textarea
          className={cn(field, "min-h-24 resize-y")}
          value={content.description ?? ""}
          placeholder="What this single-page visual maps…"
          onChange={(e) => onChange({ ...content, description: e.target.value })}
        />
      </Labelled>
    </div>
  );
}

// ── Level 4 · Deep Read ───────────────────────────────────────────────────
interface Chapter { title: string; subtitle?: string; openingHook?: string; narrativeSummary?: string; keyTakeaways?: string[]; memorableMoment?: string }

export function DeepReadEditor({ content, onChange }: { content: { overview?: string; chapters?: Chapter[]; conclusion?: string; oneAction?: string; theBigQuestion?: string }; onChange: (c: object) => void }) {
  const chapters = content.chapters ?? [];
  const updateChapters = (next: Chapter[]) => onChange({ ...content, chapters: next });
  const patchChapter = (i: number, patch: Partial<Chapter>) => updateChapters(chapters.map((c, k) => (k === i ? { ...c, ...patch } : c)));

  return (
    <div className="space-y-4">
      <Labelled text="Overview">
        <textarea className={cn(field, "min-h-24 resize-y")} value={content.overview ?? ""} onChange={(e) => onChange({ ...content, overview: e.target.value })} />
      </Labelled>

      <p className={label}>Chapters</p>
      <div className="space-y-3">
        {chapters.map((c, i) => (
          <ReorderRow key={i} index={i} total={chapters.length} onMove={(dir) => updateChapters(move(chapters, i, dir))} onRemove={() => updateChapters(chapters.filter((_, k) => k !== i))}>
            <input className={field} value={c.title} placeholder="Chapter title…" onChange={(e) => patchChapter(i, { title: e.target.value })} />
            <input className={cn(field, "text-xs")} value={c.subtitle ?? ""} placeholder="Subtitle…" onChange={(e) => patchChapter(i, { subtitle: e.target.value })} />
            <textarea className={cn(field, "min-h-20 resize-y")} value={c.narrativeSummary ?? ""} placeholder="Narrative summary…" onChange={(e) => patchChapter(i, { narrativeSummary: e.target.value })} />
            <input className={cn(field, "text-xs italic")} value={c.memorableMoment ?? ""} placeholder="Memorable moment…" onChange={(e) => patchChapter(i, { memorableMoment: e.target.value })} />
          </ReorderRow>
        ))}
        <AddButton label="Add chapter" onClick={() => updateChapters([...chapters, { title: "" }])} />
      </div>

      <Labelled text="Conclusion">
        <textarea className={cn(field, "min-h-16 resize-y")} value={content.conclusion ?? ""} onChange={(e) => onChange({ ...content, conclusion: e.target.value })} />
      </Labelled>
      <Labelled text="One action">
        <input className={field} value={content.oneAction ?? ""} onChange={(e) => onChange({ ...content, oneAction: e.target.value })} />
      </Labelled>
      <Labelled text="The big question">
        <input className={field} value={content.theBigQuestion ?? ""} onChange={(e) => onChange({ ...content, theBigQuestion: e.target.value })} />
      </Labelled>
    </div>
  );
}

// ── Level 5 · Mastery Test ────────────────────────────────────────────────
interface QuizQuestion { id: string; order: number; difficulty: string; question: string; options: string[]; correctAnswer: number; explanation: string; conceptTested?: string }

export function MasteryEditor({ content, onChange }: { content: { questions?: QuizQuestion[] }; onChange: (c: object) => void }) {
  const questions = content.questions ?? [];
  const update = (next: QuizQuestion[]) => onChange({ questions: next });
  const patch = (i: number, p: Partial<QuizQuestion>) => update(questions.map((q, k) => (k === i ? { ...q, ...p } : q)));

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <ReorderRow key={q.id ?? i} index={i} total={questions.length} onMove={(dir) => update(move(questions, i, dir))} onRemove={() => update(questions.filter((_, k) => k !== i))}>
          <div className="flex items-center gap-2">
            <select className={cn(field, "w-32")} value={q.difficulty} onChange={(e) => patch(i, { difficulty: e.target.value })}>
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
            <input className={cn(field, "text-xs")} value={q.conceptTested ?? ""} placeholder="Concept tested…" onChange={(e) => patch(i, { conceptTested: e.target.value })} />
          </div>
          <textarea className={cn(field, "min-h-16 resize-y")} value={q.question} placeholder="Question…" onChange={(e) => patch(i, { question: e.target.value })} />
          <div className="space-y-1.5">
            {(q.options ?? []).map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${q.id ?? i}`}
                  checked={q.correctAnswer === oi}
                  onChange={() => patch(i, { correctAnswer: oi })}
                  className="accent-primary"
                  aria-label={`Mark option ${oi + 1} correct`}
                />
                <input
                  className={cn(field, "flex-1")}
                  value={opt}
                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                  onChange={(e) => patch(i, { options: q.options.map((o, k) => (k === oi ? e.target.value : o)) })}
                />
              </div>
            ))}
          </div>
          <textarea className={cn(field, "min-h-14 resize-y text-xs")} value={q.explanation} placeholder="Explanation shown after answering…" onChange={(e) => patch(i, { explanation: e.target.value })} />
        </ReorderRow>
      ))}
      <AddButton
        label="Add question"
        onClick={() =>
          update([
            ...questions,
            { id: `q${Date.now()}`, order: questions.length + 1, difficulty: "EASY", question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" },
          ])
        }
      />
    </div>
  );
}

// ── Level 6 · Action Plan ─────────────────────────────────────────────────
interface WorkbookSection { title: string; prompt: string; placeholder?: string }
interface WorkbookFormat { title: string; sections: WorkbookSection[] }
type Period = "daily" | "weekly" | "monthly";

export function ActionPlanEditor({ content, onChange }: { content: Record<Period, WorkbookFormat | undefined>; onChange: (c: object) => void }) {
  const [tab, setTab] = useState<Period>("daily");
  const fmt: WorkbookFormat = content[tab] ?? { title: "", sections: [] };
  const setFmt = (next: WorkbookFormat) => onChange({ ...content, [tab]: next });

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-1">
        {(["daily", "weekly", "monthly"] as Period[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition",
              tab === t ? "bg-card text-ink-1 shadow-sm" : "text-ink-3 hover:text-ink-1",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Labelled text="Format title">
        <input className={field} value={fmt.title} onChange={(e) => setFmt({ ...fmt, title: e.target.value })} />
      </Labelled>

      <div className="space-y-3">
        {fmt.sections.map((s, i) => (
          <ReorderRow
            key={i}
            index={i}
            total={fmt.sections.length}
            onMove={(dir) => setFmt({ ...fmt, sections: move(fmt.sections, i, dir) })}
            onRemove={() => setFmt({ ...fmt, sections: fmt.sections.filter((_, k) => k !== i) })}
          >
            <input className={field} value={s.title} placeholder="Section name…" onChange={(e) => setFmt({ ...fmt, sections: fmt.sections.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)) })} />
            <textarea className={cn(field, "min-h-16 resize-y")} value={s.prompt} placeholder="What question to ask the user?" onChange={(e) => setFmt({ ...fmt, sections: fmt.sections.map((x, k) => (k === i ? { ...x, prompt: e.target.value } : x)) })} />
            <input className={cn(field, "text-xs")} value={s.placeholder ?? ""} placeholder="Placeholder hint text…" onChange={(e) => setFmt({ ...fmt, sections: fmt.sections.map((x, k) => (k === i ? { ...x, placeholder: e.target.value } : x)) })} />
          </ReorderRow>
        ))}
        <AddButton label="Add section" onClick={() => setFmt({ ...fmt, sections: [...fmt.sections, { title: "", prompt: "" }] })} />
      </div>
    </div>
  );
}

// ── Level 7 · Quick Recall ────────────────────────────────────────────────
export function RecallEditor({ content, onChange }: { content: { richText?: string }; onChange: (c: object) => void }) {
  const text = content.richText ?? "";
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className="space-y-3">
      <div className={cn("text-xs font-medium", wordCount >= 150 ? "text-success" : "text-warning")}>
        {wordCount} words {wordCount < 150 && "· aim for 150+ for a solid revision sheet"}
      </div>
      <textarea
        className={cn(field, "min-h-80 resize-y font-mono text-xs leading-relaxed")}
        value={text}
        placeholder={"## Core idea\n\n## Framework\n\n## One action"}
        onChange={(e) => onChange({ richText: e.target.value, wordCount: e.target.value.trim().split(/\s+/).filter(Boolean).length })}
      />
    </div>
  );
}
