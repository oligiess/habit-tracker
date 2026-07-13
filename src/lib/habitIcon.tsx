import {
  CheckCircle2,
  Droplets,
  BookOpen,
  Dumbbell,
  Moon,
  Apple,
  Wind,
  Brain,
  Wallet,
  Users,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  mindfulness: Wind,
  meditation: Wind,
  learning: BookOpen,
  reading: BookOpen,
  health: Droplets,
  hydration: Droplets,
  fitness: Dumbbell,
  exercise: Dumbbell,
  recovery: Moon,
  sleep: Moon,
  nutrition: Apple,
  diet: Apple,
  mental: Brain,
  finance: Wallet,
  money: Wallet,
  social: Users,
};

export function habitIcon(category: string | null): LucideIcon {
  if (!category) return CheckCircle2;
  return CATEGORY_ICONS[category.trim().toLowerCase()] ?? CheckCircle2;
}
