import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Lock, ChevronLeft, Moon, Sun, Minus, Plus, Share2, Zap, Layers, Image, BookMarked, Target, CheckSquare, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { bookService } from "@/services/bookService";

const PLAN_RANK: Record<string, number> = { FREE: 0, STARTER: 1, PREMIUM: 2, PRO: 3 };

const LEVELS = [
  { id: 1, name: "Snapshot",         emoji: "📸", icon: Zap,         words: 150,   requiredPlan: "FREE",    color: "bg-success" },
  { id: 2, name: "Flashdeck",        emoji: "🃏", icon: Layers,      words: 500,   requiredPlan: "FREE",    color: "bg-success" },
  { id: 3, name: "Infosummary",      emoji: "🖼️", icon: Image,       words: 1200,  requiredPlan: "STARTER", color: "bg-info" },
  { id: 4, name: "Deep Read",        emoji: "📖", icon: BookMarked,  words: 3000,  requiredPlan: "STARTER", color: "bg-info" },
  { id: 5, name: "Mastery Quiz",     emoji: "🎯", icon: Target,      words: 5000,  requiredPlan: "STARTER", color: "bg-primary" },
  { id: 6, name: "Action Plan",      emoji: "📋", icon: CheckSquare, words: 8000,  requiredPlan: "STARTER", color: "bg-primary" },
  { id: 7, name: "Revision Booklet", emoji: "🔖", icon: Bookmark,    words: 15000, requiredPlan: "STARTER", color: "bg-primary" },
];

const readingTime = (words: number): string => {
  const mins = Math.ceil(words / 200);
  if (mins < 60) return `${mins} min read`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min read` : `${h}h read`;
};

const BookReading = () => {
  const { id, levelNum } = useParams();
  const navigate = useNavigate();
  const currentLevel = parseInt(levelNum || "1");
  const { user } = useAuth();
  const userPlan = user?.plan ?? "FREE";
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: () => bookService.getById(id!).then((r) => r.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const canAccess = (level: number) => {
    const levelConfig = LEVELS.find((l) => l.id === level);
    if (!levelConfig) return false;
    return (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[levelConfig.requiredPlan] ?? 99);
  };

  const accessible = canAccess(currentLevel);

  const { data: levelData, isLoading: levelLoading } = useQuery({
    queryKey: ["book-level", id, currentLevel],
    queryFn: () => bookService.getLevel(id!, currentLevel).then((r) => r.data),
    enabled: !!id && accessible,
    staleTime: 5 * 60 * 1000,
  });

  const content = levelData?.data?.content;
  const currentLevelConfig = LEVELS[currentLevel - 1];
  // For now, every level's mock content ships a pre-built PDF (see mocked-data/Book)
  // — show that directly instead of the structured JSON underneath it.
  const pdfUrl: string | null = (typeof content === "object" && content?.pdfUrl) || null;

  if (isLoading || levelLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-[680px] space-y-4 p-8">
          <div className="h-8 w-64 bg-surface-3 rounded animate-pulse" />
          <div className="h-4 w-full bg-surface-3 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-surface-3 rounded animate-pulse" />
          <div className="h-4 w-full bg-surface-3 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-surface-3 rounded animate-pulse" />
          <div className="h-4 w-full bg-surface-3 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-surface-3 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!accessible) {
    return (
      <div className="min-h-screen bg-surface-2 flex items-center justify-center p-6">
        <div className="bg-background border border-border rounded-2xl p-8 text-center max-w-sm">
          <Lock className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-ink-1 mb-2">Level {currentLevel} Locked</h2>
          <p className="text-sm text-ink-3 mb-6">Upgrade your plan to access this level.</p>
          <Button className="w-full shadow-glow" asChild>
            <Link to="/plans">View Plans &rarr;</Link>
          </Button>
          <Button variant="ghost" className="w-full mt-2" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#0F172A] text-[#E2E8F0]" : "bg-background text-ink-2"}`}>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-surface-3">
        <motion.div className="h-full bg-primary" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Header */}
      <header className={`fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 ${darkMode ? "bg-[#0F172A]/95" : "bg-background/95"} backdrop-blur-xl border-b ${darkMode ? "border-[#334155]" : "border-border"}`}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/books/${id}`}><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold truncate max-w-[200px]">{book?.title}</p>
            <p className="text-xs text-ink-3">{currentLevelConfig?.emoji} {currentLevelConfig?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setFontSize(Math.max(14, fontSize - 1))}><Minus className="h-4 w-4" /></Button>
          <span className="text-xs font-mono w-8 text-center">{fontSize}</span>
          <Button variant="ghost" size="icon" onClick={() => setFontSize(Math.min(22, fontSize + 1))}><Plus className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Level Navigator - Desktop */}
        <aside className={`hidden lg:block fixed left-0 top-16 bottom-0 w-60 border-r ${darkMode ? "border-[#334155] bg-[#0F172A]" : "border-border bg-background"} p-4 overflow-y-auto`}>
          <h3 className="text-xs font-semibold uppercase text-ink-3 mb-4">Knowledge Pyramid</h3>
          <div className="space-y-1">
            {LEVELS.map((level) => {
              const isCurrent = level.id === currentLevel;
              const isLocked = !canAccess(level.id);
              return (
                <Link
                  key={level.id}
                  to={isLocked ? "#" : `/books/${id}/level/${level.id}`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    isCurrent ? "bg-primary-light text-primary font-medium" :
                    isLocked ? "text-ink-4 cursor-not-allowed" :
                    "text-ink-3 hover:bg-surface-2"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${level.color} ${isLocked ? "opacity-30" : ""}`}>
                    {isLocked ? <Lock className="h-3 w-3 text-white" /> :
                     <span className="text-xs text-white font-bold">{level.id}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium">{level.emoji} {level.name}</p>
                    <p className="text-[10px] text-ink-4">◷ {readingTime(level.words)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 lg:ml-60">
          <article className="max-w-[680px] mx-auto px-4 py-8" style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
            {/* Book header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
              <div className="w-12 h-16 rounded-lg bg-gradient-hero flex items-center justify-center flex-shrink-0 overflow-hidden">
                {book?.coverImageUrl ? (
                  <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">{book?.title}</h1>
                <div className="flex items-center gap-2 text-xs text-ink-3 mt-1">
                  <span className="bg-success-light text-success px-2 py-0.5 rounded-full font-medium">
                    {currentLevelConfig?.emoji} {currentLevelConfig?.name}
                  </span>
                  <span>◷ {readingTime(currentLevelConfig?.words ?? 0)}</span>
                </div>
              </div>
            </div>

            {/* Rendered content */}
            <div className="prose prose-lg max-w-none">
              {pdfUrl ? (
                <div className="not-prose space-y-3">
                  <iframe
                    src={pdfUrl}
                    title={`${currentLevelConfig?.name} PDF`}
                    className={`w-full h-[80vh] rounded-xl border ${darkMode ? "border-[#334155]" : "border-border"}`}
                  />
                  <div className="text-center">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Open PDF in a new tab &rarr;
                    </a>
                  </div>
                </div>
              ) : typeof content === "string" ? (
                content.split("\n\n").map((block: string, i: number) => {
                  if (block.startsWith("## ")) return <h2 key={i} className="font-display text-2xl font-bold text-ink-1 mt-8 mb-4">{block.replace("## ", "")}</h2>;
                  if (block.startsWith("### ")) return <h3 key={i} className="font-display text-lg font-bold text-ink-1 mt-6 mb-3">{block.replace("### ", "")}</h3>;
                  if (block.startsWith("> ")) return (
                    <blockquote key={i} className="border-l-4 border-primary bg-primary-light/50 rounded-r-lg px-4 py-3 my-4 italic text-ink-2">{block.replace("> ", "")}</blockquote>
                  );
                  return <p key={i} className="mb-4 text-ink-2">{block}</p>;
                })
              ) : (
                /* Engaging empty state */
                <div className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4 bg-primary-light border border-primary/20 rounded-2xl p-8 max-w-sm">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-5xl"
                    >
                      🤖
                    </motion.div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink-1 mb-2">
                        AI is crafting your {currentLevelConfig?.name}...
                      </h3>
                      <p className="text-sm text-ink-3">
                        Great knowledge takes a moment to distill. Come back soon!
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/books">Explore other books</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Level completion */}
            {(pdfUrl || typeof content === "string") && (
              <div className="mt-12 pt-8 border-t border-border text-center">
                <div className="bg-gradient-card border border-border rounded-2xl p-8 inline-block">
                  <p className="text-sm text-ink-3 mb-2">You've reached the end of {currentLevelConfig?.name}</p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-3xl font-display font-bold text-primary">+150 XP</span>
                  </div>
                  <Button className="h-12 px-8 text-base shadow-glow mb-3" disabled>
                    Mark Complete ✓
                  </Button>
                  <br />
                  {currentLevel < 7 && canAccess(currentLevel + 1) && (
                    <Button variant="ghost" className="text-sm" asChild>
                      <Link to={`/books/${id}/level/${currentLevel + 1}`}>
                        Next: {LEVELS[currentLevel]?.emoji} {LEVELS[currentLevel]?.name} &rarr;
                      </Link>
                    </Button>
                  )}
                  {currentLevel < 7 && !canAccess(currentLevel + 1) && (
                    <Button variant="ghost" className="text-sm" asChild>
                      <Link to="/plans">Upgrade to unlock next level &rarr;</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </article>
        </main>
      </div>

      {/* Mobile level tabs */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40">
        <div className={`flex items-center gap-2 px-4 py-3 overflow-x-auto ${darkMode ? "bg-[#1E293B] border-t border-[#334155]" : "bg-background border-t border-border"}`}>
          {LEVELS.map((level) => {
            const isCurrent = level.id === currentLevel;
            const isLocked = !canAccess(level.id);
            return (
              <Link
                key={level.id}
                to={isLocked ? "#" : `/books/${id}/level/${level.id}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isCurrent ? "bg-primary text-primary-foreground" :
                  isLocked ? "bg-surface-3 text-ink-4" :
                  "bg-surface-2 text-ink-3"
                }`}
              >
                {isLocked ? <Lock className="h-3 w-3" /> : <span>{level.emoji}</span>}
                {level.name.split(" ")[0]}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookReading;
