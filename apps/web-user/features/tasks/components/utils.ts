export const STATUS_DOT_COLOR: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  gray: "bg-slate-300 dark:bg-slate-600",
};

export function formatSourceLabel(source: string) {
  if (!source || source === "—") return "—";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function formatAspectLabel(aspect: string) {
  if (!aspect || aspect === "—") return "—";
  const lower = aspect.toLowerCase();
  if (lower.includes("portrait")) return "Portrait";
  if (lower.includes("landscape")) return "Landscape";
  return aspect;
}
