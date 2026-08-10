import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateBook } from '../hooks/useBooks';

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
  description:   z.string().max(500, 'Max 500 characters').optional(),
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

export function BookCreatePage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateBook();
  const [apiError, setApiError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { tags: [], isPremium: false },
  });

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
    setApiError('');
    try {
      const book = await mutateAsync({
        ...values,
        coverImageUrl: values.coverImageUrl || undefined,
        hindiTitle:    values.hindiTitle    || undefined,
        description:   values.description   || undefined,
      });
      navigate(`/books/${book.id}/content`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? 'Failed to create book. Try again.');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <button
          onClick={() => navigate('/books')}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to Books
        </button>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Create New Book</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <Field label="Title" required error={errors.title?.message}>
          <input {...register('title')} type="text" placeholder="Atomic Habits" className={inputCls} />
        </Field>

        <Field label="Hindi Title" error={errors.hindiTitle?.message}>
          <input {...register('hindiTitle')} type="text" placeholder="Optional" className={inputCls} />
        </Field>

        <Field label="Author" required error={errors.author?.message}>
          <input {...register('author')} type="text" placeholder="James Clear" className={inputCls} />
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
              placeholder="e.g. habits, productivity"
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
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
          <input {...register('coverImageUrl')} type="text" placeholder="https://…" className={inputCls} />
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
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Short description of the book…"
            className={inputCls}
          />
          <p className="text-right text-xs text-gray-400">{description.length}/500</p>
        </Field>

        {apiError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Creating…' : 'Create Book'}
          </button>
        </div>
      </form>
    </div>
  );
}
