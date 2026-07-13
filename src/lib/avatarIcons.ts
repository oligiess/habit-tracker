import { Anchor, Cat, Dog, Flame, Leaf, Rocket, Star, Sun, type LucideIcon } from "lucide-react";

export interface AvatarIconOption {
  id: string;
  icon: LucideIcon;
  color: string;
}

export const AVATAR_ICONS: AvatarIconOption[] = [
  { id: "anchor", icon: Anchor, color: "#2563eb" },
  { id: "flame", icon: Flame, color: "#f97316" },
  { id: "leaf", icon: Leaf, color: "#16a34a" },
  { id: "star", icon: Star, color: "#eab308" },
  { id: "rocket", icon: Rocket, color: "#7c3aed" },
  { id: "sun", icon: Sun, color: "#f59e0b" },
  { id: "cat", icon: Cat, color: "#db2777" },
  { id: "dog", icon: Dog, color: "#0891b2" },
];

export function avatarIcon(id: string | null | undefined): AvatarIconOption | null {
  if (!id) return null;
  return AVATAR_ICONS.find((option) => option.id === id) ?? null;
}
