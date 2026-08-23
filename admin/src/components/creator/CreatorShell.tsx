import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { Bell, ChevronLeft, LogOut, PanelLeft, Search, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { creatorNav } from "./nav";

export function CreatorLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/creator" className="flex items-center gap-2.5" aria-label="GrowVio Creator Studio">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-hero text-white">
        <Sparkles className="size-4.5" strokeWidth={2} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[17px] font-semibold tracking-tight text-ink-1">GrowVio</span>
          <span className="mt-1 block text-[10px] font-medium tracking-[0.18em] text-ink-3">
            CREATOR STUDIO
          </span>
        </span>
      )}
    </Link>
  );
}

export function CreatorShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user?.name ?? "Creator";
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-dvh bg-background text-ink-1">
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-5">
          <div className="w-[248px] shrink-0">
            <CreatorLogo />
          </div>
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" />
            <input
              type="search"
              aria-label="Search books, levels, notes"
              placeholder="Search books, levels, notes..."
              className="h-10 w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:bg-card focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative grid size-9 place-items-center rounded-lg text-ink-3 transition hover:bg-surface-2 hover:text-ink-1"
            >
              <Bell className="size-4.5" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-danger ring-2 ring-card" />
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-surface-2"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl as string} alt={displayName} className="size-8 rounded-full object-cover" />
              ) : (
                <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
                  {initials || "C"}
                </span>
              )}
              <span className="hidden text-sm font-medium xl:block">{displayName}</span>
            </Link>
            <button
              type="button"
              aria-label="Sign out"
              title="Sign out"
              onClick={handleSignOut}
              className="grid size-9 place-items-center rounded-lg text-ink-3 transition hover:bg-surface-2 hover:text-ink-1"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 border-r border-border bg-surface-2/60 transition-[width] duration-200 md:block",
            collapsed ? "w-[76px]" : "w-[248px]",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              {!collapsed && (
                <div>
                  <p className="text-[13px] font-semibold text-ink-1">Creator Studio</p>
                  <p className="text-[11px] text-ink-3">Publishing workspace</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="grid size-8 place-items-center rounded-lg text-ink-3 transition hover:bg-surface-3 hover:text-ink-1"
              >
                {collapsed ? <PanelLeft className="size-4" /> : <ChevronLeft className="size-4" />}
              </button>
            </div>

            <nav className="scroll-slim flex-1 space-y-5 overflow-y-auto px-3 pt-2 pb-6">
              {creatorNav.map((group) => (
                <div key={group.label}>
                  {!collapsed && (
                    <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-ink-3 uppercase">
                      {group.label}
                    </p>
                  )}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active =
                        item.to === "/creator" ? pathname === "/creator" : pathname.startsWith(item.to);
                      return (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            title={item.label}
                            className={cn(
                              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                              active
                                ? "bg-primary-light text-primary-dark"
                                : "text-ink-2 hover:bg-surface-3 hover:text-ink-1",
                              collapsed && "justify-center px-0",
                            )}
                          >
                            <item.icon
                              className={cn("size-4.5 shrink-0", active && "text-primary")}
                              strokeWidth={active ? 2.2 : 1.8}
                            />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                            {!collapsed && item.badge && (
                              <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className={cn("mx-auto px-6 py-8 lg:px-10", wide ? "max-w-[1600px]" : "max-w-[1280px]")}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function CreatorPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">{eyebrow}</p>
        )}
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink-1">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-3">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
