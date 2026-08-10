import { Flame, Target, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import AppShell from "@/components/layout/AppShell";

const ReadingGoals = () => (
  <AppShell>
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-ink-1 mb-6">Reading Goals</h1>
      {/* Streak */}
      <div className="bg-warning-light border border-warning/20 rounded-xl p-6 text-center mb-6">
        <Flame className="h-12 w-12 text-warning mx-auto mb-2" />
        <p className="font-display text-3xl font-bold text-ink-1">7 day streak</p>
        <p className="text-sm text-ink-3">Keep it going! Read today to maintain.</p>
      </div>
      {/* Weekly goal */}
      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-ink-1 mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Weekly Book Target</h3>
        <Slider defaultValue={[3]} min={1} max={7} step={1} className="mb-3" />
        <div className="flex justify-between text-xs text-ink-3"><span>1 book</span><span>7 books</span></div>
        <div className="mt-4 flex items-center gap-3">
          <div className="relative h-16 w-16">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90"><circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--surface-3))" strokeWidth="3" /><circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--color-primary))" strokeWidth="3" strokeDasharray="97.4" strokeDashoffset="32.5" strokeLinecap="round" /></svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink-1">2/3</span>
          </div>
          <div><p className="text-sm font-medium text-success">You're on track! 🎯</p><p className="text-xs text-ink-3">1 more book to hit this week's goal</p></div>
        </div>
      </div>
      {/* Physical review */}
      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-ink-1 mb-4">Physical Review Today</h3>
        <div className="space-y-3">
          {["Notes Written", "Discussed With Someone", "Applied in Real Life", "Re-read Key Section"].map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer"><Checkbox /><span className="text-sm text-ink-2">{item}</span></label>
          ))}
        </div>
      </div>
      {/* Badge progress */}
      <div className="bg-background border border-border rounded-xl p-6">
        <h3 className="font-semibold text-ink-1 mb-4">Next Badges</h3>
        <div className="space-y-4">
          {[{ name: "Bookworm", progress: 60, desc: "Read 20 books" }, { name: "30-Day Streak", progress: 23, desc: "30 days in a row" }, { name: "Quiz Master", progress: 80, desc: "Score 90%+ on 5 quizzes" }].map((b) => (
            <div key={b.name}>
              <div className="flex justify-between text-sm mb-1"><span className="text-ink-1 font-medium">{b.name}</span><span className="text-ink-3">{b.progress}%</span></div>
              <Progress value={b.progress} className="h-1.5" />
              <p className="text-xs text-ink-3 mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6"><Button variant="outline" size="sm">Export Reading Data (CSV)</Button></div>
    </div>
  </AppShell>
);
export default ReadingGoals;
