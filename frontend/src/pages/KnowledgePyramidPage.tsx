import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Lock, Share2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/AppShell";

const levels = [
  { id: 7, name: "Full Mastery", words: 15000, plan: "PRO", color: "#DC2626", completed: false },
  { id: 6, name: "Expert Commentary", words: 8000, plan: "PREMIUM", color: "#7C3AED", completed: false },
  { id: 5, name: "Practical Applications", words: 5000, plan: "PREMIUM", color: "#7C3AED", completed: false },
  { id: 4, name: "Deep Analysis", words: 3000, plan: "STARTER", color: "#2563EB", completed: false },
  { id: 3, name: "Chapter Breakdown", words: 1200, plan: "FREE", color: "#059669", completed: true },
  { id: 2, name: "Key Takeaways", words: 500, plan: "FREE", color: "#059669", completed: true },
  { id: 1, name: "60-Second Summary", words: 150, plan: "FREE", color: "#059669", completed: true },
];

const KnowledgePyramidPage = () => {
  const { id } = useParams();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild><Link to={`/books/${id}`}><ChevronLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-1">Your Knowledge Pyramid</h1>
            <p className="text-sm text-ink-3">Atomic Habits · 3 of 7 levels mastered</p>
          </div>
        </div>

        {/* Pyramid visualization */}
        <div className="flex flex-col items-center gap-2 mb-8">
          {levels.map((level, i) => {
            const widthPercent = 30 + (6 - i) * 10;
            const isLocked = level.plan !== "FREE";
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
                style={{ width: `${widthPercent}%` }}
              >
                <Link
                  to={isLocked ? "#" : `/books/${id}/level/${level.id}`}
                  className={`block rounded-lg p-3 text-center text-white text-sm font-medium transition-all hover:-translate-y-0.5 ${
                    isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:shadow-lg"
                  } ${level.completed ? "" : ""}`}
                  style={{
                    backgroundColor: level.color,
                    backgroundImage: isLocked ? "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)" : undefined,
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {level.completed && <Check className="h-4 w-4" />}
                    {isLocked && <Lock className="h-3 w-3" />}
                    <span>L{level.id}: {level.name}</span>
                  </div>
                  <span className="text-xs opacity-70">{level.words.toLocaleString()} words</span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-background border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-primary">3/7</p>
            <p className="text-xs text-ink-3">Levels Done</p>
          </div>
          <div className="bg-background border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-success">42%</p>
            <p className="text-xs text-ink-3">Depth</p>
          </div>
          <div className="bg-background border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-warning">450</p>
            <p className="text-xs text-ink-3">XP Earned</p>
          </div>
        </div>

        <Button variant="outline" className="w-full gap-2">
          <Share2 className="h-4 w-4" />
          Share: "I'm mastering Atomic Habits!"
        </Button>
      </div>
    </AppShell>
  );
};

export default KnowledgePyramidPage;
