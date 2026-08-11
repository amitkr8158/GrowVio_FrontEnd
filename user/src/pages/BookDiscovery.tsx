import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Filter, Star, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { bookService, type Book } from "@/services/bookService";

const DOMAINS = [
  { label: "All", value: null },
  { label: "Finance", value: "FINANCE" },
  { label: "Personal Dev", value: "PERSONAL_DEV" },
  { label: "Entrepreneurship", value: "ENTREPRENEURSHIP" },
  { label: "Spirituality", value: "SPIRITUALITY" },
  { label: "Parenting", value: "PARENTING" },
  { label: "Psychology", value: "PSYCHOLOGY" },
  { label: "Productivity", value: "PRODUCTIVITY" },
] as const;

const BookDiscovery = () => {
  const [domain, setDomain] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  const searchTimeout = useMemo(() => {
    return (value: string) => {
      const id = setTimeout(() => setDebouncedSearch(value), 300);
      return () => clearTimeout(id);
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    searchTimeout(value);
  };

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books", "all", domain, debouncedSearch],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (domain) params.domain = domain;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await bookService.getAll(params);
      return res.data;
    },
    meta: { onError: () => toast.error("Failed to load books") },
  });

  const filteredBooks = domain
    ? books.filter((b) => b.domain === domain || b.genre === domain)
    : books;

  const featuredRows = [
    { title: "🔥 Trending in India", books: filteredBooks.slice(0, 4) },
    { title: "⭐ Staff Picks", books: filteredBooks.slice(4, 8) },
    { title: "🆕 New This Week", books: filteredBooks.slice(8, 12) },
  ].filter((r) => r.books.length > 0);

  return (
    <div className="min-h-screen bg-surface-2">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
              <Input
                placeholder="Search books, authors, topics..."
                className="pl-9 h-10"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />Filters
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DOMAINS.map((d) => (
              <button
                key={d.label}
                onClick={() => setDomain(d.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  domain === d.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-ink-3 hover:bg-surface-3"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {isLoading ? (
          <>
            {/* Skeleton rows */}
            {[1, 2].map((row) => (
              <section key={row} className="mb-8">
                <div className="h-6 w-48 bg-surface-3 rounded animate-pulse mb-4" />
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-shrink-0 w-44">
                      <div className="aspect-[3/4] bg-surface-3 rounded-xl animate-pulse" />
                      <div className="mt-2 h-4 w-32 bg-surface-3 rounded animate-pulse" />
                      <div className="mt-1 h-3 w-20 bg-surface-3 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
            {/* Skeleton grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[3/4] bg-surface-3 rounded-xl animate-pulse" />
                  <div className="mt-2 h-4 w-full bg-surface-3 rounded animate-pulse" />
                  <div className="mt-1 h-3 w-2/3 bg-surface-3 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Featured Rows */}
            {featuredRows.map((row) => (
              <section key={row.title} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-ink-1">{row.title}</h2>
                  <button className="text-sm text-primary hover:underline flex items-center gap-1">
                    See all <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {row.books.map((book) => (
                    <Link key={book.id} to={`/books/${book.id}`} className="flex-shrink-0 w-44">
                      <BookCard book={book} />
                    </Link>
                  ))}
                </div>
              </section>
            ))}

            {/* Book Grid */}
            <section>
              <h2 className="text-lg font-semibold text-ink-1 mb-4">
                {domain ? `${DOMAINS.find((d) => d.value === domain)?.label} Books` : "All Books"}
                {filteredBooks.length > 0 && (
                  <span className="text-sm font-normal text-ink-3 ml-2">({filteredBooks.length})</span>
                )}
              </h2>
              {filteredBooks.length === 0 ? (
                <div className="text-center py-16 text-ink-3">
                  <p className="text-lg mb-1">No books found</p>
                  <p className="text-sm">Try a different search or category</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredBooks.map((book) => (
                    <Link key={book.id} to={`/books/${book.id}`}>
                      <BookCard book={book} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

const BookCard = ({ book }: { book: Book }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
  >
    <div className="aspect-[3/4] bg-gradient-card flex items-center justify-center text-5xl relative overflow-hidden">
      {book.coverImageUrl ? (
        <img
          src={book.coverImageUrl}
          alt={book.title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        book.coverEmoji || "📖"
      )}
      {book.isFeaturedFree && (
        <span className="absolute top-2 left-2 text-[10px] font-semibold bg-success text-white px-2 py-0.5 rounded-full">
          All Levels Free
        </span>
      )}
    </div>
    <div className="p-3">
      <h3 className="font-display text-sm font-semibold text-ink-1 line-clamp-2 mb-1">{book.title}</h3>
      <p className="text-xs text-ink-3 mb-2">{book.author}</p>
      <div className="flex items-center gap-1 mb-2">
        <Star className="h-3 w-3 fill-warning text-warning" />
        <span className="text-xs font-medium text-ink-1">{book.averageRating ?? book.rating ?? 0}</span>
        <span className="text-xs text-ink-4">({book.readCount ?? book.totalReads ?? 0})</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-ink-3">
        <Clock className="h-3 w-3" />
        <span>{book.domain || book.genre || "General"}</span>
      </div>
      <div className="flex gap-0.5 mt-2">
        {[1, 2, 3, 4, 5, 6, 7].map((l) => (
          <div
            key={l}
            className={`w-3 h-3 rounded-sm ${
              l <= 3 ? "bg-success" : l === 4 ? "bg-info" : l <= 6 ? "bg-primary" : "bg-danger"
            } ${l > 3 && !book.isFeaturedFree && !book.isPremium ? "opacity-30" : ""}`}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

export default BookDiscovery;
