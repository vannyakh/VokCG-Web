"use client";

import { CreateStudioLayout } from "./components/create-studio-layout";
import { StudioWorkspaceFrame } from "@vokcg/ui";

export function CreatePage() {
  return (
    <StudioWorkspaceFrame flush>
      <CreateStudioLayout />
    </StudioWorkspaceFrame>
  );
}
