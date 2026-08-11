import * as Sentry from '@sentry/react';
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";

const dsn = import.meta.env.VITE_SENTRY_DSN || '';

Sentry.init({
  dsn,
  enabled: dsn !== '',
  environment: import.meta.env.VITE_APP_ENV || 'dev',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
