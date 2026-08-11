import { Crown, CreditCard, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AppShell from "@/components/layout/AppShell";
import { Link } from "react-router-dom";

const SubscriptionSettings = () => (
  <AppShell>
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-ink-1 mb-6">Subscription & Billing</h1>
      <div className="bg-primary-light border-2 border-primary rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-2"><Crown className="h-5 w-5 text-primary" /><h3 className="font-bold text-ink-1">PREMIUM Plan</h3><span className="text-xs bg-success text-white px-2 py-0.5 rounded-full">Active</span></div>
        <ul className="text-sm text-ink-2 space-y-1 mb-3">
          {["All 7 levels", "Unlimited books", "Notes & highlights", "Full workbook"].map((f) => (
            <li key={f} className="flex items-center gap-2"><Check className="h-3 w-3 text-success" />{f}</li>
          ))}
        </ul>
        <p className="text-xs text-ink-3">Next billing: Apr 30, 2026 · ₹159/mo</p>
      </div>
      <div className="bg-success-light border border-success/20 rounded-xl p-4 mb-6">
        <p className="text-sm text-success font-medium">This month: 12 books read = ₹16.5 per book 📚</p>
      </div>
      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-ink-1 mb-3">Usage</h3>
        <div className="space-y-3">
          <div><div className="flex justify-between text-sm mb-1"><span className="text-ink-2">Books read</span><span className="text-ink-1">12 / unlimited</span></div><Progress value={100} className="h-1.5" /></div>
          <div><div className="flex justify-between text-sm mb-1"><span className="text-ink-2">Levels unlocked</span><span className="text-ink-1">42</span></div></div>
        </div>
      </div>
      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-ink-1 mb-3 flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment Method</h3>
        <p className="text-sm text-ink-2">UPI ending in ****1234</p>
        <button className="text-sm text-primary hover:underline mt-1">Change payment method</button>
      </div>
      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-ink-1 mb-3">Invoice History</h3>
        {["Mar 2026 — ₹159", "Feb 2026 — ₹159", "Jan 2026 — ₹159"].map((inv) => (
          <div key={inv} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-ink-2">{inv}</span>
            <button className="text-xs text-primary hover:underline flex items-center gap-1"><Download className="h-3 w-3" />PDF</button>
          </div>
        ))}
      </div>
      <Button variant="outline" asChild><Link to="/plans">Change Plan</Link></Button>
    </div>
  </AppShell>
);
export default SubscriptionSettings;
