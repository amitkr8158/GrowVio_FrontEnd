import { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ExternalLink, Layers } from 'lucide-react';
import { useBook, useUpdateBook, useDeleteBook, usePublishBook, useUnpublishBook } from '../hooks/useBooks';

const GENRES = [
  'Self-Help', 'Business', 'Finance', 'Psychology',
  'Leadership', 'Productivity', 'Biography', 'Science',
  'Health', 'Relationships', 'Philosophy', 'Other',
] as const;

const schema = z.object({
  title:         z.string().min(1, 'Title required').max(200),
  hindiTitle:    z.string().optional(),
  author:        z.string().min(1, 'Author required').max(100),
  genre:         z.enum(GENRES, { message: 'Select a genre' }),
  tags:          z.array(z.string()).default([]),
  coverImageUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  isPremium:     z.boolean().default(false),
  description:   z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

interface DeleteDialogProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteDialog({ title, onConfirm, onCancel, isDeleting }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Delete "{title}"?</h2>
        <p className="mt-2 text-sm text-gray-500">
          This will permanently delete the book and all its content. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
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

export function BookEditPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate   = useNavigate();

  const { data: book, isLoading }        = useBook(bookId ?? '');
  const { mutateAsync: updateBook, isPending: isUpdating } = useUpdateBook(bookId ?? '');
  const { mutate: deleteBook,  isPending: isDeleting }     = useDeleteBook();
  const { mutate: publishBook,   isPending: isPublishing } = usePublishBook();
  const { mutate: unpublishBook, isPending: isUnpublishing } = useUnpublishBook();

  const [apiError, setApiError]         = useState('');
  const [successMsg, setSuccessMsg]     = useState('');
  const [tagInput, setTagInput]         = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema) as Resolver<FormValues>,
      defaultValues: { tags: [], isPremium: false },
    });

  // Pre-fill form once book data arrives
  useEffect(() => {
    if (book) {
      reset({
        title:         book.title,
        hindiTitle:    book.hindiTitle ?? '',
        author:        book.author,
        genre:         book.genre as typeof GENRES[number],
        tags:          book.tags ?? [],
        coverImageUrl: book.coverImageUrl ?? '',
        isPremium:     book.isPremium,
        description:   '',
      });
    }
  }, [book, reset]);

  const tags          = watch('tags') ?? [];
  const coverImageUrl = watch('coverImageUrl');
  const description   = watch('description') ?? '';

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setValue('tags', [...tags, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setValue('tags', tags.filter((x) => x !== t));
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  };

  const onSubmit = async (values: FormValues) => {
    setApiError(''); setSuccessMsg('');
    try {
      await updateBook({
        ...values,
        coverImageUrl: values.coverImageUrl || undefined,
        hindiTitle:    values.hindiTitle    || undefined,
        description:   values.description   || undefined,
      });
      setSuccessMsg('Book updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? 'Update failed. Try again.');
    }
  };

  const handlePublish = () => {
    if (!bookId) return;
    publishBook(bookId, {
      onSuccess: () => setSuccessMsg('Book published.'),
      onError: (e: unknown) => {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setApiError(msg ?? 'Publish failed.');
      },
    });
  };

  const handleUnpublish = () => {
    if (!bookId) return;
    unpublishBook(bookId, { onSuccess: () => setSuccessMsg('Book unpublished.') });
  };

  const handleDelete = () => {
    if (!bookId) return;
    deleteBook(bookId, { onSuccess: () => navigate('/books') });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!book) return <p className="text-gray-500">Book not found.</p>;

  const statusMap = {
    PUBLISHED: 'bg-green-100 text-green-700',
    DRAFT:     'bg-yellow-100 text-yellow-700',
    ARCHIVED:  'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/books')} className="text-sm text-indigo-600 hover:underline">
            ← Back to Books
          </button>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Book</h1>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <a
            href={`https://dev.growvio.in/books/${bookId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on Site
          </a>
          <button
            onClick={() => navigate(`/books/${bookId}/content`)}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            Content Editor
          </button>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <Field label="Title" required error={errors.title?.message}>
          <input {...register('title')} type="text" className={inputCls} />
        </Field>

        <Field label="Hindi Title" error={errors.hindiTitle?.message}>
          <input {...register('hindiTitle')} type="text" className={inputCls} />
        </Field>

        <Field label="Author" required error={errors.author?.message}>
          <input {...register('author')} type="text" className={inputCls} />
        </Field>

        <Field label="Genre" required error={errors.genre?.message}>
          <select {...register('genre')} className={inputCls}>
            <option value="">Select genre…</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>

        <Field label="Tags" error={undefined}>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag…"
              className={`${inputCls} flex-1`}
            />
            <button type="button" onClick={addTag} className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:text-indigo-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field label="Cover Image URL" error={errors.coverImageUrl?.message}>
          <input {...register('coverImageUrl')} type="text" className={inputCls} />
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt="Cover preview"
              className="mt-2 h-24 w-16 rounded object-cover border border-gray-200"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </Field>

        <Field label="" error={undefined}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input {...register('isPremium')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-gray-700">Mark as Premium book</span>
          </label>
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <textarea {...register('description')} rows={4} className={inputCls} />
          <p className="text-right text-xs text-gray-400">{description.length}/500</p>
        </Field>

        {apiError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</div>
        )}
        {successMsg && (
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{successMsg}</div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/books')} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isUpdating} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
            {isUpdating ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Publish Settings */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Publish Settings</h2>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusMap[book.publishStatus]}`}>
            {book.publishStatus}
          </span>
        </div>

        {book.publishStatus === 'DRAFT' && (
          <div className="space-y-2">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {isPublishing ? 'Publishing…' : 'Publish Book'}
            </button>
            <p className="text-xs text-gray-400">Requires Level 1 and Level 2 to be published first.</p>
          </div>
        )}

        {book.publishStatus === 'PUBLISHED' && (
          <button
            onClick={handleUnpublish}
            disabled={isUnpublishing}
            className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-60 transition-colors"
          >
            {isUnpublishing ? 'Unpublishing…' : 'Unpublish Book'}
          </button>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-base font-semibold text-red-700">Danger Zone</h2>
        <p className="text-sm text-gray-500">Permanently delete this book and all its content.</p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Delete Book
        </button>
      </div>

      {showDeleteDialog && (
        <DeleteDialog
          title={book.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
