import {
  Building2,
  CreditCard,
  Package,
} from "lucide-react";
import type { StatGridItem } from "@/components/admin";
import type { AdminOverview } from "@/types/auth";

export function buildSaasStatItems(stats?: AdminOverview): StatGridItem[] {
  if (!stats) return [];

  const items: StatGridItem[] = [];

  if (stats.tenants != null) {
    items.push({
      label: "Tenants",
      value: stats.tenants,
      icon: Building2,
      accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    });
  }
  if (stats.plans != null) {
    items.push({
      label: "Plans",
      value: stats.plans,
      icon: Package,
      accent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    });
  }
  if (stats.subscriptions != null) {
    items.push({
      label: "Subscriptions",
      value: stats.subscriptions,
      icon: CreditCard,
      accent: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
    });
  }
  if (stats.mrr != null) {
    items.push({
      label: "MRR",
      value: stats.mrr,
      icon: CreditCard,
      prefix: "$",
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    });
  }

  return items;
}

export function resolveSaasColumns(count: number): 2 | 3 | 4 {
  if (count >= 4) return 4;
  if (count === 3) return 3;
  return 2;
}
