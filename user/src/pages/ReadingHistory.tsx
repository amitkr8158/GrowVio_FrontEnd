import { Flame, BookOpen, Clock, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { gamificationService } from "@/services/gamificationService";
import type { HistoryItem } from "@/types";
import { formatDistanceToNow } from "date-fns";

function buildActivitySet(items: HistoryItem[]): Set<string> {
  const s = new Set<string>();
  items.forEach((item) => {
    if (item.lastReadAt) s.add(item.lastReadAt.slice(0, 10));
  });
  return s;
}

function SkeletonRow() {
  return (
    <div className="bg-background border border-border rounded-xl p-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-14 rounded-lg bg-surface-3 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-surface-3 rounded w-2/3" />
        <div className="h-3 bg-surface-3 rounded w-1/3" />
        <div className="h-2 bg-surface-3 rounded w-full" />
      </div>
    </div>
  );
}

export default function ReadingHistory() {
  const { user } = useAuth();
  const userId = user?.id as number;

  const { data: historyPage, isLoading: historyLoading } = useQuery({
    queryKey: ["user", "history"],
    queryFn: () => userService.getHistory().then((r) => r.data),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["gamification", "stats", userId],
    queryFn: () => gamificationService.getStats(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const items: HistoryItem[] =
    (historyPage as { content?: HistoryItem[] } | undefined)?.content ??
    (Array.isArray(historyPage) ? (historyPage as HistoryItem[]) : []);

  const totalBooks =
    (historyPage as { totalElements?: number } | undefined)?.totalElements ??
    items.length;

  const activitySet = buildActivitySet(items);

  // Build last 52 weeks of activity cells (today = bottom-right)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: boolean[] = Array.from({ length: 52 * 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (52 * 7 - 1 - i));
    return activitySet.has(d.toISOString().slice(0, 10));
  });

  const isLoading = historyLoading || statsLoading;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-ink-1">Reading History</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Books Read",      value: statsLoading ? "—" : totalBooks,                    icon: BookOpen, color: "text-primary" },
            { label: "Total XP",        value: statsLoading ? "—" : (stats?.totalPoints ?? 0).toLocaleString(), icon: Clock, color: "text-info" },
            { label: "Best Streak",     value: statsLoading ? "—" : `${stats?.streakDays ?? 0}d`,  icon: Trophy, color: "text-warning" },
            { label: "Current Streak",  value: statsLoading ? "—" : `${stats?.streakDays ?? 0}d`,  icon: Flame, color: "text-danger" },
          ].map((stat) => (
            <div key={stat.label} className="bg-background border border-border rounded-xl p-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-display font-bold text-ink-1">{stat.value}</p>
              <p className="text-xs text-ink-3">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Activity heatmap (built from real data) */}
        <div className="bg-background border border-border rounded-xl p-4 mb-8 overflow-x-auto">
          <h3 className="text-sm font-semibold text-ink-1 mb-3">Activity</h3>
          <div className="flex gap-[3px] min-w-[700px]">
            {Array.from({ length: 52 }, (_, week) => (
              <div key={week} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, day) => {
                  const active = cells[week * 7 + day];
                  return (
                    <div
                      key={day}
                      className={`w-3 h-3 rounded-sm ${active ? "bg-success" : "bg-surface-3"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Book History */}
        <h3 className="text-lg font-semibold text-ink-1 mb-4">Recently Read</h3>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-ink-4 mx-auto mb-3" />
            <p className="font-medium text-ink-1 mb-1">No reading history yet</p>
            <p className="text-sm text-ink-3 mb-4">Start with your first book!</p>
            <Button asChild size="sm"><Link to="/books">Browse Books</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.bookId} className="bg-background border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-14 rounded-lg bg-gradient-card flex items-center justify-center text-xl flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-ink-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-1 truncate">
                    {item.title ?? item.bookTitle ?? `Book ${item.bookId}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={item.progressPercent ?? 0} className="h-1 flex-1 max-w-[100px]" />
                    <span className="text-xs text-ink-3">{item.progressPercent ?? 0}%</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-ink-3">
                    {item.lastReadAt
                      ? formatDistanceToNow(new Date(item.lastReadAt), { addSuffix: true })
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
