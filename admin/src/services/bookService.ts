import apiClient from '../lib/apiClient';
import type { Book } from '../types/book.types';

export async function getAllBooks(status = 'ALL', page = 0, size = 20) {
  const res = await apiClient.get('/api/admin/books', {
    params: { status, page, size },
  });
  return res.data as { books: Book[]; total: number; page: number };
}

export async function getBook(bookId: string): Promise<Book> {
  const res = await apiClient.get<Book>(`/api/admin/books/${bookId}`);
  return res.data;
}

export async function createBook(data: {
  title: string;
  hindiTitle?: string;
  author: string;
  genre: string;
  tags: string[];
  coverImageUrl?: string;
  isPremium: boolean;
  description?: string;
}): Promise<Book> {
  const res = await apiClient.post<Book>('/api/admin/books', data);
  return res.data;
}

export async function updateBook(bookId: string, data: unknown): Promise<Book> {
  const res = await apiClient.put<Book>(`/api/admin/books/${bookId}`, data);
  return res.data;
}

export async function deleteBook(bookId: string): Promise<void> {
  await apiClient.delete(`/api/admin/books/${bookId}`);
}

export async function publishBook(bookId: string): Promise<void> {
  await apiClient.post(`/api/admin/books/${bookId}/publish`);
}

export async function unpublishBook(bookId: string): Promise<void> {
  await apiClient.post(`/api/admin/books/${bookId}/unpublish`);
}
