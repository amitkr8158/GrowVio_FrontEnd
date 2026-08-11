import * as Sentry from '@sentry/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BooksListPage } from './pages/BooksListPage';
import { BookCreatePage } from './pages/BookCreatePage';
import { BookDetailPage } from './pages/BookDetailPage';
import { BookEditPage } from './pages/BookEditPage';
import { BookPreviewPage } from './pages/BookPreviewPage';
import { ContentEditorPage } from './pages/ContentEditorPage';
import { RichEditorPage } from './pages/RichEditorPage';
import { ContentCostsPage } from './pages/ContentCostsPage';
import { AbTestPage } from './pages/AbTestPage';

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
});

function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/books" element={<BooksListPage />} />
                    <Route path="/books/new" element={<BookCreatePage />} />
                    <Route path="/books/:bookId" element={<BookDetailPage />} />
                    <Route path="/books/:bookId/edit" element={<BookEditPage />} />
                    <Route path="/books/:bookId/preview" element={<BookPreviewPage />} />
                    <Route path="/books/:bookId/content" element={<ContentEditorPage />} />
                    <Route path="/books/:bookId/levels/:levelNumber/editor" element={<RichEditorPage />} />
                    <Route path="/books/:bookId/levels/:levelNumber/ab-test" element={<AbTestPage />} />
                    <Route path="/content-costs" element={<ContentCostsPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default Sentry.withErrorBoundary(App, {
  fallback: (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem' }}>
      <div>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Something went wrong.</p>
        <p style={{ color: '#94a3b8' }}>Please refresh the page. If the problem persists, contact support.</p>
      </div>
    </div>
  ),
});
