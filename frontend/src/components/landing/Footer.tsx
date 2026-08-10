import { BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">GrowVio</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              Turn any book into a 7-level knowledge pyramid. Learn at your depth, grow at your pace.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="mt-4 space-y-2">
              {["Library", "Knowledge Pyramid", "Pricing", "Workbooks"].map((item) => (
                <li key={item}><a href="#" className="text-sm text-ink-3 transition-colors hover:text-foreground">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-4 space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}><a href="#" className="text-sm text-ink-3 transition-colors hover:text-foreground">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2">
              {["Privacy Policy", "Terms of Service", "Refund Policy"].map((item) => (
                <li key={item}><a href="#" className="text-sm text-ink-3 transition-colors hover:text-foreground">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-ink-3">© 2026 GrowVio. All rights reserved.</p>
          <p className="text-xs text-ink-3">Made with ❤️ for Indian professionals</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
