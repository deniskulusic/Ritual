import {
  ArrowUpRight,
  Box,
  Clock3,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Truck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { DashboardIconName } from "./dashboard-data";

const iconMap: Record<DashboardIconName, LucideIcon> = {
  "arrow-up-right": ArrowUpRight,
  box: Box,
  "clock-3": Clock3,
  "shopping-bag": ShoppingBag,
  sparkles: Sparkles,
  "triangle-alert": TriangleAlert,
  "trending-up": TrendingUp,
  truck: Truck,
  users: Users,
};

export function DashboardIcon({
  icon,
  size = 18,
  strokeWidth = 1.8,
}: {
  icon: DashboardIconName;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = iconMap[icon];

  return <Icon aria-hidden="true" size={size} strokeWidth={strokeWidth} />;
}
