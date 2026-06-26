import { FileText, Film, Mic, Sparkles, Type } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const CREATE_FLOW_STEPS = [
  {
    id: "content",
    label: "Content",
    description: "Topic, script, and keywords",
    icon: FileText,
  },
  {
    id: "visuals",
    label: "Visuals",
    description: "Footage source and format",
    icon: Film,
  },
  {
    id: "audio",
    label: "Audio",
    description: "Voice and background music",
    icon: Mic,
  },
  {
    id: "subtitles",
    label: "Subtitles",
    description: "Caption style and placement",
    icon: Type,
  },
  {
    id: "review",
    label: "Generate",
    description: "Review and render",
    icon: Sparkles,
  },
] as const;

export type CreateFlowStepId = (typeof CREATE_FLOW_STEPS)[number]["id"];

export type CreateFlowStep = (typeof CREATE_FLOW_STEPS)[number] & {
  icon: LucideIcon;
};

export function createFlowStepIndex(stepId: CreateFlowStepId) {
  return CREATE_FLOW_STEPS.findIndex((s) => s.id === stepId);
}

export function nextCreateFlowStep(
  stepId: CreateFlowStepId,
): CreateFlowStepId | null {
  const idx = createFlowStepIndex(stepId);
  if (idx < 0 || idx >= CREATE_FLOW_STEPS.length - 1) return null;
  return CREATE_FLOW_STEPS[idx + 1]!.id;
}

export function prevCreateFlowStep(
  stepId: CreateFlowStepId,
): CreateFlowStepId | null {
  const idx = createFlowStepIndex(stepId);
  if (idx <= 0) return null;
  return CREATE_FLOW_STEPS[idx - 1]!.id;
}
