import {
  BarChart3,
  BookOpen,
  FileStack,
  FileText,
  FlaskConical,
  Home,
  Image,
  LayoutTemplate,
  Layers,
  History,
  ShieldCheck,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface CreatorNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
}

export interface CreatorNavGroup {
  label: string;
  items: CreatorNavItem[];
}

export const creatorNav: CreatorNavGroup[] = [
  {
    label: "Studio",
    items: [
      { label: "Dashboard", to: "/creator", icon: Home },
      { label: "My Books", to: "/creator/books", icon: BookOpen },
    ],
  },
  {
    label: "7-Layer Sets",
    items: [
      { label: "Snapshot", to: "/creator/sets/snapshot", icon: FileText },
      { label: "Flashdeck", to: "/creator/sets/flashdeck", icon: Layers },
      { label: "Infosummary", to: "/creator/sets/infographic", icon: Image },
      { label: "Deep Read", to: "/creator/sets/deepread", icon: BookOpen },
      { label: "Mastery Test", to: "/creator/sets/mastery", icon: FlaskConical },
      { label: "Action Plan", to: "/creator/sets/actionplan", icon: LayoutTemplate },
      { label: "Quick Recall", to: "/creator/sets/recall", icon: Trophy },
    ],
  },
  {
    label: "Assets",
    items: [
      { label: "Raw Files", to: "/creator/raw-files", icon: FileStack },
      { label: "Media Library", to: "/creator/media", icon: Image },
      { label: "AI Assistant", to: "/creator/ai", icon: Sparkles },
    ],
  },
  {
    label: "Publishing",
    items: [
      { label: "Review & Publish", to: "/creator/publish", icon: ShieldCheck },
      { label: "Version History", to: "/creator/versions", icon: History },
      { label: "Analytics", to: "/creator/analytics", icon: BarChart3 },
    ],
  },
];
