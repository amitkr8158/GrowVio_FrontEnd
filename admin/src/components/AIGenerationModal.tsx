import { useState } from 'react';
import { X, FileText, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import type { Book } from '../types/book.types';
import {
  generateLevel1,
  generateLevel2,
  generateLevel4,
  generateLevel5,
  generateLevel6,
  generateLevel7,
} from '../services/aiGenerationService';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Snapshot', 2: 'Flashdeck', 3: 'Infosummary',
  4: 'Deep Read', 5: 'Mastery Test', 6: 'Action Plan', 7: 'Quick Recall',
};

type Step = 'config' | 'generating' | 'done' | 'error';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookId: string;
  book: Book;
  activeLevel: number;
}

export function AIGenerationModal({
  isOpen, onClose, onSuccess, bookId, book, activeLevel,
}: Props) {
  const [step, setStep] = useState<Step>('config');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Per-level settings (using James's reduced L5 defaults)
  const [level1Count, setLevel1Count] = useState(10);
  const [level2Count, setLevel2Count] = useState(10);
  const [level4Words, setLevel4Words] = useState(5000);
  const [level5Easy, setLevel5Easy]   = useState(20);
  const [level5Medium, setLevel5Medium] = useState(25);
  const [level5Hard, setLevel5Hard]   = useState(15);
  const [level6Sections, setLevel6Sections] = useState(5);
  const [level7Words, setLevel7Words] = useState(800);

  if (!isOpen) return null;

  const levelName = LEVEL_NAMES[activeLevel] ?? `Level ${activeLevel}`;
  const hasPdf    = !!book.referenceFiles?.summaryPdfUrl;

  // Get level 4 inlineText as pdfText source for all levels
  const level4Content = book.levels?.find((l) => l.level === 4);
  const pdfText = (level4Content?.content as { inlineText?: string } | null)?.inlineText ?? undefined;

  const files = {
    pdfText,
    customNotes: undefined,
  };

  const handleGenerate = async () => {
    setStep('generating');
    try {
      switch (activeLevel) {
        case 1:
          await generateLevel1(bookId, book.title, book.author, level1Count, files);
          break;
        case 2:
          await generateLevel2(bookId, book.title, book.author, level2Count, files);
          break;
        case 4:
          if (!pdfText && !hasPdf) {
            throw new Error('Please upload a reference PDF first for Level 4 generation');
          }
          await generateLevel4(bookId, book.title, book.author, level4Words, files);
          break;
        case 5:
          await generateLevel5(bookId, book.title, book.author, level5Easy, level5Medium, level5Hard, files);
          break;
        case 6:
          await generateLevel6(bookId, book.title, book.author, level6Sections, files);
          break;
        case 7:
          await generateLevel7(bookId, book.title, book.author, level7Words, files);
          break;
        default:
          throw new Error(`AI generation not available for Level ${activeLevel}`);
      }
      setStep('done');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('config');
    setConfirmed(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={step === 'generating' ? undefined : handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Generate with AI</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Level {activeLevel}: {levelName}
            </p>
          </div>
          {step !== 'generating' && (
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* ── CONFIG ── */}
          {step === 'config' && (
            <>
              {/* Source check */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</p>

                <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Reference PDF</span>
                      {hasPdf ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">✓ Available</span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">⚠ Not uploaded</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {hasPdf
                        ? 'AI will use the uploaded reference PDF text'
                        : 'AI will use general knowledge of this book'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Book title + author</span>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">✓ Always included</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{book.title} · {book.author}</p>
                  </div>
                </div>
              </div>

              {/* Per-level settings */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Settings</p>

                {activeLevel === 1 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Number of key points</span>
                      <span className="font-medium text-indigo-600">{level1Count} key points</span>
                    </div>
                    <input type="range" min={8} max={15} step={1} value={level1Count}
                      onChange={(e) => setLevel1Count(Number(e.target.value))}
                      className="w-full accent-indigo-600" />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>8</span><span>15</span>
                    </div>
                  </div>
                )}

                {activeLevel === 2 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Number of flashcards</span>
                      <span className="font-medium text-indigo-600">{level2Count} cards</span>
                    </div>
                    <input type="range" min={8} max={15} step={1} value={level2Count}
                      onChange={(e) => setLevel2Count(Number(e.target.value))}
                      className="w-full accent-indigo-600" />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>8</span><span>15</span>
                    </div>
                  </div>
                )}

                {activeLevel === 4 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Target length</span>
                      <span className="font-medium text-indigo-600">~{Math.round(level4Words / 250)} pages</span>
                    </div>
                    <input type="range" min={3000} max={10000} step={500} value={level4Words}
                      onChange={(e) => setLevel4Words(Number(e.target.value))}
                      className="w-full accent-indigo-600" />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>3,000 words</span><span>10,000 words</span>
                    </div>
                    <p className="text-xs text-gray-400">AI generates structured chapter summaries from the PDF</p>
                    {!hasPdf && (
                      <p className="text-xs text-yellow-600 font-medium">⚠ Upload reference PDF for best Level 4 results</p>
                    )}
                  </div>
                )}

                {activeLevel === 5 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">Questions per difficulty</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Easy', val: level5Easy, set: setLevel5Easy },
                        { label: 'Medium', val: level5Medium, set: setLevel5Medium },
                        { label: 'Hard', val: level5Hard, set: setLevel5Hard },
                      ].map(({ label, val, set }) => (
                        <div key={label} className="space-y-1">
                          <label className="block text-xs text-gray-500 font-medium">{label}</label>
                          <input
                            type="number"
                            min={5} max={50}
                            value={val}
                            onChange={(e) => set(Math.max(5, Math.min(50, Number(e.target.value))))}
                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-center focus:border-indigo-400 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Total: <span className="font-medium">{level5Easy + level5Medium + level5Hard} questions</span>
                    </p>
                  </div>
                )}

                {activeLevel === 6 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Sections per format (Daily/Weekly/Monthly)</span>
                      <span className="font-medium text-indigo-600">{level6Sections} sections each</span>
                    </div>
                    <input type="range" min={3} max={8} step={1} value={level6Sections}
                      onChange={(e) => setLevel6Sections(Number(e.target.value))}
                      className="w-full accent-indigo-600" />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>3</span><span>8</span>
                    </div>
                  </div>
                )}

                {activeLevel === 7 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Target word count</span>
                      <span className="font-medium text-indigo-600">~{level7Words} words</span>
                    </div>
                    <input type="range" min={400} max={1200} step={100} value={level7Words}
                      onChange={(e) => setLevel7Words(Number(e.target.value))}
                      className="w-full accent-indigo-600" />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>400</span><span>1,200</span>
                    </div>
                  </div>
                )}

                {activeLevel === 3 && (
                  <p className="text-sm text-gray-500">
                    Level 3 uses the uploaded infographic image directly — no AI generation needed.
                    Upload an infographic on the Book Detail page.
                  </p>
                )}
              </div>

              {/* Warning */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                ⚠ This will replace the current <strong>DRAFT</strong> for Level {activeLevel}.
                Published content is never overwritten.
              </div>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 accent-indigo-600"
                />
                <span className="text-sm text-gray-700">
                  I understand this replaces the current draft
                </span>
              </label>
            </>
          )}

          {/* ── GENERATING ── */}
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-gray-800">
                  Generating Level {activeLevel}: {levelName}…
                </p>
                <p className="text-xs text-gray-400">This takes 15–30 seconds</p>
              </div>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-gray-900">
                  Level {activeLevel} draft generated!
                </p>
                <p className="text-sm text-gray-500">
                  Review and edit the content before publishing.
                </p>
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-gray-900">Generation failed</p>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-3 flex justify-end gap-2 shrink-0">
          {step === 'config' && (
            <>
              <button
                onClick={handleClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!confirmed || activeLevel === 3}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Generate Draft
              </button>
            </>
          )}

          {step === 'done' && (
            <button
              onClick={() => { onSuccess(); handleClose(); }}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          )}

          {step === 'error' && (
            <>
              <button
                onClick={handleClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => { setStep('config'); setConfirmed(false); }}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
