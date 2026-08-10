import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// ── L1 Snapshot ──────────────────────────────────────────────────────────────
interface KeyPoint { order?: number; heading: string; description: string }
const SnapshotRenderer = ({ content }: { content: unknown }) => {
  const points: KeyPoint[] = content?.keyPoints ?? [];
  if (!points.length) return <EmptyContent />;
  return (
    <div className="space-y-4">
      {points.map((pt, i) => (
        <div key={i} className="flex gap-4 p-4 bg-surface-2 rounded-xl border border-border">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
            {i + 1}
          </div>
          <div>
            <p className="font-semibold text-ink-1 mb-1">{pt.heading}</p>
            <p className="text-sm text-ink-2 leading-relaxed">{pt.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── L2 Flashdeck ──────────────────────────────────────────────────────────────
interface Card { order?: number; title: string; body: string }
const FlashdeckRenderer = ({ content }: { content: unknown }) => {
  const cards: Card[] = content?.cards ?? [];
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  if (!cards.length) return <EmptyContent />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="relative cursor-pointer"
          style={{ height: "180px", perspective: "1000px" }}
          onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
        >
          <motion.div
            animate={{ rotateY: flipped[i] ? 180 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d", height: "100%", position: "relative" }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-primary-light border border-primary/20 rounded-xl p-4 flex flex-col justify-between backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-xs text-primary font-semibold uppercase tracking-wide">Question {i + 1}</p>
              <p className="text-sm font-medium text-ink-1 leading-relaxed">{card.title}</p>
              <p className="text-[10px] text-ink-4 text-right">Tap to reveal →</p>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 bg-gradient-card border border-border rounded-xl p-4 flex flex-col justify-between"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="text-xs text-success font-semibold uppercase tracking-wide">Answer</p>
              <p className="text-sm text-ink-2 leading-relaxed">{card.body}</p>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

// ── L3 Infosummary ────────────────────────────────────────────────────────────
const InfosummaryRenderer = ({ content }: { content: unknown }) => {
  const imageUrl: string = content?.imageUrl ?? "";
  const markdown: string = content?.inlineMarkdown ?? content?.altText ?? "";
  return (
    <div className="space-y-4">
      {imageUrl && (
        <img src={imageUrl} alt="Infosummary" className="w-full rounded-xl border border-border" loading="lazy" />
      )}
      {markdown && <MarkdownRenderer text={markdown} />}
      {!imageUrl && !markdown && <EmptyContent />}
    </div>
  );
};

// ── L4 Deep Read ──────────────────────────────────────────────────────────────
const DeepReadRenderer = ({ content }: { content: unknown }) => {
  const text: string = content?.inlineText ?? "";
  if (!text) return <EmptyContent />;
  return <MarkdownRenderer text={text} />;
};

// ── L5 Mastery Quiz ───────────────────────────────────────────────────────────
interface Question {
  id?: string; order?: number; difficulty: string;
  question: string; options: string[]; correctAnswer: number; explanation: string;
}
const MasteryQuizRenderer = ({ content }: { content: unknown }) => {
  const questions: Question[] = content?.questions ?? [];
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  if (!questions.length) return <EmptyContent />;

  const diffColor = (d: string) =>
    d === "easy" ? "text-success bg-success-light" :
    d === "medium" ? "text-warning bg-warning-light" : "text-danger bg-danger/10";

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-3">{questions.length} questions — tap an option to answer</p>
      {questions.map((q, qi) => (
        <div key={qi} className="bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-start gap-3 mb-3">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${diffColor(q.difficulty)}`}>
              {q.difficulty?.toUpperCase()}
            </span>
            <p className="text-sm font-medium text-ink-1 leading-relaxed">{q.question}</p>
          </div>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const isSelected = selected[qi] === oi;
              const isRevealed = revealed[qi];
              const isCorrect = q.correctAnswer === oi;
              let cls = "border-border bg-background text-ink-2";
              if (isSelected && !isRevealed) cls = "border-primary bg-primary-light text-primary";
              if (isRevealed && isCorrect) cls = "border-success bg-success-light text-success";
              if (isRevealed && isSelected && !isCorrect) cls = "border-danger bg-danger/10 text-danger";
              return (
                <button
                  key={oi}
                  disabled={isRevealed}
                  onClick={() => setSelected((s) => ({ ...s, [qi]: oi }))}
                  className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border-2 transition-all ${cls}`}
                >
                  <span className="font-semibold mr-2">{["A","B","C","D"][oi]}.</span>{opt}
                </button>
              );
            })}
          </div>
          {selected[qi] !== undefined && !revealed[qi] && (
            <button
              onClick={() => setRevealed((r) => ({ ...r, [qi]: true }))}
              className="mt-3 text-xs text-primary font-semibold hover:underline"
            >
              Reveal answer →
            </button>
          )}
          {revealed[qi] && (
            <div className="mt-3 p-3 bg-success-light rounded-lg border border-success/20">
              <p className="text-xs font-semibold text-success mb-1">
                ✓ Correct: {["A","B","C","D"][q.correctAnswer]}
              </p>
              <p className="text-xs text-ink-2">{q.explanation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── L6 Action Plan ────────────────────────────────────────────────────────────
interface Section { title: string; prompt: string; placeholder: string }
const ActionPlanRenderer = ({ content }: { content: unknown }) => {
  const sections: Section[] =
    content?.daily?.sections ?? content?.sections ?? [];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  if (!sections.length) return <EmptyContent />;
  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-3">Complete each section to build your personalised habit plan.</p>
      {sections.map((sec, i) => (
        <div key={i} className="bg-surface-2 rounded-xl border border-border p-5">
          <h3 className="font-display font-bold text-ink-1 mb-2">
            {i + 1}. {sec.title}
          </h3>
          <p className="text-sm text-ink-2 mb-3 leading-relaxed">{sec.prompt}</p>
          <textarea
            rows={4}
            className="w-full text-sm rounded-lg border border-border bg-background p-3 text-ink-1 placeholder-ink-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={sec.placeholder}
            value={answers[i] ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
          />
        </div>
      ))}
    </div>
  );
};

// ── L7 Revision Booklet ───────────────────────────────────────────────────────
const RevisionBookletRenderer = ({ content }: { content: unknown }) => {
  const text: string = content?.richText ?? "";
  if (!text) return <EmptyContent />;
  return <MarkdownRenderer text={text} />;
};

// ── Markdown Renderer ─────────────────────────────────────────────────────────
const MarkdownRenderer = ({ text }: { text: string }) => (
  <div className="space-y-2">
    {text.split("\n\n").map((block, i) => {
      if (block.startsWith("## "))
        return <h2 key={i} className="font-display text-xl font-bold text-ink-1 mt-6 mb-2">{block.slice(3)}</h2>;
      if (block.startsWith("### "))
        return <h3 key={i} className="font-display text-base font-bold text-ink-1 mt-4 mb-1">{block.slice(4)}</h3>;
      if (block.startsWith("# "))
        return <h1 key={i} className="font-display text-2xl font-bold text-ink-1 mt-6 mb-3">{block.slice(2)}</h1>;
      if (block.startsWith("> "))
        return <blockquote key={i} className="border-l-4 border-primary bg-primary-light/50 rounded-r-lg px-4 py-2 my-3 italic text-ink-2">{block.slice(2)}</blockquote>;
      if (block.startsWith("---"))
        return <hr key={i} className="border-border my-4" />;
      return <p key={i} className="text-ink-2 leading-relaxed">{block}</p>;
    })}
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyContent = () => (
  <div className="text-center py-16">
    <div className="inline-flex flex-col items-center gap-4 bg-primary-light border border-primary/20 rounded-2xl p-8 max-w-sm">
      <motion.div animate={{ scale: [1,1.1,1], rotate: [0,5,-5,0] }} transition={{ duration: 2, repeat: Infinity }}>
        <span className="text-5xl">🤖</span>
      </motion.div>
      <div>
        <h3 className="font-display text-base font-bold text-ink-1 mb-2">Content is being prepared...</h3>
        <p className="text-sm text-ink-3">Great knowledge takes a moment to distill.</p>
      </div>
      <a href="/books" className="text-xs text-primary hover:underline">Explore other books</a>
    </div>
  </div>
);

// ── Main Dispatcher ───────────────────────────────────────────────────────────
interface LevelRendererProps {
  levelNum: number;
  content: unknown;
  fontSize?: number;
}

const LevelRenderer = ({ levelNum, content, fontSize = 16 }: LevelRendererProps) => {
  if (!content) return <EmptyContent />;
  switch (levelNum) {
    case 1: return <SnapshotRenderer content={content} />;
    case 2: return <FlashdeckRenderer content={content} />;
    case 3: return <InfosummaryRenderer content={content} />;
    case 4: return <DeepReadRenderer content={content} />;
    case 5: return <MasteryQuizRenderer content={content} />;
    case 6: return <ActionPlanRenderer content={content} />;
    case 7: return <RevisionBookletRenderer content={content} />;
    default: return <EmptyContent />;
  }
};

export default LevelRenderer;
export { EmptyContent, MarkdownRenderer };
