const STYLES = {
  error:   'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
  warn:    'bg-amber-50 border-amber-200 text-amber-800',
}

export default function Alert({ type = 'info', message, className = '' }) {
  if (!message) return null
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${STYLES[type]} ${className}`}>
      {message}
    </div>
  )
}
