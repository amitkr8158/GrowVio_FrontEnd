import { Bell, Mail, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

const sections = [
  { title: "Push Notifications", icon: Bell, items: ["Daily reading reminder", "New badge earned", "Weekly digest", "Friend activity", "New books in interests", "Payment receipts"] },
  { title: "Email", icon: Mail, items: ["Daily reading reminder", "Weekly digest", "Monthly newsletter", "Product updates", "Payment receipts"] },
  { title: "WhatsApp", icon: MessageCircle, items: ["Daily insight (1 quote)", "Weekly reading recap", "Special offers"] },
];

const NotificationSettings = () => (
  <AppShell>
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-ink-1 mb-6">Notification Preferences</h1>
      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="bg-background border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <s.icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-ink-1">{s.title}</h3>
              <div className="ml-auto"><Switch defaultChecked /></div>
            </div>
            <div className="space-y-3">
              {s.items.map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm text-ink-2">{item}</span>
                  <Switch defaultChecked={!item.includes("Special")} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button variant="destructive" size="sm">Unsubscribe from all</Button>
      </div>
    </div>
  </AppShell>
);
export default NotificationSettings;
