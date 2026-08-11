import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bookService } from "@/services/bookService";
import type { Review } from "@/services/socialService";
import type { Book } from "@/types";
import { LEVELS } from "@/constants/levelNames";

interface BookLevelsProps {
  book: Book;
  reviews: Review[];
  canAccessLevel: (level: number) => boolean;
}

function LevelTabContent({ bookId, level, freeSummary }: { bookId: string; level: (typeof LEVELS)[number]; freeSummary?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["book-level", bookId, level.id],
    queryFn: () => bookService.getLevel(bookId, level.id).then((r) => r.data),
    enabled: level.id > 1,
    staleTime: 5 * 60 * 1000,
  });

  const content = level.id === 1 ? freeSummary : data?.data?.content;
  // For now, every level's mock content ships a pre-built PDF (see mocked-data/Book)
  // — show that directly instead of the structured JSON underneath it.
  const pdfUrl: string | null = (typeof content === "object" && content?.pdfUrl) || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="bg-primary-light border border-primary/20 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">🤖</div>
        <h3 className="font-display text-base font-bold text-ink-1 mb-2">
          AI is crafting your {level.emoji} {level.name}...
        </h3>
        <p className="text-sm text-ink-3">Great knowledge takes a moment to distill. Come back soon!</p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-xl p-6">
      <h2 className="font-display text-xl font-bold text-ink-1 mb-4">{level.emoji} {level.name}</h2>
      {pdfUrl ? (
        <div className="space-y-3">
          <iframe
            src={pdfUrl}
            title={`${level.name} PDF`}
            className="w-full h-[75vh] rounded-lg border border-border"
          />
          <div className="text-center">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              Open PDF in a new tab &rarr;
            </a>
          </div>
        </div>
      ) : typeof content === "string" ? (
        <div className="prose max-w-none text-ink-2" style={{ lineHeight: 1.8 }}>
          {content.split("\n\n").map((p: string, i: number) => (
            <p key={i} className="mb-4">{p}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function BookLevels({ book, reviews, canAccessLevel }: BookLevelsProps) {
  return (
    <div>
      <Tabs defaultValue="1" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-background border border-border mb-4">
          {LEVELS.map((l) => {
            const accessible = canAccessLevel(l.id);
            return (
              <TabsTrigger key={l.id} value={l.id.toString()} className="gap-1" disabled={!accessible}>
                {!accessible && <Lock className="h-3 w-3" />}
                {l.emoji} L{l.id}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {LEVELS.map((l) => {
          const accessible = canAccessLevel(l.id);
          return (
            <TabsContent key={l.id} value={l.id.toString()}>
              {accessible ? (
                <LevelTabContent bookId={book.id} level={l} freeSummary={book.freeSummary} />
              ) : (
                <div className="relative bg-background border border-border rounded-xl p-6 overflow-hidden">
                  <div className="filter blur-[4px] pointer-events-none">
                    <h2 className="font-display text-xl font-bold text-ink-1 mb-4">{l.emoji} {l.name}</h2>
                    <p className="text-ink-2">This level provides an in-depth analysis of the core concepts with practical exercises...</p>
                    <p className="text-ink-2 mt-4">Advanced strategies and real-world applications are explored in detail...</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background flex items-end justify-center pb-8">
                    <div className="bg-background border border-border rounded-2xl p-6 shadow-xl text-center max-w-sm mx-4">
                      <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-display text-lg font-bold text-ink-1 mb-2">Unlock {l.emoji} {l.name}</h3>
                      <p className="text-sm text-ink-3 mb-4">Get access to {l.words.toLocaleString()} words of in-depth content</p>
                      <Button className="w-full h-11 shadow-glow" asChild>
                        <Link to="/plans">Upgrade to {l.plan} &rarr;</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink-1 mb-4">
          {reviews.length === 0 ? "No ratings yet. Be the first!" : `Reviews (${reviews.length})`}
        </h2>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-background border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {review.name?.[0] || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-1">{review.name}</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-ink-3 ml-auto">{review.createdAt}</span>
              </div>
              <p className="text-sm text-ink-2">{review.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
