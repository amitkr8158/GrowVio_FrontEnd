import apiClient from './apiClient'

export const userService = {
  getHistory:    ()               => apiClient.get('/api/users/history'),
  updateProfile: (name: string)   => apiClient.put('/api/users/me', { name }),
  favorite:      (bookId: string) => apiClient.post(`/api/users/books/${bookId}/favorite`),
  shortlist:     (bookId: string) => apiClient.post(`/api/users/books/${bookId}/shortlist`),
  adminUsers:    ()               => apiClient.get('/api/admin/users'),
  adminStats:    ()               => apiClient.get('/api/admin/analytics/active-users'),

  getNotes:      (bookId: string) => apiClient.get(`/api/users/notes?bookId=${bookId}`),
  createNote:    (bookId: string, text: string, highlight?: string) =>
    apiClient.post('/api/users/notes', { bookId, text, highlight }),
  deleteNote:    (noteId: string) => apiClient.delete(`/api/users/notes/${noteId}`),

  saveWorkbook:  (bookId: string, answers: Record<string, string>) =>
    apiClient.put(`/api/users/books/${bookId}/workbook`, { answers }),
}
