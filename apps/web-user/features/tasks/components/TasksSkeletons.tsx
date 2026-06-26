"use client";

import React from "react";

const LIST_THUMB = { width: 128, height: 72 } as const;

function Bone({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg ${className}`}
      style={style}
    />
  );
}

function GridCardSkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="overflow-hidden rounded-xl bg-surface"
      style={{ animationDelay: `${delay}s` }}
    >
      <Bone className="w-full rounded-none" style={{ aspectRatio: "16/9" }} />
    </div>
  );
}

export function GridSkeleton({
  cols = "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
}: {
  cols?: string;
}) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <GridCardSkeleton key={i} delay={i * 0.06} />
      ))}
    </div>
  );
}

export function ListRowSkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="flex flex-col md:flex-row md:items-center px-4 py-3.5"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center w-full md:w-auto">
        {/* Checkbox placeholder */}
        <div className="w-12 shrink-0 flex items-center justify-center">
          <Bone className="h-4 w-4 rounded" />
        </div>

        {/* Thumbnail placeholder */}
        <div className="w-24 md:w-32 shrink-0 pl-1">
          <Bone className="rounded-lg w-24 h-14 md:w-32 md:h-18" />
        </div>

        {/* Mobile skeleton details */}
        <div className="flex-1 min-w-0 md:hidden ml-3 flex flex-col gap-2">
          <Bone className="h-4 w-3/4 rounded-md" />
          <Bone className="h-3 w-1/2 rounded-md" />
          <Bone className="h-3 w-1/3 rounded-md" />
        </div>
      </div>

      {/* Desktop skeleton columns */}
      <div className="hidden md:flex flex-1 items-center min-w-0">
        {/* Topic */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex flex-col gap-1.5">
            <Bone className="h-3.5 w-2/3 rounded-md" />
            <Bone className="h-2.5 w-1/3 rounded-md" />
          </div>
        </div>

        {/* Keywords */}
        <div className="w-[180px] shrink-0 hidden xl:block pr-4">
          <Bone className="h-3.5 w-24 rounded-md" />
        </div>

        {/* Source */}
        <div className="w-24 shrink-0 hidden md:block pr-4">
          <Bone className="h-3.5 w-12 rounded-md" />
        </div>

        {/* Aspect */}
        <div className="w-20 shrink-0 hidden lg:block pr-4">
          <Bone className="h-3.5 w-10 rounded-md" />
        </div>

        {/* Materials */}
        <div className="w-24 shrink-0 hidden lg:block pr-4 flex justify-center">
          <Bone className="h-3.5 w-8 rounded-md" />
        </div>

        {/* Status */}
        <div className="w-32 shrink-0 pr-4">
          <div className="flex flex-col gap-1">
            <Bone className="h-3.5 w-16 rounded-md" />
            <Bone className="h-2.5 w-12 rounded-md" />
          </div>
        </div>

        {/* Actions */}
        <div className="w-12 shrink-0 flex justify-center">
          <Bone className="h-5 w-5 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="tasks-table-shell overflow-hidden rounded-2xl bg-surface divide-y divide-divider/60">
      {Array.from({ length: 6 }).map((_, i) => (
        <ListRowSkeleton key={i} delay={i * 0.06} />
      ))}
    </div>
  );
}
