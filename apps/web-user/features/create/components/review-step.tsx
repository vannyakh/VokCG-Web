"use client";

import { Button, Spin } from "antd";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  FileText,
  Film,
  Mic,
  Sparkles,
  Type,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocale } from "@vokcg/i18n";
import { useCreateConfig } from "../hooks/use-create-config";
import { useVideoActions } from "../hooks/use-video-actions";
import { validateCreateFlowStep } from "../lib/create-config";
import { CreateCard, StepSection } from "./form-primitives";
import { VIDEO_ASPECTS } from "./visuals-step";

const VIDEO_SOURCES = [
  { value: "pexels", label: "Pexels" },
  { value: "pixabay", label: "Pixabay" },
  { value: "local", label: "Local file" },
  { value: "douyin", label: "TikTok" },
  { value: "bilibili", label: "Bilibili" },
  { value: "xiaohongshu", label: "Xiaohongshu" },
] as const;

type SummaryItem = { label: string; value: string; empty?: boolean };

function SummaryRow({ label, value, empty = false }: SummaryItem) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="shrink-0 text-xs font-medium text-muted">{label}</span>
      <span
        className={[
          "max-w-[58%] truncate text-right text-xs font-semibold",
          empty ? "italic text-muted/60" : "text-primary",
        ].join(" ")}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryGroup({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: LucideIcon;
  items: SummaryItem[];
}) {
  return (
    <div className="border-b border-subtle last:border-b-0">
      <div className="flex items-center bg-subtle/40 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-muted text-accent">
            <Icon size={13} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-secondary">
            {title}
          </span>
        </div>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {items.map((item) => (
          <SummaryRow key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}

export function ReviewStep() {
  const { t } = useLocale();
  const { config } = useCreateConfig();
  const { content, visuals, audio, subtitles } = config;
  const { createVideoMutation, submitCreateVideo } = useVideoActions();
  const validation = validateCreateFlowStep("review", config);

  const sourceLabel =
    VIDEO_SOURCES.find((s) => s.value === visuals.source)?.label ??
    visuals.source;
  const aspectLabel =
    VIDEO_ASPECTS.find((a) => a.value === visuals.aspect)?.label ??
    visuals.aspect;

  const hasSubject = Boolean(content.subject.trim());
  const hasScript = Boolean(content.script.trim());
  const canGenerate = validation.valid;
  const errorText =
    createVideoMutation.error instanceof Error
      ? createVideoMutation.error.message
      : "";

  return (
    <StepSection
      align="center"
      title={t("create.steps.review.title")}
      description={t("create.steps.review.subtitle")}
    >
      <CreateCard>
        <SummaryGroup
          title={t("create.steps.review.groups.content")}
          icon={FileText}
          items={[
            {
              label: t("create.steps.review.subject"),
              value: content.subject.trim() || t("common.notSet"),
              empty: !hasSubject,
            },
            {
              label: t("create.steps.review.script"),
              value: hasScript
                ? t("create.steps.review.scriptChars", {
                    count: content.script.trim().length,
                  })
                : t("common.empty"),
              empty: !hasScript,
            },
            {
              label: t("create.steps.review.keywords"),
              value: content.terms.trim() || t("common.notSet"),
              empty: !content.terms.trim(),
            },
          ]}
        />
        <SummaryGroup
          title={t("create.steps.review.groups.visuals")}
          icon={Film}
          items={[
            { label: t("create.steps.review.footage"), value: sourceLabel },
            { label: t("create.steps.review.aspect"), value: aspectLabel },
            {
              label: t("create.steps.review.clips"),
              value: t("create.steps.review.clipsValue", {
                count: visuals.count,
                duration: visuals.clipDuration,
              }),
            },
          ]}
        />
        <SummaryGroup
          title={t("create.steps.review.groups.audio")}
          icon={Mic}
          items={[
            {
              label: t("create.steps.review.voice"),
              value:
                audio.voiceName ||
                audio.ttsServer ||
                t("create.steps.review.defaultVoice"),
            },
            {
              label: t("create.steps.review.bgm"),
              value:
                audio.bgmType === "random"
                  ? t("common.random")
                  : audio.bgmType || t("common.none"),
            },
          ]}
        />
        <SummaryGroup
          title={t("create.steps.review.groups.subtitles")}
          icon={Type}
          items={[
            {
              label: t("create.steps.review.captions"),
              value: subtitles.enabled
                ? `${subtitles.position} · ${subtitles.fontSize}px`
                : t("common.disabled"),
              empty: !subtitles.enabled,
            },
          ]}
        />
      </CreateCard>

      {!canGenerate && validation.messageKey && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-3.5 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {t("create.steps.review.missingTitle")}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-300/80">
              {t(validation.messageKey)}
            </p>
          </div>
        </div>
      )}

      {errorText && (
        <div className="rounded-xl border border-error bg-app-error px-3.5 py-3">
          <p className="text-xs font-semibold text-error">{errorText}</p>
        </div>
      )}

      <motion.div
        whileTap={canGenerate ? { scale: 0.98 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        <Button
          type="primary"
          size="large"
          block
          icon={
            createVideoMutation.isPending ? (
              <Spin size="small" />
            ) : (
              <Video size={16} />
            )
          }
          onClick={submitCreateVideo}
          disabled={!canGenerate || createVideoMutation.isPending}
          className={[
            "h-12 border-0 text-sm font-extrabold tracking-wide",
            canGenerate
              ? "shadow-[0_4px_20px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]"
              : "opacity-50",
          ].join(" ")}
        >
          {createVideoMutation.isPending
            ? t("create.steps.review.generating")
            : t("create.steps.review.generate")}
        </Button>
      </motion.div>

      {canGenerate && !createVideoMutation.isPending && (
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
          <Sparkles size={12} className="text-accent" />
          {t("create.previewHint")}
        </p>
      )}
    </StepSection>
  );
}
