const isDev = import.meta.env.DEV;

export const logger = {
  debug: (tag: string, msg: string, data?: unknown) => {
    if (isDev) console.debug(`[${tag}]`, msg, data ?? '');
  },
  info: (tag: string, msg: string, data?: unknown) => {
    if (isDev) console.info(`[${tag}]`, msg, data ?? '');
  },
  warn: (tag: string, msg: string, data?: unknown) => {
    console.warn(`[${tag}]`, msg, data ?? '');
  },
  error: (tag: string, msg: string, data?: unknown) => {
    console.error(`[${tag}]`, msg, data ?? '');
  },
};
