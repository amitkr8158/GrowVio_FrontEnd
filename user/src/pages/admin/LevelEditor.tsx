import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminShell from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";

const levels = [
  { id: 1, name: "60-Second Summary", quality: 95, status: "published" },
  { id: 2, name: "Key Takeaways", quality: 88, status: "published" },
  { id: 3, name: "Chapter Breakdown", quality: 82, status: "published" },
  { id: 4, name: "Deep Analysis", quality: 76, status: "draft" },
  { id: 5, name: "Applications", quality: 0, status: "pending" },
  { id: 6, name: "Expert Commentary", quality: 0, status: "pending" },
  { id: 7, name: "Full Mastery", quality: 0, status: "pending" },
];

const LevelEditor = () => (
  <AdminShell>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Level Content Editor</h1>
        <p className="text-sm text-[#94A3B8]">Atomic Habits — James Clear</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="border-[#334155] text-[#E2E8F0]">Preview</Button>
        <Button className="bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-1" />Approve & Publish</Button>
      </div>
    </div>
    <Tabs defaultValue="1">
      <TabsList className="bg-[#1E293B] border border-[#334155] mb-4">
        {levels.map((l) => (
          <TabsTrigger key={l.id} value={l.id.toString()} className="gap-1">
            <span className={`w-2 h-2 rounded-full ${l.quality >= 85 ? "bg-green-400" : l.quality >= 70 ? "bg-yellow-400" : l.quality > 0 ? "bg-red-400" : "bg-[#334155]"}`} />
            L{l.id}
          </TabsTrigger>
        ))}
      </TabsList>
      {levels.map((l) => (
        <TabsContent key={l.id} value={l.id.toString()}>
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{l.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${l.quality >= 85 ? "bg-green-400/20 text-green-400" : l.quality >= 70 ? "bg-yellow-400/20 text-yellow-400" : "bg-[#334155] text-[#94A3B8]"}`}>
                Quality: {l.quality || "N/A"}%
              </span>
            </div>
            {l.quality > 0 ? (
              <Textarea className="min-h-[300px] bg-[#0F172A] border-[#334155] text-[#E2E8F0] font-body" defaultValue={`Content for ${l.name}...\n\nThe most practical approach to building good habits is understanding the compound effect of small improvements...`} />
            ) : (
              <div className="h-64 flex items-center justify-center text-[#94A3B8]">
                <div className="text-center">
                  <p className="mb-3">Content not yet generated</p>
                  <Button>Generate Level {l.id}</Button>
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="border-[#334155] text-[#E2E8F0]">Regenerate</Button>
              <Button variant="outline" className="border-[#334155] text-[#E2E8F0]">Preview As User</Button>
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  </AdminShell>
);
export default LevelEditor;
