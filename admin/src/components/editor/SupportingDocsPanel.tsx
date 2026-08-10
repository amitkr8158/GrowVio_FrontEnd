import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Image, File, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { listSupportingDocs } from '../../services/contentService';

interface SupportingDoc {
  documentId: string;
  originalFileName: string;
  fileType: string;
  mimeType: string;
  fileSizeBytes: number;
  r2Url: string | null;
  processingStatus: string;
  isActive: boolean;
  batchId: string | null;
  batchLabel: string | null;
  notes: string | null;
  uploadedAt: string;
  uploadedBy: string;
}

interface Props {
  bookId: string;
  onInsertImage: (r2Url: string, caption: string) => void;
  onInsertPdf: (r2Url: string, fileName: string) => void;
  onInsertText: (text: string) => void;
}

function formatBytes(bytes: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function statusBadge(status: string) {
  const cls =
    status === 'PROCESSED' || status === 'COMPLETED'
      ? 'bg-green-900/50 text-green-400'
      : status === 'FAILED'
      ? 'bg-red-900/50 text-red-400'
      : 'bg-yellow-900/50 text-yellow-400';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{status}</span>;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType?.startsWith('image/')) return <Image className="w-4 h-4 text-blue-400 shrink-0" />;
  if (mimeType === 'application/pdf') return <FileText className="w-4 h-4 text-red-400 shrink-0" />;
  return <File className="w-4 h-4 text-slate-400 shrink-0" />;
}

function DocCard({ doc, onInsertImage, onInsertPdf, onInsertText }: {
  doc: SupportingDoc;
  onInsertImage: Props['onInsertImage'];
  onInsertPdf: Props['onInsertPdf'];
  onInsertText: Props['onInsertText'];
}) {
  const isPdf   = doc.mimeType === 'application/pdf';
  const isImage = doc.mimeType?.startsWith('image/');
  const canAct  = doc.isActive && doc.r2Url;

  return (
    <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-2 space-y-1.5">
      <div className="flex items-start gap-2">
        <FileIcon mimeType={doc.mimeType} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-200 truncate" title={doc.originalFileName}>
            {doc.originalFileName}
          </p>
          <p className="text-[10px] text-slate-500">{formatBytes(doc.fileSizeBytes)}</p>
        </div>
        {statusBadge(doc.processingStatus)}
      </div>

      {doc.notes && (
        <p className="text-[10px] text-slate-600 truncate">{doc.notes}</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-1 pt-0.5">
        {isPdf && canAct && (
          <>
            <button
              onClick={() => onInsertPdf(doc.r2Url!, doc.originalFileName)}
              className="text-[10px] bg-indigo-800/60 hover:bg-indigo-700/60 text-indigo-300 px-2 py-0.5 rounded transition-colors"
            >
              Embed PDF
            </button>
            <a
              href={doc.r2Url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-[10px] text-slate-500 hover:text-slate-300"
            >
              Preview <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </>
        )}
        {isImage && canAct && (
          <>
            <button
              onClick={() => onInsertImage(doc.r2Url!, doc.originalFileName)}
              className="text-[10px] bg-blue-800/60 hover:bg-blue-700/60 text-blue-300 px-2 py-0.5 rounded transition-colors"
            >
              Insert Image
            </button>
            <a
              href={doc.r2Url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-[10px] text-slate-500 hover:text-slate-300"
            >
              Preview <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </>
        )}
        {!isPdf && !isImage && canAct && (
          <button
            onClick={() => onInsertText(doc.r2Url ?? doc.originalFileName)}
            className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-0.5 rounded transition-colors"
          >
            Insert Text
          </button>
        )}
        {!canAct && doc.processingStatus !== 'FAILED' && (
          <span className="text-[10px] text-slate-600 italic">Processing…</span>
        )}
      </div>
    </div>
  );
}

function BatchGroup({ label, docs, onInsertImage, onInsertPdf, onInsertText }: {
  label: string;
  docs: SupportingDoc[];
  onInsertImage: Props['onInsertImage'];
  onInsertPdf: Props['onInsertPdf'];
  onInsertText: Props['onInsertText'];
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 w-full text-left py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {label}
        <span className="ml-auto text-[10px] text-slate-600 font-normal">{docs.length}</span>
      </button>
      {open && (
        <div className="space-y-1.5 pl-1">
          {docs.map((doc) => (
            <DocCard
              key={doc.documentId}
              doc={doc}
              onInsertImage={onInsertImage}
              onInsertPdf={onInsertPdf}
              onInsertText={onInsertText}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SupportingDocsPanel({ bookId, onInsertImage, onInsertPdf, onInsertText }: Props) {
  const { data = [], isLoading, isError } = useQuery<SupportingDoc[]>({
    queryKey: ['supporting-docs', bookId],
    queryFn: () => listSupportingDocs(bookId),
  });

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-12 bg-slate-800 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-xs text-red-400 py-2">Failed to load supporting docs.</p>;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-6 space-y-2">
        <FileText className="w-8 h-8 text-slate-700 mx-auto" />
        <p className="text-xs text-slate-500">No supporting docs.</p>
        <p className="text-xs text-slate-600">Upload from book settings.</p>
        <a
          href={`/books/${bookId}`}
          className="text-xs text-violet-400 hover:text-violet-300 underline"
        >
          Go to book settings →
        </a>
      </div>
    );
  }

  // Group by batchId
  const groups = new Map<string, SupportingDoc[]>();
  for (const doc of data) {
    const key = doc.batchId ?? 'ungrouped';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(doc);
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-slate-600">{data.length} document{data.length !== 1 ? 's' : ''} across {groups.size} batch{groups.size !== 1 ? 'es' : ''}</p>
      {Array.from(groups.entries()).map(([batchId, docs]) => (
        <BatchGroup
          key={batchId}
          label={docs[0].batchLabel ?? docs[0].batchId ?? 'Other'}
          docs={docs}
          onInsertImage={onInsertImage}
          onInsertPdf={onInsertPdf}
          onInsertText={onInsertText}
        />
      ))}
    </div>
  );
}
