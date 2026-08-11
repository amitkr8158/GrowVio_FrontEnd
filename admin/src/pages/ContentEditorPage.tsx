import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, GripVertical, Trash2, Plus, CheckCircle2, Circle,
  Zap, ChevronDown, ChevronUp,
} from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { useBook } from '../hooks/useBooks';
import { useLevels, useLevel, useUpdateLevel, usePublishLevel } from '../hooks/useContent';
import { FileUploadZone } from '../components/FileUploadZone';
import { AIGenerationModal } from '../components/AIGenerationModal';
import {
  uploadFlashcardImage,
  uploadLevel3Image,
  uploadLevel4Pdf,
} from '../services/uploadService';
import type {
  KeyPoint, FlashCard, QuizQuestion, WorkbookFormat, WorkbookSection, PlanTier,
} from '../types/book.types';

// ── Constants ────────────────────────────────────────────────────────────────

const LEVEL_NAMES: Record<number, string> = {
  1: 'Snapshot', 2: 'Flashdeck', 3: 'Infosummary',
  4: 'Deep Read', 5: 'Mastery Quiz', 6: 'Action Plan', 7: 'Revision Booklet',
};

const PLAN_OPTIONS: PlanTier[] = ['FREE', 'STARTER', 'PREMIUM', 'PRO'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function newKeyPoint(order: number): KeyPoint {
  return { order, heading: '', description: '' };
}
function newCard(order: number): FlashCard {
  return { order, title: '', body: '', imageUrl: '' };
}
function newQuestion(order: number, difficulty: QuizQuestion['difficulty']): QuizQuestion {
  return {
    id: crypto.randomUUID(),
    order,
    difficulty,
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  };
}
function newSection(): WorkbookSection {
  return { title: '', prompt: '', placeholder: '' };
}
function emptyWorkbook(): WorkbookFormat {
  return { title: '', sections: [] };
}

// ── Tiny toast ────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg text-white transition-all ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse p-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-gray-200" />
      ))}
    </div>
  );
}

// ── Level 1: Snapshot ─────────────────────────────────────────────────────────

function Level1Editor({
  content, onChange,
}: {
  content: unknown;
  onChange: (c: unknown) => void;
}) {
  const raw = (content as { keyPoints?: KeyPoint[] } | null);
  const [points, setPoints] = useState<KeyPoint[]>(
    raw?.keyPoints?.length ? raw.keyPoints : [newKeyPoint(1)]
  );

  const update = useCallback((pts: KeyPoint[]) => {
    setPoints(pts);
    onChange({ keyPoints: pts });
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">10 Key Points</h2>
        <p className="text-xs text-gray-400 mt-0.5">Each key point should be a distinct insight. Heading: max 80 chars.</p>
      </div>

      <div className="space-y-3">
        {points.map((pt, idx) => (
          <div key={idx} className="flex gap-2 rounded-lg border border-gray-200 bg-white p-3">
            <GripVertical className="h-4 w-4 text-gray-300 mt-2 shrink-0" />
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0 mt-1.5">{idx + 1}</div>
            <div className="flex-1 space-y-2">
              <input
                value={pt.heading}
                onChange={(e) => {
                  const next = points.map((p, i) => i === idx ? { ...p, heading: e.target.value } : p);
                  update(next);
                }}
                maxLength={80}
                placeholder="Key insight title..."
                className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              />
              <textarea
                value={pt.description}
                onChange={(e) => {
                  const next = points.map((p, i) => i === idx ? { ...p, description: e.target.value } : p);
                  update(next);
                }}
                maxLength={200}
                rows={2}
                placeholder="Explain this insight in 2-3 sentences..."
                className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm resize-none focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <button
              onClick={() => update(points.filter((_, i) => i !== idx).map((p, i) => ({ ...p, order: i + 1 })))}
              disabled={points.length === 1}
              className="text-gray-300 hover:text-red-400 disabled:opacity-30 mt-1.5 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => update([...points, newKeyPoint(points.length + 1)])}
        disabled={points.length >= 15}
        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
      >
        <Plus className="h-4 w-4" /> Add Key Point
      </button>
    </div>
  );
}

// ── Level 2: Flashdeck ────────────────────────────────────────────────────────

function Level2Editor({
  content, onChange, bookId,
}: {
  content: unknown;
  onChange: (c: unknown) => void;
  bookId: string;
}) {
  const raw = (content as { cards?: FlashCard[] } | null);
  const [cards, setCards] = useState<FlashCard[]>(
    raw?.cards?.length ? raw.cards : [newCard(1)]
  );
  const [uploadingCard, setUploadingCard] = useState<number | null>(null);

  const update = useCallback((cs: FlashCard[]) => {
    setCards(cs);
    onChange({ cards: cs });
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Flashcards</h2>
        <p className="text-xs text-gray-400 mt-0.5">8–15 cards. Each card = one key concept.</p>
      </div>

      <div className="space-y-4">
        {cards.map((card, idx) => (
          <div key={idx} className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">{idx + 1}</span>
                <span className="text-sm font-medium text-gray-600">Card {idx + 1}</span>
              </div>
              <button
                onClick={() => update(cards.filter((_, i) => i !== idx).map((c, i) => ({ ...c, order: i + 1 })))}
                disabled={cards.length === 1}
                className="text-gray-300 hover:text-red-400 disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 space-y-2">
              <input
                value={card.title}
                onChange={(e) => update(cards.map((c, i) => i === idx ? { ...c, title: e.target.value } : c))}
                maxLength={100}
                placeholder="Concept name..."
                className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
              />
              <textarea
                value={card.body}
                onChange={(e) => update(cards.map((c, i) => i === idx ? { ...c, body: e.target.value } : c))}
                maxLength={400}
                rows={3}
                placeholder="Clear explanation in 3–5 sentences..."
                className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm resize-none focus:border-indigo-400 focus:outline-none"
              />

              {/* Card image */}
              {card.imageUrl ? (
                <div className="flex items-center gap-3">
                  <img src={card.imageUrl} className="h-20 w-28 rounded object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="flex gap-2">
                    <button onClick={() => setUploadingCard(idx)} className="text-xs text-indigo-600 hover:underline">Replace</button>
                    <button onClick={() => update(cards.map((c, i) => i === idx ? { ...c, imageUrl: '' } : c))} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                </div>
              ) : uploadingCard === idx ? (
                <FileUploadZone
                  accept=".png,.jpg,.jpeg"
                  maxSizeMB={5}
                  fileType="image"
                  uploadFn={(file) => uploadFlashcardImage(bookId, card.order, file)}
                  onSuccess={(url) => {
                    update(cards.map((c, i) => i === idx ? { ...c, imageUrl: url } : c));
                    setUploadingCard(null);
                  }}
                />
              ) : (
                <button onClick={() => setUploadingCard(idx)} className="text-xs text-gray-400 hover:text-indigo-600 border border-dashed border-gray-300 rounded px-2 py-1">
                  + Upload Card Image (optional)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => update([...cards, newCard(cards.length + 1)])}
        disabled={cards.length >= 15}
        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
      >
        <Plus className="h-4 w-4" /> Add Card
      </button>
    </div>
  );
}

// ── Level 3: Infosummary ──────────────────────────────────────────────────────

function Level3Editor({
  content, onChange, bookId, referenceInfographicUrl, referenceInfographicKey, onSaveShortcut,
}: {
  content: unknown;
  onChange: (c: unknown) => void;
  bookId: string;
  referenceInfographicUrl?: string;
  referenceInfographicKey?: string;
  onSaveShortcut: (c: unknown) => void;
}) {
  const raw = content as { imageUrl?: string; imageKey?: string; altText?: string } | null;
  const [imageUrl, setImageUrl] = useState(raw?.imageUrl ?? '');
  const [imageKey, setImageKey] = useState(raw?.imageKey ?? '');
  const [altText, setAltText]   = useState(raw?.altText ?? '');

  const emit = (u: string, k: string, a: string) => onChange({ imageUrl: u, imageKey: k, altText: a });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Visual Infographic</h2>
      </div>

      {referenceInfographicUrl && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-2">
          <button
            onClick={() => {
              const c = { imageUrl: referenceInfographicUrl, imageKey: referenceInfographicKey ?? '', altText: 'Book infographic' };
              setImageUrl(c.imageUrl); setImageKey(c.imageKey); setAltText(c.altText);
              onSaveShortcut(c);
            }}
            className="flex items-center gap-2 rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Zap className="h-4 w-4" /> Use Reference Infographic
          </button>
          <p className="text-xs text-indigo-500">Copy from your uploaded reference infographic</p>
        </div>
      )}

      <FileUploadZone
        accept=".png,.jpg,.jpeg"
        maxSizeMB={20}
        fileType="image"
        currentUrl={imageUrl || undefined}
        uploadFn={(file) => uploadLevel3Image(bookId, file)}
        onSuccess={(url) => { setImageUrl(url); emit(url, imageKey, altText); }}
        onDelete={() => { setImageUrl(''); setImageKey(''); emit('', '', altText); }}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Alt text (accessibility)</label>
        <input
          value={altText}
          onChange={(e) => { setAltText(e.target.value); emit(imageUrl, imageKey, e.target.value); }}
          maxLength={200}
          placeholder="Describe the infographic for screen readers..."
          className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

// ── Level 4: Deep Read ────────────────────────────────────────────────────────

function Level4Editor({
  content, onChange, bookId, referenceFileUrl, referenceFileKey, onSaveShortcut,
}: {
  content: unknown;
  onChange: (c: unknown) => void;
  bookId: string;
  referenceFileUrl?: string;
  referenceFileKey?: string;
  onSaveShortcut: (c: unknown) => void;
}) {
  const raw = content as { pdfUrl?: string; pdfKey?: string; pageCount?: number; inlineText?: string } | null;
  const [pdfUrl, setPdfUrl]       = useState(raw?.pdfUrl ?? '');
  const [pdfKey, setPdfKey]       = useState(raw?.pdfKey ?? '');
  const [pageCount, setPageCount] = useState(raw?.pageCount ?? 0);
  const [inlineText, setInlineText] = useState(raw?.inlineText ?? '');
  const [showAll, setShowAll]     = useState(false);
  const [editingText, setEditingText] = useState(false);

  const emit = (u: string, k: string, p: number, t: string) =>
    onChange({ pdfUrl: u, pdfKey: k, pageCount: p, inlineText: t });

  const wordCount = inlineText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">20-Page Deep Summary</h2>
      </div>

      {referenceFileUrl && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-2">
          <button
            onClick={() => {
              const c = { pdfUrl: referenceFileUrl, pdfKey: referenceFileKey ?? '', pageCount: 0, inlineText: '' };
              setPdfUrl(c.pdfUrl); setPdfKey(c.pdfKey);
              onSaveShortcut(c);
            }}
            className="flex items-center gap-2 rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Zap className="h-4 w-4" /> Use Reference PDF
          </button>
          <p className="text-xs text-indigo-500">Set the reference PDF as Level 4 content</p>
        </div>
      )}

      <FileUploadZone
        accept=".pdf"
        maxSizeMB={50}
        fileType="pdf"
        currentUrl={pdfUrl || undefined}
        currentLabel={pdfUrl ? `${pageCount > 0 ? pageCount + ' pages' : 'PDF uploaded'}` : undefined}
        uploadFn={async (file) => {
          const data = await uploadLevel4Pdf(bookId, file);
          setPdfKey(data.pdfKey);
          setPageCount(data.pageCount ?? 0);
          setInlineText(data.inlineText ?? '');
          emit(data.pdfUrl, data.pdfKey, data.pageCount ?? 0, data.inlineText ?? '');
          return { url: data.pdfUrl };
        }}
        onSuccess={(url) => { setPdfUrl(url); }}
        onDelete={() => { setPdfUrl(''); setPdfKey(''); setPageCount(0); setInlineText(''); emit('', '', 0, ''); }}
      />

      {inlineText && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Extracted Text Preview</h3>
            <span className="text-xs text-gray-400">{wordCount} words</span>
          </div>

          {editingText ? (
            <textarea
              value={inlineText}
              onChange={(e) => { setInlineText(e.target.value); emit(pdfUrl, pdfKey, pageCount, e.target.value); }}
              rows={12}
              className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs font-mono resize-y focus:border-indigo-400 focus:outline-none"
            />
          ) : (
            <div
              className="text-xs text-gray-600 overflow-y-auto"
              style={{ maxHeight: showAll ? 400 : undefined }}
            >
              <p className="whitespace-pre-wrap break-words">
                {showAll ? inlineText : inlineText.slice(0, 300) + (inlineText.length > 300 ? '...' : '')}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            {!editingText && inlineText.length > 300 && (
              <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                {showAll ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show all</>}
              </button>
            )}
            <button onClick={() => setEditingText(!editingText)} className="text-xs text-gray-500 hover:text-indigo-600 hover:underline">
              {editingText ? 'Done editing' : 'Edit inline text'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Level 5: Mastery Test ─────────────────────────────────────────────────────

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

function Level5Editor({
  content, onChange,
}: {
  content: unknown;
  onChange: (c: unknown) => void;
}) {
  const raw = content as { questions?: QuizQuestion[] } | null;
  const [questions, setQuestions] = useState<QuizQuestion[]>(raw?.questions ?? []);
  const [activeTab, setActiveTab] = useState<Difficulty>('EASY');

  const update = useCallback((qs: QuizQuestion[]) => {
    setQuestions(qs);
    onChange({
      totalQuestions: qs.length,
      easyCount:   qs.filter((q) => q.difficulty === 'EASY').length,
      mediumCount: qs.filter((q) => q.difficulty === 'MEDIUM').length,
      hardCount:   qs.filter((q) => q.difficulty === 'HARD').length,
      questions: qs,
    });
  }, [onChange]);

  const filtered = questions.filter((q) => q.difficulty === activeTab);
  const easyCount   = questions.filter((q) => q.difficulty === 'EASY').length;
  const mediumCount = questions.filter((q) => q.difficulty === 'MEDIUM').length;
  const hardCount   = questions.filter((q) => q.difficulty === 'HARD').length;

  const diffBadge: Record<Difficulty, string> = {
    EASY:   'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HARD:   'bg-red-100 text-red-700',
  };

  const tabTarget: Record<Difficulty, number> = { EASY: 40, MEDIUM: 50, HARD: 30 };
  const tabCount: Record<Difficulty, number>  = { EASY: easyCount, MEDIUM: mediumCount, HARD: hardCount };

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
        {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
          <span key={d} className="text-xs">
            <span className="font-medium text-gray-700">{d.charAt(0) + d.slice(1).toLowerCase()}: </span>
            <span className={tabCount[d] >= tabTarget[d] ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
              {tabCount[d]}
            </span>
            <span className="text-gray-400">/{tabTarget[d]}</span>
          </span>
        ))}
        <span className="text-xs text-gray-400 ml-auto">Total: {questions.length}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => setActiveTab(d)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors ${activeTab === d ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {d.charAt(0) + d.slice(1).toLowerCase()}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${diffBadge[d]}`}>{tabCount[d]}</span>
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {filtered.map((q) => {
          const qIdx = questions.findIndex((x) => x.id === q.id);
          const updateQ = (patch: Partial<QuizQuestion>) =>
            update(questions.map((x, i) => i === qIdx ? { ...x, ...patch } : x));

          return (
            <div key={q.id} className="rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${diffBadge[q.difficulty]}`}>Q{q.order}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${diffBadge[q.difficulty]}`}>{q.difficulty}</span>
                </div>
                <button onClick={() => update(questions.filter((_, i) => i !== qIdx).map((x, i) => ({ ...x, order: i + 1 })))} className="text-gray-300 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3 space-y-3">
                <textarea
                  value={q.question}
                  onChange={(e) => updateQ({ question: e.target.value })}
                  rows={2}
                  placeholder="Enter your question..."
                  className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm resize-none focus:border-indigo-400 focus:outline-none"
                />

                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center gap-2 rounded border px-2.5 py-1.5 cursor-pointer transition-colors ${q.correctAnswer === oi ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        checked={q.correctAnswer === oi}
                        onChange={() => updateQ({ correctAnswer: oi })}
                        className="text-green-600"
                      />
                      <span className="text-xs font-bold text-gray-500 w-4">{String.fromCharCode(65 + oi)}</span>
                      <input
                        value={opt}
                        onChange={(e) => {
                          const opts = [...q.options];
                          opts[oi] = e.target.value;
                          updateQ({ options: opts });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      />
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Explanation (shown after answer)</label>
                  <textarea
                    value={q.explanation}
                    onChange={(e) => updateQ({ explanation: e.target.value })}
                    rows={2}
                    placeholder="Why is this the correct answer?"
                    className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm resize-none focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          const newQ = newQuestion(questions.length + 1, activeTab);
          update([...questions, newQ]);
        }}
        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800"
      >
        <Plus className="h-4 w-4" /> Add Question
      </button>
    </div>
  );
}

// ── Level 6: Action Plan ──────────────────────────────────────────────────────

type PeriodTab = 'daily' | 'weekly' | 'monthly';

function Level6Editor({
  content, onChange,
}: {
  content: unknown;
  onChange: (c: unknown) => void;
}) {
  const raw = content as { daily?: WorkbookFormat; weekly?: WorkbookFormat; monthly?: WorkbookFormat } | null;
  const [daily,   setDaily]   = useState<WorkbookFormat>(raw?.daily   ?? emptyWorkbook());
  const [weekly,  setWeekly]  = useState<WorkbookFormat>(raw?.weekly  ?? emptyWorkbook());
  const [monthly, setMonthly] = useState<WorkbookFormat>(raw?.monthly ?? emptyWorkbook());
  const [tab, setTab] = useState<PeriodTab>('daily');

  const emit = (d: WorkbookFormat, w: WorkbookFormat, m: WorkbookFormat) =>
    onChange({ daily: d, weekly: w, monthly: m });

  const getSet = (t: PeriodTab): [WorkbookFormat, (f: WorkbookFormat) => void] => {
    if (t === 'daily')   return [daily,   (f) => { setDaily(f);   emit(f, weekly, monthly); }];
    if (t === 'weekly')  return [weekly,  (f) => { setWeekly(f);  emit(daily, f, monthly);  }];
    return                      [monthly, (f) => { setMonthly(f); emit(daily, weekly, f);   }];
  };

  const [fmt, setFmt] = getSet(tab);

  const updateSection = (idx: number, patch: Partial<WorkbookSection>) => {
    const sections = fmt.sections.map((s, i) => i === idx ? { ...s, ...patch } : s);
    setFmt({ ...fmt, sections });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Action Plan Workbook</h2>

      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {(['daily', 'weekly', 'monthly'] as PeriodTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Format title</label>
          <input
            value={fmt.title}
            onChange={(e) => setFmt({ ...fmt, title: e.target.value })}
            placeholder={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Habit Tracker`}
            className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>

        {fmt.sections.map((sec, idx) => (
          <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Section {idx + 1}</span>
              <button onClick={() => setFmt({ ...fmt, sections: fmt.sections.filter((_, i) => i !== idx) })} className="text-gray-300 hover:text-red-400">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <input value={sec.title} onChange={(e) => updateSection(idx, { title: e.target.value })} placeholder="Section name" className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none" />
            <textarea value={sec.prompt} onChange={(e) => updateSection(idx, { prompt: e.target.value })} rows={2} placeholder="What question to ask the user?" className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm resize-none focus:border-indigo-400 focus:outline-none" />
            <input value={sec.placeholder ?? ''} onChange={(e) => updateSection(idx, { placeholder: e.target.value })} placeholder="Hint text for the answer field" className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none" />
          </div>
        ))}

        <button onClick={() => setFmt({ ...fmt, sections: [...fmt.sections, newSection()] })} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800">
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>
    </div>
  );
}

// ── Level 7: Quick Recall ─────────────────────────────────────────────────────

function Level7Editor({
  content, onChange,
}: {
  content: unknown;
  onChange: (c: unknown) => void;
}) {
  const raw = content as { richText?: string; wordCount?: number } | null;
  const [richText, setRichText]   = useState(raw?.richText ?? '');
  const [wordCount, setWordCount] = useState(raw?.wordCount ?? 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Revision Booklet</h2>
        <p className="text-xs text-gray-400 mt-0.5">Write in markdown. Min 200 words for publishing.</p>
      </div>

      <div className={`text-sm font-medium ${wordCount >= 200 ? 'text-green-600' : 'text-red-500'}`}>
        {wordCount} words · ~{Math.ceil(wordCount / 200)} min read
      </div>

      <div data-color-mode="light">
        <MDEditor
          value={richText}
          onChange={(val) => {
            const text = val ?? '';
            const wc   = text.trim().split(/\s+/).filter(Boolean).length;
            setRichText(text);
            setWordCount(wc);
            onChange({ richText: text, wordCount: wc });
          }}
          height={500}
          preview="live"
        />
      </div>
    </div>
  );
}

// ── Main ContentEditorPage ────────────────────────────────────────────────────

export function ContentEditorPage() {
  const { bookId }               = useParams<{ bookId: string }>();
  const navigate                 = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeLevel = parseInt(searchParams.get('level') ?? '1', 10) || 1;

  const { data: book, refetch }         = useBook(bookId ?? '');
  const { data: levels }                = useLevels(bookId ?? '');
  const { data: levelData, isLoading }  = useLevel(bookId ?? '', activeLevel);

  const { mutateAsync: updateLevel, isPending: isSaving }   = useUpdateLevel(bookId ?? '', activeLevel);
  const { mutateAsync: publishLevelMut, isPending: isPub }  = usePublishLevel(bookId ?? '', activeLevel);

  const [localContent, setLocalContent] = useState<unknown>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('FREE');
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [savedAt, setSavedAt]           = useState('');
  const [publishError, setPublishError] = useState('');
  const [showAIModal, setShowAIModal]   = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Re-init local content when level changes
  useEffect(() => {
    if (levelData) {
      setLocalContent(levelData.content ?? null);
      setSelectedPlan((levelData.requiredPlan as PlanTier) ?? 'FREE');
    }
    setPublishError('');
  }, [levelData, activeLevel]);

  // Autosave debounce (30s idle)
  const handleContentChange = useCallback((c: unknown) => {
    setLocalContent(c);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await updateLevel({ content: c, status: 'DRAFT', requiredPlan: selectedPlan });
        setSavedAt(new Date().toLocaleTimeString());
      } catch {
        // silent autosave fail — user can still manually save
      }
    }, 30_000);
  }, [updateLevel, selectedPlan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleSaveDraft = async () => {
    try {
      await updateLevel({ content: localContent, status: 'DRAFT', requiredPlan: selectedPlan });
      setSavedAt(new Date().toLocaleTimeString());
      showToast('Draft saved');
    } catch {
      showToast('Save failed', 'error');
    }
  };

  const validate = (): string | null => {
    const c = localContent as Record<string, unknown> | null;
    switch (activeLevel) {
      case 1: {
        const pts = (c?.keyPoints as KeyPoint[]) ?? [];
        if (pts.length < 5) return 'Add at least 5 key points';
        if (pts.some((p) => !p.heading.trim() || !p.description.trim())) return 'All key points need a heading and description';
        return null;
      }
      case 2: {
        const cards = (c?.cards as FlashCard[]) ?? [];
        if (cards.length < 5) return 'Add at least 5 cards';
        if (cards.some((card) => !card.title.trim() || !card.body.trim())) return 'All cards need a title and body';
        return null;
      }
      case 3: return (c?.imageUrl as string) ? null : 'Upload an infographic image first';
      case 4: return (c?.pdfUrl as string) ? null : 'Upload a PDF first';
      case 5: {
        const qs = (c?.questions as QuizQuestion[]) ?? [];
        if (qs.length < 50) return `Add at least 50 questions (currently ${qs.length})`;
        return null;
      }
      case 6: {
        const daily   = c?.daily   as WorkbookFormat | undefined;
        const weekly  = c?.weekly  as WorkbookFormat | undefined;
        const monthly = c?.monthly as WorkbookFormat | undefined;
        if (!daily?.sections?.length || !weekly?.sections?.length || !monthly?.sections?.length)
          return 'Daily, Weekly, and Monthly formats each need at least 1 section';
        return null;
      }
      case 7: {
        const wc = (c?.wordCount as number) ?? 0;
        if (wc < 200) return `Need at least 200 words (currently ${wc})`;
        return null;
      }
      default: return null;
    }
  };

  const handlePublish = async () => {
    setPublishError('');
    const err = validate();
    if (err) { setPublishError(err); return; }

    try {
      await updateLevel({ content: localContent, status: 'DRAFT', requiredPlan: selectedPlan });
      await publishLevelMut();
      showToast(`Level ${activeLevel} published!`);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg ?? 'Publish failed', 'error');
    }
  };

  const levelStatus = levelData?.status ?? 'DRAFT';
  const levelName   = LEVEL_NAMES[activeLevel] ?? `Level ${activeLevel}`;

  const levelsArr = (levels as { bookId: string; levels: { level: number; status: string }[] } | null)?.levels ?? [];

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 shrink-0">
        <button
          onClick={() => navigate(`/books/${bookId}`)}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {book?.title ?? 'Back'}
        </button>

        <span className="text-sm font-semibold text-gray-800">
          Level {activeLevel} — {levelName}
        </span>

        <div className="flex items-center gap-2">
          {/* AI Generation */}
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            ✨ Generate with AI
          </button>

          {/* Plan selector */}
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value as PlanTier)}
            className="rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-indigo-400"
          >
            {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Status badge */}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${levelStatus === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {levelStatus}
          </span>

          {savedAt && <span className="text-xs text-gray-400">Saved {savedAt}</span>}

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving…' : 'Save Draft'}
          </button>

          <button
            onClick={handlePublish}
            disabled={isPub}
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isPub ? 'Publishing…' : 'Publish Level'}
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-52 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => {
            const lv   = levelsArr.find((l) => l.level === n);
            const pub  = lv?.status === 'PUBLISHED';
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
                <span className={`h-2 w-2 rounded-full shrink-0 ${pub ? 'bg-green-400' : 'bg-yellow-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-y-auto p-6">
          {publishError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              Cannot publish: {publishError}
            </div>
          )}

          {isLoading ? (
            <Skeleton />
          ) : (
            <>
              {activeLevel === 1 && (
                <Level1Editor
                  content={localContent}
                  onChange={handleContentChange}
                />
              )}
              {activeLevel === 2 && (
                <Level2Editor
                  content={localContent}
                  onChange={handleContentChange}
                  bookId={bookId ?? ''}
                />
              )}
              {activeLevel === 3 && (
                <Level3Editor
                  content={localContent}
                  onChange={handleContentChange}
                  bookId={bookId ?? ''}
                  referenceInfographicUrl={book?.referenceFiles?.infographicUrl}
                  referenceInfographicKey={book?.referenceFiles?.infographicKey}
                  onSaveShortcut={async (c) => {
                    try {
                      await updateLevel({ content: c, status: 'DRAFT', requiredPlan: selectedPlan });
                      setLocalContent(c);
                      setSavedAt(new Date().toLocaleTimeString());
                      showToast('Reference infographic set for Level 3');
                    } catch { showToast('Save failed', 'error'); }
                  }}
                />
              )}
              {activeLevel === 4 && (
                <Level4Editor
                  content={localContent}
                  onChange={handleContentChange}
                  bookId={bookId ?? ''}
                  referenceFileUrl={book?.referenceFiles?.summaryPdfUrl}
                  referenceFileKey={book?.referenceFiles?.summaryPdfKey}
                  onSaveShortcut={async (c) => {
                    try {
                      await updateLevel({ content: c, status: 'DRAFT', requiredPlan: selectedPlan });
                      setLocalContent(c);
                      setSavedAt(new Date().toLocaleTimeString());
                      showToast('Reference PDF set for Level 4');
                    } catch { showToast('Save failed', 'error'); }
                  }}
                />
              )}
              {activeLevel === 5 && (
                <Level5Editor
                  content={localContent}
                  onChange={handleContentChange}
                />
              )}
              {activeLevel === 6 && (
                <Level6Editor
                  content={localContent}
                  onChange={handleContentChange}
                />
              )}
              {activeLevel === 7 && (
                <Level7Editor
                  content={localContent}
                  onChange={handleContentChange}
                />
              )}
            </>
          )}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {showAIModal && book && (
        <AIGenerationModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onSuccess={() => {
            setShowAIModal(false);
            void refetch();
          }}
          bookId={bookId ?? ''}
          book={book}
          activeLevel={activeLevel}
        />
      )}
    </div>
  );
}
