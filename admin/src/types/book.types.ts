export type PlanTier = 'FREE' | 'STARTER' | 'PREMIUM' | 'PRO';
export type LevelStatus = 'DRAFT' | 'PUBLISHED';
export type BookStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type LevelType =
  | 'SNAPSHOT'
  | 'FLASHDECK'
  | 'INFOSUMMARY'
  | 'DEEP_READ'
  | 'MASTERY_TEST'
  | 'ACTION_PLAN'
  | 'QUICK_RECALL';

export interface KeyPoint {
  order: number;
  heading: string;
  description: string;
}

export interface FlashCard {
  order: number;
  title: string;
  body: string;
  imageUrl?: string;
  imageKey?: string;
}

export interface QuizQuestion {
  id: string;
  order: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface WorkbookSection {
  title: string;
  prompt: string;
  placeholder?: string;
}

export interface WorkbookFormat {
  title: string;
  sections: WorkbookSection[];
}

export interface Level {
  level: number;
  type: LevelType;
  title: string;
  status: LevelStatus;
  requiredPlan: PlanTier;
  content?: unknown;
  aiGeneratedAt?: string;
  updatedAt: string;
}

export interface ReferenceFiles {
  summaryPdfUrl?: string;
  summaryPdfKey?: string;
  infographicUrl?: string;
  infographicKey?: string;
}

export interface Book {
  id: string;
  title: string;
  hindiTitle?: string;
  author: string;
  genre: string;
  coverImageUrl?: string;
  isPremium: boolean;
  rating: number;
  totalReads: number;
  tags: string[];
  publishStatus: BookStatus;
  referenceFiles?: ReferenceFiles;
  levels: Level[];
  createdAt: string;
  updatedAt: string;
  // Projection fields (admin list only)
  levelsPublished?: number;
  hasPdf?: boolean;
  hasInfographic?: boolean;
}
