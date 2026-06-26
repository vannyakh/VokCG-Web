"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input, Modal, Select, Spin } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import { useLocale } from "@vokcg/i18n";
import { postApi } from "@/api";
import { SCRIPT_LANGUAGES } from "@vokcg/constants";
import { USER_ROUTES } from "@vokcg/constants";
import type { CreateStudioConfig } from "@/types/create-config";
import type { ScriptResponse, TermsResponse } from "@/types/content";
import { useAppMessage } from "@vokcg/ui";
import {
  configToScriptPayload,
  configToTermsPayload,
  CREATE_CONFIG_DEFAULTS,
} from "../../create/lib/create-config";
import {
  buildGenerationSubject,
  buildHookVariations,
  buildScriptPrompt,
  computeQualityScores,
  countWords,
  estimateCredits,
  estimateGradeLevel,
  estimateReadMinutes,
  estimateSpeechDurationWords,
  filterTemplates,
  formatScriptForCopy,
  formatScriptForExport,
  keywordListToString,
  loadScriptHistory,
  paragraphsForLength,
  parseScriptSections,
  platformForTemplate,
  saveScriptHistory,
  SCRIPT_TEMPLATES,
  sectionNamesForTemplate,
  sectionsToScript,
  type HookVariation,
  type ScriptHistoryEntry,
  type ScriptLength,
  type ScriptPlatform,
  type ScriptSection,
  type ScriptTemplateId,
  type ScriptTone,
  type ScriptVersion,
} from "../lib/script-writer-utils";
import { storeTtsDraft } from "../../tts/lib/tts-utils";
import {
  clearContentDraft,
  loadContentDraft,
  storeContentDraft,
} from "../lib/content-draft";

import { TemplatePanel } from "./template-panel";
import { TopBar, type WorkspaceTab } from "./top-bar";
import { BriefCard } from "./brief-card";
import { OutputCard, type SectionAction } from "./output-card";
import { VersionsPanel } from "./versions-panel";
import { InsightsPanel } from "./insights-panel";

const LOADING_MESSAGES = [
  "scriptWriter.loading.analysing",
  "scriptWriter.loading.hook",
  "scriptWriter.loading.sections",
  "scriptWriter.loading.polishing",
] as const;

const toErrorText = (e: unknown) => (e instanceof Error ? e.message : "");

export function ScriptWriterWorkspace() {
  const { t } = useLocale();
  const message = useAppMessage();
  const router = useRouter();

  const [tab, setTab] = useState<WorkspaceTab>("generate");
  const [templateId, setTemplateId] = useState<ScriptTemplateId>("youtube");
  const [templateSearch, setTemplateSearch] = useState("");
  const [platform, setPlatform] = useState<ScriptPlatform>("youtube-long");
  const [length, setLength] = useState<ScriptLength>("long");
  const [audience, setAudience] = useState("Content creators & marketers");
  const [language, setLanguage] = useState("");
  const [topic, setTopic] = useState(
    "How AI video tools are helping creators produce more content in less time — covering TTS, auto-editing, and scheduling in one platform.",
  );
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [addingKeyword, setAddingKeyword] = useState(false);
  const [tone, setTone] = useState<ScriptTone>("informative");
  const [script, setScript] = useState("");
  const [sections, setSections] = useState<ScriptSection[]>([]);
  const [variations, setVariations] = useState<HookVariation[]>([]);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(
    null,
  );
  const [history, setHistory] = useState<ScriptHistoryEntry[]>(() =>
    loadScriptHistory(),
  );
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [status, setStatus] = useState<"idle" | "generating" | "ready">("idle");
  const [loadingStep, setLoadingStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalHint, setModalHint] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [modalReadOnly, setModalReadOnly] = useState(false);
  const [modalConfirmLabel, setModalConfirmLabel] = useState("");
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | null>(
    null,
  );
  const [pendingRewriteSection, setPendingRewriteSection] =
    useState<ScriptSection | null>(null);
  const [busySectionId, setBusySectionId] = useState<string | null>(null);
  const [translateModalOpen, setTranslateModalOpen] = useState(false);
  const [translateLanguage, setTranslateLanguage] = useState("English");
  const draftLoaded = useRef(false);

  const handleDeleteHistory = (id: string) => {
    const nextHistory = history.filter((item) => item.id !== id);
    setHistory(nextHistory);
    saveScriptHistory(nextHistory);
    message.success(t("scriptWriter.deleteHistory"));
  };

  const template = useMemo(
    () =>
      SCRIPT_TEMPLATES.find((item) => item.id === templateId) ??
      SCRIPT_TEMPLATES[0]!,
    [templateId],
  );
  const sectionNames = useMemo(
    () => sectionNamesForTemplate(template, length),
    [template, length],
  );
  const filteredTemplates = useMemo(
    () => filterTemplates(SCRIPT_TEMPLATES, templateSearch),
    [templateSearch],
  );

  const credits = estimateCredits(length);
  const wordCount = countWords(script);
  const charCount = script.length;
  const readMinutes = estimateReadMinutes(wordCount);
  const gradeLevel = estimateGradeLevel(script);
  const quality = useMemo(
    () => computeQualityScores(script, keywords),
    [script, keywords],
  );
  const hasScript = status === "ready" && script.trim().length > 0;

  const config = useMemo((): CreateStudioConfig => {
    const subject = buildGenerationSubject(topic, audience);
    const scriptPrompt = buildScriptPrompt({
      template,
      platform,
      length,
      audience,
      tone,
      keywords,
    });
    return {
      ...CREATE_CONFIG_DEFAULTS,
      content: {
        ...CREATE_CONFIG_DEFAULTS.content,
        subject,
        script,
        terms: keywordListToString(keywords),
        language,
        paragraphCount: paragraphsForLength(length),
        scriptPrompt,
      },
    };
  }, [
    audience,
    keywords,
    language,
    length,
    platform,
    script,
    template,
    tone,
    topic,
  ]);

  const applyScript = useCallback(
    (nextScript: string, names = sectionNames) => {
      setScript(nextScript);
      const nextSections = parseScriptSections(nextScript, names);
      setSections(nextSections);
      setVariations(buildHookVariations(nextSections));
      setSelectedVariationId(null);
      setStatus(nextScript.trim() ? "ready" : "idle");
    },
    [sectionNames],
  );

  const pushVersion = useCallback(
    (nextSections: ScriptSection[], nextScript: string) => {
      setVersions((prev) =>
        [
          {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            sections: nextSections,
            script: nextScript,
          },
          ...prev,
        ].slice(0, 8),
      );
    },
    [],
  );

  useEffect(() => {
    if (draftLoaded.current) return;
    const draft = loadContentDraft();
    if (!draft) return;
    draftLoaded.current = true;
    if (draft.subject) setTopic(draft.subject);
    if (draft.language) setLanguage(draft.language);
    if (draft.terms)
      setKeywords(
        draft.terms
          .split(/[,，]/)
          .map((term) => term.trim())
          .filter(Boolean),
      );
    if (draft.script?.trim()) applyScript(draft.script);
    clearContentDraft();
  }, [applyScript]);

  useEffect(() => {
    if (status !== "generating") return;
    setLoadingStep(0);
    const timer = window.setInterval(
      () =>
        setLoadingStep((step) =>
          Math.min(step + 1, LOADING_MESSAGES.length - 1),
        ),
      2500,
    );
    return () => window.clearInterval(timer);
  }, [status]);

  const generateScriptMutation = useMutation({
    mutationFn: () =>
      postApi<ScriptResponse>(
        "/api/v1/scripts",
        configToScriptPayload(config, {
          generationMode: "structured",
          sectionNames,
        }),
      ),
    onSuccess: (payload) => {
      const nextScript = payload.data.video_script || "";
      const nextSections = parseScriptSections(nextScript, sectionNames);
      setScript(nextScript);
      setSections(nextSections);
      setVariations(buildHookVariations(nextSections));
      setSelectedVariationId(null);
      setStatus("ready");
      pushVersion(nextSections, nextScript);
      const title = topic.trim().slice(0, 48) || t("scriptWriter.untitled");
      const entry: ScriptHistoryEntry = {
        id: crypto.randomUUID(),
        title,
        templateId,
        createdAt: Date.now(),
        wordCount: countWords(nextScript),
      };
      const nextHistory = [
        entry,
        ...history.filter((item) => item.title !== title),
      ].slice(0, 10);
      setHistory(nextHistory);
      saveScriptHistory(nextHistory);
      message.success(t("scriptWriter.scriptGenerated"));
    },
    onError: (error) => {
      setStatus("idle");
      message.error(toErrorText(error) || t("scriptWriter.generateFailed"));
    },
  });

  const generateTermsMutation = useMutation({
    mutationFn: (purpose: "keywords" | "hashtags" = "keywords") =>
      postApi<TermsResponse>(
        "/api/v1/terms",
        configToTermsPayload(config, 8, purpose),
      ),
    onSuccess: (payload) => {
      setKeywords(payload.data.video_terms ?? []);
      message.success(t("scriptWriter.keywordsGenerated"));
    },
    onError: (error) =>
      message.error(toErrorText(error) || t("scriptWriter.generateFailed")),
  });

  const sectionMutation = useMutation({
    mutationFn: async ({
      section,
      action,
      instruction,
    }: {
      section: ScriptSection;
      action: SectionAction;
      instruction?: string;
    }) =>
      postApi<ScriptResponse>(
        "/api/v1/scripts",
        configToScriptPayload(config, {
          generationMode: "section",
          sectionAction: action,
          sectionName: section.name,
          sectionText: section.text,
          sectionInstruction: instruction,
          tone,
        }),
      ),
    onSuccess: (payload, variables) => {
      const nextText =
        payload.data.video_script?.trim() || variables.section.text;
      const nextSections = sections.map((item) =>
        item.id === variables.section.id ? { ...item, text: nextText } : item,
      );
      const nextScript = sectionsToScript(nextSections);
      setSections(nextSections);
      setScript(nextScript);
      setVariations(buildHookVariations(nextSections));
      pushVersion(nextSections, nextScript);
      message.success(t("scriptWriter.sectionUpdated"));
    },
    onError: (error) =>
      message.error(toErrorText(error) || t("scriptWriter.generateFailed")),
    onSettled: () => setBusySectionId(null),
  });

  const translateMutation = useMutation({
    mutationFn: (targetLang: string) => {
      const translationPrompt = `You are a professional translator. Translate the following script to ${targetLang}. Maintain the exact section layout, tone, and HTML structure (if any). Do not add any conversational meta-remarks or introductions, return ONLY the translated script text:\n\n${script}`;
      return postApi<ScriptResponse>("/api/v1/scripts", {
        video_subject: topic,
        video_language: targetLang,
        paragraph_number: sections.length || 3,
        video_script_prompt: translationPrompt,
        generation_mode: "structured",
        section_names: sectionNames,
      });
    },
    onSuccess: (payload, targetLang) => {
      const nextScript = payload.data.video_script || "";
      const nextSections = parseScriptSections(nextScript, sectionNames);
      setScript(nextScript);
      setSections(nextSections);
      setVariations(buildHookVariations(nextSections));
      setLanguage(targetLang);
      pushVersion(nextSections, nextScript);
      message.success(
        t("scriptWriter.translatedSuccess", { lang: targetLang }),
      );
    },
    onError: (error) =>
      message.error(toErrorText(error) || t("scriptWriter.generateFailed")),
  });

  const chaptersMutation = useMutation({
    mutationFn: () => {
      const prompt = `Analyze this video script and extract 3-5 chapter markers with timestamps (e.g. 0:00 - Introduction) based on its structure. Return ONLY the timestamps list:\n\n${script}`;
      return postApi<ScriptResponse>("/api/v1/scripts", {
        video_subject: topic,
        video_language: language || "English",
        paragraph_number: sections.length || 3,
        video_script_prompt: prompt,
        generation_mode: "structured",
        section_names: sectionNames,
      });
    },
    onSuccess: (payload) => {
      openModal(
        t("scriptWriter.actionChapters"),
        t("scriptWriter.chaptersHint") || "Suggested chapters for your script:",
        {
          readOnly: true,
          value: payload.data.video_script || "",
          confirmLabel: t("common.close"),
          onConfirm: () => undefined,
        },
      );
    },
    onError: (error) =>
      message.error(toErrorText(error) || t("scriptWriter.generateFailed")),
  });

  const busy =
    generateScriptMutation.isPending ||
    generateTermsMutation.isPending ||
    sectionMutation.isPending ||
    translateMutation.isPending ||
    chaptersMutation.isPending;

  const handleGenerate = () => {
    if (!topic.trim()) {
      message.warning(t("scriptWriter.topicRequired"));
      return;
    }
    setStatus("generating");
    generateScriptMutation.mutate();
  };

  const handleTemplateSelect = (id: ScriptTemplateId) => {
    setTemplateId(id);
    setPlatform(platformForTemplate(id));
  };

  const handleNewScript = () => {
    setTopic("");
    setScript("");
    setSections([]);
    setVariations([]);
    setKeywords([]);
    setSelectedVariationId(null);
    setStatus("idle");
    setTab("generate");
    message.info(t("scriptWriter.newScriptStarted"));
  };

  const handleCopyAll = async () => {
    if (!sections.length) return;
    await navigator.clipboard.writeText(formatScriptForCopy(sections));
    message.success(t("scriptWriter.copiedScript"));
  };

  const handleExport = (format: "txt" | "md") => {
    if (!sections.length) return;
    const slug =
      topic
        .trim()
        .replace(/[^a-z0-9]+/gi, "_")
        .toLowerCase()
        .slice(0, 40) || "script";
    const blob = new Blob([formatScriptForExport(sections, format)], {
      type: format === "md" ? "text/markdown" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slug}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    message.success(t("scriptWriter.exported", { format }));
  };

  const handleSendToTts = (text?: string) => {
    const payload = text?.trim() || script.trim();
    if (!payload) {
      message.warning(t("scriptWriter.noScriptYet"));
      return;
    }
    storeContentDraft({
      subject: buildGenerationSubject(topic, audience),
      script: payload,
      terms: keywordListToString(keywords),
      language,
      source: "script-writer",
    });
    storeTtsDraft(payload);
    router.push(USER_ROUTES.ttsStudio);
  };

  const handleUseInCreate = () => {
    if (!script.trim()) {
      message.warning(t("scriptWriter.noScriptYet"));
      return;
    }
    storeContentDraft({
      subject: buildGenerationSubject(topic, audience),
      script,
      terms: keywordListToString(keywords),
      language,
      source: "script-writer",
    });
    router.push(USER_ROUTES.create);
    message.success(t("scriptWriter.sentToCreate"));
  };

  const updateSectionText = (id: string, text: string) => {
    const nextSections = sections.map((section) =>
      section.id === id ? { ...section, text } : section,
    );
    setSections(nextSections);
    setScript(sectionsToScript(nextSections));
  };

  const applyVariation = (variation: HookVariation) => {
    setSelectedVariationId(variation.id);
    if (sections.length === 0) return;
    const hookIndex = sections.findIndex((section) => section.kind === "hook");
    const index = hookIndex >= 0 ? hookIndex : 0;
    const nextSections = sections.map((section, i) =>
      i === index ? { ...section, text: variation.text } : section,
    );
    const nextScript = sectionsToScript(nextSections);
    setSections(nextSections);
    setScript(nextScript);
    message.success(t("scriptWriter.variationApplied"));
  };

  const addKeyword = (value: string) => {
    const word = value.trim();
    if (!word || keywords.includes(word)) return;
    setKeywords((prev) => [...prev, word]);
  };

  const openModal = (
    title: string,
    hint: string,
    options?: {
      readOnly?: boolean;
      value?: string;
      confirmLabel?: string;
      onConfirm?: () => void;
    },
  ) => {
    setModalTitle(title);
    setModalHint(hint);
    setModalValue(options?.value ?? "");
    setModalReadOnly(Boolean(options?.readOnly));
    setModalConfirmLabel(options?.confirmLabel ?? t("scriptWriter.apply"));
    setModalOnConfirm(() => options?.onConfirm ?? null);
    setModalOpen(true);
  };

  const handleSectionAction = (
    section: ScriptSection,
    action: SectionAction,
  ) => {
    if (action === "rewrite") {
      setPendingRewriteSection(section);
      openModal(
        t("scriptWriter.rewriteSection", { name: section.name }),
        t("scriptWriter.rewriteSectionHint"),
      );
      return;
    }
    setBusySectionId(section.id);
    sectionMutation.mutate({ section, action });
  };

  const handleModalConfirm = () => {
    if (pendingRewriteSection) {
      setBusySectionId(pendingRewriteSection.id);
      sectionMutation.mutate({
        section: pendingRewriteSection,
        action: "rewrite",
        instruction: modalValue.trim() || undefined,
      });
      setPendingRewriteSection(null);
    } else {
      modalOnConfirm?.();
    }
    setModalOpen(false);
  };

  const runAiAction = (action: string) => {
    if (!hasScript && action !== "hashtags") {
      message.warning(t("scriptWriter.noScriptYet"));
      return;
    }
    if (action === "rewrite" || action === "shorter" || action === "hook") {
      handleGenerate();
      return;
    }
    if (action === "hashtags") {
      if (!script.trim()) {
        message.warning(t("scriptWriter.noScriptYet"));
        return;
      }
      generateTermsMutation.mutate("hashtags", {
        onSuccess: (payload) => {
          const tags = (payload.data.video_terms ?? []).map((term) =>
            term.startsWith("#") ? term : `#${term.replace(/\s+/g, "")}`,
          );
          openModal(
            t("scriptWriter.actionHashtags"),
            t("scriptWriter.hashtagsHint"),
            {
              readOnly: true,
              value: tags.join("\n"),
              confirmLabel: t("common.close"),
              onConfirm: () => undefined,
            },
          );
        },
      });
      return;
    }
    if (action === "translate") {
      setTranslateModalOpen(true);
      return;
    }
    if (action === "chapters") {
      chaptersMutation.mutate();
      return;
    }
    message.info(t("scriptWriter.actionSoon"));
  };

  const languageOptions = SCRIPT_LANGUAGES.map((code) => ({
    value: code,
    label: code || t("common.random"),
  }));

  return (
    <>
      <div className="flex h-full min-h-0 overflow-hidden bg-canvas">
        <TemplatePanel
          t={t}
          templateSearch={templateSearch}
          onSearchChange={setTemplateSearch}
          filteredTemplates={filteredTemplates}
          templateId={templateId}
          onSelectTemplate={handleTemplateSelect}
          history={history}
          onHistorySelect={(entry) => {
            setTemplateId(entry.templateId);
            setTopic(entry.title);
          }}
          onNewScript={handleNewScript}
          onDeleteHistory={handleDeleteHistory}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            t={t}
            tab={tab}
            versionsCount={versions.length}
            readMinutes={readMinutes}
            credits={credits}
            onTabChange={(next) => {
              if (next === "tts") handleSendToTts();
              else setTab(next);
            }}
            onCopyAll={() => void handleCopyAll()}
            copyDisabled={!hasScript}
          />

          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-4">
              {tab === "versions" && (
                <VersionsPanel
                  t={t}
                  versions={versions}
                  onRestore={(version) =>
                    applyScript(version.script, sectionNames)
                  }
                />
              )}

              {tab === "edit" && (
                <div className="overflow-hidden rounded-xl border border-default bg-surface">
                  <div className="border-b border-default px-3.5 py-2.5 text-xs font-medium text-secondary">
                    {t("scriptWriter.editScript")}
                  </div>
                  <Input.TextArea
                    value={script}
                    onChange={(e) => applyScript(e.target.value, sectionNames)}
                    autoSize={{ minRows: 16, maxRows: 28 }}
                    className="rounded-none border-none px-3.5 py-3 text-sm leading-relaxed shadow-none"
                    placeholder={t("scriptWriter.scriptPlaceholder")}
                  />
                </div>
              )}

              {tab === "generate" && (
                <div className="flex flex-col gap-3.5">
                  <BriefCard
                    t={t}
                    templateLabel={t(`scriptWriter.${template.nameKey}`)}
                    platform={platform}
                    length={length}
                    audience={audience}
                    language={language}
                    topic={topic}
                    keywords={keywords}
                    keywordDraft={keywordDraft}
                    addingKeyword={addingKeyword}
                    tone={tone}
                    credits={credits}
                    busy={busy}
                    languageOptions={languageOptions}
                    onPlatformChange={setPlatform}
                    onLengthChange={setLength}
                    onAudienceChange={setAudience}
                    onLanguageChange={setLanguage}
                    onTopicChange={setTopic}
                    onToneChange={setTone}
                    onGenerate={handleGenerate}
                    onRemoveKeyword={(keyword) =>
                      setKeywords((prev) =>
                        prev.filter((item) => item !== keyword),
                      )
                    }
                    onKeywordDraftChange={setKeywordDraft}
                    onStartAddKeyword={() => setAddingKeyword(true)}
                    onCancelAddKeyword={() => {
                      setAddingKeyword(false);
                      setKeywordDraft("");
                    }}
                    onConfirmAddKeyword={() => {
                      addKeyword(keywordDraft);
                      setKeywordDraft("");
                      setAddingKeyword(false);
                    }}
                    onAiKeywords={() =>
                      generateTermsMutation.mutate("keywords")
                    }
                    aiKeywordsDisabled={!topic.trim() || busy}
                    templateId={templateId}
                  />

                  {status === "generating" && (
                    <div className="overflow-hidden rounded-xl border border-default bg-surface">
                      <div className="px-5 py-10 text-center">
                        <div className="mb-3 flex items-center justify-center gap-2">
                          <Spin />
                          <span className="text-sm font-medium text-secondary">
                            {t(
                              LOADING_MESSAGES[loadingStep] ??
                                LOADING_MESSAGES[0],
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-muted">
                          {t("scriptWriter.loading.eta")}
                        </p>
                      </div>
                    </div>
                  )}

                  {!hasScript && status !== "generating" && (
                    <div className="overflow-hidden rounded-xl border border-default bg-surface">
                      <div className="px-5 py-10 text-center">
                        <PenLine
                          size={40}
                          className="mx-auto mb-3 text-subtle"
                        />
                        <p className="text-sm font-medium text-secondary">
                          {t("scriptWriter.emptyTitle")}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-muted">
                          {t("scriptWriter.emptySub")}
                        </p>
                      </div>
                    </div>
                  )}

                  {hasScript && (
                    <OutputCard
                      t={t}
                      sections={sections}
                      variations={variations}
                      selectedVariationId={selectedVariationId}
                      busySectionId={busySectionId}
                      wordCount={wordCount}
                      charCount={charCount}
                      duration={estimateSpeechDurationWords(wordCount)}
                      onCopyAll={() => void handleCopyAll()}
                      onExport={() => handleExport("txt")}
                      onSendToTts={() => handleSendToTts()}
                      onSectionChange={updateSectionText}
                      onSectionAction={handleSectionAction}
                      onPreviewSection={(section) =>
                        handleSendToTts(section.text)
                      }
                      onApplyVariation={applyVariation}
                    />
                  )}
                </div>
              )}
            </div>

            <InsightsPanel
              t={t}
              hasScript={hasScript}
              wordCount={wordCount}
              duration={estimateSpeechDurationWords(wordCount)}
              gradeLevel={gradeLevel}
              clarityScore={quality.clarity}
              quality={quality}
              onExportTxt={() => handleExport("txt")}
              onExportMd={() => handleExport("md")}
              onSendToTts={() => handleSendToTts()}
              onUseInCreate={handleUseInCreate}
              onAiAction={runAiAction}
              length={length}
            />
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={modalTitle}
        onCancel={() => {
          setPendingRewriteSection(null);
          setModalOpen(false);
        }}
        onOk={handleModalConfirm}
        okText={modalConfirmLabel}
        cancelText={t("common.cancel")}
      >
        <p className="mb-3 text-sm text-muted">{modalHint}</p>
        {pendingRewriteSection && (
          <div className="mb-3">
            <span className="text-[10px] font-semibold text-muted block mb-1.5">
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                {
                  key: "punchier",
                  text: "Make it punchier and more engaging.",
                },
                {
                  key: "professional",
                  text: "Make the tone more professional and formal.",
                },
                {
                  key: "question",
                  text: "Add a thought-provoking rhetorical question.",
                },
                {
                  key: "analogy",
                  text: "Use a simple real-world analogy to explain.",
                },
                {
                  key: "conversational",
                  text: "Make it sound more conversational and natural.",
                },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setModalValue(p.text)}
                  className="rounded-full bg-subtle hover:bg-default border border-default px-2.5 py-1 text-[10px] text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  {t(`scriptWriter.presets.${p.key}`)}
                </button>
              ))}
            </div>
          </div>
        )}
        <Input.TextArea
          value={modalValue}
          onChange={(e) => setModalValue(e.target.value)}
          readOnly={modalReadOnly}
          autoSize={{ minRows: 3, maxRows: 8 }}
          placeholder={t("scriptWriter.rewritePlaceholder")}
        />
      </Modal>

      <Modal
        open={translateModalOpen}
        title={t("scriptWriter.actionTranslateTitle")}
        onCancel={() => setTranslateModalOpen(false)}
        onOk={() => {
          translateMutation.mutate(translateLanguage);
          setTranslateModalOpen(false);
        }}
        confirmLoading={translateMutation.isPending}
        okText={t("scriptWriter.translateBtn")}
        cancelText={t("common.cancel")}
      >
        <p className="mb-3 text-sm text-muted">
          {t("scriptWriter.selectLanguage")}
        </p>
        <Select
          className="w-full"
          value={translateLanguage}
          onChange={(val) => setTranslateLanguage(val)}
          options={languageOptions}
        />
      </Modal>
    </>
  );
}
