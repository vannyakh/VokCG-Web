import type { Task, TaskState } from "@vokcg/types";

export const TASK_STATE_META: Record<
  string,
  { label: string; palette: string }
> = {
  pending: { label: "Pending", palette: "blue" },
  processing: { label: "Processing", palette: "blue" },
  completed: { label: "Completed", palette: "green" },
  failed: { label: "Failed", palette: "red" },
  cancelled: { label: "Cancelled", palette: "gray" },
};

export const RENDER_PIPELINE = [
  { id: "queued", title: "Queued", sub: "waiting to start", stage: "queued" },
  {
    id: "initializing",
    title: "Initializing",
    sub: "preparing pipeline",
    stage: "initializing",
  },
  { id: "script", title: "Script", sub: "generating script", stage: "script" },
  { id: "audio", title: "Voice", sub: "synthesizing audio", stage: "audio" },
  {
    id: "subtitles",
    title: "Subtitles",
    sub: "building subtitles",
    stage: "subtitles",
  },
  {
    id: "materials",
    title: "Materials",
    sub: "fetching video clips",
    stage: "materials",
  },
  {
    id: "compositing",
    title: "Compositing",
    sub: "combining clips",
    stage: "compositing",
  },
  {
    id: "encoding",
    title: "Finalizing",
    sub: "encoding output",
    stage: "encoding",
  },
] as const;

const STAGE_BY_ID = Object.fromEntries(
  RENDER_PIPELINE.map((s, i) => [s.id, { ...s, index: i }]),
) as Record<string, (typeof RENDER_PIPELINE)[number] & { index: number }>;

const PROGRESS_FALLBACK: { min: number; id: string }[] = [
  { min: 0, id: "queued" },
  { min: 5, id: "initializing" },
  { min: 10, id: "script" },
  { min: 20, id: "audio" },
  { min: 30, id: "subtitles" },
  { min: 40, id: "materials" },
  { min: 50, id: "compositing" },
  { min: 75, id: "encoding" },
];

export function getTaskStateMeta(state: TaskState | string) {
  return TASK_STATE_META[state] ?? { label: "Unknown", palette: "gray" };
}

export function isTaskActive(state: TaskState | string | undefined): boolean {
  return state === "pending" || state === "processing";
}

export function isTaskDone(state: TaskState | string | undefined): boolean {
  return state === "completed";
}

export function isTaskFailed(state: TaskState | string | undefined): boolean {
  return state === "failed" || state === "cancelled";
}

export type RenderStatus = {
  title: string;
  sub: string;
  stage: string;
  index: number;
  total: number;
};

export function getRenderStatus(
  task: Pick<Task, "progress" | "stage" | "state"> | undefined,
): RenderStatus {
  if (!task) {
    return { ...RENDER_PIPELINE[0], index: 0, total: RENDER_PIPELINE.length };
  }

  if (isTaskFailed(task.state)) {
    return {
      title: "Failed",
      sub: "render stopped",
      stage: "failed",
      index: RENDER_PIPELINE.length - 1,
      total: RENDER_PIPELINE.length,
    };
  }

  const stageId =
    task.stage ??
    [...PROGRESS_FALLBACK].reverse().find((s) => (task.progress ?? 0) >= s.min)
      ?.id ??
    "queued";

  const meta = STAGE_BY_ID[stageId] ?? STAGE_BY_ID["queued"]!;
  return { ...meta, total: RENDER_PIPELINE.length };
}

export function parseVideoAspect(aspect: string) {
  const [w, h] = aspect.split(":").map(Number);
  if (!w || !h) return { ratioW: 16, ratioH: 9 };
  return { ratioW: w, ratioH: h };
}

export function fitAspectBox(
  containerW: number,
  containerH: number,
  ratioW: number,
  ratioH: number,
) {
  if (containerW <= 0 || containerH <= 0) return { width: 0, height: 0 };
  const aspect = ratioW / ratioH;
  const boxAspect = containerW / containerH;
  if (boxAspect > aspect) {
    const height = containerH;
    return { width: Math.round(height * aspect), height };
  }
  const width = containerW;
  return { width, height: Math.round(width / aspect) };
}
