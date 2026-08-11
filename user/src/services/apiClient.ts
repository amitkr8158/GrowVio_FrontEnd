import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { ENV } from '@/config/env'
import { logger } from '@/lib/logger'
import { installMockAdapter } from '@/mocks/mockAdapter'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    startTime?: number;
  }
}

type TimedConfig = InternalAxiosRequestConfig & { startTime?: number }

const apiClient = axios.create({
  baseURL: ENV.gatewayUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── REQUEST interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const url = config.url ?? ''
  const isFreshAuthRequest =
    url.includes('/api/auth/login') || url.includes('/api/auth/signup')

  // Do not send stale bearer tokens while logging in/signing up.
  // These endpoints are public and some upstream edges may treat this as suspicious.
  if (token && !isFreshAuthRequest) config.headers.Authorization = `Bearer ${token}`

  // Store start time for duration calculation in response interceptor
  config.startTime = Date.now()

  logger.debug('API→REQ', `${(config.method ?? 'GET').toUpperCase()} ${config.url}`, {
    params:  config.params,
    hasAuth: !!config.headers?.Authorization,
  })

  return config
})

// ── RESPONSE interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - ((response.config as TimedConfig).startTime ?? 0)
    logger.info(
      'API→RES',
      `${(response.config.method ?? 'GET').toUpperCase()} ${response.config.url} | status=${response.status} | duration=${duration}ms`,
    )
    return response
  },
  (error) => {
    const duration = Date.now() - ((error.config as TimedConfig)?.startTime ?? 0)
    const status   = error.response?.status ?? 'NETWORK_ERROR'
    const url      = error.config?.url       ?? 'unknown'
    const method   = (error.config?.method   ?? 'GET').toUpperCase()

    logger.error(
      'API→ERR',
      `${method} ${url} | status=${status} | duration=${duration}ms`,
      { responseData: error.response?.data, message: error.message },
    )

    // Status-specific handling
    if (status === 401) {
      logger.warn('API→AUTH', 'Unauthorized — clearing session and redirecting to login')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (status === 403) {
      logger.warn('API→AUTHZ', `Forbidden — userId lacks permission for ${method} ${url}`)
    } else if (status === 503 || status === 'NETWORK_ERROR') {
      logger.warn('API→DOWN', `Service unavailable or network error | ${method} ${url}`)
    } else if (status === 500) {
      logger.error('API→500', `Server error on ${method} ${url} — check service logs`)
    } else if (status === 429) {
      logger.warn('API→RATE', `Rate limited on ${method} ${url}`)
    }

    return Promise.reject(error)
  },
)

// Local-only: serve every request from the in-browser mock backend instead
// of the real gateway. Enabled via VITE_USE_MOCKS=true (see user/.env.local).
if (ENV.useMocks) installMockAdapter(apiClient)

export default apiClient
