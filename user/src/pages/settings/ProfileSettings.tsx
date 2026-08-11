import { User, Camera, Globe, Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import AppShell from "@/components/layout/AppShell";

const ProfileSettings = () => (
  <AppShell>
    <div className="max-w-2xl mx-auto">
      <div className="bg-info-light border border-info/20 rounded-xl p-3 mb-6">
        <p className="text-sm text-info">Profile 70% complete — <strong>Add bio for +50 XP</strong></p>
        <Progress value={70} className="h-1.5 mt-2" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink-1 mb-6">Profile Settings</h1>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center relative">
            <User className="h-8 w-8 text-primary" />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Camera className="h-3 w-3" /></button>
          </div>
          <div><p className="font-medium text-ink-1">Amit Sharma</p><p className="text-xs text-ink-3">Change photo</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Full Name</Label><Input defaultValue="Amit Sharma" className="mt-1" /></div>
          <div><Label>Email</Label><Input defaultValue="amit@example.com" className="mt-1" /></div>
        </div>
        <div><Label>Bio <span className="text-ink-4">(160 chars)</span></Label><Textarea placeholder="Tell us about yourself..." className="mt-1" maxLength={160} /></div>
        <div><Label>Location</Label><Input placeholder="Mumbai, India" className="mt-1" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>LinkedIn URL</Label><Input placeholder="linkedin.com/in/..." className="mt-1" /></div>
          <div><Label>Twitter/X</Label><Input placeholder="@username" className="mt-1" /></div>
        </div>
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-ink-1 mb-4 flex items-center gap-2"><Globe className="h-5 w-5" />Language</h3>
          <div className="flex gap-3">
            <Button variant="default">English</Button>
            <Button variant="outline">हिंदी</Button>
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-ink-1 mb-4">Reading Preferences</h3>
          <div className="flex items-center justify-between"><span className="text-sm text-ink-2">Make profile public</span><Switch /></div>
        </div>
        <div className="border-t border-danger/30 pt-6">
          <h3 className="font-semibold text-danger mb-2 flex items-center gap-2"><Trash2 className="h-5 w-5" />Danger Zone</h3>
          <Button variant="destructive" size="sm">Delete Account</Button>
        </div>
        <div className="sticky bottom-0 bg-background py-4 border-t border-border -mx-4 px-4 md:-mx-6 md:px-6">
          <Button className="w-full md:w-auto">Save Changes</Button>
        </div>
      </div>
    </div>
  </AppShell>
);
export default ProfileSettings;
