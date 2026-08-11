import { useState } from 'react';
import { ENV } from '@/config/env';

const BANNER_CONFIG = {
  dev: {
    background: '#FEF3C7',
    color: '#92400E',
    text: 'DEV ENVIRONMENT — dev.growvio.in',
  },
  staging: {
    background: '#DBEAFE',
    color: '#1E40AF',
    text: 'STAGING — stage.growvio.in',
  },
  preprod: {
    background: '#FED7AA',
    color: '#9A3412',
    text: 'PRE-PROD — preprod.growvio.in — DO NOT SHARE WITH USERS',
  },
} as const;

export default function EnvBanner() {
  const env = ENV.appEnv;

  if (env === 'production') return null;

  const config = BANNER_CONFIG[env as keyof typeof BANNER_CONFIG];
  if (!config) return null;

  const storageKey = `growvio-env-banner-dismissed-${env}`;
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: config.background,
        color: config.color,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 16,
        paddingRight: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      <span>{config.text}</span>
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: config.color,
          fontSize: 14,
          fontWeight: 700,
          padding: '0 4px',
          lineHeight: 1,
          opacity: 0.7,
        }}
        aria-label="Dismiss environment banner"
      >
        ×
      </button>
    </div>
  );
}
