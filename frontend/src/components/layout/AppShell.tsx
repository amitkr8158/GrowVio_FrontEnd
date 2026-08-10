import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BookOpen, Bookmark, BarChart3, Trophy, ClipboardList,
  Settings, Bell, Search, Flame, User, Plus, Shield,
  ChevronLeft, Menu, CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const sidebarLinks = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Library", href: "/books", icon: BookOpen },
  { label: "My Books", href: "/my-books", icon: Bookmark },
  { label: "Progress", href: "/profile/history", icon: BarChart3 },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Workbooks", href: "/workbooks", icon: ClipboardList },
];

const bottomLinks = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Library", href: "/books", icon: BookOpen },
  { label: "Read", href: "/books", icon: Plus, isCenter: true },
  { label: "XP", href: "/profile/history", icon: BarChart3 },
  { label: "Me", href: "/profile", icon: User },
];

interface AppShellProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const AppShell = ({ children, showSidebar = true }: AppShellProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-surface-2">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur-xl px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} className="hidden lg:block text-ink-3 hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/home" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground hidden sm:block">GrowVio</span>
          </Link>
        </div>

        <div className="hidden md:block max-w-[400px] flex-1 mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
            <Input placeholder="Search books, topics..." className="pl-9 h-10 bg-surface-2 border-border" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/search" className="md:hidden text-ink-3"><Search className="h-5 w-5" /></Link>
          <button aria-label="Notifications" className="relative text-ink-3 hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-1 text-warning">
            <Flame className="h-5 w-5" />
            <span className="text-sm font-semibold font-mono">7</span>
          </div>
          <span className="hidden sm:block text-xs font-medium text-ink-3 bg-primary-light px-2 py-1 rounded-full">1,250 XP</span>
          <span className="text-xs font-medium text-ink-3 cursor-pointer hover:text-foreground">EN | HI</span>
          <Link to="/profile" className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </Link>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <aside className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 ${sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'} border-r border-border bg-background transition-all duration-200 z-40`}>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {sidebarLinks.map((link) => {
                const active = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-primary-light text-primary border-l-[3px] border-primary"
                        : "text-ink-3 hover:bg-surface-2 hover:text-foreground"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                to="/task-tracker"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  location.pathname === "/task-tracker"
                    ? "bg-primary-light text-primary border-l-[3px] border-primary"
                    : "text-ink-3 hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <CheckSquare className="h-5 w-5" />
                Task Tracker
              </Link>
              <div className="my-3 border-t border-border" />
              <Link
                to="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-3 hover:bg-surface-2"
              >
                <Shield className="h-5 w-5" />
                Admin
              </Link>
              <div className="my-3 border-t border-border" />
              <Link
                to="/settings/profile"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  location.pathname.startsWith("/settings")
                    ? "bg-primary-light text-primary"
                    : "text-ink-3 hover:bg-surface-2"
                }`}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </nav>
            <div className="p-3 border-t border-border">
              <div className="rounded-lg bg-primary-light p-3 text-center">
                <span className="text-xs font-semibold text-primary">PREMIUM</span>
                <p className="text-xs text-ink-3 mt-1">Upgrade for full access</p>
                <Button size="sm" className="mt-2 w-full text-xs">Upgrade</Button>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-ink-3">
                <Flame className="h-4 w-4 text-warning" />
                <span>7 day streak</span>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-[calc(100vh-4rem)] pb-20 lg:pb-0 ${showSidebar && sidebarOpen ? 'lg:ml-60' : ''} transition-all duration-200`}>
          <div className="max-w-[1200px] mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background h-14 pb-[env(safe-area-inset-bottom)] lg:hidden">
        {bottomLinks.map((link) => {
          const active = location.pathname === link.href ||
            location.pathname.startsWith(link.href + '/');
          if (link.isCenter) {
            return (
              <Link key="center" to={link.href} aria-label="Start Reading" className="flex -mt-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-glow">
                <Plus className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
              </Link>
            );
          }
          return (
            <Link key={link.href} to={link.href} aria-label={link.label} aria-current={active ? "page" : undefined} className="flex flex-col items-center gap-0.5">
              <link.icon className={`h-5 w-5 ${active ? "text-primary" : "text-ink-3"}`} aria-hidden="true" />
              {active && <span className="text-[10px] font-medium text-primary">{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AppShell;
