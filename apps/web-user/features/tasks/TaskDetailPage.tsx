"use client";

import { useRouter } from "next/navigation";

import { USER_ROUTES } from "@vokcg/constants";
import { useLocale } from "@vokcg/i18n";
import { TaskPreviewPanel, useAppMessage } from "@vokcg/ui";

import { useDeleteTask, useTask } from "@/api";

export function TaskDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { t } = useLocale();
  const message = useAppMessage();
  const { data: task, isLoading } = useTask(id);
  const deleteMutation = useDeleteTask();

  const handleDelete = (taskId: string) => {
    deleteMutation.mutate(taskId, {
      onSuccess: () => {
        message.success(t("tasks.deleted"));
        router.push(USER_ROUTES.tasks);
      },
    });
  };

  const handleClose = () => {
    router.push(USER_ROUTES.tasks);
  };

  return (
    <div className="flex h-full flex-col">
      <TaskPreviewPanel
        task={task}
        isLoading={isLoading}
        onClose={handleClose}
        onDelete={handleDelete}
      />
    </div>
  );
}
