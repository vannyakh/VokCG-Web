import type { LucideIcon } from "lucide-react";
import {
  FileText,
  GraduationCap,
  Headphones,
  Megaphone,
  Presentation,
  Smartphone,
  Video,
} from "lucide-react";

export type ScriptTemplateId =
  | "youtube"
  | "reel"
  | "demo"
  | "tutorial"
  | "ad"
  | "explainer"
  | "podcast";

export type ScriptTone =
  | "informative"
  | "casual"
  | "persuasive"
  | "energetic"
  | "story";

export type ScriptSectionKind =
  | "hook"
  | "problem"
  | "solution"
  | "cta"
  | "body";

export type ScriptTemplate = {
  id: ScriptTemplateId;
  nameKey: string;
  metaKey: string;
  icon: LucideIcon;
  iconClass: string;
  defaultParagraphs: number;
  sectionNames: string[];
};

export type ScriptSection = {
  id: string;
  name: string;
  kind: ScriptSectionKind;
  text: string;
};

export type ScriptVersion = {
  id: string;
  createdAt: number;
  sections: ScriptSection[];
  script: string;
};

export type HookVariation = { id: string; labelKey: string; text: string };

export type ScriptHistoryEntry = {
  id: string;
  title: string;
  templateId: ScriptTemplateId;
  createdAt: number;
  wordCount: number;
};

export type ScriptQualityScores = {
  engagement: number;
  clarity: number;
  seo: number;
  hookStrength: number;
};

const HISTORY_KEY = "vokcg-script-history";

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: "youtube",
    nameKey: "template.youtube",
    metaKey: "template.youtubeMeta",
    icon: Video,
    iconClass: "bg-accent-muted text-accent",
    defaultParagraphs: 4,
    sectionNames: ["Hook", "Problem", "Solution", "Proof", "CTA"],
  },
  {
    id: "reel",
    nameKey: "template.reel",
    metaKey: "template.reelMeta",
    icon: Smartphone,
    iconClass: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
    defaultParagraphs: 1,
    sectionNames: ["Hook", "Value", "CTA"],
  },
  {
    id: "demo",
    nameKey: "template.demo",
    metaKey: "template.demoMeta",
    icon: Presentation,
    iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    defaultParagraphs: 3,
    sectionNames: ["Hook", "Problem", "Demo", "Proof", "CTA"],
  },
  {
    id: "tutorial",
    nameKey: "template.tutorial",
    metaKey: "template.tutorialMeta",
    icon: GraduationCap,
    iconClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    defaultParagraphs: 5,
    sectionNames: ["Intro", "Step 1", "Step 2", "Step 3", "Summary"],
  },
  {
    id: "ad",
    nameKey: "template.ad",
    metaKey: "template.adMeta",
    icon: Megaphone,
    iconClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    defaultParagraphs: 2,
    sectionNames: ["Hook", "Offer", "Urgency", "CTA"],
  },
  {
    id: "explainer",
    nameKey: "template.explainer",
    metaKey: "template.explainerMeta",
    icon: FileText,
    iconClass: "bg-accent-muted text-accent",
    defaultParagraphs: 4,
    sectionNames: ["Hook", "Context", "Explanation", "Examples", "Summary"],
  },
  {
    id: "podcast",
    nameKey: "template.podcast",
    metaKey: "template.podcastMeta",
    icon: Headphones,
    iconClass: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
    defaultParagraphs: 2,
    sectionNames: ["Greeting", "Topic intro", "What to expect", "CTA"],
  },
];

export const SCRIPT_PLATFORMS = [
  "youtube-long",
  "tiktok",
  "linkedin",
  "podcast",
] as const;
export const SCRIPT_LENGTHS = ["short", "medium", "long", "extended"] as const;
export type ScriptPlatform = (typeof SCRIPT_PLATFORMS)[number];
export type ScriptLength = (typeof SCRIPT_LENGTHS)[number];
export const SCRIPT_TONES: ScriptTone[] = [
  "informative",
  "casual",
  "persuasive",
  "energetic",
  "story",
];

export function estimateCredits(length: ScriptLength) {
  switch (length) {
    case "short":
      return 5;
    case "medium":
      return 8;
    case "long":
      return 12;
    case "extended":
      return 20;
    default:
      return 8;
  }
}

export function platformForTemplate(id: ScriptTemplateId): ScriptPlatform {
  if (id === "reel") return "tiktok";
  if (id === "podcast") return "podcast";
  return "youtube-long";
}

export function sectionKindFromName(name: string): ScriptSectionKind {
  const v = name.toLowerCase();
  if (v.includes("hook") || v.includes("greeting") || v.includes("intro"))
    return "hook";
  if (
    v.includes("problem") ||
    v.includes("context") ||
    v.includes("offer") ||
    v.includes("urgency") ||
    v.includes("topic intro")
  )
    return "problem";
  if (
    v.includes("solution") ||
    v.includes("demo") ||
    v.includes("proof") ||
    v.includes("explanation") ||
    v.includes("example") ||
    v.includes("step") ||
    v.includes("value") ||
    v.includes("expect")
  )
    return "solution";
  if (v.includes("cta") || v.includes("summary")) return "cta";
  return "body";
}

export function sectionNamesForTemplate(
  template: ScriptTemplate,
  length: ScriptLength,
) {
  const target = paragraphsForLength(length);
  return template.sectionNames.slice(
    0,
    Math.max(1, Math.min(target, template.sectionNames.length)),
  );
}

export function paragraphsForLength(length: ScriptLength) {
  switch (length) {
    case "short":
      return 1;
    case "medium":
      return 3;
    case "long":
      return 5;
    case "extended":
      return 8;
    default:
      return 3;
  }
}

export function parseKeywordList(raw: string) {
  return raw
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function keywordListToString(keywords: string[]) {
  return keywords.join(", ");
}

export function buildScriptPrompt(input: {
  template: ScriptTemplate;
  platform: ScriptPlatform;
  length: ScriptLength;
  audience: string;
  tone: ScriptTone;
  keywords: string[];
}) {
  return [
    `Template: ${input.template.id}`,
    `Platform: ${input.platform}`,
    `Length: ${input.length}`,
    input.audience.trim() ? `Audience: ${input.audience.trim()}` : "",
    `Tone: ${input.tone}`,
    input.keywords.length ? `Keywords: ${input.keywords.join(", ")}` : "",
    `Structure: ${sectionNamesForTemplate(input.template, input.length).join(" → ")}`,
  ]
    .filter(Boolean)
    .join(". ");
}

export function buildGenerationSubject(topic: string, audience: string) {
  const base = topic.trim();
  const aud = audience.trim();
  if (!aud) return base;
  return `${base} (for ${aud})`;
}

export function parseScriptSections(
  script: string,
  sectionNames: string[],
): ScriptSection[] {
  const blocks = script
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (blocks.length === 0) return [];
  const count = Math.max(blocks.length, sectionNames.length);
  return Array.from({ length: count }, (_, index) => {
    const name =
      sectionNames[index] ??
      sectionNames[sectionNames.length - 1] ??
      `Section ${index + 1}`;
    return {
      id: `section-${index}`,
      name,
      kind: sectionKindFromName(name),
      text: blocks[index] ?? "",
    };
  }).filter((section) => section.text.trim());
}

export function sectionsToScript(sections: ScriptSection[]) {
  return sections
    .map((section) => section.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function formatScriptForCopy(sections: ScriptSection[]) {
  return sections
    .map((section) => `[${section.name}]\n${section.text}`)
    .join("\n\n");
}

export function formatScriptForExport(
  sections: ScriptSection[],
  format: "txt" | "md",
) {
  if (format === "md")
    return sections
      .map((section) => `## ${section.name}\n\n${section.text}`)
      .join("\n\n---\n\n");
  return formatScriptForCopy(sections);
}

export function buildHookVariations(
  sections: ScriptSection[],
): HookVariation[] {
  const hook =
    sections.find((section) => section.kind === "hook")?.text ??
    sections[0]?.text ??
    "";
  if (!hook.trim()) return [];
  const firstSentence = hook.split(/(?<=[.!?])\s+/)[0]?.trim() || hook.trim();
  const words = hook.split(/\s+/).filter(Boolean);
  return [
    { id: "direct", labelKey: "variation.direct", text: firstSentence },
    {
      id: "story",
      labelKey: "variation.story",
      text:
        words.length > 12
          ? `${words.slice(0, 8).join(" ")}… Here's what changed everything.`
          : `Here's the story behind it: ${firstSentence}`,
    },
    {
      id: "bold",
      labelKey: "variation.bold",
      text:
        words.length > 10
          ? `${words.slice(0, 10).join(" ")}.`
          : `${firstSentence} No clickbait.`,
    },
  ];
}

export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function estimateReadMinutes(words: number) {
  return words <= 0 ? 0 : Math.max(1, Math.round(words / 150));
}

export function estimateSpeechDurationWords(words: number) {
  const seconds = Math.round((words / 150) * 60);
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function estimateGradeLevel(text: string) {
  const words = countWords(text);
  const sentences = Math.max(1, text.split(/[.!?]+/).filter(Boolean).length);
  return Math.min(12, Math.max(5, Math.round((words / sentences) * 0.45 + 4)));
}

export function computeQualityScores(
  script: string,
  keywords: string[],
): ScriptQualityScores {
  const words = countWords(script);
  const lower = script.toLowerCase();
  const questions = (script.match(/\?/g) ?? []).length;
  const actionWords = [
    "you",
    "discover",
    "learn",
    "try",
    "start",
    "build",
    "create",
  ].filter((w) => lower.includes(w)).length;
  const keywordHits = keywords.filter((kw) =>
    lower.includes(kw.toLowerCase()),
  ).length;
  const hook = script.split(/\n\s*\n/)[0] ?? script;
  const hookWords = countWords(hook);
  return {
    engagement: Math.min(98, Math.round(55 + questions * 8 + actionWords * 5)),
    clarity: Math.min(
      98,
      Math.round(
        words > 0
          ? 92 -
              Math.abs(
                countWords(script) /
                  Math.max(1, script.split(/[.!?]+/).length) -
                  18,
              )
          : 50,
      ),
    ),
    seo: keywords.length
      ? Math.min(98, Math.round(45 + (keywordHits / keywords.length) * 50))
      : 60,
    hookStrength: Math.min(
      98,
      Math.round(hookWords >= 8 && hookWords <= 45 ? 70 + questions * 6 : 58),
    ),
  };
}

export function loadScriptHistory(): ScriptHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScriptHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

export function saveScriptHistory(entries: ScriptHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 10)));
}

export function relativeHistoryTime(ts: number) {
  const hours = Math.floor((Date.now() - ts) / 3600000);
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function filterTemplates(templates: ScriptTemplate[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return templates;
  return templates.filter(
    (t) =>
      t.id.includes(q) ||
      t.nameKey.toLowerCase().includes(q) ||
      t.metaKey.toLowerCase().includes(q),
  );
}

export const WORD_COUNT_TARGETS: Record<
  ScriptLength,
  { min: number; max: number }
> = {
  short: { min: 80, max: 150 },
  medium: { min: 300, max: 600 },
  long: { min: 750, max: 1200 },
  extended: { min: 1500, max: 2500 },
};

export const TOPIC_SUGGESTIONS: Record<ScriptTemplateId, string[]> = {
  youtube: [
    "5 Secrets to scale your SaaS business in 2026",
    "Why traditional databases are dying (and what is next)",
    "A complete walkthrough of the new Apple Vision headset",
  ],
  reel: [
    "3 tools I use to write code 10x faster 🚀",
    "Stop using standard loops in JavaScript! Do this instead",
    "Morning routine of a remote Google engineer",
  ],
  demo: [
    "VokCG: The AI video platform that converts text into high-converting ads",
    "Introducing DevSync: Instant collaborative terminal sharing",
    "How our new browser extension automates receipt sorting",
  ],
  tutorial: [
    "How to build a complete Next.js app with authentication in 10 minutes",
    "Mastering CSS Grid: A step-by-step guide for beginners",
    "Deploying your first Python backend to the cloud",
  ],
  ad: [
    "Tired of editing videos for hours? Try VokCG now for free!",
    "Upgrade your workspace with our ergonomic standing desks",
    "The ultimate cyber-security boot camp for career changers",
  ],
  explainer: [
    "How does quantum computing actually work? (Simply explained)",
    "What is inflation and how does it affect your savings?",
    "The history of the internet and how it evolved",
  ],
  podcast: [
    "Welcome back to Code Talk. Today we are joined by a senior AI researcher.",
    "Ep 42: The future of web development frameworks with our special guest.",
    "Welcome to Startup Journey. Let’s talk about how to get your first 100 users.",
  ],
};
