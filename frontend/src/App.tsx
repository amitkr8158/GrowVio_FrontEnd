import * as Sentry from '@sentry/react';
import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/common/ProtectedRoute";
import EnvBanner from "@/components/common/EnvBanner";
import ErrorBoundary from "@/components/ErrorBoundary";

// ── Static imports (auth critical path + small pages) ─────────────────────
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";
import { ENV } from "./config/env";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import OTPVerification from "./pages/OTPVerification";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import OnboardingInterests from "./pages/OnboardingInterests";
import OnboardingGoal from "./pages/OnboardingGoal";
import OnboardingFirstBook from "./pages/OnboardingFirstBook";
import BookDetail from "./pages/BookDetail";
import SearchResults from "./pages/SearchResults";
import AuthorPage, { CategoryPage } from "./pages/AuthorPage";
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// ── Lazy-loaded pages (heavy pages split into separate chunks) ─────────────
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const BookReading    = lazy(() => import('./pages/BookReading'));
const BookDiscovery  = lazy(() => import('./pages/BookDiscovery'));
const BookReviews    = lazy(() => import('./pages/BookReviews'));
const KnowledgePyramidPage = lazy(() => import('./pages/KnowledgePyramidPage'));
const Quiz           = lazy(() => import('./pages/Quiz'));
const NotesHighlights = lazy(() => import('./pages/NotesHighlights'));
const Workbook       = lazy(() => import('./pages/Workbook'));
const ReadingHistory = lazy(() => import('./pages/ReadingHistory'));
const UserProfile    = lazy(() => import('./pages/UserProfile'));
const Leaderboard    = lazy(() => import('./pages/Leaderboard'));
const BadgeCollection = lazy(() => import('./pages/BadgeCollection'));
const ShareReferral  = lazy(() => import('./pages/ShareReferral'));
const Community      = lazy(() => import('./pages/Community'));
const PlansPage      = lazy(() => import('./pages/PlansPage'));
const Checkout       = lazy(() => import('./pages/Checkout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const AdminOverview  = lazy(() => import('./pages/admin/AdminOverview'));
const AdminBooks     = lazy(() => import('./pages/admin/AdminBooks'));
const AdminUpload    = lazy(() => import('./pages/admin/AdminUpload'));
const AdminUsers     = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const LevelEditor    = lazy(() => import('./pages/admin/LevelEditor'));
const ProfileSettings = lazy(() => import('./pages/settings/ProfileSettings'));
const NotificationSettings = lazy(() => import('./pages/settings/NotificationSettings'));
const SubscriptionSettings = lazy(() => import('./pages/settings/SubscriptionSettings'));
const ReadingGoals   = lazy(() => import('./pages/settings/ReadingGoals'));

// ── Internal tools (admin-only, largest chunks isolated) ──────────────────
const GrowVioAgents  = lazy(() => import('@/pages/tools/GrowVioAgents'));
const WarRoom        = lazy(() => import('@/pages/tools/WarRoom'));
const TaskTracker    = lazy(() => import('@/pages/tools/TaskTracker'));

// ── Shared Suspense fallback ───────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <EnvBanner />
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public / Marketing */}
            <Route path="/" element={ENV.isProduction ? <ComingSoon /> : <Index />} />
            <Route path="/pricing" element={<PlansPage />} />
            <Route path="/books" element={<BookDiscovery />} />
            <Route path="/books/:bookSlug" element={<BookDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/author/:name" element={<AuthorPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />

            {/* Auth & Onboarding */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<OTPVerification />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding/interests" element={<ProtectedRoute><OnboardingInterests /></ProtectedRoute>} />
            <Route path="/onboarding/goal" element={<ProtectedRoute><OnboardingGoal /></ProtectedRoute>} />
            <Route path="/onboarding/first-book" element={<ProtectedRoute><OnboardingFirstBook /></ProtectedRoute>} />

            {/* Core Reading — auth required */}
            <Route path="/home" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/books/:id/level/:levelNum" element={<ProtectedRoute><BookReading /></ProtectedRoute>} />
            <Route path="/books/:id/pyramid" element={<ProtectedRoute><KnowledgePyramidPage /></ProtectedRoute>} />
            <Route path="/books/:id/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/books/:id/notes" element={<ProtectedRoute><NotesHighlights /></ProtectedRoute>} />
            <Route path="/books/:id/workbook" element={<ProtectedRoute><Workbook /></ProtectedRoute>} />
            <Route path="/books/:id/reviews" element={<ProtectedRoute><BookReviews /></ProtectedRoute>} />
            <Route path="/books/:id/share" element={<ProtectedRoute><ShareReferral /></ProtectedRoute>} />
            <Route path="/my-books" element={<ProtectedRoute><BookDiscovery /></ProtectedRoute>} />
            <Route path="/workbooks" element={<ProtectedRoute><Workbook /></ProtectedRoute>} />

            {/* Social & Gamification — auth required */}
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/profile/history" element={<ProtectedRoute><ReadingHistory /></ProtectedRoute>} />
            <Route path="/profile/badges" element={<ProtectedRoute><BadgeCollection /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />

            {/* Monetization */}
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />

            {/* Admin — admin role required */}
            <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
            <Route path="/admin/books" element={<AdminRoute><AdminBooks /></AdminRoute>} />
            <Route path="/admin/books/upload" element={<AdminRoute><AdminUpload /></AdminRoute>} />
            <Route path="/admin/books/:id/edit" element={<AdminRoute><LevelEditor /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />

            {/* Settings — auth required */}
            <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
            <Route path="/settings/subscription" element={<ProtectedRoute><SubscriptionSettings /></ProtectedRoute>} />
            <Route path="/settings/goals" element={<ProtectedRoute><ReadingGoals /></ProtectedRoute>} />

            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Internal tools — admin only */}
            <Route path="/team"         element={<AdminRoute><GrowVioAgents /></AdminRoute>} />
            <Route path="/war-room"     element={<AdminRoute><WarRoom /></AdminRoute>} />
            <Route path="/task-tracker" element={<AdminRoute><TaskTracker /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default Sentry.withErrorBoundary(App, {
  fallback: (
    <div className="flex items-center justify-center min-h-screen text-center p-8">
      <div>
        <p className="text-lg font-semibold mb-2">Something went wrong.</p>
        <p className="text-sm text-muted-foreground">Please refresh the page. If the problem persists, contact support.</p>
      </div>
    </div>
  ),
});
