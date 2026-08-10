/**
 * GrowVio dev logger — colour-coded browser console output.
 *
 * All output is suppressed in production (import.meta.env.DEV === false).
 * error() is always emitted so server-side errors reach production monitoring.
 *
 * Usage:
 *   logger.info('BOOKS', 'Fetched books', { count: 12 })
 *   logger.error('API→ERR', 'POST /api/auth/login | status=401')
 */

const isDev = import.meta.env.DEV

export const logger = {
  info: (tag: string, msg: string, data?: unknown) => {
    if (isDev) console.log(`%c[${tag}] ${msg}`, 'color:#0ea5e9;font-weight:600', ...(data !== undefined ? [data] : []))
  },
  debug: (tag: string, msg: string, data?: unknown) => {
    if (isDev) console.debug(`%c[${tag}] ${msg}`, 'color:#8b5cf6', ...(data !== undefined ? [data] : []))
  },
  warn: (tag: string, msg: string, data?: unknown) => {
    if (isDev) console.warn(`%c[${tag}] ${msg}`, 'color:#f59e0b;font-weight:600', ...(data !== undefined ? [data] : []))
  },
  error: (tag: string, msg: string, data?: unknown) => {
    // error always logs — visible in production monitoring tools
    console.error(`%c[${tag}] ${msg}`, 'color:#ef4444;font-weight:700', ...(data !== undefined ? [data] : []))
  },
}
