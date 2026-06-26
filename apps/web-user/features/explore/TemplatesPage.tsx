"use client";

import { Input } from "antd";
import { LayoutTemplate, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useLocale } from "@vokcg/i18n";

import {
  ExploreDisabledButton,
  ExploreFilterChip,
  ExplorePreviewNotice,
  ExploreShell,
} from "./components/explore-shell";
import { MOCK_TEMPLATES, type ExploreTemplate } from "./data/mock";

type Category = "all" | ExploreTemplate["category"];

export function TemplatesPage() {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const categories: { id: Category; label: string }[] = [
    { id: "all", label: t("explore.templates.categories.all") },
    { id: "social", label: t("explore.templates.categories.social") },
    { id: "education", label: t("explore.templates.categories.education") },
    { id: "promo", label: t("explore.templates.categories.promo") },
  ];

  const items = useMemo(() => {
    return MOCK_TEMPLATES.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery =
        !query.trim() ||
        item.title.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <ExploreShell description={t("explore.templates.description")}>
      <div className="flex flex-col gap-5">
        <ExplorePreviewNotice />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <ExploreFilterChip
                key={item.id}
                label={item.label}
                active={category === item.id}
                onClick={() => setCategory(item.id)}
              />
            ))}
          </div>
          <Input
            allowClear
            prefix={<Search size={15} className="text-muted" />}
            placeholder={t("explore.templates.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-divider bg-surface"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div
                className="relative aspect-video"
                style={{ background: item.gradient }}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <LayoutTemplate size={28} className="text-white/90" />
                </div>
                <span className="absolute bottom-2 right-2 rounded-md bg-black/45 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {item.duration}
                </span>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="text-[14px] font-semibold text-primary">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-[12px] text-muted">
                    {item.aspect} · {item.category}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ExploreDisabledButton>
                    {t("explore.useTemplate")}
                  </ExploreDisabledButton>
                  <ExploreDisabledButton variant="ghost">
                    {t("explore.previewTemplate")}
                  </ExploreDisabledButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </ExploreShell>
  );
}
