import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PlusCircle, DollarSign, User, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/books', icon: BookOpen, label: 'Books', end: false },
  { to: '/books/new', icon: PlusCircle, label: '+ New Book', end: false },
  { to: '/content-costs', icon: DollarSign, label: 'Content Costs', end: false },
  { to: '/creator', icon: Sparkles, label: 'Creator Studio', end: false },
  { to: '/profile', icon: User, label: 'Profile', end: false },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col min-h-screen">
      <div className="px-4 py-5 border-b border-gray-200">
        <span className="text-lg font-bold text-indigo-600 tracking-tight">GrowVio Admin</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
