import { Link, useParams } from "react-router-dom";
import { ChevronRight, Star, BookOpen, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const authorBooks = [
  { id: "atomic-habits", title: "Atomic Habits", rating: 4.8, emoji: "🧠" },
  { id: "clear-thinking", title: "Clear Thinking on Goals", rating: 4.5, emoji: "🎯" },
];

const subcategories = ["Habit Building", "Mindset", "Morning Routines", "Motivation", "Goal Setting"];

const AuthorPage = () => {
  const { name } = useParams();

  return (
    <div className="min-h-screen bg-surface-2">
      {/* Hero */}
      <div className="bg-gradient-hero text-white py-16 px-4">
        <div className="max-w-[800px] mx-auto flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-5xl">👤</div>
          <div className="text-center sm:text-left">
            <h1 className="font-display text-3xl font-bold mb-2">James Clear</h1>
            <p className="text-white/70 mb-3">Author, speaker, and expert on habits and decision-making</p>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />2 books</span>
              <span>Read by 5,200 GrowVio users</span>
            </div>
            <Button variant="outline" className="mt-4 text-white border-white/30 hover:bg-white/10">Follow</Button>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-ink-1 mb-4">Books by James Clear</h2>
        <div className="grid grid-cols-2 gap-4">
          {authorBooks.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`} className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[3/4] bg-gradient-card flex items-center justify-center text-5xl">{book.emoji}</div>
              <div className="p-3">
                <h3 className="font-display text-sm font-semibold text-ink-1">{book.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="text-xs text-ink-1">{book.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CategoryPage = () => {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-surface-2">
      <div className="bg-gradient-hero text-white py-12 px-4">
        <div className="max-w-[800px] mx-auto">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
            <Link to="/books" className="hover:text-white">Library</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Self-Help</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Self-Help</h1>
          <p className="text-white/70">Discover books that help you grow personally and professionally</p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 py-6">
        <div className="flex gap-2 flex-wrap mb-6">
          {subcategories.map((sub) => (
            <button key={sub} className="px-3 py-1.5 rounded-full text-xs font-medium bg-background border border-border text-ink-3 hover:bg-primary hover:text-primary-foreground transition-colors">{sub}</button>
          ))}
        </div>
        <p className="text-ink-3 text-center py-12">Browse {slug} books...</p>
      </div>
    </div>
  );
};

export default AuthorPage;
