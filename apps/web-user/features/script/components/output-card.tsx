"use client";

import { Button, Spin } from "antd";
import {
  ArrowUp,
  Copy,
  Download,
  Edit3,
  FileText,
  Mic,
  Plus,
  RefreshCw,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import type { HookVariation, ScriptSection } from "../lib/script-writer-utils";

export type SectionAction = "rewrite" | "expand" | "shorten" | "tone";

const SECTION_STYLES: Record<string, string> = {
  hook: "bg-accent-muted text-accent",
  problem: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  solution: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  cta: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  body: "bg-subtle text-secondary",
};

interface OutputCardProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  sections: ScriptSection[];
  variations: HookVariation[];
  selectedVariationId: string | null;
  busySectionId: string | null;
  wordCount: number;
  charCount: number;
  duration: string;
  onCopyAll: () => void;
  onExport: () => void;
  onSendToTts: () => void;
  onSectionChange: (id: string, text: string) => void;
  onSectionAction: (section: ScriptSection, action: SectionAction) => void;
  onPreviewSection: (section: ScriptSection) => void;
  onApplyVariation: (variation: HookVariation) => void;
}

export function OutputCard(props: OutputCardProps) {
  const {
    t,
    sections,
    variations,
    selectedVariationId,
    busySectionId,
    wordCount,
    charCount,
    duration,
    onCopyAll,
    onExport,
    onSendToTts,
    onSectionChange,
    onSectionAction,
    onPreviewSection,
    onApplyVariation,
  } = props;

  return (
    <div className="overflow-hidden rounded-xl border border-default bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-default px-3.5 py-2.5">
        <FileText size={14} className="text-muted" />
        <span className="text-xs font-medium text-secondary">
          {t("scriptWriter.generatedScript")}
        </span>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          {t("scriptWriter.ready")}
        </span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <Button size="small" icon={<Copy size={12} />} onClick={onCopyAll}>
            {t("scriptWriter.copyAll")}
          </Button>
          <Button size="small" icon={<Download size={12} />} onClick={onExport}>
            {t("scriptWriter.export")}
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<Mic size={12} />}
            onClick={onSendToTts}
          >
            {t("scriptWriter.sendToTts")}
          </Button>
        </div>
      </div>
      <div className="px-3.5 py-1">
        {sections.map((section) => (
          <div
            key={section.id}
            className="border-b border-default py-3 last:border-b-0"
          >
            <span
              className={[
                "mb-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold",
                SECTION_STYLES[section.kind] ?? SECTION_STYLES.body,
              ].join(" ")}
            >
              <Zap size={11} />
              {section.name}
            </span>
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) =>
                onSectionChange(section.id, e.currentTarget.textContent ?? "")
              }
              className="min-h-[40px] rounded-lg px-2 py-1.5 text-[13px] leading-relaxed text-primary outline-none focus:bg-subtle"
            >
              {section.text}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <ToolButton
                icon={RefreshCw}
                label={t("scriptWriter.rewrite")}
                loading={busySectionId === section.id}
                onClick={() => onSectionAction(section, "rewrite")}
              />
              <ToolButton
                icon={Plus}
                label={t("scriptWriter.expand")}
                loading={busySectionId === section.id}
                onClick={() => onSectionAction(section, "expand")}
              />
              <ToolButton
                icon={ArrowUp}
                label={t("scriptWriter.shorten")}
                loading={busySectionId === section.id}
                onClick={() => onSectionAction(section, "shorten")}
              />
              <ToolButton
                icon={Edit3}
                label={t("scriptWriter.adjustTone")}
                loading={busySectionId === section.id}
                onClick={() => onSectionAction(section, "tone")}
              />
              <ToolButton
                icon={Mic}
                label={t("scriptWriter.previewTts")}
                onClick={() => onPreviewSection(section)}
              />
            </div>
          </div>
        ))}
      </div>
      {variations.length > 0 && (
        <div className="border-t border-default px-3.5 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {t("scriptWriter.hookVariations")}
          </p>
          <div className="grid gap-2 md:grid-cols-3">
            {variations.map((variation) => (
              <button
                key={variation.id}
                type="button"
                onClick={() => onApplyVariation(variation)}
                className={[
                  "rounded-lg border p-2.5 text-left transition-colors",
                  selectedVariationId === variation.id
                    ? "border-accent bg-accent-muted"
                    : "border-default hover:border-accent/40 hover:bg-accent-muted/40",
                ].join(" ")}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {t(`scriptWriter.${variation.labelKey}`)}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-secondary">
                  {variation.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-4 border-t border-default bg-subtle px-3.5 py-2">
        <StatInline value={String(wordCount)} label={t("scriptWriter.words")} />
        <StatInline value={duration} label={t("scriptWriter.estDuration")} />
        <StatInline
          value={String(charCount)}
          label={t("scriptWriter.characters")}
        />
        <StatInline
          value={String(sections.length)}
          label={t("scriptWriter.sections")}
        />
      </div>
    </div>
  );
}

function StatInline({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-[15px] font-semibold text-primary">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  loading,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-[11px] text-muted transition-colors hover:border-default hover:bg-subtle disabled:opacity-50"
    >
      {loading ? <Spin size="small" /> : <Icon size={12} />}
      {label}
    </button>
  );
}
