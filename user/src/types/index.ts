// ── Shared domain types ────────────────────────────────────────────────────────

export type PlanType = "FREE" | "STARTER" | "PREMIUM" | "PRO";
export type UserRole = "USER" | "CONTENT_CREATOR" | "ADMIN" | "SUPER_ADMIN";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  plan: PlanType;
  emailVerified: boolean;
}

export interface Book {
  id: string;
  slug?: string;
  title: string;
  author: string;
  genre?: string;
  domain?: string;
  coverImageUrl?: string;
  isPremium?: boolean;
  isFeaturedFree?: boolean;
  freeSummary?: string;
  premiumSummary?: string;
  keyPoints?: string[];
  eli5Summary?: string;
  tags?: string[];
  rating?: number;
  averageRating?: number;
  readCount?: number;
  totalReads?: number;
  hindiTitle?: string;
  hindiFreeSummary?: string;
  isFavorited?: boolean;
  isShortlisted?: boolean;
  progressPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LevelContent {
  levelNumber: number;
  content: unknown;
  status: "DRAFT" | "PUBLISHED";
  requiredPlan: string;
  aiGeneratedAt?: string;
}

export interface AdminUser {
  id?: number;
  email: string;
  name: string;
  plan: PlanType;
  role: UserRole;
  createdAt?: string;
  joinedAt?: string;
}

export interface HistoryItem {
  bookId: string;
  title?: string;
  bookTitle?: string;
  bookSlug?: string;
  coverImageUrl?: string;
  progressPercent?: number;
  levelReached?: number;
  lastReadAt?: string;
}

// ── Groq / OpenAI API response shape ─────────────────────────────────────────
export interface GroqMessage { role: string; content: string }
export interface GroqChoice { message: GroqMessage; finish_reason?: string }
export interface GroqResponse { choices: GroqChoice[] }
export interface GroqErrorResponse { error?: { message?: string } }

// ── Razorpay callback shapes ──────────────────────────────────────────────────
export interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error?: { description?: string; code?: string; reason?: string };
}
