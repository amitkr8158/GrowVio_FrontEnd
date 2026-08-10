import apiClient from './apiClient'

export interface Review {
  id: string
  bookId: string
  userId: number
  name: string
  rating: number
  text: string
  helpfulCount: number
  createdAt: string
}

export const socialService = {
  getReviews: (bookId: string, page = 0, size = 20) =>
    apiClient.get<Review[]>(`/api/social/books/${bookId}/reviews`, { params: { page, size } })
      .then(r => r.data),

  createReview: (bookId: string, rating: number, text: string) =>
    apiClient.post<Review>(`/api/social/books/${bookId}/reviews`, { rating, text })
      .then(r => r.data),

  getRating: (bookId: string) =>
    apiClient.get<{ averageRating: number; totalReviews: number }>(`/api/social/books/${bookId}/rating`)
      .then(r => r.data),

  markHelpful: (reviewId: string) =>
    apiClient.post<Review>(`/api/social/reviews/${reviewId}/helpful`).then(r => r.data),

}
