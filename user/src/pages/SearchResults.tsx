import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ChevronRight, Star, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const results = [
  { id: "atomic-habits", title: "Atomic Habits", author: "James Clear", rating: 4.8, category: "Self-Help", emoji: "🧠" },
  { id: "power-of-habit", title: "The Power of Habit", author: "Charles Duhigg", rating: 4.5, category: "Psychology", emoji: "🔄" },
  { id: "deep-work", title: "Deep Work", author: "Cal Newport", rating: 4.6, category: "Productivity", emoji: "💼" },
];

const SearchResults = () => {
  const [query, setQuery] = useState("habits");

  return (
    <div className="min-h-screen bg-surface-2">
      <div className="sticky top-0 z-40 bg-background border-b border-border p-4">
        <div className="max-w-[800px] mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-3" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 h-12 text-lg" placeholder="Search books..." />
          </div>
          <p className="text-sm text-ink-3 mt-2">Found <strong className="text-ink-1">{results.length} books</strong> for "{query}"</p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 py-6 space-y-4">
        {results.map((book) => (
          <Link key={book.id} to={`/books/${book.id}`} className="flex gap-4 bg-background border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-22 rounded-lg bg-gradient-card flex items-center justify-center text-3xl flex-shrink-0">{book.emoji}</div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-ink-1">{book.title}</h3>
              <p className="text-sm text-ink-3">{book.author}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-surface-2 text-ink-3 px-2 py-0.5 rounded-full">{book.category}</span>
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span className="text-xs text-ink-1">{book.rating}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-4 self-center" />
          </Link>
        ))}
        {results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📚</p>
            <h3 className="font-display text-lg font-bold text-ink-1 mb-2">No results found</h3>
            <p className="text-sm text-ink-3">Try: "Atomic Habits", "Deep Work", "Psychology"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
