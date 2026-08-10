export type LevelPlan = 'FREE' | 'STARTER' | 'PREMIUM' | 'PRO';

export const LEVELS = [
  { id: 1, name: 'Snapshot',         emoji: '📸', words: 150,   plan: 'FREE'    as LevelPlan },
  { id: 2, name: 'Flashdeck',        emoji: '🃏', words: 500,   plan: 'FREE'    as LevelPlan },
  { id: 3, name: 'Infosummary',      emoji: '🖼️', words: 1200,  plan: 'FREE'    as LevelPlan },
  { id: 4, name: 'Deep Read',        emoji: '📖', words: 3000,  plan: 'STARTER' as LevelPlan },
  { id: 5, name: 'Mastery Quiz',     emoji: '🎯', words: 5000,  plan: 'PREMIUM' as LevelPlan },
  { id: 6, name: 'Action Plan',      emoji: '📋', words: 8000,  plan: 'PREMIUM' as LevelPlan },
  { id: 7, name: 'Revision Booklet', emoji: '🔖', words: 15000, plan: 'PRO'     as LevelPlan },
] as const;

export const LEVEL_NAMES: Record<number, string> = Object.fromEntries(
  LEVELS.map((l) => [l.id, l.name]),
);

export const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: '10 key points · 5 min read',
  2: '8–10 visual cards · 3 min',
  3: '2-page visual summary · 5 min',
  4: 'Chapter summaries · 45 min',
  5: '50 quiz questions · 20 min',
  6: 'Personal workbook · 30 min',
  7: 'Quick revision cheat sheet · 10 min',
};
