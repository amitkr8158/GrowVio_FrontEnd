import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Mirrors requireAdmin() in mocks/handlers.ts — the three roles that can
// actually use the admin portal's API. A plain USER account (any plan)
// authenticates fine elsewhere in the product but has no business here.
const ADMIN_PORTAL_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!user || !ADMIN_PORTAL_ROLES.includes(user.role)) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This account does not have access to the admin portal.</p>
      </div>
    );
  }

  return <>{children}</>;
}
