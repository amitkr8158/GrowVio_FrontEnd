import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as contentService from '../services/contentService';

export function useLevels(bookId: string) {
  return useQuery({
    queryKey: ['levels', bookId],
    queryFn: () => contentService.getLevels(bookId),
    enabled: !!bookId,
  });
}

export function useLevel(bookId: string, level: number) {
  return useQuery({
    queryKey: ['level', bookId, level],
    queryFn: () => contentService.getLevel(bookId, level),
    enabled: !!bookId && !!level,
  });
}

export function useUpdateLevel(bookId: string, level: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: unknown; status: string; requiredPlan: string }) =>
      contentService.updateLevel(bookId, level, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['level', bookId, level] });
      qc.invalidateQueries({ queryKey: ['levels', bookId] });
      qc.invalidateQueries({ queryKey: ['admin-book', bookId] });
    },
  });
}

export function usePublishLevel(bookId: string, level: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => contentService.publishLevel(bookId, level),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['levels', bookId] });
      qc.invalidateQueries({ queryKey: ['level', bookId, level] });
      qc.invalidateQueries({ queryKey: ['admin-book', bookId] });
    },
  });
}
