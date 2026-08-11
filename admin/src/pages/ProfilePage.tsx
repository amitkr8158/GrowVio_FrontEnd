import { Mail, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { RoleBadge, initials } from '../lib/roleBadge';

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <p className="text-gray-500">Not signed in.</p>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Profile</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700">
              {initials(user.name)}
            </div>
          )}

          <div className="min-w-0 space-y-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{user.name}</h2>
              <div className="mt-1">
                <RoleBadge role={user.role} plan={user.plan} />
              </div>
            </div>
            {user.bio && <p className="text-sm text-gray-500">{user.bio}</p>}
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
          <div className="flex items-start gap-2.5">
            <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <dt className="text-xs text-gray-400">Email</dt>
              <dd className="text-sm text-gray-800">{user.email}</dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <dt className="text-xs text-gray-400">Account type</dt>
              <dd className="text-sm text-gray-800">{user.role.replace('_', ' ')}</dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <dt className="text-xs text-gray-400">Member since</dt>
              <dd className="text-sm text-gray-800">{formatDate(user.createdAt)}</dd>
            </div>
          </div>

          {user.plan && (
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-gray-400">Plan</dt>
                <dd className="text-sm text-gray-800">{user.plan}</dd>
              </div>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
