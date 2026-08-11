import apiClient from './apiClient'

export interface Notification {
  id: string
  userId: number
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const notificationService = {
  getHistory: (userId: number) =>
    apiClient.get<Notification[]>(`/api/notifications/history/${userId}`).then(r => r.data),
}
