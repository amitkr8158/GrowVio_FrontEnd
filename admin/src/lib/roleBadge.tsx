// Shared display metadata for every account "type" in the system —
// the 3 admin-portal roles plus the 4 plan tiers a regular end user
// (role: USER, from the user app) can be on. The admin portal itself
// only ever authenticates ADMIN / SUPER_ADMIN / CONTENT_CREATOR (see
// requireAdmin in mocks/handlers.ts), but Profile/Layout render whichever
// type the signed-in account actually has, so the full map lives here.
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_CREATOR' | 'USER';
export type Plan = 'FREE' | 'STARTER' | 'PREMIUM' | 'PRO';

interface RoleMeta {
  label: string;
  className: string;
}

const ROLE_META: Record<Role, RoleMeta> = {
  SUPER_ADMIN: { label: 'Super Admin', className: 'bg-purple-100 text-purple-700' },
  ADMIN: { label: 'Admin', className: 'bg-indigo-100 text-indigo-700' },
  CONTENT_CREATOR: { label: 'Content Creator', className: 'bg-blue-100 text-blue-700' },
  USER: { label: 'User', className: 'bg-gray-100 text-gray-700' },
};

const PLAN_META: Record<Plan, RoleMeta> = {
  FREE: { label: 'Free User', className: 'bg-gray-100 text-gray-700' },
  STARTER: { label: 'Starter User', className: 'bg-green-100 text-green-700' },
  PREMIUM: { label: 'Premium User', className: 'bg-amber-100 text-amber-700' },
  PRO: { label: 'Pro User', className: 'bg-violet-100 text-violet-700' },
};

// A USER-role account's "type" is really its plan (Free/Starter/Premium/Pro
// User); every other role is its own type regardless of plan.
export function accountTypeMeta(role?: string, plan?: string): RoleMeta {
  if (role === 'USER') {
    return (plan && PLAN_META[plan as Plan]) || PLAN_META.FREE;
  }
  return (role && ROLE_META[role as Role]) || { label: role || 'Unknown', className: 'bg-gray-100 text-gray-700' };
}

export function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function RoleBadge({ role, plan, size = 'md' }: { role?: string; plan?: string; size?: 'sm' | 'md' }) {
  const meta = accountTypeMeta(role, plan);
  const sizeCls = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeCls} ${meta.className}`}>
      {meta.label}
    </span>
  );
}
