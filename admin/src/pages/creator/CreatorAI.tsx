import { useState } from "react";
import { Sparkles } from "lucide-react";

import { CreatorShell, CreatorPageHeader } from "@/components/creator/CreatorShell";
import { Panel } from "@/components/creator/primitives";

const COMMANDS = [
  "Generate from source",
  "Rewrite",
  "Simplify",
  "Expand",
  "Summarize",
  "Create quiz",
  "Create flashcards",
  "Create infographic",
  "Translate to Hindi",
  "Improve structure",
];

const CANNED: Record<string, string> = {
  "Generate from source": "Drafted a first pass from the uploaded source PDF — review it in the layer editor before publishing.",
  Rewrite: "Rewritten in a more direct, active voice while keeping the original meaning intact.",
  Simplify: "Simplified to shorter sentences and everyday vocabulary — should read comfortably at a Grade 8 level.",
  Expand: "Expanded with one more supporting example and a closing takeaway line.",
  Summarize: "Summarized down to the two sentences that carry the most weight.",
  "Create quiz": "Drafted 4 multiple-choice questions with explanations, ready to paste into the Mastery Test layer.",
  "Create flashcards": "Drafted 6 flashcard fronts/backs from this section's key ideas.",
  "Create infographic": "Suggested a 4-step framework layout for the infographic — a loop diagram fits this content well.",
  "Translate to Hindi": "Translated the selected text to Hindi, preserving tone and keeping product names in English.",
  "Improve structure": "Reordered so the strongest idea leads, with supporting points grouped underneath.",
};

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function CreatorAI() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Pick a command below, or describe what you'd like help with. Every draft stays fully editable — nothing publishes automatically." },
  ]);
  const [input, setInput] = useState("");

  const run = (command: string) => {
    setMessages((m) => [
      ...m,
      { role: "user", text: command },
      { role: "assistant", text: CANNED[command] ?? "Drafted a suggestion based on your request — open the relevant layer editor to apply it." },
    ]);
    setInput("");
  };

  return (
    <CreatorShell>
      <CreatorPageHeader
        eyebrow="Assets"
        title="AI Assistant"
        description="Quick drafting help for any layer. Suggestions are always editable, never auto-published."
      />

      <Panel title="Assistant">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {COMMANDS.map((c) => (
            <button
              key={c}
              onClick={() => run(c)}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-ink-2 transition hover:border-primary/50 hover:text-primary"
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span
                className={
                  m.role === "user"
                    ? "inline-block max-w-md rounded-2xl bg-primary px-3.5 py-2 text-sm text-white"
                    : "inline-flex max-w-md items-start gap-2 rounded-2xl bg-card px-3.5 py-2 text-sm text-ink-1 shadow-sm"
                }
              >
                {m.role === "assistant" && <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />}
                {m.text}
              </span>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) run(input.trim());
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask GrowVio AI anything about this book…"
            className="h-10 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <Sparkles className="size-4" /> Ask
          </button>
        </form>
      </Panel>
    </CreatorShell>
  );
}
