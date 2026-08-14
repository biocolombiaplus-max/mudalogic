import {
  Box,
  Truck,
  Tag,
  FileSignature,
  MapPinned,
  Users,
  ShieldCheck,
  BadgeCheck,
  Clock,
  Award,
  Heart,
  ThumbsUp,
  LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  box: Box,
  truck: Truck,
  price: Tag,
  doc: FileSignature,
  map: MapPinned,
  team: Users,
  shield: ShieldCheck,
  badge: BadgeCheck,
  clock: Clock,
  award: Award,
  heart: Heart,
  thumbsup: ThumbsUp,
};

export const ICON_OPTIONS = Object.keys(ICON_MAP);
