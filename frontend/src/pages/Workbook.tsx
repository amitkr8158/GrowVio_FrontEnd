import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Check, Flame, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";

interface WorkbookData {
  answers: Record<string, string>;
  challengeDays: number[];
}

function storageKey(bookId: string, userId: number) {
  return `growvio_workbook_${userId}_${bookId}`;
}

function load(bookId: string, userId: number): WorkbookData {
  // TODO: Replace localStorage with PUT /api/users/books/{bookId}/workbook when API is stable
  try {
    const raw = localStorage.getItem(storageKey(bookId, userId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { answers: {}, challengeDays: [] };
}

export default function Workbook() {
  const { id: bookId = "" } = useParams();
  const { user } = useAuth();
  const userId = user?.id ?? 0;

  const [data, setData] = useState<WorkbookData>({ answers: {}, challengeDays: [] });
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (bookId && userId) setData(load(bookId, userId));
  }, [bookId, userId]);

  const persist = useCallback(
    (updated: WorkbookData) => {
      setData(updated);
      if (saveTimer) clearTimeout(saveTimer);
      const t = setTimeout(() => {
        localStorage.setItem(storageKey(bookId, userId), JSON.stringify(updated));
        setSavedAt(new Date());
      }, 1000);
      setSaveTimer(t);
    },
    [bookId, userId, saveTimer]
  );

  const setAnswer = (key: string, value: string) => {
    persist({ ...data, answers: { ...data.answers, [key]: value } });
  };

  const toggleDay = (day: number) => {
    const days = data.challengeDays.includes(day)
      ? data.challengeDays.filter((d) => d !== day)
      : [...data.challengeDays, day];
    persist({ ...data, challengeDays: days });
  };

  const savedLabel = savedAt
    ? `Saved ${savedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
    : "Auto-saved";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-1">Action Workbook</h1>
            <p className="text-sm text-ink-3 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              {bookId || "Book"}
              <span className="text-[10px] bg-surface-3 text-ink-3 px-2 py-0.5 rounded-full">Saved locally</span>
            </p>
          </div>
        </div>

        <Tabs defaultValue="tracker">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="tracker">Habit Tracker</TabsTrigger>
            <TabsTrigger value="worksheets">Worksheets</TabsTrigger>
            <TabsTrigger value="challenge">30-Day Challenge</TabsTrigger>
          </TabsList>

          <TabsContent value="tracker">
            <div className="bg-background border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-ink-1">Define Your Habit Loop</h3>
              <div className="space-y-3">
                {[
                  { key: "cue",     label: "Cue (What triggers it?)",         placeholder: "e.g., My alarm goes off at 6 AM" },
                  { key: "routine", label: "Routine (What do you do?)",        placeholder: "e.g., I put on my running shoes and jog for 10 minutes" },
                  { key: "reward",  label: "Reward (What do you get?)",        placeholder: "e.g., I feel energized and have a healthy smoothie" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-ink-2 mb-1 block">{label}</label>
                    <Textarea
                      placeholder={placeholder}
                      className="h-20"
                      value={data.answers[key] ?? ""}
                      onChange={(e) => setAnswer(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-success flex items-center gap-1">
                <Check className="h-3 w-3" />{savedLabel}
              </p>
            </div>

            <div className="bg-background border border-border rounded-xl p-6 mt-4">
              <h3 className="font-semibold text-ink-1 mb-4">5-Day Experiment</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-ink-3 font-medium">Day</th>
                      <th className="text-left py-2 text-ink-3 font-medium">Tried?</th>
                      <th className="text-left py-2 text-ink-3 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((day) => (
                      <tr key={day} className="border-b border-border">
                        <td className="py-3 font-medium text-ink-1">Day {day}</td>
                        <td className="py-3">
                          <Checkbox
                            checked={!!(data.answers[`exp_tried_${day}`])}
                            onCheckedChange={(v) => setAnswer(`exp_tried_${day}`, v ? "1" : "")}
                          />
                        </td>
                        <td className="py-3">
                          <input
                            className="text-sm border-0 bg-transparent text-ink-2 w-full outline-none"
                            placeholder="How did it go?"
                            value={data.answers[`exp_result_${day}`] ?? ""}
                            onChange={(e) => setAnswer(`exp_result_${day}`, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="worksheets">
            <div className="bg-background border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-ink-1">Implementation Intentions</h3>
              <p className="text-sm text-ink-3">Use the formula: "I will [BEHAVIOR] at [TIME] in [LOCATION]"</p>
              <Textarea
                placeholder={`e.g., "I will meditate for 5 minutes at 7 AM in my living room"`}
                className="h-24"
                value={data.answers["intention_1"] ?? ""}
                onChange={(e) => setAnswer("intention_1", e.target.value)}
              />
              <Textarea
                placeholder="Add another intention..."
                className="h-24"
                value={data.answers["intention_2"] ?? ""}
                onChange={(e) => setAnswer("intention_2", e.target.value)}
              />
              <p className="text-xs text-success flex items-center gap-1">
                <Check className="h-3 w-3" />{savedLabel}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="challenge">
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-ink-1">30-Day Habit Challenge</h3>
                <div className="flex items-center gap-1 text-warning">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold font-mono">{data.challengeDays.length}</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const isDone = data.challengeDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                        isDone ? "bg-success text-white" : "bg-surface-2 text-ink-3 hover:bg-surface-3"
                      }`}
                    >
                      {isDone ? <Check className="h-3 w-3" /> : day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-background border border-border rounded-xl p-6 mt-4">
              <h3 className="font-semibold text-ink-1 mb-4">Did you review today?</h3>
              <div className="space-y-3">
                {["Notes written", "Discussed with someone", "Applied in real life", "Re-read key section"].map((item) => (
                  <label key={item} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={!!(data.answers[`review_${item}`])}
                      onCheckedChange={(v) => setAnswer(`review_${item}`, v ? "1" : "")}
                    />
                    <span className="text-sm text-ink-2">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
