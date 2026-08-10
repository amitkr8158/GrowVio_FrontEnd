import apiClient from './apiClient'

export interface Book {
  id: string
  slug?: string
  title: string
  author: string
  genre: string
  coverImageUrl?: string
  // UI-only display fields (not from backend — set by frontend or defaults)
  coverEmoji?: string
  domain?: string
  isFeaturedFree?: boolean
  // Backend fields
  isPremium: boolean
  freeSummary?: string
  premiumSummary?: string
  keyPoints?: string[]
  eli5Summary?: string
  tags?: string[]
  rating: number
  totalReads: number
  hindiTitle?: string
  hindiFreeSummary?: string
  // Aliases used in UI (backend returns rating/totalReads; these are UI aliases)
  averageRating?: number
  readCount?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface SearchResult {
  books: Book[]
  totalHits: number
  backend: string
  query: string
  durationMs: number
}

export const bookService = {
  getAll:      (params?: Record<string, unknown>) => apiClient.get<Book[]>('/api/books', { params }),
  getById:     (id: string)                       => apiClient.get<Book>(`/api/books/${id}`),
  getBySlug:   (slug: string)                     => apiClient.get<Book>(`/api/books/slug/${slug}`),
  getPopular:  ()                                 => apiClient.get<Book[]>('/api/books/popular'),
  search:     (q: string)                        => apiClient.get<SearchResult>('/api/books/search', { params: { q } }),
  create:     (data: unknown)                    => apiClient.post('/api/books', data),
  update:     (id: string, data: unknown)        => apiClient.put(`/api/books/${id}`, data),
  remove:     (id: string)                       => apiClient.delete(`/api/books/${id}`),
  analytics:  ()                                 => apiClient.get('/api/admin/books/analytics'),
  getLevel:   (bookId: string, level: number)    => apiClient.get<{ success: boolean; data: { level: number; content: string } }>(`/api/books/${bookId}/level/${level}`),
  getStatus:  (bookId: string)                   => apiClient.get(`/api/books/${bookId}/status`),
}
