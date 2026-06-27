"use client";

import type { ExploreCategory } from "@vokcg/constants";

import { TemplatesPage } from "./TemplatesPage";
import { AvatarPage } from "./AvatarPage";
import { MusicPage } from "./MusicPage";
import { PublishPage } from "./PublishPage";

interface Props {
  category: ExploreCategory;
}

export function ExploreCategoryPage({ category }: Props) {
  switch (category) {
    case "templates":
      return <TemplatesPage />;
    case "avatar":
      return <AvatarPage />;
    case "music":
      return <MusicPage />;
    case "publish":
      return <PublishPage />;
  }
}
