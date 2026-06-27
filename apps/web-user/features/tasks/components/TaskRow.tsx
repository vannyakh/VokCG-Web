"use client";

import React from "react";
import { Checkbox } from "antd";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TaskDeleteButton,
  getTaskContentSummary,
  getTaskStateMeta,
  isTaskActive,
  getRenderStatus,
} from "@vokcg/ui";
import { taskDetailRoute } from "@vokcg/constants";
import type { Task } from "@vokcg/types";
import {
  STATUS_DOT_COLOR,
  formatSourceLabel,
  formatAspectLabel,
} from "./utils";
import { TaskPreviewCell } from "./TaskPreviewCell";
import { TaskTopicCell, TaskKeywordsCell, TaskStatusCell } from "./TaskCells";

interface TaskRowProps {
  task: Task;
  checked: boolean;
  onToggleCheck: () => void;
  onDelete: (id: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function TaskRow({
  task,
  checked,
  onToggleCheck,
  onDelete,
  t,
}: TaskRowProps) {
  const router = useRouter();
  const summary = getTaskContentSummary(task);
  const meta = getTaskStateMeta(task.state);
  const active = isTaskActive(task.state);
  const progress = task.progress ?? 0;
  const renderStatus = getRenderStatus(task);
  const count = summary.materialCount;

  const handleClick = () => {
    router.push(taskDetailRoute(task.id));
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={[
        "flex flex-col md:flex-row md:items-center px-4 py-3 cursor-pointer transition-all duration-150 outline-none select-none relative",
        "mb-3 mx-1 rounded-2xl border shadow-sm",
        "md:mb-0 md:mx-0 md:rounded-none md:border-0 md:border-b md:border-default/60 md:shadow-none md:last:border-b-0",
        checked
          ? "border-primary/40 bg-surface/80 md:bg-primary/5"
          : "border-default bg-surface hover:bg-[var(--bg-subtle)]",
      ].join(" ")}
    >
      {/* Left & Thumbnail Container */}
      <div className="flex items-center w-full md:w-auto">
        {/* Checkbox */}
        <div
          className="w-12 shrink-0 flex items-center justify-center cursor-default"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={checked}
            onChange={onToggleCheck}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Thumbnail */}
        <div className="w-24 md:w-40 shrink-0 pl-1">
          <TaskPreviewCell task={task} selected={false} />
        </div>

        {/* Mobile Row Content (hidden on desktop) */}
        <div className="flex-1 min-w-0 md:hidden ml-3 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="line-clamp-2 text-sm font-semibold text-primary leading-snug">
              {summary.topic}
            </h4>
            <div className="shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
              <TaskDeleteButton
                task={task}
                onDelete={onDelete}
                variant="table"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-secondary mt-0.5">
            <span>{formatSourceLabel(summary.source)}</span>
            <span className="text-muted/60">•</span>
            <span className="tabular-nums">
              {formatAspectLabel(summary.aspect)}
            </span>
            {count > 0 && (
              <>
                <span className="text-muted/60">•</span>
                <span className="tabular-nums">
                  {t("tasks.materialsCount", { count })}
                </span>
              </>
            )}
            {task.created_at && (
              <>
                <span className="text-muted/60">•</span>
                <span className="tabular-nums">
                  {new Date(task.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_COLOR[meta.palette] ?? STATUS_DOT_COLOR["gray"]}`}
            />
            <span className="text-xs font-semibold text-primary">
              {meta.label}
            </span>
            {active && (
              <span className="text-[11px] tabular-nums text-muted">
                · {renderStatus.title} · {progress}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Row Columns (hidden on mobile) */}
      <div className="hidden md:flex flex-1 items-center min-w-0">
        {/* Topic */}
        <div className="flex-1 min-w-0 pr-4">
          <TaskTopicCell task={task} />
        </div>

        {/* Keywords */}
        <div className="w-[180px] shrink-0 hidden xl:block pr-4">
          <TaskKeywordsCell task={task} />
        </div>

        {/* Source */}
        <div className="w-24 shrink-0 hidden md:block pr-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/5 text-blue-500 border border-blue-500/10 dark:bg-blue-400/5 dark:text-blue-400 dark:border-blue-400/10">
            {formatSourceLabel(summary.source)}
          </span>
        </div>

        {/* Aspect */}
        <div className="w-20 shrink-0 hidden lg:block pr-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/5 text-purple-500 border border-purple-500/10 dark:bg-purple-400/5 dark:text-purple-400 dark:border-purple-400/10">
            {formatAspectLabel(summary.aspect)}
          </span>
        </div>

        {/* Materials */}
        <div className="w-24 shrink-0 hidden lg:block pr-4 text-center">
          {count <= 0 ? (
            <span className="text-[13px] text-muted">—</span>
          ) : (
            <Tooltip content={t("tasks.materialsHint")}>
              <span className="text-[13px] tabular-nums text-secondary">
                {t("tasks.materialsCount", { count })}
              </span>
            </Tooltip>
          )}
        </div>

        {/* Status */}
        <div className="w-32 shrink-0 pr-4">
          <TaskStatusCell task={task} />
        </div>

        {/* Delete button */}
        <div
          className="w-12 shrink-0 flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <TaskDeleteButton task={task} onDelete={onDelete} variant="table" />
        </div>
      </div>
    </div>
  );
}
