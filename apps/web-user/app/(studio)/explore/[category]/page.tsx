import { notFound } from "next/navigation";

import type { ExploreCategory } from "@vokcg/constants";
import { ExploreCategoryPage } from "@/features/explore";

const VALID_CATEGORIES: ExploreCategory[] = [
  "templates",
  "avatar",
  "music",
  "publish",
];

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as ExploreCategory)) {
    notFound();
  }
  return <ExploreCategoryPage category={category as ExploreCategory} />;
}
