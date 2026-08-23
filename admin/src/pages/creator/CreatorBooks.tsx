import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PenSquare } from "lucide-react";

import { CreatorShell, CreatorPageHeader } from "@/components/creator/CreatorShell";
import { Panel, Progress, StatusPill } from "@/components/creator/primitives";
import { creatorService } from "@/services/creatorService";

function bookStatus(overall: number) {
  if (overall >= 100) return "Published";
  if (overall > 0) return "Draft";
  return "Pending";
}

export default function CreatorBooks() {
  const { data, isLoading } = useQuery({
    queryKey: ["creator-books"],
    queryFn: () => creatorService.listBooks().then((r) => r.data.books),
  });
  const books = data ?? [];

  return (
    <CreatorShell wide>
      <CreatorPageHeader
        eyebrow="Creator Studio"
        title="My Books"
        description="Every book you are authoring, from draft through published, with completeness scores."
      />

      <Panel title="Open a book workspace" action={<span className="text-xs text-ink-3">7 layers per book</span>}>
        {isLoading ? (
          <p className="text-xs text-ink-3">Loading…</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {books.map((book) => (
              <li key={book.id} className="surface-card flex gap-4 p-4">
                <div
                  className="flex h-[92px] w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-hero text-2xl"
                  aria-hidden
                >
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt="" className="size-full rounded-xl object-cover" />
                  ) : (
                    <span>{book.coverEmoji ?? "📖"}</span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-ink-1">{book.title}</h3>
                    <StatusPill status={bookStatus(book.overall)} />
                  </div>
                  <p className="truncate text-xs text-ink-3">{book.author}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={book.overall} className="flex-1" />
                    <span className="text-[11px] text-ink-3">{book.done}/7 layers</span>
                  </div>
                  <div className="mt-3">
                    <Link
                      to={`/creator/books/${book.id}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white transition hover:bg-primary-dark"
                    >
                      <PenSquare className="size-3.5" /> Open workspace
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </CreatorShell>
  );
}
