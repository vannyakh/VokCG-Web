"use client";

import { TtsWorkspace } from "./components/tts-workspace";
import { StudioWorkspaceFrame } from "@vokcg/ui";

export function TtsPage() {
  return (
    <StudioWorkspaceFrame>
      <TtsWorkspace />
    </StudioWorkspaceFrame>
  );
}
