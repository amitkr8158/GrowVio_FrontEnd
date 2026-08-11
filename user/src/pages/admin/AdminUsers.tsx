import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import AdminShell from "@/components/layout/AdminShell";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import type { AdminUser } from "@/types";

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => userService.adminUsers().then((r) => r.data),
    meta: { onError: () => toast.error("Failed to load users") },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => userService.adminStats().then((r) => r.data),
    meta: { onError: () => toast.error("Failed to load stats") },
  });

  // Normalize: API might return array or {content: [...]}
  const raw = users as AdminUser[] | { content?: AdminUser[] } | undefined;
  const userList: AdminUser[] = Array.isArray(raw) ? raw : (raw as { content?: AdminUser[] })?.content ?? [];

  const filteredUsers = useMemo(() => {
    let result = userList;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u: AdminUser) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    if (planFilter) {
      result = result.filter((u: AdminUser) => u.plan === planFilter);
    }
    return result;
  }, [userList, search, planFilter]);

  const planCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    userList.forEach((u: AdminUser) => {
      counts[u.plan] = (counts[u.plan] || 0) + 1;
    });
    return counts;
  }, [userList]);

  const statChips = [
    { l: "Total", v: stats?.totalUsers ?? userList.length },
    { l: "Active Today", v: stats?.activeToday ?? "—" },
    { l: "Free", v: planCounts["FREE"] ?? "—" },
    { l: "Paid", v: Object.entries(planCounts).filter(([k]) => k !== "FREE").reduce((s, [, v]) => s + v, 0) || "—" },
    { l: "New This Week", v: stats?.newThisWeek ?? "—" },
  ];

  const plans = ["All", "FREE", "STARTER", "PREMIUM", "PRO"];

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-bold mb-6">User Management</h1>

      {/* Stat chips */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {statChips.map((s) => (
          <div key={s.l} className="bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2">
            <p className="text-xs text-[#94A3B8]">{s.l}</p>
            {stats || !usersLoading ? (
              <p className="font-bold">{typeof s.v === "number" ? s.v.toLocaleString() : s.v}</p>
            ) : (
              <div className="h-5 w-12 bg-[#334155] rounded animate-pulse mt-1" />
            )}
          </div>
        ))}
      </div>

      {/* Plan filter tabs */}
      <div className="flex gap-2 mb-4">
        {plans.map((p) => (
          <button
            key={p}
            onClick={() => setPlanFilter(p === "All" ? null : p)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              (p === "All" && !planFilter) || planFilter === p
                ? "bg-primary text-white"
                : "bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
        <Input
          placeholder="Search users by name or email..."
          className="pl-9 bg-[#1E293B] border-[#334155] text-[#E2E8F0]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#334155] text-[#94A3B8]">
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Plan</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Joined</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {usersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#334155]">
                  <td className="p-3"><div className="h-4 w-32 bg-[#334155] rounded animate-pulse" /></td>
                  <td className="p-3"><div className="h-4 w-16 bg-[#334155] rounded animate-pulse" /></td>
                  <td className="p-3"><div className="h-4 w-12 bg-[#334155] rounded animate-pulse" /></td>
                  <td className="p-3"><div className="h-4 w-20 bg-[#334155] rounded animate-pulse" /></td>
                  <td className="p-3"></td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[#94A3B8]">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((u: AdminUser) => (
                <tr key={u.id || u.email} className="border-b border-[#334155] hover:bg-[#0F172A]">
                  <td className="p-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-[#94A3B8]">{u.email}</p>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.plan === "PRO"
                        ? "bg-yellow-400/20 text-yellow-400"
                        : u.plan === "PREMIUM"
                        ? "bg-purple-400/20 text-purple-400"
                        : u.plan === "STARTER"
                        ? "bg-blue-400/20 text-blue-400"
                        : "bg-[#334155] text-[#94A3B8]"
                    }`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs ${u.role === "ADMIN" ? "text-red-400" : "text-[#94A3B8]"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-[#94A3B8] text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "—"}
                  </td>
                  <td className="p-3">
                    <button className="text-[#94A3B8] hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      <p className="text-xs text-[#94A3B8] mt-3">
        Showing {filteredUsers.length} of {userList.length} users
      </p>
    </AdminShell>
  );
};

export default AdminUsers;
