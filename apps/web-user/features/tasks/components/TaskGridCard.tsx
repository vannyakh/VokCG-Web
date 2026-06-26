"use client";

import { motion } from "framer-motion";
import { Checkbox } from "antd";
import { ListVideo } from "lucide-react";
import {
  fadeUpItem,
  TaskDeleteButton,
  getTaskContentSummary,
  getTaskStateMeta,
  isTaskActive,
  isTaskFailed,
  getRenderStatus,
  formatTaskId,
  getTaskFinalVideo,
  TaskVideoPoster,
  DotGridLoader,
} from "@vokcg/ui";
import type { Task } from "@vokcg/types";
import { STATUS_DOT_COLOR } from "./utils";

const GRID_THUMB_ASPECT = "16 / 9" as const;

function TaskGridThumb({ task, selected }: { task: Task; selected: boolean }) {
  const finalVideo = getTaskFinalVideo(task);
  const active = isTaskActive(task.state);
  const failed = isTaskFailed(task.state);
  const renderStatus = getRenderStatus(task);
  const progress = task.progress ?? 0;

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ aspectRatio: GRID_THUMB_ASPECT }}
    >
      {finalVideo && !active && (
        <TaskVideoPoster src={finalVideo} objectFit="cover" />
      )}
      {active && (
        <div className="absolute inset-0">
          <DotGridLoader
            fill
            compact
            progress={progress}
            jobId={formatTaskId(task.id, 8)}
            status={renderStatus}
          />
        </div>
      )}
      {failed && !finalVideo && (
        <div
          className="flex h-full items-center justify-center"
          style={{ background: "rgba(127,29,29,0.45)" }}
        >
          <span className="text-xs font-bold text-red-200">Failed</span>
        </div>
      )}
      {!finalVideo && !active && !failed && (
        <div className="flex h-full items-center justify-center bg-subtle">
          <ListVideo size={28} className="text-slate-400 dark:text-slate-500" />
        </div>
      )}
    </div>
  );
}

export function TaskGridCard({
  task,
  selected,
  checked,
  onSelect,
  onToggleCheck,
  onDelete,
}: {
  task: Task;
  selected: boolean;
  checked: boolean;
  onSelect: () => void;
  onToggleCheck: () => void;
  onDelete: (id: string) => void;
}) {
  const summary = getTaskContentSummary(task);
  const meta = getTaskStateMeta(task.state);
  const active = isTaskActive(task.state);

  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div
        role="button"
        tabIndex={0}
        title={summary.topic}
        className={[
          "w-full overflow-hidden rounded-xl border bg-surface cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md outline-none",
          selected
            ? "border-default bg-[var(--bg-active)] shadow-md"
            : checked
              ? "border-primary/60 bg-surface/80"
              : "border-default hover:border-primary/40",
        ].join(" ")}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        {/* Thumbnail */}
        <div className="relative">
          <TaskGridThumb task={task} selected={selected} />

          <div
            className="absolute left-0 top-0 p-3 z-10 cursor-default"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onKeyUp={(e) => {
              e.stopPropagation();
            }}
          >
            <Checkbox
              checked={checked}
              onChange={onToggleCheck}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute right-2 top-2">
            <TaskDeleteButton
              task={task}
              onDelete={onDelete}
              variant="overlay"
            />
          </div>

          {/* Active progress badge */}
          {active && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
              <span className="text-[10px] font-medium text-white">
                {task.progress ?? 0}%
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="px-3 py-2.5">
          <p
            className="line-clamp-1 text-[13px] font-medium leading-snug text-primary"
            title={summary.topic}
          >
            {summary.topic}
          </p>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_COLOR[meta.palette] ?? STATUS_DOT_COLOR["gray"]}`}
              />
              <span className="truncate text-[11px] text-secondary">
                {meta.label}
              </span>
            </div>

            {task.created_at && (
              <span className="shrink-0 text-[11px] tabular-nums text-muted">
                {new Date(task.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {summary.aspect && summary.aspect !== "—" && (
            <p className="mt-1 text-[11px] text-muted">{summary.aspect}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
