import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Pencil, Layers, Trash2, CheckCircle2, Minus, Eye } from 'lucide-react';
import { useBooks, useDeleteBook } from '../hooks/useBooks';
import type { Book } from '../types/book.types';

const PAGE_SIZE = 20;

function relativeTime(iso: string | null | undefined) {
  if (!iso) return 'Not saved yet';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (!isFinite(days)) return 'Not saved yet';
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function StatusBadge({ status }: { status: Book['publishStatus'] }) {
  const map = {
    PUBLISHED: 'bg-green-100 text-green-700',
    DRAFT:     'bg-yellow-100 text-yellow-700',
    ARCHIVED:  'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

function LevelsProgress({ completed }: { completed: number }) {
  const color =
    completed === 7 ? 'bg-green-500' :
    completed >= 3  ? 'bg-yellow-400' :
    'bg-gray-300';

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700 w-7">{completed}/7</span>
      <div className="h-1.5 w-16 rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(completed / 7) * 100}%` }} />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(9)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-gray-100 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

interface DeleteDialogProps {
  book: Book;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteDialog({ book, onConfirm, onCancel, isDeleting }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Delete "{book.title}"?</h2>
        <p className="mt-2 text-sm text-gray-500">
          This will permanently delete the book and all its content. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {isDeleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BooksListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const { data, isLoading } = useBooks(statusFilter, page);
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();

  const allBooks = data?.books ?? [];
  const total    = data?.total ?? allBooks.length;

  const filtered = search.trim()
    ? allBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase())
      )
    : allBooks;

  const startIdx = page * PAGE_SIZE + 1;
  const endIdx   = Math.min(page * PAGE_SIZE + filtered.length, total);
  const hasNext  = page * PAGE_SIZE + PAGE_SIZE < total;

  const handleDelete = () => {
    if (!deletingBook) return;
    deleteBook(deletingBook.id, {
      onSuccess: () => setDeletingBook(null),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Books</h1>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {total}
          </span>
        </div>
        <button
          onClick={() => navigate('/books/new')}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Book
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by title or author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Genre</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Levels</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">PDF</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Updated</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <p className="text-gray-400 mb-3">No books yet. Add your first book →</p>
                  <button
                    onClick={() => navigate('/books/new')}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add New Book
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map((book, idx) => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{page * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{book.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {book.genre}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={book.publishStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <LevelsProgress completed={book.levelsPublished ?? 0} />
                  </td>
                  <td className="px-4 py-3">
                    {book.hasPdf
                      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                      : <Minus className="h-4 w-4 text-gray-300" />
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {relativeTime(book.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/books/${book.id}/preview`)}
                        title="Preview"
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/books/${book.id}/edit`)}
                        title="Edit"
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/books/${book.id}/content`)}
                        title="Content"
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <Layers className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingBook(book)}
                        title="Delete"
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {startIdx}–{endIdx} of {total} books</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deletingBook && (
        <DeleteDialog
          book={deletingBook}
          onConfirm={handleDelete}
          onCancel={() => setDeletingBook(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
