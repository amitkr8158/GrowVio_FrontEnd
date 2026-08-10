import apiClient from '../lib/apiClient';

export async function getLevels(bookId: string) {
  const res = await apiClient.get(`/api/admin/books/${bookId}/levels`);
  return res.data;
}

export async function getLevel(bookId: string, level: number) {
  const res = await apiClient.get(`/api/admin/books/${bookId}/levels/${level}`);
  return res.data;
}

export async function updateLevel(
  bookId: string,
  level: number,
  data: { content: unknown; status: string; requiredPlan: string }
) {
  const res = await apiClient.put(
    `/api/admin/books/${bookId}/levels/${level}`,
    data
  );
  return res.data;
}

export async function publishLevel(bookId: string, level: number) {
  const res = await apiClient.post(
    `/api/admin/books/${bookId}/levels/${level}/publish`
  );
  return res.data;
}

export async function unpublishLevel(bookId: string, level: number) {
  const res = await apiClient.post(
    `/api/admin/books/${bookId}/levels/${level}/unpublish`
  );
  return res.data;
}

// ── Rich editor endpoints ─────────────────────────────────────────────────────

export async function getAiDraft(bookId: string, level: number) {
  const res = await apiClient.get(`/api/admin/books/${bookId}/levels/${level}/ai-draft`);
  return res.data;
}

export async function saveDraft(bookId: string, level: number, blocks: Record<string, unknown>) {
  const res = await apiClient.put(`/api/admin/books/${bookId}/levels/${level}/draft`, blocks);
  return res.data;
}

export async function publishFinal(bookId: string, level: number, blocks: Record<string, unknown>) {
  const res = await apiClient.post(`/api/admin/books/${bookId}/levels/${level}/publish-final`, blocks);
  return res.data;
}

export async function getPublishedVersion(bookId: string, level: number) {
  const res = await apiClient.get(`/api/admin/books/${bookId}/levels/${level}/published`);
  return res.data;
}

export async function rollbackLevel(bookId: string, level: number, toVersion: number) {
  const res = await apiClient.post(`/api/admin/books/${bookId}/levels/${level}/rollback`, { toVersion });
  return res.data;
}

export async function listSupportingDocs(bookId: string) {
  const res = await apiClient.get(`/api/admin/books/${bookId}/supporting-docs`);
  return res.data;
}

export async function getVersionStatus(bookId: string, level: number) {
  const res = await apiClient.get(`/api/admin/books/${bookId}/levels/${level}/version-status`);
  return res.data;
}

export async function getPreviewInfo(bookId: string, level: number) {
  const res = await apiClient.get(`/api/admin/books/${bookId}/levels/${level}/preview`);
  return res.data;
}

export async function getContentCosts() {
  const res = await apiClient.get('/api/admin/analytics/content-costs');
  return res.data;
}

// ── Collaborative editor lock ─────────────────────────────────────────────────

export async function acquireEditorLock(bookId: string, levelNumber: number) {
  const res = await apiClient.post(`/api/admin/books/${bookId}/levels/${levelNumber}/editor-lock`);
  return res.data as { sessionId: string; lockedBy: string; expiresAt: string };
}

export async function releaseEditorLock(bookId: string, levelNumber: number, sessionId: string) {
  await apiClient.delete(`/api/admin/books/${bookId}/levels/${levelNumber}/editor-lock`, {
    data: { sessionId },
  });
}

export async function heartbeatEditorLock(bookId: string, levelNumber: number, sessionId: string) {
  const res = await apiClient.put(
    `/api/admin/books/${bookId}/levels/${levelNumber}/editor-lock/heartbeat`,
    { sessionId },
  );
  return res.data as { expiresAt: string };
}

export async function getEditorStatus(bookId: string) {
  const res = await apiClient.get(`/api/admin/books/${bookId}/editor-status`);
  return res.data as Record<string, { lockedBy: string; expiresAt: string }>;
}

// ── Content scheduling ────────────────────────────────────────────────────────

export async function schedulePublish(bookId: string, levelNumber: number, scheduledAt: string) {
  const res = await apiClient.post(
    `/api/admin/books/${bookId}/levels/${levelNumber}/schedule`,
    { scheduledAt },
  );
  return res.data;
}

export async function cancelSchedule(bookId: string, levelNumber: number) {
  await apiClient.delete(`/api/admin/books/${bookId}/levels/${levelNumber}/schedule`);
}

// ── A/B Testing ───────────────────────────────────────────────────────────────

export async function startAbTest(bookId: string, levelNumber: number, variantBContent: string) {
  const res = await apiClient.post(
    `/api/admin/books/${bookId}/levels/${levelNumber}/ab-test/start`,
    { variantBContent },
  );
  return res.data;
}

export async function concludeAbTest(bookId: string, levelNumber: number, winner: 'A' | 'B') {
  const res = await apiClient.post(
    `/api/admin/books/${bookId}/levels/${levelNumber}/ab-test/conclude`,
    { winner },
  );
  return res.data;
}
