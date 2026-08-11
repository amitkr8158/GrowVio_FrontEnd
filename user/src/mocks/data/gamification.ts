// AUTO-GENERATED mock fixture data for local development.
// Regenerate via scripts/gen-fixtures.mjs (see mocked-data/README.md).
// Passwords here are PLAINTEXT ON PURPOSE — this is mock/dev-only data, never real credentials.

export const MOCK_GAMIFICATION_STATS = {
  "1": {
    "userId": 1,
    "totalPoints": 500,
    "weeklyPoints": 0,
    "streakDays": 0,
    "badges": [
      {
        "name": "FIRST_READ",
        "iconUrl": "https://cdn.growvio.app/badges/first-read.svg",
        "unlockedAt": "2025-01-06T08:00:00Z"
      }
    ],
    "userLevel": 2,
    "nextLevelXP": 1000,
    "weeklyXP": 0,
    "weeklyRank": 40,
    "currentStreak": 0,
    "weeklyGoalProgress": 0,
    "level": 2,
    "totalXP": 500
  },
  "601": {
    "userId": 601,
    "totalPoints": 120,
    "weeklyPoints": 40,
    "streakDays": 2,
    "badges": [
      {
        "name": "FIRST_READ",
        "iconUrl": "https://cdn.growvio.app/badges/first-read.svg",
        "unlockedAt": "2026-06-01T10:00:00Z"
      }
    ],
    "userLevel": 1,
    "nextLevelXP": 500,
    "weeklyXP": 40,
    "weeklyRank": 24,
    "currentStreak": 2,
    "weeklyGoalProgress": 0.3,
    "level": 1,
    "totalXP": 120
  },
  "602": {
    "userId": 602,
    "totalPoints": 1840,
    "weeklyPoints": 210,
    "streakDays": 6,
    "badges": [
      {
        "name": "FIRST_READ",
        "iconUrl": "https://cdn.growvio.app/badges/first-read.svg",
        "unlockedAt": "2026-03-12T10:00:00Z"
      },
      {
        "name": "STREAK_7",
        "iconUrl": "https://cdn.growvio.app/badges/streak-7.svg",
        "unlockedAt": "2026-03-18T10:00:00Z"
      }
    ],
    "userLevel": 3,
    "nextLevelXP": 2500,
    "weeklyXP": 210,
    "weeklyRank": 9,
    "currentStreak": 6,
    "weeklyGoalProgress": 0.55,
    "level": 3,
    "totalXP": 1840
  },
  "603": {
    "userId": 603,
    "totalPoints": 4820,
    "weeklyPoints": 340,
    "streakDays": 12,
    "badges": [
      {
        "name": "FIRST_READ",
        "iconUrl": "https://cdn.growvio.app/badges/first-read.svg",
        "unlockedAt": "2025-09-13T08:00:00Z"
      },
      {
        "name": "STREAK_7",
        "iconUrl": "https://cdn.growvio.app/badges/streak-7.svg",
        "unlockedAt": "2025-09-20T08:00:00Z"
      },
      {
        "name": "BOOKWORM_10",
        "iconUrl": "https://cdn.growvio.app/badges/bookworm-10.svg",
        "unlockedAt": "2026-01-04T08:00:00Z"
      }
    ],
    "userLevel": 6,
    "nextLevelXP": 5000,
    "weeklyXP": 340,
    "weeklyRank": 4,
    "currentStreak": 12,
    "weeklyGoalProgress": 0.68,
    "level": 6,
    "totalXP": 4820
  },
  "604": {
    "userId": 604,
    "totalPoints": 9120,
    "weeklyPoints": 560,
    "streakDays": 34,
    "badges": [
      {
        "name": "FIRST_READ",
        "iconUrl": "https://cdn.growvio.app/badges/first-read.svg",
        "unlockedAt": "2025-05-21T08:00:00Z"
      },
      {
        "name": "STREAK_7",
        "iconUrl": "https://cdn.growvio.app/badges/streak-7.svg",
        "unlockedAt": "2025-05-28T08:00:00Z"
      },
      {
        "name": "STREAK_30",
        "iconUrl": "https://cdn.growvio.app/badges/streak-30.svg",
        "unlockedAt": "2025-06-20T08:00:00Z"
      },
      {
        "name": "BOOKWORM_10",
        "iconUrl": "https://cdn.growvio.app/badges/bookworm-10.svg",
        "unlockedAt": "2025-11-02T08:00:00Z"
      },
      {
        "name": "QUIZ_MASTER",
        "iconUrl": "https://cdn.growvio.app/badges/quiz-master.svg",
        "unlockedAt": "2026-02-14T08:00:00Z"
      }
    ],
    "userLevel": 9,
    "nextLevelXP": 10000,
    "weeklyXP": 560,
    "weeklyRank": 1,
    "currentStreak": 34,
    "weeklyGoalProgress": 0.95,
    "level": 9,
    "totalXP": 9120
  },
  "605": {
    "userId": 605,
    "totalPoints": 2210,
    "weeklyPoints": 90,
    "streakDays": 4,
    "badges": [
      {
        "name": "FIRST_READ",
        "iconUrl": "https://cdn.growvio.app/badges/first-read.svg",
        "unlockedAt": "2025-02-02T08:00:00Z"
      },
      {
        "name": "EARLY_BIRD",
        "iconUrl": "https://cdn.growvio.app/badges/early-bird.svg",
        "unlockedAt": "2025-02-05T08:00:00Z"
      }
    ],
    "userLevel": 4,
    "nextLevelXP": 3000,
    "weeklyXP": 90,
    "weeklyRank": 15,
    "currentStreak": 4,
    "weeklyGoalProgress": 0.2,
    "level": 4,
    "totalXP": 2210
  }
} as const

export const MOCK_LEADERBOARD = [
  {
    "rank": 1,
    "name": "Vikram Nair",
    "xp": 9120,
    "books": 22,
    "trend": "up"
  },
  {
    "rank": 2,
    "name": "Arjun Mehta",
    "xp": 6120,
    "books": 14,
    "trend": "up"
  },
  {
    "rank": 3,
    "name": "Sneha Kapoor",
    "xp": 2210,
    "books": 8,
    "trend": "same"
  },
  {
    "rank": 4,
    "name": "Priya Sharma",
    "xp": 4820,
    "books": 9,
    "trend": "up"
  },
  {
    "rank": 5,
    "name": "Karan Malhotra",
    "xp": 1840,
    "books": 5,
    "trend": "down"
  }
] as const
