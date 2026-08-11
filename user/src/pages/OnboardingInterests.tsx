import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_SELECTIONS = 5;

const categories = [
  { emoji: "💼", label: "Business" },
  { emoji: "🧠", label: "Self-Help" },
  { emoji: "🔬", label: "Psychology" },
  { emoji: "💰", label: "Finance" },
  { emoji: "👑", label: "Leadership" },
  { emoji: "⚡", label: "Productivity" },
  { emoji: "📜", label: "History" },
  { emoji: "🔭", label: "Science" },
  { emoji: "👤", label: "Biographies" },
  { emoji: "📖", label: "Fiction" },
  { emoji: "🇮🇳", label: "Hindi Books" },
  { emoji: "🕉️", label: "Spirituality" },
  { emoji: "🚀", label: "Entrepreneurship" },
  { emoji: "💸", label: "Personal Finance" },
  { emoji: "🏃", label: "Health & Wellness" },
  { emoji: "🧘", label: "Philosophy" },
  { emoji: "💻", label: "Technology" },
  { emoji: "📣", label: "Marketing" },
  { emoji: "❤️", label: "Relationships" },
  { emoji: "🎨", label: "Creativity" },
  { emoji: "🗣️", label: "Communication" },
  { emoji: "📈", label: "Career & Growth" },
  { emoji: "👶", label: "Parenting" },
  { emoji: "🌿", label: "Environment" },
];

const OnboardingInterests = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggle = (label: string) => {
    setSelected((prev) => {
      if (prev.includes(label)) return prev.filter((l) => l !== label);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, label];
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2 flex-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= 1 ? "bg-primary" : "bg-surface-3"}`} />
            ))}
          </div>
          <Link to="/onboarding/goal" className="text-sm text-ink-3 hover:text-primary ml-4">Skip for now</Link>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/signup")}
          className="flex items-center gap-1 text-sm text-ink-3 hover:text-primary mt-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="font-display text-2xl font-bold text-ink-1 mt-4 mb-2">What do you want to learn?</h1>
        <p className="text-ink-3 mb-6">Pick up to {MAX_SELECTIONS} topics to personalize your library</p>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
          {categories.map((cat) => {
            const isSelected = selected.includes(cat.label);
            const isDisabled = !isSelected && selected.length >= MAX_SELECTIONS;
            return (
              <motion.button
                key={cat.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(cat.label)}
                disabled={isDisabled}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary-light shadow-sm"
                    : isDisabled
                    ? "border-border bg-surface-2 opacity-40 cursor-not-allowed"
                    : "border-border bg-background hover:bg-surface-2"
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-ink-1 text-center leading-tight">{cat.label}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                  >
                    <span className="text-white text-[9px]">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-ink-3">
            <span className={selected.length === MAX_SELECTIONS ? "text-primary font-medium" : ""}>
              {selected.length} of {MAX_SELECTIONS} selected
            </span>
            {selected.length === 0 && (
              <span className="ml-2 text-xs text-ink-4">Select at least 1 to continue</span>
            )}
          </div>
          <Button disabled={selected.length < 1} className="h-12 px-8" asChild>
            <Link to="/onboarding/goal">Continue</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingInterests;
