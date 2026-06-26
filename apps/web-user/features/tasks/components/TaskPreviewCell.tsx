"use client";

import { ListVideo } from "lucide-react";
import {
  DotGridLoader,
  TaskVideoPoster,
  getRenderStatus,
  isTaskActive,
  isTaskFailed,
  formatTaskId,
  getTaskFinalVideo,
} from "@vokcg/ui";
import type { Task } from "@vokcg/types";

export function TaskPreviewCell({
  task,
  selected,
}: {
  task: Task;
  selected: boolean;
}) {
  const finalVideo = getTaskFinalVideo(task);
  const active = isTaskActive(task.state);
  const failed = isTaskFailed(task.state);
  const renderStatus = getRenderStatus(task);

  return (
    <div
      className={[
        "tasks-thumb relative shrink-0 w-24 h-14 md:w-32 md:h-18 bg-black overflow-hidden rounded-lg border border-divider",
        selected
          ? "tasks-thumb--selected border-default"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {active ? (
        <DotGridLoader
          fill
          compact
          progress={task.progress ?? 0}
          jobId={formatTaskId(task.id, 8)}
          status={renderStatus}
        />
      ) : finalVideo ? (
        <TaskVideoPoster src={finalVideo} objectFit="cover" />
      ) : failed ? (
        <div className="flex h-full items-center justify-center bg-red-50 dark:bg-red-950/40">
          <span className="text-[11px] font-medium text-red-500">Failed</span>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center bg-subtle">
          <ListVideo size={18} className="text-muted" />
        </div>
      )}
    </div>
  );
}
