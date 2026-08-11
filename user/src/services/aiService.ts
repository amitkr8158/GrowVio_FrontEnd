import apiClient from './apiClient'

export const aiService = {
  generateFromPdf: (formData: FormData) =>
    apiClient.post('/ai/generate-summary', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  generateFromText: (data: { text: string; title?: string; author?: string; bookId?: string }) =>
    apiClient.post('/ai/generate-from-text', data).then(r => r.data),
}
