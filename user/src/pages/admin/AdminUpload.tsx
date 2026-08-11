import { Upload, FileText, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import AdminShell from "@/components/layout/AdminShell";

const AdminUpload = () => (
  <AdminShell>
    <h1 className="font-display text-2xl font-bold mb-6">Upload & Generate</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Upload className="h-5 w-5" />Upload Book PDF</h3>
        <div className="border-2 border-dashed border-[#334155] rounded-xl p-8 text-center mb-4">
          <FileText className="h-10 w-10 text-[#94A3B8] mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8]">Drop PDF here or click to browse</p>
          <p className="text-xs text-[#94A3B8] mt-1">Max 50MB</p>
        </div>
        <div className="space-y-3">
          <div><Label className="text-[#94A3B8]">Book Title</Label><Input className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1" /></div>
          <div><Label className="text-[#94A3B8]">Author</Label><Input className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1" /></div>
          <div><Label className="text-[#94A3B8]">Category</Label><Input className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1" /></div>
          <Button className="w-full">Upload & Start Generation</Button>
        </div>
      </div>
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Cpu className="h-5 w-5" />Generation Queue</h3>
        <div className="space-y-4">
          {[{ title: "Psychology of Money", level: "Level 4", progress: 65 }, { title: "Ikigai", level: "Level 2", progress: 30 }].map((q) => (
            <div key={q.title} className="bg-[#0F172A] rounded-lg p-3">
              <div className="flex justify-between text-sm mb-2"><span>{q.title}</span><span className="text-[#94A3B8]">{q.level}</span></div>
              <Progress value={q.progress} className="h-1.5" />
              <p className="text-xs text-[#94A3B8] mt-1">{q.progress}% complete</p>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-[#0F172A] rounded-lg p-3">
          <p className="text-xs text-[#94A3B8]">AI Cost Today</p>
          <p className="text-lg font-display font-bold text-primary">₹1,240</p>
          <Progress value={62} className="h-1 mt-2" />
          <p className="text-[10px] text-[#94A3B8] mt-1">62% of daily budget</p>
        </div>
      </div>
    </div>
  </AdminShell>
);
export default AdminUpload;
