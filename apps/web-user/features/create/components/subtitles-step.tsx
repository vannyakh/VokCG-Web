"use client";

import { useMemo } from "react";
import { Input, InputNumber } from "antd";
import { useLocale } from "@vokcg/i18n";
import { useCreateConfig } from "../hooks/use-create-config";
import {
  ColorPicker,
  CreateCard,
  FieldMenuSelect,
  RangeField,
  StepSection,
  Toggle,
} from "./form-primitives";

const SUBTITLE_POSITIONS = [
  { value: "bottom", labelKey: "create.steps.subtitles.positions.bottom" },
  { value: "center", labelKey: "create.steps.subtitles.positions.center" },
  { value: "top", labelKey: "create.steps.subtitles.positions.top" },
  { value: "custom", labelKey: "create.steps.subtitles.positions.custom" },
] as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
      {children}
    </p>
  );
}

export function SubtitlesStep() {
  const { t } = useLocale();
  const { section: subtitles, patch } = useCreateConfig("subtitles");
  const subtitlePositionOptions = useMemo(
    () =>
      SUBTITLE_POSITIONS.map((item) => ({
        value: item.value,
        label: t(item.labelKey),
      })),
    [t],
  );

  return (
    <StepSection
      title={t("create.steps.subtitles.title")}
      description={t("create.steps.subtitles.subtitle")}
    >
      <CreateCard className="p-3 sm:p-4">
        <Toggle
          checked={subtitles.enabled}
          onChange={(enabled) => patch({ enabled })}
          label={t("create.steps.subtitles.enable")}
        />
      </CreateCard>

      {subtitles.enabled && (
        <div className="flex flex-col gap-3">
          <CreateCard className="p-3 sm:p-4">
            <SectionLabel>
              {t("create.steps.subtitles.groups.placement")}
            </SectionLabel>
            <div className="flex flex-col gap-4">
              <FieldMenuSelect
                label={t("create.steps.subtitles.position")}
                options={subtitlePositionOptions}
                value={subtitles.position}
                onChange={(position) => patch({ position })}
              />
              {subtitles.position === "custom" && (
                <RangeField
                  label={t("create.steps.subtitles.customPosition")}
                  value={subtitles.customPosition}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(v) => patch({ customPosition: v })}
                />
              )}
            </div>
          </CreateCard>

          <CreateCard className="p-3 sm:p-4">
            <SectionLabel>
              {t("create.steps.subtitles.groups.typography")}
            </SectionLabel>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-primary">
                  {t("create.steps.subtitles.fontName")}
                </label>
                <Input
                  value={subtitles.fontName}
                  onChange={(e) => patch({ fontName: e.target.value })}
                  placeholder={t("create.steps.subtitles.fontNamePlaceholder")}
                  className="font-mono text-xs"
                />
              </div>
              <RangeField
                label={t("create.steps.subtitles.fontSize")}
                value={subtitles.fontSize}
                min={30}
                max={100}
                onChange={(fontSize) => patch({ fontSize })}
              />
            </div>
          </CreateCard>

          <CreateCard className="p-3 sm:p-4">
            <SectionLabel>
              {t("create.steps.subtitles.groups.colors")}
            </SectionLabel>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ColorPicker
                  label={t("create.steps.subtitles.textColor")}
                  value={subtitles.textForeColor}
                  onChange={(textForeColor) => patch({ textForeColor })}
                />
                <ColorPicker
                  label={t("create.steps.subtitles.strokeColor")}
                  value={subtitles.strokeColor}
                  onChange={(strokeColor) => patch({ strokeColor })}
                />
              </div>
              <RangeField
                label={t("create.steps.subtitles.strokeWidth")}
                value={subtitles.strokeWidth}
                min={0}
                max={10}
                step={0.5}
                onChange={(strokeWidth) => patch({ strokeWidth })}
              />
            </div>
          </CreateCard>

          <CreateCard className="p-3 sm:p-4">
            <SectionLabel>
              {t("create.steps.subtitles.groups.background")}
            </SectionLabel>
            <div className="flex flex-col gap-4">
              <Toggle
                checked={subtitles.bgEnabled}
                onChange={(bgEnabled) => patch({ bgEnabled })}
                label={t("create.steps.subtitles.bgEnable")}
              />
              {subtitles.bgEnabled && (
                <>
                  <ColorPicker
                    label={t("create.steps.subtitles.bgColor")}
                    value={subtitles.textBgColor}
                    onChange={(textBgColor) => patch({ textBgColor })}
                  />
                  <Toggle
                    checked={subtitles.roundedBg}
                    onChange={(roundedBg) => patch({ roundedBg })}
                    label={t("create.steps.subtitles.roundedBg")}
                  />
                </>
              )}
            </div>
          </CreateCard>
        </div>
      )}

      {!subtitles.enabled && (
        <p className="rounded-xl border border-dashed border-default bg-subtle/40 px-3 py-2.5 text-xs text-muted">
          {t("create.steps.subtitles.offHint")}
        </p>
      )}
    </StepSection>
  );
}
