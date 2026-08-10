import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import {
  ArrowLeft, Save, Send, RotateCcw, Eye, History,
  Bold, Italic, List, Heading2, Heading3, Link2, ImageIcon,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  ChevronRight, Calendar, X, Lock, FlaskConical,
} from 'lucide-react';
import { AiDraftPanel } from '../components/editor/AiDraftPanel';
import { SupportingDocsPanel } from '../components/editor/SupportingDocsPanel';
import { PreviewRenderer } from '../components/editor/PreviewRenderer';
import { PdfEmbed } from '../components/editor/extensions/PdfEmbed';
import {
  saveDraft,
  publishFinal,
  getPublishedVersion,
  rollbackLevel,
  getVersionStatus,
  acquireEditorLock,
  releaseEditorLock,
  heartbeatEditorLock,
  schedulePublish,
  cancelSchedule,
} from '../services/contentService';
import { useBook } from '../hooks/useBooks';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Snapshot', 2: 'Flashdeck', 3: 'Infosummary',
  4: 'Deep Read', 5: 'Mastery Quiz', 6: 'Action Plan', 7: 'Quick Recall',
};

const ENV_ORDER = ['production', 'preprod', 'staging', 'development'];
const ENV_LABELS: Record<string, string> = {
  production: 'Prod', preprod: 'Preprod', staging: 'Stage', development: 'Dev',
};

type ToastState = { msg: string; type: 'success' | 'error' } | null;

function showToastFn(
  setToast: React.Dispatch<React.SetStateAction<ToastState>>,
  msg: string,
  type: 'success' | 'error' = 'success',
) {
  setToast({ msg, type });
  setTimeout(() => setToast(null), 3000);
}

// ── Version Status Widget ─────────────────────────────────────────────────────

interface EnvVersionInfo {
  activePubVersion?: number;
  syncedAt?: string;
  syncedFrom?: string;
  lockedForTesting?: boolean;
}

function VersionStatusBar({ versionStatus }: { versionStatus: Record<string, EnvVersionInfo> }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-0.5 text-[10px]">
      {ENV_ORDER.map((env) => {
        const info = versionStatus[env];
        if (!info) return null;
        const isOpen = expanded === env;
        return (
          <div key={env} className="relative">
            <button
              onClick={() => setExpanded(isOpen ? null : env)}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                info.lockedForTesting
                  ? 'bg-amber-900/50 text-amber-400'
                  : info.activePubVersion
                  ? 'bg-green-900/40 text-green-400'
                  : 'bg-slate-700 text-slate-500'
              }`}
            >
              {ENV_LABELS[env]}: v{info.activePubVersion ?? '—'}
              {info.lockedForTesting ? ' 🔒' : ''}
            </button>
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-slate-800 border border-slate-700 rounded-lg p-2 w-48 shadow-xl text-[10px] space-y-1">
                <p className="font-semibold text-slate-300">{ENV_LABELS[env]}</p>
                <p className="text-slate-400">v{info.activePubVersion ?? '—'}</p>
                {info.syncedAt && <p className="text-slate-500">{new Date(info.syncedAt).toLocaleString()}</p>}
                {info.syncedFrom && <p className="text-slate-500">From: {info.syncedFrom}</p>}
                {info.lockedForTesting && <p className="text-amber-400">🔒 Locked for testing</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Version History Drawer ────────────────────────────────────────────────────

function VersionHistoryDrawer({
  currentVersion,
  levelNumber,
  onRestore,
  onClose,
}: {
  currentVersion: number;
  levelNumber: number;
  onRestore: (v: number) => void;
  onClose: () => void;
}) {
  const versions = Array.from({ length: currentVersion }, (_, i) => currentVersion - i);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-200">Version History</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {versions.map((v) => (
          <div
            key={v}
            className={`rounded-lg border p-3 space-y-2 ${
              v === currentVersion
                ? 'border-violet-600/50 bg-violet-900/20'
                : 'border-slate-700/50 bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                v{v}
                {v === currentVersion && (
                  <span className="ml-2 text-[10px] text-violet-400 font-normal">(Active)</span>
                )}
              </span>
            </div>
            <div className="flex gap-2">
              {v < currentVersion && (
                <button
                  onClick={() => {
                    if (window.confirm(`Restore Level ${levelNumber} to v${v}?`)) {
                      onRestore(v);
                    }
                  }}
                  className="flex items-center gap-1 text-[10px] bg-amber-800/60 hover:bg-amber-700/60 text-amber-300 px-2 py-1 rounded transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Restore
                </button>
              )}
            </div>
          </div>
        ))}
        {versions.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-8">No published versions yet.</p>
        )}
      </div>
    </div>
  );
}

// ── Schedule Publish Modal ────────────────────────────────────────────────────

function ScheduleModal({
  bookId,
  levelNumber,
  currentStatus,
  onClose,
  onSuccess,
}: {
  bookId: string;
  levelNumber: number;
  currentStatus: string | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [dateTime, setDateTime] = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSchedule() {
    if (!dateTime) return;
    setLoading(true);
    try {
      await schedulePublish(bookId, levelNumber, dateTime + ':00');
      onSuccess(`Scheduled for ${new Date(dateTime).toLocaleString()}`);
      onClose();
    } catch {
      onSuccess('Failed to schedule');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelSchedule(bookId, levelNumber);
      onSuccess('Schedule cancelled');
      onClose();
    } catch {
      onSuccess('Failed to cancel schedule');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-96 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-slate-200">Schedule Publish</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentStatus === 'SCHEDULED' ? (
          <div className="space-y-3">
            <p className="text-xs text-amber-400">A publish is already scheduled for this level.</p>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full bg-red-700/60 hover:bg-red-700 text-white text-xs py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Cancelling…' : 'Cancel Schedule'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Select a future date and time for automatic publishing.</p>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={handleSchedule}
              disabled={loading || !dateTime}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs py-2 rounded-lg transition-colors"
            >
              {loading ? 'Scheduling…' : 'Schedule Publish'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function RichEditorPage() {
  const { bookId = '', levelNumber: levelParam = '1' } = useParams<{
    bookId: string;
    levelNumber: string;
  }>();
  const levelNumber = parseInt(levelParam, 10);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [leftOpen,      setLeftOpen]      = useState(true);
  const [rightOpen,     setRightOpen]     = useState(true);
  const [showPreview,   setShowPreview]   = useState(false);
  const [showHistory,   setShowHistory]   = useState(false);
  const [showSchedule,  setShowSchedule]  = useState(false);
  const [previewBlocks, setPreviewBlocks] = useState<Record<string, unknown> | null>(null);
  const [toast,         setToast]         = useState<ToastState>(null);
  const [lockWarning,      setLockWarning]      = useState<string | null>(null);
  const [schedulingStatus] = useState<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockSessionRef = useRef<string | null>(null);

  const show = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') => showToastFn(setToast, msg, type),
    [],
  );

  const { data: book } = useBook(bookId);

  // ── Editor lock — acquire on mount, heartbeat every 60s, release on unmount ─
  useEffect(() => {
    let sid: string | null = null;

    acquireEditorLock(bookId, levelNumber)
      .then((res) => {
        sid = res.sessionId;
        lockSessionRef.current = res.sessionId;
        setLockWarning(null);
      })
      .catch((err: { response?: { data?: { message?: string } } }) => {
        setLockWarning(err?.response?.data?.message ?? 'Could not acquire editor lock');
      });

    heartbeatRef.current = setInterval(async () => {
      if (!sid) return;
      try {
        await heartbeatEditorLock(bookId, levelNumber, sid);
      } catch {
        // lock expired or lost — stop heartbeat silently
        clearInterval(heartbeatRef.current!);
      }
    }, 60_000);

    function release() {
      if (sid) releaseEditorLock(bookId, levelNumber, sid).catch(() => {});
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    }

    window.addEventListener('beforeunload', release);
    return () => {
      release();
      window.removeEventListener('beforeunload', release);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, levelNumber]);

  const { data: publishedMeta } = useQuery({
    queryKey: ['published-version', bookId, levelNumber],
    queryFn: () => getPublishedVersion(bookId, levelNumber),
  });

  const { data: versionStatus = {} } = useQuery<Record<string, EnvVersionInfo>>({
    queryKey: ['version-status', bookId, levelNumber],
    queryFn: () => getVersionStatus(bookId, levelNumber),
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Highlight,
      PdfEmbed,
    ],
    content: '<p>Start writing here…</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] focus:outline-none p-6',
      },
    },
  });

  // ── Editor insert helpers ─────────────────────────────────────────────────

  const insertText = useCallback((text: string) => {
    editor?.chain().focus().insertContent(`<p>${text}</p>`).run();
  }, [editor]);

  const insertImage = useCallback((src: string, alt: string) => {
    editor?.chain().focus().setImage({ src, alt }).run();
  }, [editor]);

  const insertPdf = useCallback((src: string, fileName: string) => {
    editor?.commands.setPdfEmbed({ src, fileName, caption: fileName });
  }, [editor]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const saveDraftMutation = useMutation({
    mutationFn: () => {
      const html = editor?.getHTML() ?? '';
      const json = editor?.getJSON() ?? {};
      return saveDraft(bookId, levelNumber, { html, json });
    },
    onSuccess: () => show('Draft saved'),
    onError: () => show('Failed to save draft', 'error'),
  });

  const publishMutation = useMutation({
    mutationFn: () => {
      const html = editor?.getHTML() ?? '';
      const json = editor?.getJSON() ?? {};
      return publishFinal(bookId, levelNumber, { html, json });
    },
    onSuccess: () => {
      show('Published successfully');
      qc.invalidateQueries({ queryKey: ['published-version', bookId, levelNumber] });
      qc.invalidateQueries({ queryKey: ['version-status', bookId, levelNumber] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      show(err?.response?.data?.message ?? 'Failed to publish', 'error'),
  });

  const rollbackMutation = useMutation({
    mutationFn: (toVersion: number) => rollbackLevel(bookId, levelNumber, toVersion),
    onSuccess: (_, v) => {
      show(`Rolled back to v${v}`);
      qc.invalidateQueries({ queryKey: ['published-version', bookId, levelNumber] });
      qc.invalidateQueries({ queryKey: ['version-status', bookId, levelNumber] });
      setShowHistory(false);
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      show(err?.response?.data?.message ?? 'Rollback failed', 'error'),
  });

  // ── Preview ───────────────────────────────────────────────────────────────

  function openPreview() {
    const json = editor?.getJSON() ?? null;
    setPreviewBlocks(json as { content?: unknown[] } | null);
    setShowPreview(true);
  }

  const levelName = LEVEL_NAMES[levelNumber] ?? `Level ${levelNumber}`;
  const currentVersion = publishedMeta?.publishedVersion ?? 0;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Lock warning banner */}
      {lockWarning && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/50 border-b border-amber-800 text-amber-300 text-xs shrink-0">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>{lockWarning}. You can view but concurrent edits may conflict.</span>
          <button onClick={() => setLockWarning(null)} className="ml-auto text-amber-500 hover:text-amber-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Schedule modal */}
      {showSchedule && (
        <ScheduleModal
          bookId={bookId}
          levelNumber={levelNumber}
          currentStatus={schedulingStatus}
          onClose={() => setShowSchedule(false)}
          onSuccess={(msg) => show(msg)}
        />
      )}

      {/* Preview overlay */}
      {showPreview && (
        <PreviewRenderer
          blocksJson={previewBlocks}
          levelName={levelName}
          requiredPlan={undefined}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Version history drawer */}
      {showHistory && (
        <VersionHistoryDrawer
          currentVersion={currentVersion}
          levelNumber={levelNumber}
          onRestore={(v) => rollbackMutation.mutate(v)}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 shrink-0 bg-slate-950">
        <button
          onClick={() => navigate(`/books/${bookId}`)}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 truncate">{book?.title ?? bookId} › Level {levelNumber}</p>
          <h1 className="text-sm font-semibold truncate">{levelName} — Rich Editor</h1>
        </div>

        {/* Version status bar */}
        {Object.keys(versionStatus).length > 0 && (
          <div className="hidden lg:flex items-center gap-1 ml-2">
            <VersionStatusBar versionStatus={versionStatus} />
          </div>
        )}

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/books/${bookId}/levels/${levelNumber}/ab-test`)}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">A/B Test</span>
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={() => setShowSchedule(true)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
              schedulingStatus === 'SCHEDULED'
                ? 'bg-amber-800/60 text-amber-300 hover:bg-amber-700/60'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{schedulingStatus === 'SCHEDULED' ? 'Scheduled' : 'Schedule'}</span>
          </button>
          <button
            onClick={openPreview}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={() => saveDraftMutation.mutate()}
            disabled={saveDraftMutation.isPending}
            className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {saveDraftMutation.isPending ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('Publish as live version? Users will see this immediately.')) {
                publishMutation.mutate();
              }
            }}
            disabled={publishMutation.isPending}
            className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {publishMutation.isPending ? 'Publishing…' : 'Publish Final'}
          </button>
        </div>
      </header>

      {/* 3-column body */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — AI Draft panel */}
        <div className={`shrink-0 border-r border-slate-800 bg-slate-900/40 flex flex-col transition-all duration-200 ${leftOpen ? 'w-64' : 'w-10'}`}>
          <div className="flex items-center justify-between px-2 py-2 border-b border-slate-800 shrink-0">
            {leftOpen && <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1">AI Draft</span>}
            <button
              onClick={() => setLeftOpen((v) => !v)}
              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors ml-auto"
              title={leftOpen ? 'Collapse' : 'Expand AI Draft'}
            >
              {leftOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          </div>
          {leftOpen && (
            <div className="flex-1 overflow-y-auto p-3">
              <AiDraftPanel
                bookId={bookId}
                levelNumber={levelNumber}
                onInsertText={insertText}
              />
            </div>
          )}
        </div>

        {/* CENTER — TipTap editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-slate-800 bg-slate-900 shrink-0 flex-wrap">
            {[
              { icon: <Bold className="w-4 h-4" />,    action: () => editor?.chain().focus().toggleBold().run(),                         label: 'Bold' },
              { icon: <Italic className="w-4 h-4" />,  action: () => editor?.chain().focus().toggleItalic().run(),                       label: 'Italic' },
              { icon: <Heading2 className="w-4 h-4" />, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),          label: 'H2' },
              { icon: <Heading3 className="w-4 h-4" />, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),          label: 'H3' },
              { icon: <List className="w-4 h-4" />,    action: () => editor?.chain().focus().toggleBulletList().run(),                    label: 'List' },
            ].map(({ icon, action, label }) => (
              <button key={label} onClick={action} title={label}
                className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors">
                {icon}
              </button>
            ))}
            <div className="w-px h-5 bg-slate-700 mx-1" />
            <button
              onClick={() => { const url = window.prompt('URL:'); if (url) editor?.chain().focus().setLink({ href: url }).run(); }}
              title="Insert Link"
              className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { const url = window.prompt('Image URL:'); if (url) editor?.chain().focus().setImage({ src: url }).run(); }}
              title="Insert Image"
              className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Published version badge */}
            {currentVersion > 0 && (
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500">Live: v{currentVersion}</span>
                {currentVersion > 1 && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-[10px] text-amber-500 hover:text-amber-400 flex items-center gap-0.5"
                  >
                    <RotateCcw className="w-3 h-3" /> Rollback
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-y-auto bg-slate-900">
            <EditorContent editor={editor} className="h-full" />
          </div>
        </div>

        {/* RIGHT — Supporting Docs panel */}
        <div className={`shrink-0 border-l border-slate-800 bg-slate-900/40 flex flex-col transition-all duration-200 ${rightOpen ? 'w-64' : 'w-10'}`}>
          <div className="flex items-center justify-between px-2 py-2 border-b border-slate-800 shrink-0">
            <button
              onClick={() => setRightOpen((v) => !v)}
              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
              title={rightOpen ? 'Collapse' : 'Expand Supporting Docs'}
            >
              {rightOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
            {rightOpen && <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1">Source Docs</span>}
          </div>
          {rightOpen && (
            <div className="flex-1 overflow-y-auto p-3">
              <SupportingDocsPanel
                bookId={bookId}
                onInsertImage={insertImage}
                onInsertPdf={insertPdf}
                onInsertText={insertText}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
