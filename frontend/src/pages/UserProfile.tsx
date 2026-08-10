import { BookOpen, Flame, Trophy, Star, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamificationService";
import { userService } from "@/services/userService";
import type { HistoryItem } from "@/types";

const PLAN_COLORS: Record<string, string> = {
  FREE:     "bg-surface-2 text-ink-3",
  STARTER:  "bg-blue-100 text-blue-700",
  PREMIUM:  "bg-warning-light text-amber-700",
  PRO:      "bg-primary-light text-primary",
}

function SkeletonCard() {
  return (
    <div className="bg-background border border-border rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-surface-3 rounded w-3/4 mb-2" />
      <div className="h-3 bg-surface-3 rounded w-1/2" />
    </div>
  )
}

export default function UserProfile() {
  const { user } = useAuth()
  const userId = user?.id as number

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["gamification", "stats", userId],
    queryFn: () => gamificationService.getStats(userId),
    enabled: !!userId,
    staleTime: 60_000,
  })

  const {
    data: historyPage,
    isLoading: historyLoading,
    isError: historyError,
  } = useQuery({
    queryKey: ["user", "history"],
    queryFn: () => userService.getHistory().then((r) => r.data),
    enabled: !!userId,
    staleTime: 60_000,
  })

  const historyItems: HistoryItem[] = (historyPage as { content?: HistoryItem[] } | undefined)?.content ?? []
  const recentBooks = historyItems.slice(0, 5)
  const earnedBadges = stats?.badges ?? []
  const initials = (user?.name ?? "?").charAt(0).toUpperCase()
  const planLabel = (user?.plan ?? "FREE").toUpperCase()

  const isLoading = statsLoading || historyLoading
  const hasError  = statsError && historyError

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">

        {/* ── Hero banner ──────────────────────────────────────── */}
        <div className="bg-gradient-hero rounded-2xl p-8 text-white text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 mx-auto flex items-center justify-center text-3xl font-bold mb-3">
            {initials}
          </div>
          <h1 className="font-display text-2xl font-bold">{user?.name ?? "Reader"}</h1>
          <p className="text-white/70 text-sm mb-3">{user?.email}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${PLAN_COLORS[planLabel] ?? PLAN_COLORS.FREE}`}>
            {planLabel}
          </span>

          <div className="flex justify-center gap-6 text-sm mt-4">
            <div className="text-center">
              <p className="font-bold text-lg">{statsLoading ? "—" : (stats?.totalPoints ?? 0).toLocaleString()}</p>
              <p className="text-white/70 text-xs">XP</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{statsLoading ? "—" : stats?.streakDays ?? 0}</p>
              <p className="text-white/70 text-xs">Streak</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{statsLoading ? "—" : earnedBadges.length}</p>
              <p className="text-white/70 text-xs">Badges</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{historyLoading ? "—" : historyPage?.totalElements ?? 0}</p>
              <p className="text-white/70 text-xs">Books</p>
            </div>
          </div>
        </div>

        {/* ── Error state ───────────────────────────────────────── */}
        {hasError && (
          <div className="bg-danger-light border border-danger/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-danger mb-3">Could not load your profile data.</p>
            <Button size="sm" variant="outline" onClick={() => refetchStats()} className="gap-1">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <Tabs defaultValue="reading">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="reading">Reading History</TabsTrigger>
            <TabsTrigger value="badges">Badges ({earnedBadges.length})</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          {/* Reading history tab */}
          <TabsContent value="reading" className="space-y-3">
            {historyLoading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : recentBooks.length === 0
              ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-ink-4 mx-auto mb-3" />
                  <p className="font-medium text-ink-1">No reading history yet</p>
                  <p className="text-sm text-ink-3 mt-1">Start reading to see your journey here</p>
                  <Button size="sm" className="mt-4" onClick={() => window.location.href = "/books"}>
                    Browse Books
                  </Button>
                </div>
              )
              : recentBooks.map((item: HistoryItem) => (
                <div key={item.bookId} className="bg-background border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                      <p className="text-sm font-medium text-ink-1 truncate">
                        {item.title ?? `Book ${item.bookId}`}
                      </p>
                    </div>
                    <span className="text-xs text-ink-3 flex-shrink-0 ml-2">
                      {item.progressPercent}%
                    </span>
                  </div>
                  <Progress value={item.progressPercent} className="h-1.5" />
                  <p className="text-xs text-ink-4 mt-1">
                    {item.lastReadAt
                      ? new Date(item.lastReadAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                      : "—"}
                  </p>
                </div>
              ))
            }
          </TabsContent>

          {/* Badges tab */}
          <TabsContent value="badges">
            {statsLoading
              ? (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-xl p-4 animate-pulse">
                      <div className="h-8 w-8 bg-surface-3 rounded-full mx-auto mb-2" />
                      <div className="h-3 bg-surface-3 rounded w-3/4 mx-auto" />
                    </div>
                  ))}
                </div>
              )
              : earnedBadges.length === 0
              ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-ink-4 mx-auto mb-3" />
                  <p className="font-medium text-ink-1">No badges yet</p>
                  <p className="text-sm text-ink-3 mt-1">Complete books and build streaks to earn badges</p>
                </div>
              )
              : (
                <div className="grid grid-cols-3 gap-3">
                  {earnedBadges.map((b) => (
                    <div key={b.name} className="border border-warning bg-warning-light rounded-xl p-4 text-center shadow-sm">
                      <Trophy className="h-6 w-6 text-warning mx-auto mb-1" />
                      <p className="text-xs font-semibold text-ink-1 mt-1 capitalize">
                        {b.name.replace(/_/g, " ").toLowerCase()}
                      </p>
                      {b.unlockedAt && (
                        <p className="text-[10px] text-ink-3 mt-0.5">
                          {new Date(b.unlockedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
            }
          </TabsContent>

          {/* Stats tab */}
          <TabsContent value="stats">
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Total XP",       value: (stats?.totalPoints ?? 0).toLocaleString(), icon: Star,    color: "text-warning" },
                    { label: "Current Streak", value: `${stats?.streakDays ?? 0} days`,           icon: Flame,   color: "text-danger" },
                    { label: "Knowledge Level",value: `Level ${stats?.userLevel ?? 1}`,            icon: Trophy,  color: "text-primary" },
                    { label: "Weekly XP",      value: (stats?.weeklyPoints ?? 0).toLocaleString(), icon: BookOpen,color: "text-success" },
                  ].map((s) => (
                    <div key={s.label} className="bg-background border border-border rounded-xl p-4">
                      <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                      <p className="text-2xl font-display font-bold text-ink-1">{s.value}</p>
                      <p className="text-xs text-ink-3">{s.label}</p>
                    </div>
                  ))}
                </div>
              )
            }
            {stats?.weeklyRank && (
              <p className="text-center text-xs text-ink-3 mt-4">
                Weekly leaderboard rank: <strong className="text-primary">#{stats.weeklyRank}</strong>
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
