import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Flame, TrendingUp, Quote } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { bookService, type Book } from "@/services/bookService";
import { gamificationService } from "@/services/gamificationService";
import { toast } from "sonner";

const DAILY_QUOTES = [
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear, Atomic Habits" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Not all readers are leaders, but all leaders are readers.", author: "Harry S. Truman" },
  { text: "A reader lives a thousand lives before he dies.", author: "George R.R. Martin" },
];

const todayQuote = DAILY_QUOTES[new Date().getDay() % DAILY_QUOTES.length];

const bookUrl = (book: Book): string => `/books/${book.slug || book.id}`;

const Dashboard = () => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: stats } = useQuery({
    queryKey: ["gamification", "stats", user?.id],
    queryFn: () => gamificationService.getStats(user?.id as number).then((r) => r.data),
    enabled: !!user?.id,
    meta: { onError: () => toast.error("Failed to load stats") },
  });

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ["books", "popular"],
    queryFn: () => bookService.getPopular().then((r) => r.data),
    meta: { onError: () => toast.error("Failed to load books") },
  });

  const trending = Array.isArray(books) ? books.slice(0, 5) : [];
  const newBooks = Array.isArray(books) ? books.slice(5, 9) : [];

  const streak = stats?.streakDays ?? stats?.currentStreak ?? 0;
  const weeklyXP = stats?.weeklyXP ?? [0, 0, 0, 0, 0, 0, 0];
  const goalProgress = stats?.weeklyGoalProgress ?? 0;
  const maxXP = Math.max(...weeklyXP, 1);

  return (
    <AppShell>
      {/* Greeting */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-1">
            {greeting}, {user?.name?.split(" ")[0] || "Reader"}! {"👋"}
          </h1>
          <p className="text-sm text-ink-3">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-warning-light px-3 py-1.5 rounded-full">
            <Flame className="h-4 w-4 text-warning" />
            <span className="text-sm font-bold text-warning font-mono">{streak}</span>
          </div>
          {/* Goal ring */}
          <div className="relative h-16 w-16">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--surface-3))" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.5" fill="none"
                stroke="hsl(var(--color-primary))" strokeWidth="3"
                strokeDasharray="97.4"
                strokeDashoffset={97.4 - (97.4 * Math.min(goalProgress, 100)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink-1">
              {goalProgress}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />Trending in India
            </h2>
          </div>
          {booksLoading ? (
            <div className="bg-background border border-border rounded-xl divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="w-8 h-8 rounded-full bg-surface-3 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-surface-3 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-surface-3 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-background border border-border rounded-xl divide-y divide-border">
              {trending.map((book, i) => (
                <Link
                  key={book.id}
                  to={bookUrl(book)}
                  className="flex items-center gap-4 p-4 hover:bg-surface-2 transition-colors"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    i < 3 ? "bg-primary text-primary-foreground" : "bg-surface-3 text-ink-3"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="w-10 h-13 rounded overflow-hidden flex-shrink-0">
                    {book.coverImageUrl ? (
                      <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{book.title?.[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-ink-1">{book.title}</p>
                    <p className="text-xs text-ink-3">{book.author}</p>
                  </div>
                  <span className="text-xs text-ink-3 flex-shrink-0">
                    {(book.readCount ?? book.totalReads ?? 0).toLocaleString()} reads
                  </span>
                </Link>
              ))}
              {trending.length === 0 && (
                <div className="p-8 text-center text-sm text-ink-3">
                  No books available yet. <Link to="/books" className="text-primary hover:underline">Browse library</Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right column */}
        <div className="space-y-6">
          {/* Weekly XP */}
          <div className="bg-background border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-ink-1 mb-3">Weekly XP</h3>
            {weeklyXP.every((v: number) => v === 0) ? (
              <div className="h-20 flex items-center justify-center text-xs text-ink-3">
                Start reading to earn XP!
              </div>
            ) : (
              <div className="flex items-end gap-1 h-20">
                {weeklyXP.map((xp: number, i: number) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary rounded-t transition-all"
                    style={{ height: `${(xp / maxXP) * 100}%`, minHeight: xp > 0 ? "4px" : "0" }}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-between text-[10px] text-ink-3 mt-1">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          {/* Daily Quote */}
          <div className="bg-gradient-card border border-border rounded-xl p-4">
            <Quote className="h-5 w-5 text-primary mb-2" />
            <p className="text-sm italic text-ink-2 mb-2">"{todayQuote.text}"</p>
            <p className="text-xs text-ink-3">— {todayQuote.author}</p>
          </div>
        </div>
      </div>

      {/* New This Week */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink-1">New This Week</h2>
          <Link to="/books" className="text-sm text-primary hover:underline">See all</Link>
        </div>
        {booksLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-36 bg-surface-3 rounded-xl animate-pulse" />
                <div className="mt-2 h-4 w-full bg-surface-3 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : newBooks.length === 0 ? (
          <div className="bg-background border border-border rounded-xl p-8 text-center text-sm text-ink-3">
            No new books this week. <Link to="/books" className="text-primary hover:underline">Browse our full library</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newBooks.map((book) => (
              <Link key={book.id} to={bookUrl(book)}>
                <motion.div whileHover={{ y: -2 }} className="bg-background border border-border rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-36 overflow-hidden">
                    {book.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-card flex flex-col items-center justify-center gap-1">
                        <span className="text-3xl font-display font-bold text-primary">
                          {book.title?.[0] || "?"}
                        </span>
                        <BookOpen className="h-5 w-5 text-ink-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-semibold text-warning bg-warning-light px-2 py-0.5 rounded-full">NEW</span>
                    <h3 className="font-display text-sm font-semibold text-ink-1 mt-2 line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-ink-3">{book.author}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
};

export default Dashboard;
