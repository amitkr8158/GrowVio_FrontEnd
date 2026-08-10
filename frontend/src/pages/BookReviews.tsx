import { useState } from "react";
import { useParams } from "react-router-dom";
import { Star, ThumbsUp, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { socialService, type Review } from "@/services/socialService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              s <= (hover || value) ? "fill-warning text-warning" : "text-ink-4"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function SkeletonReview() {
  return (
    <div className="bg-background border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-surface-3" />
        <div className="space-y-1 flex-1">
          <div className="h-3 bg-surface-3 rounded w-24" />
          <div className="h-3 bg-surface-3 rounded w-16" />
        </div>
      </div>
      <div className="h-4 bg-surface-3 rounded w-full mb-1" />
      <div className="h-4 bg-surface-3 rounded w-3/4" />
    </div>
  );
}

export default function BookReviews() {
  const { id: bookId = "" } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", bookId],
    queryFn: () => socialService.getReviews(bookId),
    enabled: !!bookId,
    staleTime: 60_000,
  });

  const { data: ratingData } = useQuery({
    queryKey: ["rating", bookId],
    queryFn: () => socialService.getRating(bookId),
    enabled: !!bookId,
    staleTime: 60_000,
  });

  const submitMutation = useMutation({
    mutationFn: () => socialService.createReview(bookId, rating, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
      queryClient.invalidateQueries({ queryKey: ["rating", bookId] });
      setRating(0);
      setText("");
      setShowForm(false);
      toast.success("Review submitted!");
    },
    onError: () => toast.error("Could not submit review. Try again."),
  });

  const helpfulMutation = useMutation({
    mutationFn: (reviewId: string) => socialService.markHelpful(reviewId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", bookId] }),
  });

  const avgRating = ratingData?.averageRating ?? (reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0);

  const hasReviewed = reviews.some((r) => r.userId === user?.id);

  // Count distribution
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));
  const maxCount = Math.max(...dist.map((d) => d.count), 1);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-ink-1 mb-6">Reviews</h1>

        {/* Rating summary */}
        <div className="bg-background border border-border rounded-xl p-6 mb-6 flex items-center gap-8">
          <div className="text-center">
            <p className="font-display text-4xl font-bold text-ink-1">{avgRating.toFixed(1)}</p>
            <div className="flex gap-0.5 justify-center my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? "fill-warning text-warning" : "text-ink-4"}`} />
              ))}
            </div>
            <p className="text-xs text-ink-3">{ratingData?.totalReviews ?? reviews.length} ratings</p>
          </div>
          <div className="flex-1 space-y-1">
            {dist.map(({ stars, count }) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-xs text-ink-3 w-4">{stars}</span>
                <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full transition-all"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Write review button / form */}
        {user && !hasReviewed && !showForm && (
          <Button className="w-full mb-6" variant="outline" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}

        {showForm && (
          <div className="bg-background border border-border rounded-xl p-4 mb-6 space-y-3">
            <h3 className="text-sm font-semibold text-ink-1">Your Review</h3>
            <StarPicker value={rating} onChange={setRating} />
            <Textarea
              placeholder="Share your thoughts about this book summary..."
              className="min-h-[80px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => submitMutation.mutate()}
                disabled={rating === 0 || !text.trim() || submitMutation.isPending}
              >
                {submitMutation.isPending ? "Submitting…" : "Submit Review"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Review list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <SkeletonReview key={i} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-ink-4 mx-auto mb-3" />
            <p className="font-medium text-ink-1">No reviews yet.</p>
            <p className="text-sm text-ink-3 mt-1">Be the first to review this book!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(reviews as Review[]).map((r) => (
              <div key={r.id} className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {r.name?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-1">{r.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-ink-3 ml-auto">
                    {r.createdAt
                      ? formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })
                      : "—"}
                  </span>
                </div>
                <p className="text-sm text-ink-2 mb-2">{r.text}</p>
                <button
                  className="flex items-center gap-1 text-xs text-ink-3 hover:text-primary transition-colors"
                  onClick={() => helpfulMutation.mutate(r.id)}
                  disabled={helpfulMutation.isPending}
                >
                  <ThumbsUp className="h-3 w-3" />Helpful ({r.helpfulCount})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
