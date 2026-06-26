"use client";

import {
  getTaskContentSummary,
  getTaskStateMeta,
  isTaskActive,
  getRenderStatus,
} from "@vokcg/ui";
import type { Task } from "@vokcg/types";
import { STATUS_DOT_COLOR } from "./utils";

export function TaskTopicCell({ task }: { task: Task }) {
  const summary = getTaskContentSummary(task);
  return (
    <div className="min-w-0 py-1">
      <p
        className="line-clamp-1 font-semibold text-[13.5px] leading-snug text-primary hover:text-accent transition-colors duration-150"
        title={summary.topic}
      >
        {summary.topic}
      </p>
      {summary.scriptPreview && summary.scriptPreview !== summary.topic && (
        <p
          className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted font-normal"
          title={task.script}
        >
          {summary.scriptPreview}
        </p>
      )}
    </div>
  );
}

export function TaskKeywordsCell({ task }: { task: Task }) {
  const keywords = getTaskContentSummary(task).keywords;
  if (keywords.length === 0)
    return <span className="text-xs text-muted">—</span>;

  // Show up to 2 keywords as clean badges, collapse rest
  const visibleKeywords = keywords.slice(0, 2);
  const hasMore = keywords.length > 2;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visibleKeywords.map((kw, idx) => (
        <span
          key={idx}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-subtle border border-default text-secondary"
        >
          {kw}
        </span>
      ))}
      {hasMore && (
        <span className="text-[10px] text-muted font-semibold pl-0.5">
          +{keywords.length - 2}
        </span>
      )}
    </div>
  );
}

export function TaskStatusCell({ task }: { task: Task }) {
  const meta = getTaskStateMeta(task.state);
  const active = isTaskActive(task.state);
  const renderStatus = getRenderStatus(task);
  const progress = task.progress ?? 0;

  // Custom pill styling based on task state
  let stateBg = "bg-slate-500/5 border-slate-500/10 text-slate-500";
  if (task.state === "completed") {
    stateBg =
      "bg-emerald-500/5 border-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  } else if (task.state === "failed") {
    stateBg = "bg-red-500/5 border-red-500/15 text-red-600 dark:text-red-400";
  } else if (active) {
    stateBg =
      "bg-blue-500/5 border-blue-500/15 text-blue-600 dark:text-blue-400";
  }

  return (
    <div className="flex min-w-[96px] flex-col gap-0.5">
      <div className="flex items-center">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${stateBg}`}
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_COLOR[meta.palette] ?? STATUS_DOT_COLOR["gray"]} ${
              active ? "animate-pulse" : ""
            }`}
          />
          {meta.label}
        </span>
      </div>
      {active && (
        <span className="pl-2 text-[10px] tabular-nums text-muted font-medium mt-0.5">
          {renderStatus.title} · {progress}%
        </span>
      )}
    </div>
  );
}
