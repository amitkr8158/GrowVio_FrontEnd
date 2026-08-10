import apiClient from './apiClient'

export interface BadgeInfo {
  name: string          // enum name e.g. "FIRST_READ", "STREAK_7"
  iconUrl: string | null
  unlockedAt: string | null
}

export interface UserStats {
  // Real backend fields (UserStatsResponse)
  userId?: number
  totalPoints?: number
  weeklyPoints?: number
  streakDays?: number
  badges?: BadgeInfo[]
  userLevel?: number
  nextLevelXP?: number
  weeklyXP?: number
  weeklyRank?: number
  // Legacy aliases kept so Dashboard fallbacks still compile
  currentStreak?: number
  weeklyGoalProgress?: number
  level?: number
  totalXP?: number
}

export interface LeaderboardEntry {
  rank: number
  name: string
  xp: number
  books: number
  trend?: 'up' | 'down' | 'same'
}

export const gamificationService = {
  getStats: (userId: number) =>
    apiClient.get<UserStats>(`/api/gamification/stats/${userId}`).then(r => r.data),

  getLeaderboard: (limitOrType: number | string = 10, limit = 10) => {
    const isType = typeof limitOrType === 'string'
    const type   = isType ? limitOrType.toLowerCase().replace('_', '-') : 'weekly'
    const size   = isType ? limit : (limitOrType as number)
    return apiClient
      .get<LeaderboardEntry[]>('/api/gamification/leaderboard', { params: { limit: size, type } })
      .then(r => r.data)
  },
}
