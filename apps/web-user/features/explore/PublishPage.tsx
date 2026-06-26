"use client";

import { CalendarClock, Link2 } from "lucide-react";

import { useLocale } from "@vokcg/i18n";

import {
  ExploreDisabledButton,
  ExplorePreviewNotice,
  ExploreShell,
} from "./components/explore-shell";
import { MOCK_PLATFORMS, MOCK_SCHEDULE } from "./data/mock";

export function PublishPage() {
  const { t } = useLocale();

  return (
    <ExploreShell
      description={t("explore.publish.description")}
      extra={
        <ExploreDisabledButton>
          {t("explore.addSchedule")}
        </ExploreDisabledButton>
      }
    >
      <div className="flex flex-col gap-5">
        <ExplorePreviewNotice />

        <section className="space-y-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
            {t("explore.publish.platforms")}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MOCK_PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className="rounded-2xl border border-divider bg-surface p-4"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ background: platform.color }}
                  >
                    {platform.name.slice(0, 1)}
                  </div>
                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                      platform.connected
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-subtle text-muted",
                    ].join(" ")}
                  >
                    {platform.connected
                      ? t("explore.connected")
                      : t("explore.connect")}
                  </span>
                </div>
                <p className="mt-3 text-[14px] font-semibold text-primary">
                  {platform.name}
                </p>
                <div className="mt-3">
                  <ExploreDisabledButton variant="ghost">
                    <span className="inline-flex items-center gap-1.5">
                      <Link2 size={13} />
                      {platform.connected
                        ? t("explore.connected")
                        : t("explore.connect")}
                    </span>
                  </ExploreDisabledButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
            {t("explore.publish.schedule")}
          </h2>
          <div
            className="overflow-hidden rounded-2xl border border-divider bg-surface"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            {MOCK_SCHEDULE.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <CalendarClock size={28} className="text-muted" />
                <p className="text-[14px] font-semibold text-primary">
                  {t("explore.publish.scheduleEmpty")}
                </p>
                <p className="max-w-md text-[13px] text-muted">
                  {t("explore.publish.scheduleEmptyHint")}
                </p>
              </div>
            ) : (
              MOCK_SCHEDULE.map((item, index) => (
                <div
                  key={item.id}
                  className={[
                    "flex flex-wrap items-center justify-between gap-3 px-4 py-4",
                    index > 0 ? "border-t border-divider" : "",
                  ].join(" ")}
                >
                  <div>
                    <p className="text-[14px] font-semibold text-primary">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {item.platform} · {item.date} at {item.time}
                    </p>
                  </div>
                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                      item.status === "scheduled"
                        ? "bg-accent/10 text-accent"
                        : "bg-subtle text-muted",
                    ].join(" ")}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </ExploreShell>
  );
}
