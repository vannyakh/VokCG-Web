"use client";

import { Button, Input, Select, Spin } from "antd";
import { Plus, Sparkles, X } from "lucide-react";
import {
  SCRIPT_LENGTHS,
  SCRIPT_PLATFORMS,
  SCRIPT_TONES,
  TOPIC_SUGGESTIONS,
  type ScriptLength,
  type ScriptPlatform,
  type ScriptTemplateId,
  type ScriptTone,
} from "../lib/script-writer-utils";

interface BriefCardProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  templateLabel: string;
  platform: ScriptPlatform;
  length: ScriptLength;
  audience: string;
  language: string;
  topic: string;
  keywords: string[];
  keywordDraft: string;
  addingKeyword: boolean;
  tone: ScriptTone;
  credits: number;
  busy: boolean;
  languageOptions: Array<{ value: string; label: string }>;
  onPlatformChange: (v: ScriptPlatform) => void;
  onLengthChange: (v: ScriptLength) => void;
  onAudienceChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onTopicChange: (v: string) => void;
  onToneChange: (v: ScriptTone) => void;
  onGenerate: () => void;
  onRemoveKeyword: (k: string) => void;
  onKeywordDraftChange: (v: string) => void;
  onStartAddKeyword: () => void;
  onCancelAddKeyword: () => void;
  onConfirmAddKeyword: () => void;
  onAiKeywords: () => void;
  aiKeywordsDisabled: boolean;
  templateId: ScriptTemplateId;
}

export function BriefCard(props: BriefCardProps) {
  const {
    t,
    templateLabel,
    platform,
    length,
    audience,
    language,
    topic,
    keywords,
    keywordDraft,
    addingKeyword,
    tone,
    credits,
    busy,
    languageOptions,
    onPlatformChange,
    onLengthChange,
    onAudienceChange,
    onLanguageChange,
    onTopicChange,
    onToneChange,
    onGenerate,
    onRemoveKeyword,
    onKeywordDraftChange,
    onStartAddKeyword,
    onCancelAddKeyword,
    onConfirmAddKeyword,
    onAiKeywords,
    aiKeywordsDisabled,
    templateId,
  } = props;

  return (
    <div className="overflow-hidden rounded-xl border border-default bg-surface shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-center gap-2 border-b border-default bg-subtle/50 px-3.5 py-2.5">
        <Sparkles size={14} className="text-accent animate-pulse" />
        <span className="text-xs font-semibold text-primary">
          {t("scriptWriter.brief")}
        </span>
        <span className="ml-auto rounded-full bg-accent-muted px-2.5 py-0.5 text-[10px] font-bold text-accent border border-accent/20">
          {templateLabel}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
        <FieldSelect
          label={t("scriptWriter.platformLabel")}
          value={platform}
          onChange={(v) => onPlatformChange(v as ScriptPlatform)}
          options={SCRIPT_PLATFORMS.map((item) => ({
            value: item,
            label: t(`scriptWriter.platform.${item}`),
          }))}
        />
        <FieldSelect
          label={t("scriptWriter.targetLength")}
          value={length}
          onChange={(v) => onLengthChange(v as ScriptLength)}
          options={SCRIPT_LENGTHS.map((item) => ({
            value: item,
            label: t(`scriptWriter.length.${item}`),
          }))}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {t("scriptWriter.audience")}
          </label>
          <Input
            size="middle"
            value={audience}
            onChange={(e) => onAudienceChange(e.target.value)}
            placeholder={t("scriptWriter.audiencePlaceholder")}
            className="rounded-lg text-xs"
          />
        </div>
        <FieldSelect
          label={t("scriptWriter.language")}
          value={language}
          onChange={onLanguageChange}
          options={languageOptions}
        />
      </div>
      <div className="px-4 pb-4">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
          {t("scriptWriter.topic")}
        </label>
        <Input.TextArea
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          rows={3}
          placeholder={t("scriptWriter.topicPlaceholder")}
          className="text-sm leading-relaxed rounded-lg"
        />
        {(!topic || topic.length < 15) && (
          <div className="mt-2">
            <span className="text-[10px] font-semibold text-muted block mb-1.5">
              {t("scriptWriter.trySuggestion")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(TOPIC_SUGGESTIONS[templateId] || []).map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onTopicChange(suggestion)}
                  className="rounded-full bg-subtle hover:bg-default border border-default px-2.5 py-1 text-[10px] text-secondary hover:text-primary transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
          {t("scriptWriter.keywordsLabel")}
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent-muted/40 px-3 py-1 text-xs text-accent font-medium shadow-sm"
            >
              {keyword}
              <button
                type="button"
                onClick={() => onRemoveKeyword(keyword)}
                aria-label="Remove"
                className="cursor-pointer"
              >
                <X
                  size={12}
                  className="text-accent/60 hover:text-error transition-colors"
                />
              </button>
            </span>
          ))}
          {addingKeyword ? (
            <Input
              size="small"
              autoFocus
              value={keywordDraft}
              onChange={(e) => onKeywordDraftChange(e.target.value)}
              onPressEnter={onConfirmAddKeyword}
              onBlur={() => {
                onConfirmAddKeyword();
                onCancelAddKeyword();
              }}
              placeholder={t("scriptWriter.addKeyword")}
              className="max-w-[120px] rounded-full text-xs"
            />
          ) : (
            <button
              type="button"
              onClick={onStartAddKeyword}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-default px-3 py-1 text-xs text-muted hover:bg-subtle hover:text-secondary cursor-pointer transition-colors"
            >
              <Plus size={11} />
              {t("scriptWriter.addKeyword")}
            </button>
          )}
          <button
            type="button"
            onClick={onAiKeywords}
            disabled={aiKeywordsDisabled}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-accent/30 text-accent bg-accent-muted/10 hover:bg-accent-muted/20 px-3 py-1 text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles size={11} />
            {t("scriptWriter.aiKeywords")}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-default bg-subtle/30 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {SCRIPT_TONES.map((item) => {
            const active = tone === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToneChange(item)}
                className={[
                  "rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200 cursor-pointer shadow-sm",
                  active
                    ? "bg-gradient-to-r from-accent to-accent/90 text-white font-semibold shadow-accent/20 scale-[1.03]"
                    : "bg-surface border border-default text-secondary hover:bg-subtle hover:border-accent/30",
                ].join(" ")}
              >
                {t(`scriptWriter.tone.${item}`)}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted">
            {credits} {t("scriptWriter.credits")}
          </span>
          <Button
            type="primary"
            size="middle"
            icon={
              busy ? (
                <Spin size="small" className="text-white" />
              ) : (
                <Sparkles size={13} />
              )
            }
            onClick={onGenerate}
            disabled={busy || !topic.trim()}
            className="rounded-lg font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {t("scriptWriter.generateScript")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <Select
        size="small"
        value={value}
        onChange={onChange}
        options={options}
        className="w-full"
      />
    </div>
  );
}
