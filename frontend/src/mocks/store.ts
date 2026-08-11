// In-memory + localStorage-persisted mock "database" for local development.
// Seeded from ./data/*.ts on first load, then mutated in place as the app
// creates/updates things (favorites, notes, reviews, books, etc.).
// Reset anytime from the browser console with `__growvioResetMocks()`.
import { MOCK_USERS } from './data/users'
import { MOCK_BOOKS } from './data/books'
import { MOCK_REVIEWS } from './data/reviews'
import { MOCK_NOTIFICATIONS } from './data/notifications'
import { MOCK_NOTES } from './data/notes'
import { MOCK_READING_HISTORY } from './data/readingHistory'

const STORAGE_KEY = 'growvio_mock_state_v1'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export interface MockState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  books: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviews: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notifications: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notes: any[]
  readingHistory: AnyRecord
  sagas: Record<string, { completed: boolean; plan: string }>
}

function clone<T>(value: T): T {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value))
}

function seed(): MockState {
  return {
    users: clone(MOCK_USERS as unknown as AnyRecord[]),
    books: clone(MOCK_BOOKS as unknown as AnyRecord[]),
    reviews: clone(MOCK_REVIEWS as unknown as AnyRecord[]),
    notifications: clone(MOCK_NOTIFICATIONS as unknown as AnyRecord[]),
    notes: clone(MOCK_NOTES as unknown as AnyRecord[]),
    readingHistory: clone(MOCK_READING_HISTORY as unknown as AnyRecord),
    sagas: {},
  }
}

function load(): MockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as MockState
  } catch {
    // corrupt/unavailable storage — fall back to a fresh seed
  }
  return seed()
}

export const db: MockState = load()

export function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // storage full or unavailable — mock still works in-memory for this session
  }
}

export function resetMockData() {
  Object.assign(db, seed())
  persist()
  // eslint-disable-next-line no-console
  console.info('[GrowVio] Mock data reset to the seeded fixtures.')
}

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__growvioResetMocks = resetMockData
}

// ── Helpers ──────────────────────────────────────────────────────────────
export function toPublicUser(u: AnyRecord) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = u
  return rest
}

export function toPublicBook(b: AnyRecord) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { level1, level2, level3, level4, level5, level6, level7, ...rest } = b
  return rest
}

export function makeToken(userId: number | string) {
  return `mock-jwt.${userId}.${Date.now().toString(36)}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAuthUser(config: any): AnyRecord | null {
  const header: string | undefined = config?.headers?.Authorization ?? config?.headers?.authorization
  if (!header || typeof header !== 'string') return null
  const token = header.replace(/^Bearer\s+/i, '')
  const [scheme, userId] = token.split('.')
  if (scheme !== 'mock-jwt') return null
  return db.users.find((u) => String(u.id) === userId) ?? null
}
