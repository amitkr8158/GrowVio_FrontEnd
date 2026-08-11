export const ENV = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  claudeApiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  appEnv: import.meta.env.VITE_APP_ENV || 'dev',
  // When true, apiClient serves every request from the local mock backend
  // (see src/mocks/) instead of calling the real API, and aiGenerationService
  // returns pre-written mock content instead of calling Claude directly.
  // See mocked-data/README.md.
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
} as const;
