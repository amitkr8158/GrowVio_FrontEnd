import * as Sentry from '@sentry/react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'

const dsn = import.meta.env.VITE_SENTRY_DSN || '';

Sentry.init({
  dsn,
  enabled: dsn !== '',
  environment: import.meta.env.VITE_APP_ENV || 'dev',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
