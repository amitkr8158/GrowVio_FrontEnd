import { Share2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppShell from "@/components/layout/AppShell";

const quotes = [
  "Habits are the compound interest of self-improvement.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "Every action is a vote for the type of person you wish to become.",
];

const ShareReferral = () => (
  <AppShell>
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold text-ink-1 mb-6">Share & Refer</h1>
      {/* Quote cards */}
      <div className="space-y-4 mb-8">
        {quotes.map((q, i) => (
          <div key={i} className="bg-gradient-hero text-white rounded-xl p-6">
            <p className="font-display text-lg italic mb-3">"{q}"</p>
            <p className="text-sm text-white/60">— Atomic Habits</p>
          </div>
        ))}
      </div>
      {/* Share buttons */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Button className="bg-[#25D366] hover:bg-[#22c55e] text-white gap-2">WhatsApp</Button>
        <Button variant="outline" className="gap-2">Twitter/X</Button>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Download PNG</Button>
        <Button variant="outline" className="gap-2"><Copy className="h-4 w-4" />Copy Link</Button>
      </div>
      {/* Referral */}
      <div className="bg-background border border-border rounded-xl p-6">
        <h3 className="font-semibold text-ink-1 mb-2">Refer & Earn</h3>
        <p className="text-sm text-ink-3 mb-4">Earn 30 days free for each signup!</p>
        <div className="flex gap-2">
          <Input value="growvio.in/r/amit" readOnly className="text-sm" />
          <Button size="sm" variant="outline"><Copy className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  </AppShell>
);
export default ShareReferral;
