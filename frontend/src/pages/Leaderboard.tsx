import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Crown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { toast } from "sonner";
import { gamificationService, type LeaderboardEntry } from "@/services/gamificationService";
import { useAuth } from "@/context/AuthContext";

type Period = "WEEKLY" | "MONTHLY" | "ALL_TIME";

const Leaderboard = () => {
  const [period, setPeriod] = useState<Period>("WEEKLY");
  const { user } = useAuth();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => gamificationService.getLeaderboard(period, 50).then((r) => r.data),
    meta: { onError: () => toast.error("Failed to load leaderboard") },
  });

  const topThree: LeaderboardEntry[] = entries.length >= 3
    ? [entries[1], entries[0], entries[2]] // podium order: 2nd, 1st, 3rd
    : entries.slice(0, 3);
  const rest = entries.slice(3);

  // Find current user's rank
  const myEntry = entries.find((e) => e.name === user?.name);
  const myRank = myEntry?.rank ?? entries.length + 1;
  const myXP = myEntry?.xp ?? 0;

  const periodLabels: Record<Period, string> = {
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    ALL_TIME: "All-Time",
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-ink-1 mb-1">
          {period === "WEEKLY" ? "This Week's" : period === "MONTHLY" ? "This Month's" : "All-Time"} Top Readers
        </h1>
        <p className="text-sm text-ink-3 mb-6">
          {period === "WEEKLY" ? "Resets Monday 00:00 IST" : period === "MONTHLY" ? "Resets 1st of each month" : "Since launch"}
        </p>

        <div className="flex gap-2 mb-6">
          {(["WEEKLY", "MONTHLY", "ALL_TIME"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                period === p ? "bg-primary text-primary-foreground" : "bg-surface-2 text-ink-3 hover:bg-surface-3"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {/* Podium skeleton */}
            <div className="flex items-end justify-center gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-surface-3 animate-pulse" />
                  <div className="h-4 w-16 mx-auto bg-surface-3 rounded animate-pulse" />
                </div>
              ))}
            </div>
            {/* List skeleton */}
            <div className="bg-background border border-border rounded-xl divide-y divide-border">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-8 h-4 bg-surface-3 rounded animate-pulse" />
                  <div className="w-8 h-8 rounded-full bg-surface-3 animate-pulse" />
                  <div className="flex-1 h-4 bg-surface-3 rounded animate-pulse" />
                  <div className="w-16 h-4 bg-surface-3 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Podium */}
            {topThree.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-8">
                {topThree.map((u) => (
                  <motion.div
                    key={u.rank}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: u.rank * 0.1 }}
                    className={`text-center ${u.rank === 1 ? "order-2" : u.rank === 2 ? "order-1" : "order-3"}`}
                  >
                    <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl ${
                      u.rank === 1 ? "bg-warning/20 ring-2 ring-warning" : "bg-surface-2"
                    }`}>
                      {u.rank === 1 && <Crown className="h-6 w-6 text-warning" />}
                      {u.rank !== 1 && <span className="font-bold text-ink-3">#{u.rank}</span>}
                    </div>
                    <p className="text-sm font-semibold text-ink-1">{u.name}</p>
                    <p className="text-xs text-primary font-mono">{u.xp.toLocaleString()} XP</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List */}
            {rest.length > 0 && (
              <div className="bg-background border border-border rounded-xl divide-y divide-border">
                {rest.map((u) => (
                  <div key={u.rank} className="flex items-center gap-3 p-3">
                    <span className="w-8 text-sm font-bold text-ink-3 text-center">{u.rank}</span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {u.name?.[0] || "?"}
                    </div>
                    <span className="flex-1 text-sm font-medium text-ink-1">{u.name}</span>
                    <span className="text-xs font-mono text-primary">{u.xp.toLocaleString()}</span>
                    {u.trend === "up" ? <TrendingUp className="h-4 w-4 text-success" /> :
                     u.trend === "down" ? <TrendingDown className="h-4 w-4 text-danger" /> :
                     <Minus className="h-4 w-4 text-ink-4" />}
                  </div>
                ))}
              </div>
            )}

            {/* My rank */}
            <div className="mt-4 bg-primary-light border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              <span className="text-sm font-bold text-primary">#{myRank}</span>
              <span className="text-sm text-ink-1 flex-1">Your rank &middot; {myXP.toLocaleString()} XP this {period.toLowerCase().replace("_", " ")}</span>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default Leaderboard;
