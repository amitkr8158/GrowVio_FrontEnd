import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertCircle, Eye, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

type UploadState = 'EMPTY' | 'UPLOADING' | 'SUCCESS' | 'ERROR';

interface FileUploadZoneProps {
  accept: string;               // e.g. '.pdf' or '.png,.jpg,.jpeg'
  maxSizeMB: number;
  uploadFn: (file: File) => Promise<{ url: string }>;
  onSuccess: (url: string) => void;
  onDelete?: () => void;
  currentUrl?: string;
  currentLabel?: string;
  fileType: 'pdf' | 'image';
  disabled?: boolean;
}

function buildAcceptMap(accept: string): Record<string, string[]> {
  // Convert '.pdf' or '.png,.jpg' to dropzone's accept map
  const extToMime: Record<string, string> = {
    '.pdf':  'application/pdf',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.webp': 'image/webp',
  };
  const map: Record<string, string[]> = {};
  accept.split(',').map((e) => e.trim()).forEach((ext) => {
    const mime = extToMime[ext];
    if (mime) {
      if (!map[mime]) map[mime] = [];
      if (!map[mime].includes(ext)) map[mime].push(ext);
    }
  });
  return map;
}

export function FileUploadZone({
  accept,
  maxSizeMB,
  uploadFn,
  onSuccess,
  onDelete,
  currentUrl,
  currentLabel = 'Uploaded file',
  fileType,
  disabled = false,
}: FileUploadZoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>(
    currentUrl ? 'SUCCESS' : 'EMPTY'
  );
  const [errorMsg, setErrorMsg]   = useState('');
  const [fileName, setFileName]   = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentUrl ?? '');

  // Keep SUCCESS state in sync if parent refetches and passes a new url
  if (currentUrl && uploadState === 'EMPTY') {
    setUploadState('SUCCESS');
    setPreviewUrl(currentUrl);
  }
  if (!currentUrl && uploadState === 'SUCCESS' && !previewUrl) {
    setUploadState('EMPTY');
  }

  const handleFile = useCallback(
    async (file: File) => {
      // Size validation — before reading into memory
      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMsg(`File exceeds ${maxSizeMB} MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
        setUploadState('ERROR');
        return;
      }

      setFileName(file.name);
      setUploadState('UPLOADING');
      setErrorMsg('');

      try {
        const result = await uploadFn(file);
        setPreviewUrl(result.url);
        setUploadState('SUCCESS');
        onSuccess(result.url);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? 'Upload failed. Please try again.';
        setErrorMsg(msg);
        setUploadState('ERROR');
      }
    },
    [uploadFn, maxSizeMB, onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) {
        setErrorMsg(`Invalid file. Accepted: ${accept}`);
        setUploadState('ERROR');
        return;
      }
      if (accepted[0]) handleFile(accepted[0]);
    },
    accept: buildAcceptMap(accept),
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
    disabled: disabled || uploadState === 'UPLOADING',
    noClick: uploadState === 'SUCCESS',  // Prevent accidental re-upload in success state
  });

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      setUploadState('EMPTY');
      setPreviewUrl('');
    }
  };

  // ── UPLOADING ────────────────────────────────────────────────────────────
  if (uploadState === 'UPLOADING') {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="truncate max-w-xs">{fileName}</span>
          <span className="text-gray-400">· Uploading…</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/2 rounded-full bg-indigo-500 animate-[shimmer_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  // ── ERROR ────────────────────────────────────────────────────────────────
  if (uploadState === 'ERROR') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
        <button
          onClick={() => { setUploadState('EMPTY'); setErrorMsg(''); }}
          className="text-xs text-red-600 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (uploadState === 'SUCCESS' && (previewUrl || currentUrl)) {
    const url = previewUrl || currentUrl!;

    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
        {fileType === 'image' ? (
          <img
            src={url}
            alt="Preview"
            className="max-h-36 max-w-[200px] rounded object-contain border border-gray-200 bg-white"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
            <span className="truncate max-w-xs font-medium">{currentLabel}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          <span className="text-xs font-medium text-green-700">Uploaded ✓</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.open(url, '_blank')}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            {fileType === 'image' ? 'View full size' : 'View'}
          </button>
          <button
            onClick={open}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Replace
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
          {/* Hidden input for Replace */}
          <input {...getInputProps()} />
        </div>
      </div>
    );
  }

  // ── EMPTY ────────────────────────────────────────────────────────────────
  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors text-center',
        isDragActive
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-7 w-7 text-gray-400" />
      <div>
        <p className="text-sm text-gray-600">
          Drop {fileType === 'pdf' ? 'PDF' : 'image'} here or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Max {maxSizeMB} MB · {accept} only
        </p>
      </div>
    </div>
  );
}
