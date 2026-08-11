// In-memory + localStorage-persisted mock "database" for local development.
// Seeded from ./data/*.ts on first load, then mutated in place as the admin
// panel edits books, levels, locks, schedules, etc.
// Reset anytime from the browser console with `__growvioResetMocks()`.
import { MOCK_USERS } from './data/users';
import { MOCK_BOOKS } from './data/books';
import { MOCK_CONTENT_LEVELS } from './data/contentLevels';

const STORAGE_KEY = 'growvio_admin_mock_state_v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export interface MockState {
  users: AnyRecord[];
  books: AnyRecord[];
  // per-book array of { level, name, status, requiredPlan }
  levelStatus: Record<string, AnyRecord[]>;
  drafts: Record<string, AnyRecord>; // key `${bookId}:${level}` -> blocks
  published: Record<string, AnyRecord>; // key `${bookId}:${level}` -> { blocks, version, publishedAt }
  versions: Record<string, { draftVersion: number; publishedVersion: number }>;
  editorLocks: Record<string, { sessionId: string; lockedBy: string; expiresAt: string }>;
  schedules: Record<string, { scheduledAt: string }>;
  abTests: Record<string, { abTestId: string; status: string; winner?: string; variantBContent?: string }>;
  supportingDocs: Record<string, AnyRecord[]>;
}

function clone<T>(value: T): T {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function seed(): MockState {
  const levelStatus: Record<string, AnyRecord[]> = clone(MOCK_CONTENT_LEVELS as unknown as AnyRecord);
  const versions: Record<string, { draftVersion: number; publishedVersion: number }> = {};
  for (const bookId of Object.keys(levelStatus)) {
    for (const l of levelStatus[bookId]) {
      versions[`${bookId}:${l.level}`] = { draftVersion: l.status === 'PUBLISHED' ? 1 : 0, publishedVersion: l.status === 'PUBLISHED' ? 1 : 0 };
    }
  }
  return {
    users: clone(MOCK_USERS as unknown as AnyRecord[]),
    books: clone(MOCK_BOOKS as unknown as AnyRecord[]),
    levelStatus,
    drafts: {},
    published: {},
    versions,
    editorLocks: {},
    schedules: {},
    abTests: {},
    supportingDocs: {
      bk_1001: [
        { type: 'PDF', url: 'https://cdn.growvio.app/refs/atomic-habits-source.pdf', uploadedAt: '2026-05-01T10:00:00Z' },
        { type: 'INFOGRAPHIC', url: 'https://cdn.growvio.app/refs/atomic-habits-infographic.png', uploadedAt: '2026-05-02T10:00:00Z' },
      ],
    },
  };
}

function load(): MockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockState;
  } catch {
    // corrupt/unavailable storage — fall back to a fresh seed
  }
  return seed();
}

export const db: MockState = load();

export function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // storage full or unavailable — mock still works in-memory for this session
  }
}

export function resetMockData() {
  Object.assign(db, seed());
  persist();
  // eslint-disable-next-line no-console
  console.info('[GrowVio Admin] Mock data reset to the seeded fixtures.');
}

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__growvioResetMocks = resetMockData;
}

// ── Helpers ──────────────────────────────────────────────────────────────
export function toPublicUser(u: AnyRecord) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = u;
  return rest;
}

export function makeToken(userId: number | string) {
  return `mock-jwt.${userId}.${Date.now().toString(36)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAuthUser(config: any): AnyRecord | null {
  const header: string | undefined = config?.headers?.Authorization ?? config?.headers?.authorization;
  if (!header || typeof header !== 'string') return null;
  const token = header.replace(/^Bearer\s+/i, '');
  const [scheme, userId] = token.split('.');
  if (scheme !== 'mock-jwt') return null;
  return db.users.find((u) => String(u.id) === userId) ?? null;
}

const LEVEL_TYPE: Record<number, string> = {
  1: 'SNAPSHOT', 2: 'FLASHDECK', 3: 'INFOSUMMARY', 4: 'DEEP_READ', 5: 'MASTERY_TEST', 6: 'ACTION_PLAN', 7: 'QUICK_RECALL',
};

// Maps our flat fixture book (level1..level7 as raw content) into the admin
// `Book` shape (types/book.types.ts): publishStatus, levels[], projections.
export function toAdminBook(book: AnyRecord) {
  const statuses = db.levelStatus[book.id] || [];
  const levels = statuses.map((s: AnyRecord) => ({
    level: s.level,
    type: LEVEL_TYPE[s.level],
    title: s.name,
    status: s.status,
    requiredPlan: s.requiredPlan,
    content: book[`level${s.level}`],
    updatedAt: book.updatedAt || book.createdAt,
  }));
  return {
    id: book.id,
    title: book.title,
    hindiTitle: book.hindiTitle,
    author: book.author,
    genre: book.genre,
    coverImageUrl: book.coverImageUrl,
    isPremium: book.isPremium,
    rating: book.rating,
    totalReads: book.totalReads,
    tags: book.tags || [],
    publishStatus: book.status,
    description: book.freeSummary,
    referenceFiles: {
      summaryPdfUrl: db.supportingDocs[book.id]?.find((d: AnyRecord) => d.type === 'PDF')?.url,
      infographicUrl: db.supportingDocs[book.id]?.find((d: AnyRecord) => d.type === 'INFOGRAPHIC')?.url,
    },
    levels,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt || book.createdAt,
    levelsPublished: levels.filter((l: AnyRecord) => l.status === 'PUBLISHED').length,
    hasPdf: !!db.supportingDocs[book.id]?.some((d: AnyRecord) => d.type === 'PDF'),
    hasInfographic: !!db.supportingDocs[book.id]?.some((d: AnyRecord) => d.type === 'INFOGRAPHIC'),
  };
}
