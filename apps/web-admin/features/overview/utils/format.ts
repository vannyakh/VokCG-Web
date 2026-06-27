export function timeAgo(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function logAgo(isoStr: string): string {
  return timeAgo(new Date(isoStr).getTime());
}

export function actionClass(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("creat") || a.includes("add") || a.includes("register"))
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
  if (a.includes("updat") || a.includes("edit") || a.includes("chang"))
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  if (a.includes("delet") || a.includes("remov") || a.includes("ban"))
    return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
  if (a.includes("login") || a.includes("auth") || a.includes("logout"))
    return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400";
  return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
}
