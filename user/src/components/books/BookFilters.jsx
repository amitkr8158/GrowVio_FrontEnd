const GENRES = ['All', 'Self-Help', 'Finance', 'Productivity', 'Psychology', 'Business', 'History', 'Technology', 'Memoir']

export default function BookFilters({ genre, setGenre, filter, setFilter }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Genre pills */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g === 'All' ? '' : g)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              (g === 'All' && !genre) || genre === g
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Free / Premium toggle */}
      <div className="ml-auto flex items-center gap-2 rounded-lg bg-white p-1 ring-1 ring-gray-200">
        {[['all', 'All'], ['free', 'Free'], ['premium', '⭐ Premium']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === val ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
