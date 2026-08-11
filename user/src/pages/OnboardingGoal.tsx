import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const styles = [
  { id: "quick", label: "Quick Summaries", desc: "Key points in 60 seconds", emoji: "⚡" },
  { id: "balanced", label: "Balanced", desc: "Summaries + key concepts", emoji: "⚖️" },
  { id: "deep", label: "Deep Dives", desc: "Comprehensive understanding", emoji: "🔍" },
];

const getPaceLabel = (booksPerWeek: number): string => {
  if (booksPerWeek === 1) return "Explorer";
  if (booksPerWeek === 2) return "Casual";
  if (booksPerWeek <= 4) return "Consistent";
  if (booksPerWeek <= 6) return "Dedicated";
  return "Obsessed";
};

const OnboardingGoal = () => {
  const [booksPerWeek, setBooksPerWeek] = useState([2]);
  const [selectedStyle, setSelectedStyle] = useState("balanced");

  const paceLabel = getPaceLabel(booksPerWeek[0]);
  const estimatedXP = booksPerWeek[0] * 250;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= 2 ? "bg-primary" : "bg-surface-3"}`} />
          ))}
        </div>

        <h1 className="font-display text-2xl font-bold text-ink-1 mb-2">Set your reading rhythm</h1>
        <p className="text-ink-3 mb-8">We'll customize your experience based on your goals</p>

        {/* Books per week slider */}
        <div className="bg-background border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-ink-1">Books per week</span>
            <span className="text-sm font-semibold text-primary">{booksPerWeek[0]} — {paceLabel}</span>
          </div>
          <Slider value={booksPerWeek} onValueChange={setBooksPerWeek} min={1} max={7} step={1} className="mb-4" />
          <div className="flex justify-between text-xs text-ink-3">
            <span>Explorer</span>
            <span>Consistent</span>
            <span>Obsessed</span>
          </div>
          <div className="mt-4 text-center bg-primary-light rounded-lg p-3">
            <span className="text-sm text-primary font-medium">At your pace: ~{estimatedXP} XP/week</span>
          </div>
        </div>

        {/* Learning style */}
        <div className="space-y-3 mb-8">
          <span className="text-sm font-medium text-ink-1">Learning style</span>
          <div className="grid gap-3">
            {styles.map((style) => (
              <motion.button
                key={style.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedStyle(style.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  selectedStyle === style.id
                    ? "border-primary bg-primary-light -translate-y-0.5 shadow-sm"
                    : "border-border hover:bg-surface-2"
                }`}
              >
                <span className="text-2xl">{style.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-ink-1">{style.label}</p>
                  <p className="text-xs text-ink-3">{style.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" asChild><Link to="/onboarding/interests">← Back</Link></Button>
          <Button className="h-12 px-8" asChild><Link to="/onboarding/first-book">Continue</Link></Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingGoal;
