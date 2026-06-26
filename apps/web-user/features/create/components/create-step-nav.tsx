"use client";

import { Check } from "lucide-react";
import { useMemo } from "react";

import { useLocale } from "@vokcg/i18n";
import {
  CREATE_FLOW_STEPS,
  createFlowStepIndex,
  type CreateFlowStepId,
} from "@vokcg/constants";
import { useCreateStudioStore } from "@/store";
import { useCreateConfig } from "../hooks/use-create-config";
import { validateCreateFlowStep } from "../lib/create-config";

type Props = {
  compact?: boolean;
  centered?: boolean;
  interactive?: boolean;
  variant?: "default" | "pills";
};

export function CreateStepNav({
  interactive = true,
  variant = "default",
}: Props) {
  const { t } = useLocale();
  const activeStep = useCreateStudioStore((s) => s.activeStep);
  const setActiveStep = useCreateStudioStore((s) => s.setActiveStep);
  const activeIndex = createFlowStepIndex(activeStep);
  const { config } = useCreateConfig();

  const isStepSelectable = (stepId: string) => {
    const targetIndex = createFlowStepIndex(stepId as CreateFlowStepId);
    for (let i = 0; i < targetIndex; i++) {
      const step = CREATE_FLOW_STEPS[i]!;
      const res = validateCreateFlowStep(step.id as CreateFlowStepId, config);
      if (!res.valid) return false;
    }
    return true;
  };

  const steps = useMemo(
    () =>
      CREATE_FLOW_STEPS.map((step) => ({
        ...step,
        label: t(`create.steps.${step.id}.label`),
      })),
    [t],
  );

  if (variant === "pills") {
    return (
      <nav
        aria-label="Create video steps"
        className="flex w-full items-center justify-between"
        style={{ gap: 0 }}
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === activeStep;
          const isComplete = index < activeIndex;
          const isLast = index === steps.length - 1;
          const selectable = isStepSelectable(step.id);

          return (
            <div
              key={step.id}
              className="flex flex-1 items-center"
              style={{ minWidth: 0 }}
            >
              {/* Step pill */}
              <div
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                style={{ position: "relative" }}
              >
                {/* Circle */}
                {interactive && selectable ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep(step.id as CreateFlowStepId)}
                    aria-current={isActive ? "step" : undefined}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: isActive
                        ? "var(--color-primary)"
                        : isComplete
                          ? "color-mix(in srgb, var(--color-primary) 15%, transparent)"
                          : "color-mix(in srgb, var(--text-muted) 10%, transparent)",
                      border: isActive
                        ? "none"
                        : isComplete
                          ? "1.5px solid color-mix(in srgb, var(--color-primary) 40%, transparent)"
                          : "1.5px solid var(--border-default)",
                      boxShadow: isActive
                        ? "0 2px 12px color-mix(in srgb, var(--color-primary) 40%, transparent)"
                        : "none",
                      color: isActive
                        ? "#fff"
                        : isComplete
                          ? "var(--color-primary)"
                          : "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {isComplete ? (
                      <Check size={14} strokeWidth={2.5} />
                    ) : (
                      <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
                    )}
                  </button>
                ) : (
                  <div
                    aria-current={isActive ? "step" : undefined}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200"
                    style={{
                      background:
                        "color-mix(in srgb, var(--text-muted) 5%, transparent)",
                      border: "1.5px solid var(--border-default)",
                      color: "var(--text-muted)",
                      opacity: 0.4,
                      cursor: "not-allowed",
                    }}
                    title={t("create.lockedHint")}
                  >
                    <Icon size={14} strokeWidth={1.8} />
                  </div>
                )}

                {/* Label */}
                <span
                  className="truncate text-[10px] font-semibold transition-colors duration-200 sm:text-[11px]"
                  style={{
                    color: isActive
                      ? "var(--color-primary)"
                      : isComplete
                        ? "var(--text-secondary)"
                        : "var(--text-muted)",
                    opacity: selectable ? 1 : 0.5,
                    letterSpacing: "0.01em",
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className="mx-1 h-px flex-1 shrink transition-colors duration-300 sm:mx-2"
                  style={{
                    background:
                      index < activeIndex
                        ? "var(--color-primary)"
                        : "var(--border-default)",
                    opacity: index < activeIndex ? 0.5 : 1,
                    minWidth: 8,
                    maxWidth: 48,
                  }}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  /* ── Default / compact variant (legacy) ──────────────────────────────── */
  return (
    <nav
      aria-label="Create video steps"
      className="flex shrink-0 gap-1 overflow-x-auto py-2.5"
    >
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === activeStep;
        const isComplete = index < activeIndex;
        const selectable = isStepSelectable(step.id);

        return (
          <button
            key={step.id}
            type="button"
            onClick={() =>
              interactive &&
              selectable &&
              setActiveStep(step.id as CreateFlowStepId)
            }
            aria-current={isActive ? "step" : undefined}
            className="group flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 transition-colors"
            style={{
              background: isActive
                ? "color-mix(in srgb, var(--color-primary) 10%, transparent)"
                : "transparent",
              color: isActive ? "var(--color-primary)" : "var(--text-muted)",
              cursor: interactive && selectable ? "pointer" : "not-allowed",
              opacity: selectable ? 1 : 0.5,
            }}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                background: isActive
                  ? "var(--color-primary)"
                  : isComplete
                    ? "color-mix(in srgb, var(--color-primary) 20%, transparent)"
                    : "var(--border-default)",
                color: isActive
                  ? "#fff"
                  : isComplete
                    ? "var(--color-primary)"
                    : "var(--text-muted)",
              }}
            >
              {isComplete ? <Check size={10} strokeWidth={3} /> : index + 1}
            </span>
            <span className="text-[12px] font-semibold">{step.label}</span>
            <Icon size={13} className="shrink-0 opacity-60" />
          </button>
        );
      })}
    </nav>
  );
}
