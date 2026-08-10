import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { bookService } from "@/services/bookService";
import { socialService } from "@/services/socialService";
import { userService } from "@/services/userService";
import BookHero from "@/components/books/BookHero";
import BookLevels from "@/components/books/BookLevels";
import ShareModal from "@/components/books/ShareModal";

const BookDetail = () => {
  const { bookSlug } = useParams();
  const navigate = useNavigate();
  const { isPremium, isPro } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", bookSlug],
    queryFn: () => bookService.getById(bookSlug!).then((r) => r.data),
    enabled: !!bookSlug,
    staleTime: 5 * 60 * 1000,
    meta: { onError: () => toast.error("Failed to load book") },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", bookSlug],
    queryFn: () => socialService.getReviews(bookSlug!).then((r) => r.data),
    enabled: !!bookSlug,
  });

  const toggleFavorite = async () => {
    const prev = isFavorited;
    setIsFavorited(!prev);
    try {
      await userService.shortlist(bookSlug!);
    } catch {
      setIsFavorited(prev);
      toast.error("Could not update. Try again.");
    }
  };

  const canAccessLevel = (level: number) => {
    if (level <= 3) return true;
    if (book?.isFeaturedFree) return true;
    if (level <= 6 && isPremium) return true;
    if (level === 7 && isPro) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-2">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <div className="bg-background border border-border rounded-2xl p-6">
              <div className="w-48 h-64 mx-auto rounded-xl bg-surface-3 animate-pulse mb-4" />
              <div className="h-6 w-40 mx-auto bg-surface-3 rounded animate-pulse mb-2" />
              <div className="h-4 w-24 mx-auto bg-surface-3 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-surface-3 rounded animate-pulse" />
              <div className="h-64 bg-surface-3 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-surface-2 flex items-center justify-center">
        <p className="text-ink-3">Book not found</p>
      </div>
    );
  }

  const bookSlugOrId = book.slug || bookSlug!;

  const description = book.freeSummary?.slice(0, 160) ?? `Read ${book.title} by ${book.author} on GrowVio`;
  const canonicalUrl = `https://growvio.in/books/${book.slug || bookSlug}`;

  return (
    <div className="min-h-screen bg-surface-2">
      <Helmet>
        <title>{book.title} by {book.author} | GrowVio</title>
        <meta name="description" content={description} />
        <meta property="og:type"        content="book" />
        <meta property="og:title"       content={`${book.title} by ${book.author}`} />
        <meta property="og:description" content={description} />
        <meta property="og:image"       content={book.coverImageUrl ?? ''} />
        <meta property="og:url"         content={canonicalUrl} />
        <meta name="twitter:card"       content="summary_large_image" />
        <link rel="canonical"           href={canonicalUrl} />
      </Helmet>
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-ink-3 mb-6">
          <Link to="/books" className="hover:text-primary">Library</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-ink-1">{book.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <BookHero
              book={book}
              isFavorited={isFavorited}
              canAccessLevel={canAccessLevel}
              onFavoriteToggle={toggleFavorite}
              onShare={() => setShareOpen(true)}
              onStartReading={() => navigate(`/books/${bookSlugOrId}/level/1`)}
            />
          </div>
          <BookLevels book={book} reviews={reviews} canAccessLevel={canAccessLevel} />
        </div>
      </div>

      <ShareModal book={book} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
};

export default BookDetail;
