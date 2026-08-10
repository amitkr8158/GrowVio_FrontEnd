import apiClient from '../lib/apiClient';

export async function uploadReferencePdf(bookId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post(
    `/api/admin/books/${bookId}/reference/pdf`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data as { url: string; key?: string; uploadedAt?: string };
}

export async function uploadReferenceInfographic(bookId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post(
    `/api/admin/books/${bookId}/reference/infographic`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data as { url: string; key?: string; uploadedAt?: string };
}

export async function deleteReferencePdf(bookId: string): Promise<void> {
  await apiClient.delete(`/api/admin/books/${bookId}/reference/pdf`);
}

export async function deleteReferenceInfographic(bookId: string): Promise<void> {
  await apiClient.delete(`/api/admin/books/${bookId}/reference/infographic`);
}

export async function uploadFlashcardImage(
  bookId: string,
  order: number,
  file: File
) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post(
    `/api/admin/books/${bookId}/levels/2/cards/${order}/image`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data as { url: string };
}

export async function uploadLevel3Image(bookId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post(
    `/api/admin/books/${bookId}/levels/3/image`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data as { url: string };
}

export async function uploadLevel4Pdf(bookId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post(
    `/api/admin/books/${bookId}/levels/4/pdf`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data as { pdfUrl: string; pdfKey: string; pageCount?: number; wordCount?: number; inlineText?: string };
}
