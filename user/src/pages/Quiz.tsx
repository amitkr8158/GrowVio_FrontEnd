import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Check, X, ChevronLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";

const questions = [
  { q: "What is the core concept behind habit formation in Atomic Habits?", options: ["Big goals", "Compound 1% improvements", "Willpower", "Motivation"], correct: 1, explanation: "James Clear emphasizes that getting 1% better each day leads to remarkable results over time." },
  { q: "What are the four laws of behavior change?", options: ["Plan, Act, Review, Repeat", "Cue, Craving, Response, Reward", "Think, Do, Check, Adjust", "See, Want, Try, Get"], correct: 1, explanation: "The Four Laws are based on the habit loop: Cue, Craving, Response, and Reward." },
  { q: "What is 'habit stacking'?", options: ["Doing many habits at once", "Linking a new habit to an existing one", "Building habits in order", "Removing bad habits"], correct: 1, explanation: "Habit stacking pairs a new habit with an existing one using the formula: After I [CURRENT], I will [NEW]." },
  { q: "According to Clear, identity-based habits focus on:", options: ["What you want to achieve", "Who you wish to become", "How much you can do", "When you should act"], correct: 1, explanation: "True behavior change is identity change — focusing on who you wish to become, not what you want to achieve." },
];

const Quiz = () => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[current];

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (finished) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto text-center py-12">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <p className="text-5xl mb-4">{score >= 3 ? "🎉" : "📚"}</p>
            <h1 className="font-display text-3xl font-bold text-ink-1 mb-2">{score}/{questions.length}</h1>
            <p className="text-ink-3 mb-2">{score >= 3 ? "Excellent work!" : "Keep learning!"}</p>
            <div className="bg-primary-light rounded-xl p-4 mb-6">
              <p className="text-2xl font-display font-bold text-primary">+{score * 25} XP</p>
              <p className="text-xs text-ink-3">earned from this quiz</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setCurrent(0); setScore(0); setFinished(false); setSelected(null); setAnswered(false); }}>Retry</Button>
              <Button className="gap-2"><Share2 className="h-4 w-4" />Share Result</Button>
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-ink-1">Atomic Habits Quiz</p>
            <p className="text-xs text-ink-3">Q{current + 1} of {questions.length}</p>
          </div>
        </div>
        <Progress value={((current + 1) / questions.length) * 100} className="h-1.5 mb-8" />

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg font-semibold text-ink-1 mb-6">{question.q}</h2>
            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                let style = "bg-background border border-border text-ink-1 hover:bg-surface-2";
                if (answered) {
                  if (idx === question.correct) style = "bg-success-light border-2 border-success text-success";
                  else if (idx === selected) style = "bg-danger-light border-2 border-danger text-danger";
                }
                return (
                  <motion.button
                    key={idx}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl font-medium transition-all flex items-center gap-3 ${style}`}
                  >
                    <span className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {answered && idx === question.correct ? <Check className="h-4 w-4 text-success" /> :
                       answered && idx === selected ? <X className="h-4 w-4 text-danger" /> :
                       String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </motion.button>
                );
              })}
            </div>
            {answered && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-info-light border border-info/20 rounded-xl p-4">
                <p className="text-sm text-ink-2">{question.explanation}</p>
              </motion.div>
            )}
            {answered && (
              <Button onClick={handleNext} className="w-full mt-6 h-12">
                {current + 1 >= questions.length ? "See Results" : "Next Question →"}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
};

export default Quiz;
