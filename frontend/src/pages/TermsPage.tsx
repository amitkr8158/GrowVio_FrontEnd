import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const TermsPage = () => (
  <div className="min-h-screen bg-background">
    <header className="border-b border-border px-6 py-4">
      <Link to="/" className="flex items-center gap-2 w-fit">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <BookOpen className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-bold">GrowVio</span>
      </Link>
    </header>
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-ink-1 mb-2">Terms of Service</h1>
      <p className="text-sm text-ink-3 mb-8">Updated April 2026</p>
      <div className="prose text-ink-2">
        <p>
          Welcome to GrowVio. By using our platform, you agree to these terms of service.
          This page is being updated with full legal content before our public launch.
        </p>
        <p className="mt-4">
          For questions, contact us at <a href="mailto:amitkr2027@gmail.com" className="text-primary hover:underline">amitkr2027@gmail.com</a>.
        </p>
      </div>
      <Link to="/signup" className="inline-block mt-8 text-sm text-primary hover:underline">← Back to Sign Up</Link>
    </main>
  </div>
);

export default TermsPage;
