"use client";

import { Progress } from "antd";
import type { LucideIcon } from "lucide-react";
import { planCreditSummary } from "../lib/workspace-billing-utils";

type Props = {
  label: string;
  used: number;
  limit: number | null;
  icon: LucideIcon;
  suffix?: string;
  unlimitedLabel?: string;
  remainingLabel?: string;
  usedOfLabel?: string;
};

export function BillingCreditStat({
  label,
  used,
  limit,
  icon: Icon,
  suffix = "",
  unlimitedLabel = "Unlimited",
  remainingLabel = "remaining",
  usedOfLabel = "used",
}: Props) {
  const credit = planCreditSummary(used, limit);
  const headline = credit.isUnlimited
    ? unlimitedLabel
    : `${credit.remaining}${suffix} ${remainingLabel}`;
  const detail = credit.isUnlimited
    ? `${used}${suffix} ${usedOfLabel}`
    : `${credit.used}${suffix} / ${credit.limit}${suffix} ${usedOfLabel}`;

  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-6">
      <div className="flex min-w-0 items-center gap-3.5 sm:w-56 sm:shrink-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon size={18} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-primary">{label}</p>
          <p className="mt-0.5 text-sm tabular-nums text-muted">{detail}</p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        {!credit.isUnlimited ? (
          <Progress
            percent={credit.percent}
            showInfo={false}
            size={["100%", 8]}
            strokeColor="var(--color-primary)"
            className="m-0"
          />
        ) : (
          <div className="h-2 rounded-full bg-accent/15" />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 sm:w-44 sm:shrink-0 sm:justify-end sm:text-right">
        <p className="text-base font-bold tabular-nums text-primary">
          {headline}
        </p>
        {!credit.isUnlimited && (
          <span className="rounded-full bg-subtle px-2.5 py-1 text-xs font-semibold tabular-nums text-muted">
            {credit.percent}%
          </span>
        )}
      </div>
    </div>
  );
}
