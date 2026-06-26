"use client";

import { Button } from "antd";
import { ListVideo } from "lucide-react";
import Link from "next/link";
import { StudioEmptyState } from "@vokcg/ui";
import { USER_ROUTES } from "@vokcg/constants";

export function TasksEmptyState({
  t,
  variant,
  onClearFilters,
}: {
  t: (key: string) => string;
  variant: "none" | "filtered";
  onClearFilters?: () => void;
}) {
  return (
    <StudioEmptyState
      icon={ListVideo}
      title={variant === "filtered" ? t("tasks.noMatches") : t("tasks.noTasks")}
      description={
        variant === "filtered"
          ? t("tasks.noMatchesHint")
          : t("tasks.noTasksHint")
      }
      action={
        variant === "filtered" ? (
          <Button size="small" onClick={onClearFilters} className="rounded-lg">
            {t("tasks.clearFilters")}
          </Button>
        ) : (
          <Link href={USER_ROUTES.create}>
            <Button
              type="primary"
              size="small"
              className="rounded-lg font-bold"
            >
              {t("tasks.createVideo")}
            </Button>
          </Link>
        )
      }
    />
  );
}
