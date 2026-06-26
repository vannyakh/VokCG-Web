"use client";

import { Button } from "antd";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "@vokcg/i18n";
import { useCreateStudioStore } from "@/store";
import { CREATE_FLOW_STEPS, createFlowStepIndex } from "@vokcg/constants";
import { validateCreateFlowStep } from "../lib/create-config";
import { useCreateConfig } from "../hooks/use-create-config";
import { CreateFormCenter } from "./create-form-center";

export function CreateStepFooter() {
  const { t } = useLocale();
  const activeStep = useCreateStudioStore((s) => s.activeStep);
  const nextStep = useCreateStudioStore((s) => s.nextStep);
  const prevStep = useCreateStudioStore((s) => s.prevStep);
  const { config } = useCreateConfig();
  const validation = validateCreateFlowStep(activeStep, config);

  const index = createFlowStepIndex(activeStep);
  const isFirst = index <= 0;
  const isLast = index >= CREATE_FLOW_STEPS.length - 1;

  return (
    <div
      className="w-full shrink-0"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-default)",
        padding: "12px 0",
      }}
    >
      <CreateFormCenter>
        <div className="flex flex-col gap-2">
          {/* Validation hint */}
          {!validation.valid && validation.messageKey && (
            <p
              className="text-center text-[12px] font-medium"
              style={{ color: "#d97706" }}
            >
              {t(validation.messageKey)}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            {/* Back button */}
            <Button
              size="large"
              icon={<ArrowLeft size={15} />}
              onClick={prevStep}
              disabled={isFirst}
              style={{
                borderRadius: 9999,
                fontWeight: 600,
                fontSize: 13,
                height: 40,
                paddingLeft: 20,
                paddingRight: 20,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span className="hidden sm:inline">{t("common.back")}</span>
            </Button>

            {/* Step counter */}
            <span
              className="shrink-0 tabular-nums"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
              }}
            >
              {t("common.stepOf", {
                current: index + 1,
                total: CREATE_FLOW_STEPS.length,
              })}
            </span>

            {/* Next / Generate */}
            {isLast ? (
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold"
                style={{
                  color: "var(--color-primary)",
                  background:
                    "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
                  height: 40,
                  alignItems: "center",
                }}
              >
                <Sparkles size={13} />
                <span>{t("create.generateBelow")}</span>
              </div>
            ) : (
              <Button
                type="primary"
                size="large"
                onClick={nextStep}
                disabled={!validation.valid}
                style={{
                  borderRadius: 9999,
                  fontWeight: 600,
                  fontSize: 13,
                  height: 40,
                  paddingLeft: 24,
                  paddingRight: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow:
                    "0 2px 12px color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  border: "none",
                }}
              >
                {t("common.next")}
                <ArrowRight size={15} />
              </Button>
            )}
          </div>
        </div>
      </CreateFormCenter>
    </div>
  );
}
