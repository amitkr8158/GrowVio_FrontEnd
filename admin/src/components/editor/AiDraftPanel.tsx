import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ChevronDown, RotateCcw, ClipboardCopy, ArrowRight } from 'lucide-react';
import { getAiDraft } from '../../services/contentService';

interface Props {
  bookId: string;
  levelNumber: number;
  onInsertText: (text: string) => void;
}

interface AiDraftData {
  aiDraftUrl: string | null;
  aiDraftVersion: number | null;
  aiDraftLastGeneratedAt: string | null;
  aiDraftLastGeneratedBy: string | null;
}

interface DraftContent {
  paragraphs: string[];
  rawHtml?: string;
}

function timeAgo(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Skeleton() {
  return (
    <div className="space-y-3 py-2">
      {[60, 85, 70].map((w) => (
        <div key={w} className="animate-pulse">
          <div className="h-3 bg-slate-700 rounded" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

export function AiDraftPanel({ bookId, levelNumber, onInsertText }: Props) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [draftContent, setDraftContent] = useState<DraftContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<AiDraftData>({
    queryKey: ['ai-draft', bookId, levelNumber],
    queryFn: () => getAiDraft(bookId, levelNumber),
  });

  const version = selectedVersion ?? data?.aiDraftVersion ?? null;

  async function loadContent(url: string) {
    setLoadingContent(true);
    setContentError(false);
    setDraftContent(null);
    try {
      const res = await fetch(url);
      const json = await res.json();

      // Extract paragraphs from blocks JSON or fall back to HTML split
      const paragraphs: string[] = [];
      if (json.json?.content) {
        // TipTap JSON format
        for (const node of json.json.content) {
          if (node.type === 'paragraph' || node.type === 'heading') {
            const text = (node.content ?? [])
              .filter((c: { type: string }) => c.type === 'text')
              .map((c: { text: string }) => c.text)
              .join('');
            if (text.trim()) paragraphs.push(text.trim());
          }
        }
      } else if (json.html) {
        // Split HTML by paragraph tags
        const stripped = json.html
          .replace(/<\/?(h[1-6]|p|li|blockquote)[^>]*>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .trim();
        stripped.split(/\n+/).forEach((s: string) => {
          if (s.trim()) paragraphs.push(s.trim());
        });
      } else if (typeof json === 'object') {
        // Fallback: stringify sections
        Object.entries(json).forEach(([k, v]) => {
          if (typeof v === 'string' && v.trim()) paragraphs.push(`${k}: ${v}`);
        });
      }

      setDraftContent({ paragraphs: paragraphs.length ? paragraphs : ['(No readable content in draft)'] });
    } catch {
      setContentError(true);
    } finally {
      setLoadingContent(false);
    }
  }

  function copyParagraph(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }

  // ── Render states ─────────────────────────────────────────────────────────

  if (isLoading) return <Skeleton />;

  if (isError) {
    return (
      <div className="space-y-2 py-2">
        <p className="text-xs text-red-400">Failed to load AI draft.</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
        >
          <RotateCcw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  const hasDraft = !!data?.aiDraftUrl;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200">
            AI Draft{version ? ` v${version}` : ''}
            {data?.aiDraftLastGeneratedAt && (
              <span className="text-slate-500 font-normal ml-1">
                · {timeAgo(data.aiDraftLastGeneratedAt)}
              </span>
            )}
          </span>
        </div>
        {hasDraft && version && (
          <div className="relative">
            <select
              value={version}
              onChange={(e) => setSelectedVersion(Number(e.target.value))}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-0.5 pr-5 appearance-none focus:outline-none"
            >
              {Array.from({ length: version }, (_, i) => i + 1).map((v) => (
                <option key={v} value={v}>v{v}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1 top-1 w-3 h-3 text-slate-500 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Body */}
      {!hasDraft ? (
        <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-4 text-center">
          <p className="text-xs text-slate-500">No AI draft yet.</p>
          <p className="text-xs text-slate-600 mt-0.5">Generate from the Admin panel.</p>
        </div>
      ) : !draftContent ? (
        <div className="space-y-2">
          {data.aiDraftLastGeneratedBy && (
            <p className="text-xs text-slate-500">by {data.aiDraftLastGeneratedBy}</p>
          )}
          {loadingContent ? (
            <Skeleton />
          ) : contentError ? (
            <div className="space-y-1">
              <p className="text-xs text-red-400">Failed to load draft content.</p>
              <button
                onClick={() => data.aiDraftUrl && loadContent(data.aiDraftUrl)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
              >
                <RotateCcw className="w-3 h-3" /> Retry
              </button>
            </div>
          ) : (
            <button
              onClick={() => data.aiDraftUrl && loadContent(data.aiDraftUrl)}
              className="w-full text-xs bg-violet-900/40 hover:bg-violet-900/70 border border-violet-700/40 text-violet-300 px-3 py-2 rounded-lg transition-colors"
            >
              Load AI draft content
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {draftContent.paragraphs.map((para, idx) => (
            <div
              key={idx}
              className="group relative rounded-lg bg-slate-800/60 border border-slate-700/40 px-3 py-2 text-xs text-slate-300 leading-relaxed hover:border-slate-600/60 transition-colors"
            >
              <p className="pr-14 whitespace-pre-wrap">{para}</p>
              <div className="absolute right-2 top-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyParagraph(para, idx)}
                  title="Copy"
                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copiedIdx === idx
                    ? <span className="text-green-400 text-[10px]">✓</span>
                    : <ClipboardCopy className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => onInsertText(para)}
                  title="Insert into editor"
                  className="p-1 rounded bg-violet-700 hover:bg-violet-600 text-white transition-colors"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setDraftContent(null)}
            className="text-xs text-slate-600 hover:text-slate-400 mt-1"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
