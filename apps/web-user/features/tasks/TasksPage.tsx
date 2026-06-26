"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Button,
  Checkbox,
  ConfigProvider,
  Drawer,
  Dropdown,
  Input,
  Popconfirm,
  Select,
} from "antd";
import {
  Download,
  Filter,
  LayoutGrid,
  List,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@vokcg/i18n";
import { useTasks, useDeleteTask, useTask } from "@/api";
import { STORAGE_KEYS } from "@vokcg/config";
import {
  Tooltip,
  TaskPreviewPanel,
  StudioListShell,
  panelSlide,
  staggerContainer,
  viewSwitch,
  filterTasks,
  downloadTaskVideo,
  useAppMessage,
  useMediaQuery,
} from "@vokcg/ui";
import type { Task, TaskViewMode } from "@vokcg/types";
import type { TaskStatusFilter } from "@vokcg/ui";

import {
  TaskGridCard,
  TaskRow,
  GridSkeleton,
  ListSkeleton,
  TasksEmptyState,
} from "./components";

const VIEW_MODE_KEY = STORAGE_KEYS.tasksViewMode;
const XL_MEDIA_QUERY = "(min-width: 80em)";

const floatBarVariants = {
  initial: { y: 100, x: "-50%", opacity: 0 },
  animate: {
    y: 0,
    x: "-50%",
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
  exit: { y: 100, x: "-50%", opacity: 0, transition: { duration: 0.2 } },
} as const;

function useViewMode() {
  const [viewMode, setViewMode] = useState<TaskViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return saved === "list" ? "list" : "grid";
  });
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);
  return [viewMode, setViewMode] as const;
}

export function TasksPage() {
  const { t } = useLocale();
  const message = useAppMessage();
  const searchInputRef = useRef<any>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useViewMode();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const isXlUp = useMediaQuery(XL_MEDIA_QUERY);
  const pageSize = 12;
  const filtersActive = searchQuery.trim().length > 0 || statusFilter !== "all";
  const fetchPage = filtersActive ? 1 : page;
  const fetchPageSize = filtersActive ? 100 : pageSize;

  const { data, isLoading, isFetching, refetch } = useTasks(
    fetchPage,
    fetchPageSize,
  );
  const hasActiveSelected = useMemo(() => {
    const selectedTasks = (data?.tasks ?? []).filter((task) =>
      selectedTaskIds.includes(task.id),
    );
    return selectedTasks.some(
      (task) => task.state === "processing" || task.state === "pending",
    );
  }, [data?.tasks, selectedTaskIds]);

  const deleteMutation = useDeleteTask();
  const { data: selectedTask, isLoading: isSelectedTaskLoading } = useTask(
    selectedTaskId ?? "",
  );
  const totalPages = data
    ? Math.ceil(data.total / (filtersActive ? fetchPageSize : pageSize))
    : 1;
  const hasServerTasks = (data?.tasks.length ?? 0) > 0;

  const visibleTasks = useMemo(
    () => filterTasks(data?.tasks ?? [], searchQuery, statusFilter),
    [data?.tasks, searchQuery, statusFilter],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
      if (selectedTaskId === id) setSelectedTaskId(null);
      setSelectedTaskIds((prev) => prev.filter((taskId) => taskId !== id));
    },
    [deleteMutation, selectedTaskId],
  );

  const toggleTaskChecked = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleToggleAll = () => {
    const allChecked =
      visibleTasks.length > 0 &&
      visibleTasks.every((task) => selectedTaskIds.includes(task.id));
    if (allChecked) {
      setSelectedTaskIds((prev) =>
        prev.filter((id) => !visibleTasks.some((vt) => vt.id === id)),
      );
    } else {
      setSelectedTaskIds((prev) =>
        Array.from(new Set([...prev, ...visibleTasks.map((t) => t.id)])),
      );
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPage(1);
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedTaskIds];
    await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
    if (selectedTaskId && ids.includes(selectedTaskId)) setSelectedTaskId(null);
    setSelectedTaskIds([]);
    message.success(t("tasks.bulkDeleted", { count: ids.length }));
  };

  const handleBulkDownload = () => {
    const tasks = visibleTasks.filter((task) =>
      selectedTaskIds.includes(task.id),
    );
    let downloaded = 0;
    let skipped = 0;
    for (const task of tasks) {
      if (downloadTaskVideo(task)) downloaded += 1;
      else skipped += 1;
    }
    if (downloaded > 0)
      message.success(t("tasks.bulkDownloaded", { count: downloaded }));
    if (skipped > 0)
      message.info(t("tasks.bulkDownloadSkipped", { count: skipped }));
  };

  useEffect(() => {
    setSelectedTaskIds((prev) =>
      prev.filter((id) => visibleTasks.some((task) => task.id === id)),
    );
  }, [visibleTasks]);

  const gridCols = selectedTaskId
    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedTaskIds,
      onChange: (keys: React.Key[]) => setSelectedTaskIds(keys.map(String)),
      preserveSelectedRowKeys: true,
    }),
    [selectedTaskIds],
  );

  const statusOptions = useMemo(
    () => [
      { value: "all", label: t("tasks.statusAll") },
      { value: "processing", label: t("tasks.statusProcessing") },
      { value: "completed", label: t("tasks.statusCompleted") },
      { value: "failed", label: t("tasks.statusFailed") },
    ],
    [t],
  );

  return (
    <>
      <StudioListShell
        description={
          <span className="hidden sm:inline">{t("tasks.description")}</span>
        }
        extra={
          <ConfigProvider
            theme={{
              token: {
                controlHeight: 36,
                borderRadius: 12,
              },
            }}
          >
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                ref={searchInputRef}
                allowClear
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t("tasks.searchPlaceholder")}
                prefix={<Search size={14} className="text-muted" />}
                suffix={
                  !searchQuery && (
                    <span className="hidden md:inline-flex items-center justify-center text-[10px] text-muted border border-default bg-subtle w-4 h-4 rounded select-none font-sans font-medium">
                      /
                    </span>
                  )
                }
                className="flex-1 sm:flex-initial sm:w-[180px] md:w-[240px] rounded-xl !bg-[var(--bg-subtle)] border border-default hover:border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 transition-all duration-200 shadow-sm"
              />

              {/* Mobile Dropdown status filter (icon trigger) */}
              <div className="sm:hidden shrink-0">
                <Dropdown
                  menu={{
                    items: statusOptions.map((opt) => ({
                      key: opt.value,
                      label: opt.label,
                      onClick: () => {
                        setStatusFilter(opt.value as TaskStatusFilter);
                        setPage(1);
                      },
                    })),
                  }}
                  trigger={["click"]}
                >
                  <Button
                    icon={<Filter size={16} />}
                    className={`rounded-xl flex items-center justify-center ${
                      statusFilter !== "all"
                        ? "border-accent text-accent bg-accent/5"
                        : "border-default text-secondary bg-surface"
                    }`}
                  />
                </Dropdown>
              </div>

              {/* Desktop Select status filter */}
              <div className="hidden sm:block shrink-0">
                <Select
                  value={statusFilter}
                  onChange={(value: TaskStatusFilter) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                  options={statusOptions}
                  className="min-w-[140px]"
                  classNames={{
                    popup: {
                      root: "rounded-xl bg-surface shadow-lg",
                    },
                  }}
                />
              </div>

              <div className="flex gap-0 rounded-xl border border-default bg-subtle p-[3px] shrink-0 h-9 box-border items-center">
                <ConfigProvider
                  theme={{
                    token: {
                      controlHeight: 30,
                      borderRadius: 9,
                    },
                  }}
                >
                  <Button
                    type={viewMode === "grid" ? "primary" : "text"}
                    icon={<LayoutGrid size={16} />}
                    onClick={() => setViewMode("grid")}
                    className="flex items-center justify-center w-[30px] p-0"
                  />
                  <Button
                    type={viewMode === "list" ? "primary" : "text"}
                    icon={<List size={16} />}
                    onClick={() => setViewMode("list")}
                    className="flex items-center justify-center w-[30px] p-0"
                  />
                </ConfigProvider>
              </div>
            </div>
          </ConfigProvider>
        }
      >
        <AnimatePresence>
          {selectedTaskIds.length > 0 && (
            <motion.div
              variants={floatBarVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 rounded-2xl border border-default bg-surface/95 backdrop-blur-md px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] border-primary/20"
            >
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                {t("tasks.selectedCount", { count: selectedTaskIds.length })}
              </span>
              <div className="h-4 w-[1px] bg-default shrink-0" />
              <Button
                size="middle"
                type="text"
                icon={<Download size={15} />}
                onClick={handleBulkDownload}
                disabled={hasActiveSelected}
                className={`rounded-xl flex items-center gap-1.5 transition-colors duration-150 ${hasActiveSelected ? "text-muted opacity-50 cursor-not-allowed" : "hover:bg-subtle text-secondary"}`}
              >
                <span className="hidden sm:inline text-xs font-medium">
                  {t("tasks.bulkDownload")}
                </span>
              </Button>
              <Popconfirm
                disabled={hasActiveSelected}
                title={t("tasks.bulkDeleteConfirmTitle", {
                  count: selectedTaskIds.length,
                })}
                description={t("tasks.bulkDeleteConfirmDescription")}
                okText={t("tasks.deleteConfirmOk")}
                cancelText={t("tasks.deleteConfirmCancel")}
                okButtonProps={{ danger: true }}
                onConfirm={() => void handleBulkDelete()}
              >
                <Button
                  size="middle"
                  type="text"
                  danger
                  icon={<Trash2 size={15} />}
                  disabled={hasActiveSelected}
                  className={`rounded-xl flex items-center gap-1.5 transition-colors duration-150 ${hasActiveSelected ? "text-muted opacity-50 cursor-not-allowed" : "hover:bg-red-500/10 text-red-500"}`}
                >
                  <span className="hidden sm:inline text-xs font-medium">
                    {t("tasks.bulkDelete")}
                  </span>
                </Button>
              </Popconfirm>
              <div className="h-4 w-[1px] bg-default shrink-0" />
              <Button
                type="text"
                size="middle"
                onClick={() => setSelectedTaskIds([])}
                className="rounded-xl hover:bg-subtle text-muted text-xs font-medium"
              >
                {t("common.cancel")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex w-full flex-col gap-5 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">
            {!isLoading && !hasServerTasks ? (
              <TasksEmptyState t={t} variant="none" />
            ) : !isLoading && visibleTasks.length === 0 ? (
              <TasksEmptyState
                t={t}
                variant="filtered"
                onClearFilters={clearFilters}
              />
            ) : isLoading ? (
              viewMode === "grid" ? (
                <GridSkeleton cols={gridCols} />
              ) : (
                <ListSkeleton />
              )
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  variants={viewSwitch}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {viewMode === "grid" ? (
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className={`grid ${gridCols} gap-4`}
                    >
                      {visibleTasks.map((task) => (
                        <TaskGridCard
                          key={task.id}
                          task={task}
                          selected={selectedTaskId === task.id}
                          checked={selectedTaskIds.includes(task.id)}
                          onSelect={() => setSelectedTaskId(task.id)}
                          onToggleCheck={() => toggleTaskChecked(task.id)}
                          onDelete={handleDelete}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col bg-transparent border-none md:rounded-2xl md:shadow-sm overflow-visible md:overflow-hidden md:divide-y md:divide-default">
                      {/* Header Row */}
                      <div className="hidden md:flex items-center border-b border-default bg-surface/40 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted select-none">
                        <div className="w-12 shrink-0 flex items-center justify-center">
                          <Checkbox
                            checked={
                              visibleTasks.length > 0 &&
                              visibleTasks.every((task) =>
                                selectedTaskIds.includes(task.id),
                              )
                            }
                            indeterminate={
                              selectedTaskIds.length > 0 &&
                              !visibleTasks.every((task) =>
                                selectedTaskIds.includes(task.id),
                              )
                            }
                            onChange={handleToggleAll}
                          />
                        </div>
                        <div className="w-40 shrink-0 pl-1">
                          {t("tasks.preview")}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          {t("tasks.topic")}
                        </div>
                        <div className="w-[180px] shrink-0 hidden xl:block pr-4">
                          {t("tasks.keywords")}
                        </div>
                        <div className="w-24 shrink-0 hidden md:block pr-4">
                          {t("tasks.source")}
                        </div>
                        <div className="w-20 shrink-0 hidden lg:block pr-4">
                          {t("tasks.aspect")}
                        </div>
                        <div className="w-24 shrink-0 hidden lg:block pr-4 text-center">
                          <Tooltip content={t("tasks.materialsHint")}>
                            <span className="cursor-help border-b border-dotted border-muted">
                              {t("tasks.materials")}
                            </span>
                          </Tooltip>
                        </div>
                        <div className="w-32 shrink-0 pr-4">
                          {t("tasks.status")}
                        </div>
                        <div className="w-12 shrink-0 text-center"></div>
                      </div>

                      {/* List Rows */}
                      <div className="flex flex-col divide-y divide-default md:divide-y">
                        {visibleTasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            selected={selectedTaskId === task.id}
                            checked={selectedTaskIds.includes(task.id)}
                            onSelect={() => setSelectedTaskId(task.id)}
                            onToggleCheck={() => toggleTaskChecked(task.id)}
                            onDelete={handleDelete}
                            t={t}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {totalPages > 1 && !filtersActive && (
              <div className="mt-5 flex items-center justify-end gap-2">
                <span className="text-sm font-semibold text-secondary">
                  {t("tasks.page", { current: page, total: totalPages })}
                </span>
                <Button
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg"
                >
                  ‹
                </Button>
                <Button
                  size="small"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg"
                >
                  ›
                </Button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {selectedTaskId && isXlUp && (
              <motion.div
                key="preview-panel"
                className="tasks-preview-panel hidden shrink-0 xl:block"
                variants={panelSlide}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <TaskPreviewPanel
                  task={selectedTask}
                  isLoading={isSelectedTaskLoading}
                  onClose={() => setSelectedTaskId(null)}
                  onDelete={handleDelete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </StudioListShell>

      <Drawer
        open={!!selectedTaskId && !isXlUp}
        placement="bottom"
        onClose={() => setSelectedTaskId(null)}
        size="88vh"
        styles={{
          body: { padding: 0, height: "100%", overflow: "hidden" },
          header: { display: "none" },
          wrapper: {
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            overflow: "hidden",
          },
        }}
        className="bg-canvas"
      >
        {selectedTaskId && (
          <TaskPreviewPanel
            task={selectedTask}
            isLoading={isSelectedTaskLoading}
            onClose={() => setSelectedTaskId(null)}
            onDelete={handleDelete}
          />
        )}
      </Drawer>
    </>
  );
}
