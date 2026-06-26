import type { NavBadgeVariant } from "./types";

type Props = {
  label: string;
  variant?: NavBadgeVariant;
  compact?: boolean;
};

const BADGE_STYLES: Record<NavBadgeVariant, { bg: string; color: string }> = {
  soon: {
    bg: "color-mix(in srgb,#f59e0b 12%,transparent)",
    color: "color-mix(in srgb,#d97706 90%,var(--text-primary))",
  },
  beta: {
    bg: "color-mix(in srgb,#6366f1 12%,transparent)",
    color: "color-mix(in srgb,#6366f1 90%,var(--text-primary))",
  },
  new: {
    bg: "color-mix(in srgb,#22c55e 12%,transparent)",
    color: "color-mix(in srgb,#16a34a 90%,var(--text-primary))",
  },
  custom: {
    bg: "color-mix(in srgb,var(--color-primary) 12%,transparent)",
    color: "var(--color-primary)",
  },
};

export function NavBadge({ label, variant = "soon", compact = false }: Props) {
  const { bg, color } = BADGE_STYLES[variant] ?? BADGE_STYLES.soon;
  return (
    <span
      className={[
        "ml-auto shrink-0 rounded-full font-semibold uppercase tracking-wide",
        compact ? "px-1.5 py-px text-[9px]" : "px-2 py-0.5 text-[10px]",
      ].join(" ")}
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}
