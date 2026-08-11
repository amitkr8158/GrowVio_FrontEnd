import { Crown, Trophy, BookOpen, RefreshCw, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/AppShell";
import { gamificationService, type LeaderboardEntry } from "@/services/gamificationService";
import { useAuth } from "@/context/AuthContext";

function SkeletonRow() {
  return (
    <div className="bg-background border border-border rounded-xl p-4 flex items-center gap-3 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-surface-3 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-surface-3 rounded w-1/3 mb-2" />
        <div className="h-2 bg-surface-3 rounded w-1/4" />
      </div>
      <div className="h-4 w-12 bg-surface-3 rounded" />
    </div>
  )
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" }

export default function Community() {
  const { user } = useAuth()

  const {
    data: leaders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["leaderboard", "weekly", 10],
    queryFn: () => gamificationService.getLeaderboard(10),
    staleTime: 60_000,
  })

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-2xl font-bold text-ink-1">Community</h1>
          <Users className="h-6 w-6 text-ink-3" />
        </div>
        <p className="text-sm text-ink-3 mb-6">This week's top readers on GrowVio</p>

        {/* ── Error state ───────────────────────────────────────── */}
        {isError && (
          <div className="bg-danger-light border border-danger/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-danger mb-3">Could not load community data.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        )}

        {/* ── Top Readers section ───────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-semibold text-ink-2 uppercase tracking-wide">Weekly Top Readers</h2>
          </div>

          <div className="space-y-2">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : (leaders as LeaderboardEntry[]).length === 0
              ? (
                <div className="text-center py-12 bg-background border border-border rounded-xl">
                  <BookOpen className="h-12 w-12 text-ink-4 mx-auto mb-3" />
                  <p className="font-medium text-ink-1">Be the first to appear here!</p>
                  <p className="text-sm text-ink-3 mt-1">Complete a book to join the leaderboard</p>
                  <Button size="sm" className="mt-4" onClick={() => window.location.href = "/books"}>
                    Start Reading
                  </Button>
                </div>
              )
              : (leaders as LeaderboardEntry[]).map((entry) => {
                  const isMe = entry.name === user?.name
                  return (
                    <div
                      key={entry.rank}
                      className={`border rounded-xl p-4 flex items-center gap-3 transition-all ${
                        isMe
                          ? "border-primary bg-primary-light"
                          : "bg-background border-border"
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 text-center">
                        {MEDAL[entry.rank]
                          ? <span className="text-xl">{MEDAL[entry.rank]}</span>
                          : <span className="text-sm font-bold text-ink-3">#{entry.rank}</span>
                        }
                      </div>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isMe ? "bg-primary text-white" : "bg-surface-2 text-ink-2"
                      }`}>
                        {(entry.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-1 truncate">
                          {entry.name}
                          {isMe && <span className="ml-1 text-[10px] text-primary font-normal">(you)</span>}
                        </p>
                        <p className="text-xs text-ink-3">
                          {entry.books} {entry.books === 1 ? "book" : "books"} · {entry.xp?.toLocaleString()} XP
                        </p>
                      </div>
                      {entry.rank <= 3 && (
                        <Crown className="h-4 w-4 text-warning flex-shrink-0" />
                      )}
                    </div>
                  )
                })
            }
          </div>
        </div>

        {/* ── Community growing CTA ─────────────────────────────── */}
        {!isLoading && !isError && (
          <div className="bg-primary-light border border-primary/20 rounded-xl p-5 text-center">
            <p className="text-sm font-semibold text-primary mb-1">Community is growing 🌱</p>
            <p className="text-xs text-ink-3 mb-3">
              Read books, earn XP, and appear on the weekly leaderboard.
              A full activity feed is coming soon.
            </p>
            <Button size="sm" onClick={() => window.location.href = "/leaderboard"}>
              See Full Leaderboard
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
