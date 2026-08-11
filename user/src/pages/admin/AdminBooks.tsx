import { Search, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminShell from "@/components/layout/AdminShell";

const books = [
  { title: "Atomic Habits", author: "James Clear", category: "Self-Help", status: "Published", levels: [true,true,true,true,true,true,true], quality: 92 },
  { title: "Deep Work", author: "Cal Newport", category: "Productivity", status: "Published", levels: [true,true,true,true,true,false,false], quality: 85 },
  { title: "Psychology of Money", author: "Morgan Housel", category: "Finance", status: "Processing", levels: [true,true,true,false,false,false,false], quality: 70 },
  { title: "Ikigai", author: "Héctor García", category: "Self-Help", status: "Draft", levels: [true,false,false,false,false,false,false], quality: 45 },
];

const AdminBooks = () => (
  <AdminShell>
    <div className="flex items-center justify-between mb-6">
      <h1 className="font-display text-2xl font-bold">Book Management</h1>
      <Button className="gap-2"><Plus className="h-4 w-4" />Upload Book</Button>
    </div>
    <div className="flex gap-3 mb-4">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" /><Input placeholder="Search books..." className="pl-9 bg-[#1E293B] border-[#334155] text-[#E2E8F0]" /></div>
    </div>
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-[#334155] text-[#94A3B8]">
          <th className="text-left p-3">Title</th><th className="text-left p-3">Category</th><th className="text-left p-3">Status</th><th className="text-left p-3">Levels</th><th className="text-left p-3">Quality</th><th className="p-3"></th>
        </tr></thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.title} className="border-b border-[#334155] hover:bg-[#0F172A]">
              <td className="p-3"><p className="font-medium">{b.title}</p><p className="text-xs text-[#94A3B8]">{b.author}</p></td>
              <td className="p-3"><span className="text-xs bg-[#334155] px-2 py-0.5 rounded-full">{b.category}</span></td>
              <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${b.status === "Published" ? "bg-green-400/20 text-green-400" : b.status === "Processing" ? "bg-yellow-400/20 text-yellow-400" : "bg-[#334155] text-[#94A3B8]"}`}>{b.status}</span></td>
              <td className="p-3"><div className="flex gap-0.5">{b.levels.map((l, i) => <div key={i} className={`w-3 h-3 rounded-sm ${l ? "bg-green-400" : "bg-[#334155]"}`} />)}</div></td>
              <td className="p-3"><span className={`text-xs font-mono ${b.quality >= 85 ? "text-green-400" : b.quality >= 70 ? "text-yellow-400" : "text-red-400"}`}>{b.quality}%</span></td>
              <td className="p-3"><button className="text-[#94A3B8] hover:text-white"><MoreHorizontal className="h-4 w-4" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminShell>
);
export default AdminBooks;
