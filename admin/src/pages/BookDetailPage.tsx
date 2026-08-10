import { useNavigate, useParams } from 'react-router-dom';
import { Edit2, Layers, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { useBook, usePublishBook, useUnpublishBook } from '../hooks/useBooks';
import { FileUploadZone } from '../components/FileUploadZone';
import {
  uploadReferencePdf,
  uploadReferenceInfographic,
  deleteReferencePdf,
  deleteReferenceInfographic,
} from '../services/uploadService';
import type { Level, PlanTier } from '../types/book.types';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Snapshot',
  2: 'Flashdeck',
  3: 'Infosummary',
  4: 'Deep Read',
  5: 'Mastery Test',
  6: 'Action Plan',
  7: 'Quick Recall',
};

const PLAN_BADGE: Record<PlanTier, string> = {
  FREE:    'bg-green-100 text-green-700',
  STARTER: 'bg-blue-100 text-blue-700',
  PREMIUM: 'bg-orange-100 text-orange-700',
  PRO:     'bg-purple-100 text-purple-700',
};

function Skeleton() {
  return (
    <div className="flex gap-6 animate-pulse">
      <div className="flex-[3] space-y-4">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="h-40 rounded-xl bg-gray-200" />
        <div className="h-32 rounded-xl bg-gray-200" />
        <div className="h-32 rounded-xl bg-gray-200" />
      </div>
      <div className="flex-[2] space-y-4">
        <div className="h-8 w-36 rounded-lg bg-gray-200" />
        <div className="h-80 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

export function BookDetailPage() {
  const { bookId }  = useParams<{ bookId: string }>();
  const navigate    = useNavigate();
  const { data: book, isLoading, refetch } = useBook(bookId ?? '');
  const { mutate: publishBook,   isPending: isPublishing }   = usePublishBook();
  const { mutate: unpublishBook, isPending: isUnpublishing } = useUnpublishBook();

  if (isLoading) return <Skeleton />;
  if (!book) {
    return (
      <div className="space-y-3">
        <p className="text-gray-500">Book not found.</p>
        <button onClick={() => navigate('/books')} className="text-sm text-indigo-600 hover:underline">
          ← Back to Books
        </button>
      </div>
    );
  }

  const levels = book.levels ?? [];

  const completedCount = levels.filter((l: Level) => l.status === 'PUBLISHED').length;

  const progressPct   = Math.round((completedCount / 7) * 100);
  const progressColor =
    completedCount === 7 ? 'bg-green-500' :
    completedCount > 0   ? 'bg-amber-400' :
    'bg-gray-300';

  const l1Published = levels.some((l: Level) => l.level === 1 && l.status === 'PUBLISHED');
  const l2Published = levels.some((l: Level) => l.level === 2 && l.status === 'PUBLISHED');
  const canPublish   = l1Published && l2Published;

  const handlePublish = () => {
    if (!bookId) return;
    publishBook(bookId, { onSuccess: () => refetch() });
  };

  const handleUnpublish = () => {
    if (!bookId) return;
    unpublishBook(bookId, { onSuccess: () => refetch() });
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/books')} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Books
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="flex-[3] space-y-4 min-w-0">

          {/* Book info card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex gap-4">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="h-28 w-20 rounded-lg object-cover border border-gray-200 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="h-28 w-20 rounded-lg bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center text-gray-300 text-xs">
                  No cover
                </div>
              )}

              <div className="min-w-0 space-y-1.5">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{book.title}</h1>
                {book.hindiTitle && (
                  <p className="text-sm text-gray-400">{book.hindiTitle}</p>
                )}
                <p className="text-sm text-gray-500">{book.author}</p>

                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                    {book.genre}
                  </span>
                  {book.isPremium && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      Premium
                    </span>
                  )}
                </div>

                {book.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {book.tags.map((t) => (
                      <span key={t} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => navigate(`/books/${bookId}/edit`)}
                className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Metadata
              </button>
              <button
                onClick={() => navigate(`/books/${bookId}/content`)}
                className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                <Layers className="h-3.5 w-3.5" />
                Content Editor
              </button>
            </div>
          </div>

          {/* Reference PDF */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Reference Summary PDF</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Source material for AI content generation and Level 4 Deep Read
              </p>
            </div>
            <FileUploadZone
              accept=".pdf"
              maxSizeMB={50}
              fileType="pdf"
              currentUrl={book.referenceFiles?.summaryPdfUrl}
              currentLabel="Reference PDF"
              uploadFn={(file) => uploadReferencePdf(bookId!, file)}
              onSuccess={() => { void refetch(); }}
              onDelete={() => {
                if (confirm('Remove reference PDF?')) {
                  deleteReferencePdf(bookId!).then(() => { void refetch(); });
                }
              }}
            />
          </div>

          {/* Reference Infographic */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Reference Infographic</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Your 1–2 page visual summary — used as Level 3 source
              </p>
            </div>
            <FileUploadZone
              accept=".png,.jpg,.jpeg"
              maxSizeMB={10}
              fileType="image"
              currentUrl={book.referenceFiles?.infographicUrl}
              currentLabel="Infographic"
              uploadFn={(file) => uploadReferenceInfographic(bookId!, file)}
              onSuccess={() => { void refetch(); }}
              onDelete={() => {
                if (confirm('Remove infographic?')) {
                  deleteReferenceInfographic(bookId!).then(() => { void refetch(); });
                }
              }}
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
        <div className="flex-[2] space-y-4 min-w-0">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Content Progress</h2>

            {/* Overall progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{completedCount} of 7 levels published</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progressColor}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Levels list */}
            <div className="space-y-1">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => {
                const level = levels.find((l: Level) => l.level === n);
                const published = level?.status === 'PUBLISHED';
                const plan = (level?.requiredPlan ?? (n <= 2 ? 'FREE' : 'STARTER')) as PlanTier;

                return (
                  <div
                    key={n}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    {/* Circle */}
                    {published ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                    )}

                    {/* Level info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-800">
                          L{n} — {LEVEL_NAMES[n]}
                        </span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PLAN_BADGE[plan]}`}>
                          {plan}
                        </span>
                      </div>
                    </div>

                    {/* Status + edit */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {published ? 'Published' : 'Draft'}
                      </span>
                      <button
                        onClick={() => navigate(`/books/${bookId}/content?level=${n}`)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Publish book button */}
            <div className="pt-2 border-t border-gray-100">
              {book.publishStatus === 'PUBLISHED' ? (
                <button
                  onClick={handleUnpublish}
                  disabled={isUnpublishing}
                  className="w-full rounded-md bg-amber-500 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
                >
                  {isUnpublishing ? 'Unpublishing…' : 'Unpublish Book'}
                </button>
              ) : (
                <div className="space-y-1.5">
                  <button
                    onClick={handlePublish}
                    disabled={!canPublish || isPublishing}
                    title={!canPublish ? 'Publish Level 1 and Level 2 first' : undefined}
                    className="w-full rounded-md bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPublishing ? 'Publishing…' : 'Publish Book'}
                  </button>
                  {!canPublish && (
                    <p className="text-[11px] text-center text-gray-400">
                      Requires Level 1 and Level 2 to be published first
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
