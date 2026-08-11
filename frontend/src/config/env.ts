export const ENV = {
  gatewayUrl: import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080',
  appEnv: (import.meta.env.VITE_APP_ENV || 'dev') as 'dev' | 'staging' | 'preprod' | 'production',
  appVersion: import.meta.env.VITE_APP_VERSION || '0.0.1',
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'debug',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  prodTier: Number(import.meta.env.VITE_PROD_TIER || 1),
  isProduction: import.meta.env.VITE_APP_ENV === 'production',
  isDev: import.meta.env.VITE_APP_ENV === 'dev',
  isStaging: import.meta.env.VITE_APP_ENV === 'staging',
  isPreprod: import.meta.env.VITE_APP_ENV === 'preprod',
  // When true, apiClient serves every request from the local mock backend
  // (see src/mocks/) instead of calling the real gateway. See mocked-data/README.md.
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
} as const;

export type AppEnv = 'dev' | 'staging' | 'preprod' | 'production';
