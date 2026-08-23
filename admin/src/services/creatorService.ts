import apiClient from '../lib/apiClient'
import type { LayerMeta } from '@/mocks/data/creatorLayers'

export type CreatorLayerStatus = 'Draft' | 'In Review' | 'Approved' | 'Published'

interface BookLevelContent { pdfUrl?: string | null; [key: string]: unknown }

export interface CreatorBookSummary {
  id: string
  slug: string
  title: string
  author: string
  coverImageUrl?: string
  coverEmoji?: string
  isPremium: boolean
  overall: number
  done: number
}

export interface CreatorLayerStat {
  meta: LayerMeta
  count: number
  target: number
  percent: number
  status: CreatorLayerStatus
  updatedAt: string
  version: number
  pdfUrl: string | null
}

export interface CreatorBookLayers {
  book: { id: string; slug: string; title: string; author: string; coverImageUrl?: string }
  layers: CreatorLayerStat[]
  overall: number
  done: number
}

export interface CreatorVersionEntry {
  version: number
  note: string
  at: string
  by: string
  bookId: string
  bookTitle: string
  level: number
  layer: string
}

export interface RawFileEntry {
  id: string
  bookId: string
  bookTitle: string
  level: number
  layer: string
  name?: string
  url: string
}

export interface MediaEntry {
  id: string
  bookId: string
  bookTitle: string
  kind: string
  url: string
}

export const creatorService = {
  listBooks: () => apiClient.get<{ books: CreatorBookSummary[] }>('/api/creator/books'),
  getLayers: (bookId: string) => apiClient.get<CreatorBookLayers>(`/api/creator/books/${bookId}/layers`),
  getLevel: (bookId: string, level: number) =>
    apiClient.get<{ success: boolean; data: { level: number; content: BookLevelContent } }>(`/api/books/${bookId}/level/${level}`),
  updateLevel: (bookId: string, level: number, content: BookLevelContent) =>
    apiClient.put(`/api/books/${bookId}/level/${level}`, content),
  submit: (bookId: string, level: number) => apiClient.post(`/api/books/${bookId}/level/${level}/submit`),
  approve: (bookId: string, level: number) => apiClient.post(`/api/books/${bookId}/level/${level}/approve`),
  publish: (bookId: string, level: number) => apiClient.post(`/api/books/${bookId}/level/${level}/publish`),
  revert: (bookId: string, level: number) => apiClient.post(`/api/books/${bookId}/level/${level}/revert`),
  rawFiles: () => apiClient.get<{ files: RawFileEntry[] }>('/api/creator/raw-files'),
  media: () => apiClient.get<{ media: MediaEntry[] }>('/api/creator/media'),
  versions: () => apiClient.get<{ versions: CreatorVersionEntry[] }>('/api/creator/versions'),
  publishQueue: () => apiClient.get<{ queue: { bookId: string; bookTitle: string; level: number; layer: string; updatedAt: string }[] }>('/api/creator/publish-queue'),
  analytics: () =>
    apiClient.get<{
      totalReads: number
      avgRating: number
      publishedLayers: number
      inReviewLayers: number
      byBook: { bookId: string; title: string; reads: number; rating: number }[]
    }>('/api/creator/analytics'),
}
