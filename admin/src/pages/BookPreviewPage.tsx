import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Edit2, Layers, FileWarning } from 'lucide-react';
import { useBook } from '../hooks/useBooks';
import type { Level } from '../types/book.types';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Snapshot', 2: 'Flashdeck', 3: 'Infosummary',
  4: 'Deep Read', 5: 'Mastery Quiz', 6: 'Action Plan', 7: 'Revision Booklet',
};

function Skeleton() {
  return (
    <div className="flex h-screen">
      <div className="w-52 shrink-0 border-r border-gray-200 bg-white p-3 space-y-2 animate-pulse">
        {[...Array(7)].map((_, i) => <div key={i} className="h-9 rounded-lg bg-gray-100" />)}
      </div>
      <div className="flex-1 p-6">
        <div className="h-[80vh] rounded-xl bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}

function EmptyPdf({ levelName }: { levelName: string }) {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center px-8">
      <FileWarning className="h-8 w-8 text-gray-300" />
      <div>
        <p className="text-sm font-medium text-gray-600">No PDF uploaded yet for {levelName}</p>
        <p className="text-xs text-gray-400 mt-1">Upload one from the Content Editor for this level.</p>
      </div>
    </div>
  );
}

export function BookPreviewPage() {
  const { bookId }               = useParams<{ bookId: string }>();
  const navigate                 = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeLevel = parseInt(searchParams.get('level') ?? '1', 10) || 1;

  const { data: book, isLoading } = useBook(bookId ?? '');

  if (isLoading) return <Skeleton />;

  if (!book) {
    return (
      <div className="space-y-3 p-6">
        <p className="text-gray-500">Book not found.</p>
        <button onClick={() => navigate('/books')} className="text-sm text-indigo-600 hover:underline">
          ← Back to Books
        </button>
      </div>
    );
  }

  const levels = book.levels ?? [];
  const activeLevelData = levels.find((l: Level) => l.level === activeLevel);
  const levelName = LEVEL_NAMES[activeLevel] ?? `Level ${activeLevel}`;
  const content = activeLevelData?.content as { pdfUrl?: string } | null | undefined;
  const pdfUrl = content?.pdfUrl ?? null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 shrink-0">
        <button
          onClick={() => navigate('/books')}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Books
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{book.title}</p>
          <p className="text-xs text-gray-400">Preview — Level {activeLevel} · {levelName}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/books/${bookId}/edit`)}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => navigate(`/books/${bookId}/content?level=${activeLevel}`)}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            Content Editor
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Level nav */}
        <div className="w-52 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => {
            const lv = levels.find((l: Level) => l.level === n);
            const pub = lv?.status === 'PUBLISHED';
            const hasPdf = !!(lv?.content as { pdfUrl?: string } | undefined)?.pdfUrl;
            const active = n === activeLevel;
            return (
              <button
                key={n}
                onClick={() => setSearchParams({ level: n.toString() })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-l-2 ${active ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:bg-gray-50'}`}
              >
                {pub
                  ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  : <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${active ? 'text-indigo-700' : 'text-gray-700'}`}>
                    L{n} {LEVEL_NAMES[n]}
                  </p>
                </div>
                <span className={`h-2 w-2 rounded-full shrink-0 ${hasPdf ? 'bg-indigo-400' : 'bg-gray-200'}`} title={hasPdf ? 'PDF available' : 'No PDF'} />
              </button>
            );
          })}
        </div>

        {/* PDF viewer */}
        <div className="flex-1 overflow-y-auto p-6">
          {pdfUrl ? (
            <div className="space-y-3">
              <iframe
                src={pdfUrl}
                title={`${book.title} — ${levelName} PDF`}
                className="w-full h-[80vh] rounded-xl border border-gray-200"
              />
              <div className="text-center">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                  Open PDF in a new tab &rarr;
                </a>
              </div>
            </div>
          ) : (
            <EmptyPdf levelName={levelName} />
          )}
        </div>
      </div>
    </div>
  );
}
