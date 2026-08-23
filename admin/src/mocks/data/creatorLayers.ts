// Static metadata for the 7 authoring layers in Creator Studio. Mirrors the
// 7 reading levels already modeled in mocks/data/books.ts (level1..level7) —
// this file only adds the editorial/authoring-facing labels around them.
export type LayerKey =
  | 'snapshot'
  | 'flashdeck'
  | 'infographic'
  | 'deepread'
  | 'mastery'
  | 'actionplan'
  | 'recall'

export interface LayerMeta {
  key: LayerKey
  level: number
  name: string
  tagline: string
  tier: 'FREE' | 'STARTER' | 'PREMIUM' | 'PRO'
  duration: string
  blockLabel: string
  guidance: string
}

export const LAYER_META: LayerMeta[] = [
  {
    key: 'snapshot',
    level: 1,
    name: 'Snapshot',
    tagline: '4–10 core concepts, one page',
    tier: 'FREE',
    duration: '4 min',
    blockLabel: 'Key point',
    guidance:
      'Write original paraphrases, never verbatim quotations. Each point must stand alone and be understandable in under 20 seconds.',
  },
  {
    key: 'flashdeck',
    level: 2,
    name: 'Flashdeck',
    tagline: 'Swipeable visual cards',
    tier: 'FREE',
    duration: '7 min',
    blockLabel: 'Card',
    guidance: 'One idea per card. Body is a single sentence; keep it screen-sized.',
  },
  {
    key: 'infographic',
    level: 3,
    name: 'Infosummary',
    tagline: 'Single-image visual summary',
    tier: 'STARTER',
    duration: '12 min',
    blockLabel: 'Frame',
    guidance: 'One tall infographic image plus a short caption describing what it maps.',
  },
  {
    key: 'deepread',
    level: 4,
    name: 'Deep Read',
    tagline: 'Chapter-wise long-form summary',
    tier: 'STARTER',
    duration: '38 min',
    blockLabel: 'Chapter',
    guidance: 'Keep chapters 200–400 words. Pull one memorable moment per chapter into the margin rail.',
  },
  {
    key: 'mastery',
    level: 5,
    name: 'Mastery Test',
    tagline: 'Question bank with scoring rules',
    tier: 'STARTER',
    duration: '15 min',
    blockLabel: 'Question',
    guidance: 'Mix EASY / MEDIUM / HARD. Every question needs an explanation shown after answering.',
  },
  {
    key: 'actionplan',
    level: 6,
    name: 'Action Plan',
    tagline: 'Daily / weekly / monthly workbook',
    tier: 'STARTER',
    duration: '20 min',
    blockLabel: 'Prompt',
    guidance: 'Each prompt must ask for a written commitment. Prefer fewer prompts that actually get executed.',
  },
  {
    key: 'recall',
    level: 7,
    name: 'Quick Recall',
    tagline: 'Rapid revision & active recall',
    tier: 'STARTER',
    duration: '6 min',
    blockLabel: 'Recall block',
    guidance: 'Recall beats re-reading. Keep this answerable from memory with the book closed.',
  },
]

export const getLayerMeta = (key: string) => LAYER_META.find((l) => l.key === key)
export const getLayerMetaByLevel = (level: number) => LAYER_META.find((l) => l.level === level)
