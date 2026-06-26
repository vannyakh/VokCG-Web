"use client";

import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Pin,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ADMIN_AFFIX_TABS, ADMIN_TAB_META } from "@vokcg/constants";
import type { AdminTab } from "@vokcg/constants";
import { useTabsDrag } from "./use-tabs-drag";
import { useAdminUiStore } from "@/store";

type AdminTabbarProps = {
  tabs: AdminTab[];
  activeTab: AdminTab;
  onTabClick: (tab: AdminTab) => void;
  onTabClose: (tab: AdminTab) => void;
  onSortTabs: (oldIndex: number, newIndex: number) => void;
  onCloseOthers?: (tab: AdminTab) => void;
  onCloseAll?: () => void;
};

export function AdminTabbar({
  tabs,
  activeTab,
  onTabClick,
  onTabClose,
  onSortTabs,
  onCloseOthers,
  onCloseAll,
}: AdminTabbarProps) {
  const { tabBarDraggable, tabBarWheelScroll, tabBarShowIcons } =
    useAdminUiStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<AdminTab, HTMLDivElement>>(new Map());
  const [atLeft, setAtLeft] = useState(true);
  const [atRight, setAtRight] = useState(false);

  const { getTabDragProps, isDragging } = useTabsDrag({
    tabs,
    draggable: tabBarDraggable,
    onSortTabs,
  });

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtLeft(el.scrollLeft <= 1);
    setAtRight(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  const scrollBy = useCallback((delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  const scrollActiveIntoView = useCallback(() => {
    const el = tabRefs.current.get(activeTab);
    el?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeTab]);

  useEffect(() => {
    if (!isDragging) scrollActiveIntoView();
    updateScrollState();
  }, [activeTab, tabs, isDragging, scrollActiveIntoView, updateScrollState]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!tabBarWheelScroll || !scrollRef.current) return;
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY || e.deltaX;
      updateScrollState();
    },
    [tabBarWheelScroll, updateScrollState],
  );

  const toolMenuItems: MenuProps["items"] = [
    {
      key: "close-others",
      label: "Close others",
      disabled: tabs.length <= 1,
      onClick: () => onCloseOthers?.(activeTab),
    },
    {
      key: "close-all",
      label: "Close all",
      disabled: tabs.filter((t) => !ADMIN_AFFIX_TABS.includes(t)).length === 0,
      onClick: () => onCloseAll?.(),
    },
  ];

  return (
    <div className="flex h-10 shrink-0 items-stretch border-b border-default bg-surface">
      <button
        type="button"
        aria-label="Scroll tabs left"
        disabled={atLeft}
        onClick={() => scrollBy(-160)}
        className={[
          "flex w-8 shrink-0 items-center justify-center border-r border-default text-muted transition-colors",
          atLeft
            ? "cursor-default opacity-30"
            : "hover:bg-black/4 hover:text-primary dark:hover:bg-white/4",
        ].join(" ")}
      >
        <ChevronsLeft size={14} />
      </button>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        onWheel={handleWheel}
        className="tabs-chrome flex min-w-0 flex-1 items-end overflow-x-auto overflow-y-hidden px-1.5 pb-0 scrollbar-none"
        style={{ cursor: isDragging ? "grabbing" : undefined }}
      >
        <div className="admin-tabs-content flex h-full w-max items-end gap-[7px] pr-2 pt-1">
          {tabs.map((tab, index) => {
            const { label, icon: Icon } = ADMIN_TAB_META[tab];
            const isActive = tab === activeTab;
            const isAffix = ADMIN_AFFIX_TABS.includes(tab);
            const canClose = !isAffix && tabs.length > 1;
            const dragProps = getTabDragProps(index, tab);

            return (
              <div
                key={tab}
                ref={(node) => {
                  if (node) tabRefs.current.set(tab, node);
                  else tabRefs.current.delete(tab);
                }}
                role="tab"
                aria-selected={isActive}
                data-title={label}
                draggable={dragProps.draggable}
                onDragStart={dragProps.onDragStart}
                onDragEnd={dragProps.onDragEnd}
                onDragOver={dragProps.onDragOver}
                onDragLeave={dragProps.onDragLeave}
                onDrop={dragProps.onDrop}
                onClick={() => onTabClick(tab)}
                className={[
                  "group relative flex h-[30px] shrink-0 select-none items-center",
                  isActive ? "z-2" : "z-1",
                  dragProps.dragClassName,
                ].join(" ")}
              >
                {index > 0 && (
                  <span
                    aria-hidden
                    className={[
                      "absolute left-[-4px] top-1/2 z-0 h-3.5 w-px -translate-y-1/2 bg-(--border-default) transition-opacity",
                      isActive ? "opacity-0" : "group-hover:opacity-0",
                    ].join(" ")}
                  />
                )}

                <span
                  aria-hidden
                  className={[
                    "absolute inset-0 rounded-t-md transition-all duration-150",
                    isActive
                      ? "bg-canvas shadow-[inset_0_-1px_0_var(--bg-canvas)]"
                      : "group-hover:bg-subtle/80",
                  ].join(" ")}
                />

                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px bg-canvas"
                  />
                )}

                <span
                  className={[
                    "relative z-1 flex items-center gap-1.5 px-3 pb-0.5",
                    isActive
                      ? "text-[13px] font-semibold text-primary"
                      : "text-[12px] font-medium text-muted group-hover:text-secondary",
                  ].join(" ")}
                >
                  {tabBarShowIcons &&
                    (isAffix ? (
                      <Pin size={11} className="shrink-0 opacity-60" />
                    ) : (
                      <Icon size={12} className="shrink-0 opacity-70" />
                    ))}
                  <span className="max-w-[120px] truncate whitespace-nowrap">
                    {label}
                  </span>

                  {canClose && (
                    <button
                      type="button"
                      aria-label={`Close ${label}`}
                      className={[
                        "ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                        "transition-all hover:bg-black/10 dark:hover:bg-white/15",
                        isActive
                          ? "opacity-60 hover:opacity-100"
                          : "opacity-0 group-hover:opacity-100",
                      ].join(" ")}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabClose(tab);
                      }}
                    >
                      <X size={10} />
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        aria-label="Scroll tabs right"
        disabled={atRight}
        onClick={() => scrollBy(160)}
        className={[
          "flex w-8 shrink-0 items-center justify-center border-l border-default text-muted transition-colors",
          atRight
            ? "cursor-default opacity-30"
            : "hover:bg-black/4 hover:text-primary dark:hover:bg-white/4",
        ].join(" ")}
      >
        <ChevronsRight size={14} />
      </button>

      <Dropdown
        menu={{ items: toolMenuItems }}
        trigger={["click"]}
        placement="bottomRight"
      >
        <button
          type="button"
          aria-label="Tab options"
          className="flex w-9 shrink-0 items-center justify-center border-l border-default text-muted transition-colors hover:bg-black/4 hover:text-primary dark:hover:bg-white/4"
        >
          <MoreHorizontal size={15} />
        </button>
      </Dropdown>
    </div>
  );
}
