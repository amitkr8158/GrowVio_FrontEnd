import { Users, BookOpen, DollarSign, Activity, BarChart3, Cpu, RefreshCw } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";

const metrics = [
  { label: "Total Users", value: "5,284", trend: "+12%", icon: Users },
  { label: "DAU", value: "1,230", trend: "+8%", icon: Activity },
  { label: "MRR", value: "₹4.2L", trend: "+15%", icon: DollarSign },
  { label: "Books Published", value: "156", trend: "+3", icon: BookOpen },
  { label: "AI Cost Today", value: "₹1,240", trend: "-5%", icon: Cpu },
  { label: "Queue Size", value: "7", trend: "", icon: RefreshCw },
];
const services = [
  { name: "API Gateway", status: "green" }, { name: "User Service", status: "green" }, { name: "Book Service", status: "green" },
  { name: "AI Service", status: "yellow" }, { name: "Kafka", status: "green" }, { name: "Elasticsearch", status: "green" },
  { name: "Redis", status: "green" }, { name: "MongoDB", status: "green" },
];

const AdminOverview = () => (
  <AdminShell>
    <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metrics.map((m) => (
        <div key={m.label} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
          <m.icon className="h-4 w-4 text-[#94A3B8] mb-2" />
          <p className="text-2xl font-display font-bold">{m.value}</p>
          <p className="text-xs text-[#94A3B8]">{m.label}</p>
          {m.trend && <span className={`text-xs ${m.trend.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{m.trend}</span>}
        </div>
      ))}
    </div>
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 mb-8">
      <h3 className="text-sm font-semibold mb-3">System Health</h3>
      <div className="flex flex-wrap gap-4">
        {services.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${s.status === "green" ? "bg-green-400" : s.status === "yellow" ? "bg-yellow-400 animate-pulse" : "bg-red-400"}`} />
            <span className="text-xs text-[#94A3B8]">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Recent Signups</h3>
        {["Priya S.", "Rahul K.", "Neha M.", "Amit J.", "Kavita R."].map((n) => (
          <div key={n} className="flex items-center gap-2 py-2 border-b border-[#334155] last:border-0">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-xs flex items-center justify-center text-primary font-bold">{n[0]}</div>
            <span className="text-sm flex-1">{n}</span>
            <span className="text-xs text-[#94A3B8]">Free</span>
          </div>
        ))}
      </div>
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Recent Payments</h3>
        {["Priya S. — ₹199", "Rahul K. — ₹499", "Neha M. — ₹99"].map((p) => (
          <div key={p} className="flex items-center gap-2 py-2 border-b border-[#334155] last:border-0">
            <span className="text-sm flex-1">{p}</span>
            <span className="text-xs text-green-400">Paid</span>
          </div>
        ))}
      </div>
    </div>
  </AdminShell>
);
export default AdminOverview;
