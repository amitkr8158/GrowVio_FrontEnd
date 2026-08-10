import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Book } from "@/types";

interface ShareModalProps {
  book: Book;
  open: boolean;
  onClose: () => void;
}

export default function ShareModal({ book, open, onClose }: ShareModalProps) {
  const shareUrl = `${window.location.origin}/books/${book.slug || book.id}`;
  const shareText = `I'm learning from "${book.title}" on GrowVio — 7 levels of deep book mastery!`;

  const options = [
    {
      label: "WhatsApp",
      emoji: "📱",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank"),
    },
    {
      label: "LinkedIn",
      emoji: "💼",
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank"),
    },
    {
      label: "Copy Link",
      emoji: "🔗",
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
        onClose();
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share "{book.title}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-surface-2 transition-colors text-left"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-medium text-ink-1">{opt.label}</span>
            </button>
          ))}
          <button
            onClick={onClose}
            className="w-full p-3 text-sm text-ink-3 hover:text-ink-1 transition-colors"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
