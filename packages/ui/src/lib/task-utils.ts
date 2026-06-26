import type { Task, TaskContentSummary } from "@vokcg/types";
import { isTaskActive, isTaskDone, isTaskFailed } from "./task-status";

export type TaskStatusFilter = "all" | "processing" | "completed" | "failed";

export function getTaskVideos(task: Task) {
  return [...(task.combined_videos ?? []), ...(task.videos ?? [])];
}

export function getTaskFinalVideo(task: Task): string | null {
  const finals = task.videos ?? [];
  if (finals.length > 0) return finals[finals.length - 1]!;
  const combined = task.combined_videos ?? [];
  if (combined.length > 0) return combined[combined.length - 1]!;
  return null;
}

export function getTaskTerms(task: Task): string[] {
  if (!task.terms) return [];
  if (Array.isArray(task.terms)) return task.terms.filter(Boolean);
  return task.terms
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function getTaskMaterials(task: Task): string[] {
  if (!task.materials?.length) return [];
  return task.materials.map((item) => {
    if (typeof item === "string") return item.split("/").pop() ?? item;
    return item.url?.split("/").pop() ?? item.provider ?? "material";
  });
}

export function getTaskFinalVideoIndex(task: Task): number {
  const all = getTaskVideos(task);
  const final = getTaskFinalVideo(task);
  if (!final || all.length === 0) return 0;
  const idx = all.indexOf(final);
  return idx >= 0 ? idx : 0;
}

export function formatTaskId(taskId: string, length = 8) {
  return taskId.length > length ? `${taskId.slice(0, length)}…` : taskId;
}

export function getTaskAspectRatioCss(task: Task): string {
  const raw = task.video_aspect?.trim();
  if (!raw) return "16 / 9";
  const parts = raw.split(":").map((p) => Number.parseFloat(p.trim()));
  if (parts.length === 2 && parts.every((n) => Number.isFinite(n) && n > 0)) {
    return `${parts[0]} / ${parts[1]}`;
  }
  return "16 / 9";
}

function truncateText(value: string, max = 120) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function getTaskContentSummary(task: Task): TaskContentSummary {
  const keywords = getTaskTerms(task);
  const materials = getTaskMaterials(task);
  const scriptPreview = task.script ? truncateText(task.script, 140) : "";
  const subject = task.video_subject?.trim();
  const topic =
    subject ||
    scriptPreview ||
    (keywords.length > 0 ? keywords.slice(0, 2).join(", ") : "") ||
    task.title?.trim() ||
    "Untitled video";

  return {
    topic,
    scriptPreview,
    keywords,
    source: task.video_source?.trim() || "—",
    aspect: task.video_aspect?.trim() || "—",
    materialCount: materials.length,
    videoCount: task.video_count ?? 0,
  };
}

export function filterTasks(
  tasks: Task[],
  searchQuery: string,
  statusFilter: TaskStatusFilter,
): Task[] {
  const query = searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    if (statusFilter === "processing" && !isTaskActive(task.state))
      return false;
    if (statusFilter === "completed" && !isTaskDone(task.state)) return false;
    if (statusFilter === "failed" && !isTaskFailed(task.state)) return false;

    if (!query) return true;

    const summary = getTaskContentSummary(task);
    const haystack = [
      summary.topic,
      summary.scriptPreview,
      summary.keywords.join(" "),
      task.video_subject ?? "",
      task.script ?? "",
      task.id,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function downloadTaskVideo(task: Task) {
  const url = getTaskFinalVideo(task);
  if (!url) return false;

  const slug =
    getTaskContentSummary(task)
      .topic.replace(/[^a-z0-9]+/gi, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 48) || task.id.slice(0, 8);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slug}.mp4`;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return true;
}
