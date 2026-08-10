import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as bookService from '../services/bookService';

export function useBooks(status = 'ALL', page = 0) {
  return useQuery({
    queryKey: ['admin-books', status, page],
    queryFn: () => bookService.getAllBooks(status, page, 20),
  });
}

export function useBook(bookId: string) {
  return useQuery({
    queryKey: ['admin-book', bookId],
    queryFn: () => bookService.getBook(bookId),
    enabled: !!bookId,
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookService.createBook,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-books'] }),
  });
}

export function useUpdateBook(bookId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => bookService.updateBook(bookId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-books'] });
      qc.invalidateQueries({ queryKey: ['admin-book', bookId] });
    },
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookService.deleteBook,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-books'] }),
  });
}

export function usePublishBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => bookService.publishBook(bookId),
    onSuccess: (_data, bookId) => {
      qc.invalidateQueries({ queryKey: ['admin-books'] });
      qc.invalidateQueries({ queryKey: ['admin-book', bookId] });
    },
  });
}

export function useUnpublishBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => bookService.unpublishBook(bookId),
    onSuccess: (_data, bookId) => {
      qc.invalidateQueries({ queryKey: ['admin-books'] });
      qc.invalidateQueries({ queryKey: ['admin-book', bookId] });
    },
  });
}
