import apiClient from './apiClient'

export interface SignupData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UserData {
  id: number
  name: string
  email: string
  role: string
  plan: string
  createdAt?: string
}

const AUTH_REQUEST_TIMEOUT_MS = 120000

export const authService = {
  signup:        (data: SignupData)  => apiClient.post('/api/auth/signup', data),
  // Login can be slow on free-tier cold starts (service spin-up can take ~50s),
  // so we override the default client timeout for this endpoint.
  login:         (data: LoginData)   => apiClient.post('/api/auth/login', data, { timeout: AUTH_REQUEST_TIMEOUT_MS }),
  logout:        ()                  => apiClient.post('/api/auth/logout'),
  getMe:         ()                  => apiClient.get<UserData>('/api/users/me'),
  updateProfile: (name: string)      => apiClient.put<UserData>('/api/users/me', { name }),

  // Email verification
  resendVerification: (email: string)           => apiClient.post('/api/auth/resend-verification', { email }),
  verifyEmail:        (token: string)           => apiClient.get('/api/auth/verify-email', { params: { token } }),

  // Password reset
  forgotPassword: (email: string)               => apiClient.post('/api/auth/forgot-password', { email }),
  resetPassword:  (token: string, newPassword: string) =>
    apiClient.post('/api/auth/reset-password', { token, newPassword }),
}
