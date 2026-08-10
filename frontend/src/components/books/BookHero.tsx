import { Star, Clock, BookOpen, Lock, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types";
import { LEVELS } from "@/constants/levelNames";

interface BookHeroProps {
  book: Book;
  isFavorited: boolean;
  canAccessLevel: (level: number) => boolean;
  onFavoriteToggle: () => void;
  onShare: () => void;
  onStartReading: () => void;
}

export default function BookHero({ book, isFavorited, canAccessLevel, onFavoriteToggle, onShare, onStartReading }: BookHeroProps) {
  return (
    <div className="bg-background border border-border rounded-2xl p-6 text-center">
      <div className="w-48 h-64 mx-auto rounded-xl overflow-hidden mb-4 shadow-lg">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-hero flex flex-col items-center justify-center gap-2">
            <span className="text-4xl font-display font-bold text-white">{book.title?.[0] || "?"}</span>
            <BookOpen className="h-8 w-8 text-white/60" />
          </div>
        )}
      </div>

      <h1 className="font-display text-2xl font-bold text-ink-1 mb-1">{book.title}</h1>
      <p className="text-sm text-ink-3 mb-3">by {book.author}</p>

      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="font-semibold text-ink-1">{book.averageRating ?? book.rating ?? 0}</span>
        </div>
        <span className="text-ink-4">&middot;</span>
        {(book.readCount ?? book.totalReads ?? 0) === 0 ? (
          <span className="text-sm text-ink-3">Be the first to read this</span>
        ) : (
          <span className="text-sm text-ink-3">{(book.readCount ?? book.totalReads ?? 0).toLocaleString()} reads</span>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-ink-3 mb-4">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{book.domain || book.genre}</span>
        {book.isFeaturedFree && (
          <span className="bg-success-light text-success px-2 py-0.5 rounded-full font-medium">All Levels Free</span>
        )}
      </div>

      <div className="space-y-1 mb-4">
        {LEVELS.map((l) => {
          const accessible = canAccessLevel(l.id);
          return (
            <div key={l.id} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                l.plan === "FREE" ? "bg-success" : l.plan === "STARTER" ? "bg-info" : l.plan === "PREMIUM" ? "bg-primary" : "bg-danger"
              }`}>{l.id}</div>
              <span className="text-xs text-ink-3 flex-1 text-left truncate">{l.emoji} {l.name}</span>
              {!accessible && <Lock className="h-3 w-3 text-ink-4" />}
            </div>
          );
        })}
      </div>

      <Button className="w-full h-12 text-base shadow-glow mb-2" onClick={onStartReading}>
        Start Reading
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label={isFavorited ? "Remove from bookmarks" : "Add to bookmarks"}
          className={`flex-1 ${isFavorited ? "border-primary text-primary" : ""}`}
          onClick={onFavoriteToggle}
        >
          <Bookmark className={`h-4 w-4 ${isFavorited ? "fill-primary" : ""}`} aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Share book" className="flex-1" onClick={onShare}>
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
