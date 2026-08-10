import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Upload, Users, BarChart3, FileEdit,
  LogOut, BookOpen as Logo, Bell, Search, Settings
} from "lucide-react";
import { Input } from "@/components/ui/input";

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Books", href: "/admin/books", icon: BookOpen },
  { label: "Upload", href: "/admin/books/upload", icon: Upload },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

interface AdminShellProps {
  children: React.ReactNode;
}

const AdminShell = ({ children }: AdminShellProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#E2E8F0]">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-[#334155] bg-[#0F172A]/95 backdrop-blur-xl px-4">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Logo className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">GrowVio</span>
            <span className="text-[10px] font-bold bg-danger text-white px-1.5 py-0.5 rounded">ADMIN</span>
          </Link>
        </div>

        <div className="hidden md:block max-w-[400px] flex-1 mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <Input placeholder="Search..." className="pl-9 h-10 bg-[#1E293B] border-[#334155] text-[#E2E8F0] placeholder:text-[#94A3B8]" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-[#94A3B8] hover:text-[#E2E8F0]"><Bell className="h-5 w-5" /></button>
          <button className="text-[#94A3B8] hover:text-[#E2E8F0]"><Settings className="h-5 w-5" /></button>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-60 border-r border-[#334155] bg-[#0F172A]">
          <nav className="flex-1 p-3 space-y-1">
            {adminLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/15 text-primary border-l-[3px] border-primary"
                      : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E2E8F0]"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-[#334155]">
            <Link to="/home" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B]">
              <LogOut className="h-5 w-5" />
              Exit Admin
            </Link>
          </div>
        </aside>

        <main className="flex-1 lg:ml-60 min-h-[calc(100vh-4rem)]">
          <div className="max-w-[1400px] mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
