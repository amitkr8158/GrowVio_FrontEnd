import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FlaskConical, CheckCircle, XCircle } from 'lucide-react';
import { getPublishedVersion, startAbTest, concludeAbTest } from '../services/contentService';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Snapshot', 2: 'Flashdeck', 3: 'Infosummary',
  4: 'Deep Read', 5: 'Mastery Quiz', 6: 'Action Plan', 7: 'Quick Recall',
};

export function AbTestPage() {
  const { bookId = '', levelNumber: lp = '1' } = useParams<{ bookId: string; levelNumber: string }>();
  const levelNumber = parseInt(lp, 10);
  const navigate    = useNavigate();
  const qc          = useQueryClient();

  const [variantBJson, setVariantBJson] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const { data: published } = useQuery({
    queryKey: ['published-version', bookId, levelNumber],
    queryFn:  () => getPublishedVersion(bookId, levelNumber),
  });

  const startMutation = useMutation({
    mutationFn: () => startAbTest(bookId, levelNumber, variantBJson),
    onSuccess: () => {
      showToast('A/B test started');
      qc.invalidateQueries({ queryKey: ['published-version', bookId, levelNumber] });
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      showToast(e?.response?.data?.message ?? 'Failed to start test', false),
  });

  const concludeMutation = useMutation({
    mutationFn: (winner: 'A' | 'B') => concludeAbTest(bookId, levelNumber, winner),
    onSuccess: (_data, winner) => {
      showToast(`Test concluded — winner: Variant ${winner}`);
      qc.invalidateQueries({ queryKey: ['published-version', bookId, levelNumber] });
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      showToast(e?.response?.data?.message ?? 'Failed to conclude test', false),
  });

  const levelName = LEVEL_NAMES[levelNumber] ?? `Level ${levelNumber}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-slate-800">
        <button
          onClick={() => navigate(`/books/${bookId}/editor/${levelNumber}`)}
          className="text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-violet-400" />
          <div>
            <p className="text-[11px] text-slate-500">A/B Testing</p>
            <h1 className="text-sm font-semibold">{levelName} — Level {levelNumber}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Current status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Current State</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] text-slate-500">Published Version</p>
              <p className="font-medium">v{published?.publishedVersion ?? '—'}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Published At</p>
              <p className="font-medium">
                {published?.publishedAt ? new Date(published.publishedAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Start A/B test */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Start A/B Test</h2>
          <p className="text-xs text-slate-500">
            Variant A is the current published content. Paste the Variant B blocks JSON below.
          </p>

          <textarea
            value={variantBJson}
            onChange={(e) => setVariantBJson(e.target.value)}
            placeholder={'{\n  "type": "doc",\n  "content": [...]\n}'}
            className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500 resize-none"
          />

          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending || !variantBJson.trim()}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-lg transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            {startMutation.isPending ? 'Starting…' : 'Start Test'}
          </button>
        </div>

        {/* Conclude */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Conclude Test</h2>
          <p className="text-xs text-slate-500">
            Choose the winning variant. The winner's content becomes the published version.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => concludeMutation.mutate('A')}
              disabled={concludeMutation.isPending}
              className="flex items-center gap-2 bg-green-700/60 hover:bg-green-700 disabled:opacity-50 text-green-200 text-xs px-4 py-2 rounded-lg transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Variant A Wins
            </button>
            <button
              onClick={() => concludeMutation.mutate('B')}
              disabled={concludeMutation.isPending}
              className="flex items-center gap-2 bg-blue-700/60 hover:bg-blue-700 disabled:opacity-50 text-blue-200 text-xs px-4 py-2 rounded-lg transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Variant B Wins
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-4 py-2 rounded-lg transition-colors ml-auto"
            >
              <XCircle className="w-3.5 h-3.5" />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
