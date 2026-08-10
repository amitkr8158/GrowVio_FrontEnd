import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const COVER_COLORS = [
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',
  'from-green-400 to-teal-600',
  'from-orange-400 to-red-500',
  'from-cyan-400 to-blue-500',
  'from-rose-400 to-purple-500',
]

function CoverPlaceholder({ title, index }) {
  const gradient = COVER_COLORS[index % COVER_COLORS.length]
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} p-3`}>
      <span className="text-center text-xs font-bold leading-tight text-white drop-shadow">{title}</span>
    </div>
  )
}

export default function BookCard({ book, index = 0 }) {
  const { isPremium } = useAuth()
  const locked = book.isPremium && !isPremium

  return (
    <Link
      to={`/books/${book.id}`}
      className="card group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {book.coverImageUrl && !book.coverImageUrl.includes('covers.bookplatform.io') ? (
          <img src={book.coverImageUrl} alt={book.title}
               className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <CoverPlaceholder title={book.title} index={index} />
        )}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-3xl">🔒</span>
          </div>
        )}
        <div className="absolute left-2 top-2">
          {book.isPremium ? (
            <span className="badge-premium">⭐ Premium</span>
          ) : (
            <span className="badge-free">Free</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-primary-600">
          {book.title}
        </h3>
        <p className="mb-2 text-xs text-gray-500">{book.author}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{book.genre}</span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>⭐</span>
            <span>{book.rating?.toFixed(1)}</span>
          </div>
        </div>

        {book.totalReads > 0 && (
          <p className="mt-1.5 text-xs text-gray-400">{book.totalReads.toLocaleString()} reads</p>
        )}
      </div>
    </Link>
  )
}
