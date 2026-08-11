import { Lock, Trophy, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamificationService";

interface BadgeDef {
  id: string       // matches Badge.BadgeType enum name exactly
  label: string
  icon: string
  desc: string
  category: string
}

const ALL_BADGES: BadgeDef[] = [
  // Reading
  { id: "FIRST_READ",    label: "First Read",       icon: "📖", desc: "Complete your first book",       category: "Reading" },
  { id: "BOOKWORM_5",    label: "Bookworm",          icon: "🐛", desc: "Read 5 books",                   category: "Reading" },
  { id: "BOOKWORM_10",   label: "Bibliophile",       icon: "📚", desc: "Read 10 books",                  category: "Reading" },
  { id: "BOOKWORM_25",   label: "Avid Reader",       icon: "🎓", desc: "Read 25 books",                  category: "Reading" },
  { id: "BOOKWORM_50",   label: "Knowledge Seeker",  icon: "🏆", desc: "Read 50 books",                  category: "Reading" },
  // Consistency
  { id: "STREAK_3",      label: "3-Day Streak",      icon: "⚡", desc: "Read 3 days in a row",           category: "Consistency" },
  { id: "STREAK_7",      label: "7-Day Streak",      icon: "🔥", desc: "Read 7 days in a row",           category: "Consistency" },
  { id: "STREAK_30",     label: "30-Day Streak",     icon: "💪", desc: "Read 30 days in a row",          category: "Consistency" },
  // Points
  { id: "POINTS_100",    label: "Rising Star",       icon: "⭐", desc: "Earn 100 XP",                   category: "Points" },
  { id: "POINTS_500",    label: "XP Hunter",         icon: "🌟", desc: "Earn 500 XP",                   category: "Points" },
  { id: "POINTS_1000",   label: "XP Master",         icon: "💎", desc: "Earn 1,000 XP",                 category: "Points" },
  // Special
  { id: "PREMIUM_MEMBER",label: "Premium Member",    icon: "👑", desc: "Upgrade to a paid plan",        category: "Special" },
  { id: "EARLY_ADOPTER", label: "Early Adopter",     icon: "🚀", desc: "Among GrowVio's first readers", category: "Special" },
]

const CATEGORIES = ["Reading", "Consistency", "Points", "Special"]

function SkeletonBadge() {
  return (
    <div className="border border-border rounded-xl p-4 text-center animate-pulse">
      <div className="h-8 w-8 bg-surface-3 rounded-full mx-auto mb-2" />
      <div className="h-3 bg-surface-3 rounded w-3/4 mx-auto mb-1" />
      <div className="h-2 bg-surface-3 rounded w-1/2 mx-auto" />
    </div>
  )
}

export default function BadgeCollection() {
  const { user } = useAuth()
  const userId = user?.id as number

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["gamification", "stats", userId],
    queryFn: () => gamificationService.getStats(userId),
    enabled: !!userId,
    staleTime: 60_000,
  })

  // Build a Set of earned badge IDs for O(1) lookup
  const earnedSet = new Set((stats?.badges ?? []).map((b) => b.name))
  const earnedCount = earnedSet.size

  // Find earnedAt date for a badge
  const getEarnedAt = (badgeId: string) => {
    const b = (stats?.badges ?? []).find((x) => x.name === badgeId)
    if (!b?.unlockedAt) return null
    return new Date(b.unlockedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-1">Your Achievements</h1>
            <p className="text-sm text-ink-3">
              {isLoading ? "Loading…" : `${earnedCount} earned of ${ALL_BADGES.length}`}
            </p>
          </div>
          <Trophy className="h-8 w-8 text-warning" />
        </div>

        {/* Error state */}
        {isError && (
          <div className="bg-danger-light border border-danger/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-danger mb-3">Could not load your badges.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        )}

        {/* Next badge hint */}
        {!isLoading && !isError && earnedCount < ALL_BADGES.length && (() => {
          const next = ALL_BADGES.find((b) => !earnedSet.has(b.id))
          return next ? (
            <div className="bg-info-light border border-info/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-info font-medium">
                Next badge: <strong>{next.label}</strong> — {next.desc}
              </p>
            </div>
          ) : null
        })()}

        {/* Badge grid by category */}
        {CATEGORIES.map((cat) => {
          const catBadges = ALL_BADGES.filter((b) => b.category === cat)
          return (
            <div key={cat} className="mb-8">
              <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">{cat}</h3>
              <div className="grid grid-cols-3 gap-3">
                {isLoading
                  ? catBadges.map((_, i) => <SkeletonBadge key={i} />)
                  : catBadges.map((b) => {
                      const earned = earnedSet.has(b.id)
                      const earnedDate = getEarnedAt(b.id)
                      return (
                        <div
                          key={b.id}
                          className={`border rounded-xl p-4 text-center transition-all ${
                            earned
                              ? "border-warning bg-warning-light shadow-sm"
                              : "border-border bg-background opacity-60"
                          }`}
                        >
                          <span className={`text-3xl ${!earned ? "grayscale" : ""}`}>{b.icon}</span>
                          {!earned && <Lock className="h-3 w-3 text-ink-4 mx-auto mt-1" />}
                          <p className="text-xs font-semibold text-ink-1 mt-2 leading-tight">{b.label}</p>
                          <p className="text-[10px] text-ink-3 mt-0.5 leading-tight">
                            {earned && earnedDate ? earnedDate : b.desc}
                          </p>
                        </div>
                      )
                    })
                }
              </div>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
