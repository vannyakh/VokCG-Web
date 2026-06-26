"use client";

import { Input } from "antd";
import { Music2, Play, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useLocale } from "@vokcg/i18n";

import {
  ExploreFilterChip,
  ExplorePreviewNotice,
  ExploreShell,
} from "./components/explore-shell";
import { MOCK_TRACKS, type ExploreTrack } from "./data/mock";

type Genre = "all" | ExploreTrack["genre"];

export function MusicPage() {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<Genre>("all");

  const genres: { id: Genre; label: string }[] = [
    { id: "all", label: t("explore.music.genres.all") },
    { id: "cinematic", label: t("explore.music.genres.cinematic") },
    { id: "upbeat", label: t("explore.music.genres.upbeat") },
    { id: "calm", label: t("explore.music.genres.calm") },
    { id: "corporate", label: t("explore.music.genres.corporate") },
  ];

  const items = useMemo(() => {
    return MOCK_TRACKS.filter((item) => {
      const matchesGenre = genre === "all" || item.genre === genre;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.mood.toLowerCase().includes(q);
      return matchesGenre && matchesQuery;
    });
  }, [genre, query]);

  return (
    <ExploreShell description={t("explore.music.description")}>
      <div className="flex flex-col gap-5">
        <ExplorePreviewNotice />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {genres.map((item) => (
              <ExploreFilterChip
                key={item.id}
                label={item.label}
                active={genre === item.id}
                onClick={() => setGenre(item.id)}
              />
            ))}
          </div>
          <Input
            allowClear
            prefix={<Search size={15} className="text-muted" />}
            placeholder={t("explore.music.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-divider bg-surface"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className={[
                "flex items-center gap-4 px-4 py-3.5",
                index > 0 ? "border-t border-divider" : "",
              ].join(" ")}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                }}
              >
                <Music2 size={18} className="text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-primary">
                  {item.title}
                </p>
                <p className="truncate text-[12px] text-muted">
                  {item.artist} · {item.mood} · {item.duration}
                </p>
              </div>
              <button
                type="button"
                disabled
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-default text-muted opacity-60"
                aria-label={t("explore.playTrack")}
              >
                <Play size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ExploreShell>
  );
}
