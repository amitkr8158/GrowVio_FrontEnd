import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { bookService } from "@/services/bookService";
import confetti from "canvas-confetti";

const OnboardingFirstBook = () => {
  const { data: book } = useQuery({
    queryKey: ["books", "popular", "first"],
    queryFn: () => bookService.getPopular().then((r) => Array.isArray(r.data) ? r.data[0] : null),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.4 },
        colors: ["#6C3FC4", "#F59E0B", "#ffffff", "#a78bfa"],
        zIndex: 9999,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const bookSlug = book?.slug || book?.id || "atomic-habits";
  const bookTitle = book?.title || "Atomic Habits";
  const bookAuthor = book?.author || "James Clear";
  const bookCover = book?.coverImageUrl;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center">
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1.5 flex-1 rounded-full bg-primary" />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-5xl mx-auto mb-4 w-fit"
          >
            🌟
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-ink-1 mb-2">You're all set! 🎉</h1>
          <p className="text-ink-3 mb-8">Here's the perfect book to start your journey</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-background border border-border rounded-2xl p-6 mb-6 shadow-lg"
        >
          <div className="w-32 h-44 mx-auto rounded-lg overflow-hidden mb-4 shadow-glow">
            {bookCover ? (
              <img src={bookCover} alt={bookTitle} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
          <h2 className="font-display text-xl font-bold text-ink-1 mb-1">{bookTitle}</h2>
          <p className="text-sm text-ink-3 mb-3">by {bookAuthor}</p>
          <div className="bg-success-light rounded-lg p-3 mb-4">
            <p className="text-sm text-success font-medium flex items-center justify-center gap-1">
              ✨ Recommended to start your GrowVio journey
            </p>
          </div>
          <p className="text-sm text-ink-2 italic">
            "Build good habits, break bad ones, and master the tiny changes that lead to remarkable results."
          </p>
        </motion.div>

        <Button className="w-full h-14 text-lg font-semibold shadow-glow mb-3" asChild>
          <Link to={`/books/${bookSlug}/level/1`}>Start Reading →</Link>
        </Button>
        <Button variant="ghost" className="text-sm text-ink-3" asChild>
          <Link to="/home">Explore all books</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default OnboardingFirstBook;
