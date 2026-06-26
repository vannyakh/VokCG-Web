"use client";

import {
  ArrowRight,
  Calendar,
  CreditCard,
  HardDrive,
  Package,
  Users,
  Video,
} from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale } from "@vokcg/i18n";
import { useTasks } from "@/api";
import { useWorkspace } from "@/api";
import { useWorkspacePlans } from "@/api";
import { USER_ROUTES } from "@vokcg/constants";
import { formatAdminDate, formatCurrency } from "@vokcg/ui";
import {
  parsePlanLimits,
  pickUpgradePlan,
} from "./lib/workspace-billing-utils";
import { BillingCreditStat } from "./components/billing-credit-stat";
import { BillingList, BillingListRow } from "./components/billing-list";
import { BillingShell } from "./components/billing-shell";

function StatusPill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "muted";
}) {
  const toneClass =
    tone === "accent"
      ? "bg-accent/15 text-accent"
      : tone === "muted"
        ? "bg-subtle text-muted"
        : "bg-accent/10 text-accent";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${toneClass}`}
    >
      {children}
    </span>
  );
}

function RoundedLinkButton({
  href,
  children,
  variant = "primary",
  icon,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold",
        variant === "primary"
          ? "billing-primary-btn"
          : "billing-primary-btn--ghost",
      ].join(" ")}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

export function BillingPage() {
  const { t } = useLocale();
  const { workspace, canManageBilling } = useWorkspace();
  const { data: plansData } = useWorkspacePlans();
  const { data: tasksData } = useTasks(1, 1);

  const plan = workspace.plan;
  const plans = plansData ?? [];
  const limits = parsePlanLimits(plan);
  const videosUsed = tasksData?.total ?? 0;
  const upgradePlan = pickUpgradePlan(plans, plan?.id, plan?.price ?? 0);

  const renewalLabel = workspace.renews_at
    ? formatAdminDate(workspace.renews_at)
    : (plan?.price ?? 0) <= 0
      ? t("billing.renewsFreePlan")
      : t("billing.renewsUnavailable");

  const statusLabel =
    workspace.subscription_status?.replace("_", " ") ??
    t("billing.statusActive");
  const isFreePlan = (plan?.price ?? 0) <= 0;

  return (
    <BillingShell
      description={t("billing.description")}
      badge={plan?.name}
      extra={
        canManageBilling ? (
          <RoundedLinkButton
            href={USER_ROUTES.billingPlans}
            icon={<Package size={16} />}
          >
            {t("billing.viewPlans")}
          </RoundedLinkButton>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-8">
        {upgradePlan && canManageBilling && (
          <section className="billing-upgrade-banner flex flex-col gap-5 rounded-[20px] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
            <div className="min-w-0 space-y-1">
              <p className="text-base font-bold text-primary">
                {t("billing.upgradeBannerTitle")}
              </p>
              <p className="text-[15px] text-muted">
                {t("billing.upgradeBannerHint", { plan: upgradePlan.name })}
              </p>
            </div>
            <RoundedLinkButton
              href={USER_ROUTES.billingPlans}
              icon={<ArrowRight size={16} />}
            >
              {t("billing.upgradeTo", { plan: upgradePlan.name })}
            </RoundedLinkButton>
          </section>
        )}

        <BillingList title={t("billing.subscription")}>
          <BillingListRow
            large
            icon={<CreditCard size={18} />}
            label={plan?.name ?? "Free"}
            hint={t("billing.currentPlan")}
            value={
              <div className="flex flex-col items-end gap-2.5">
                <p className="text-[28px] font-extrabold leading-none tabular-nums tracking-tight text-primary">
                  {formatCurrency(plan?.price ?? 0, { prefix: "$" })}
                  <span className="ml-1 text-base font-medium text-muted">
                    /{plan?.interval ?? "month"}
                  </span>
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <StatusPill tone="accent">{statusLabel}</StatusPill>
                  {isFreePlan && (
                    <StatusPill tone="muted">
                      {t("billing.freeTier")}
                    </StatusPill>
                  )}
                </div>
              </div>
            }
          />
          <BillingListRow
            icon={<Calendar size={17} />}
            label={t("billing.renewsOn")}
            hint={workspace.name}
            value={
              <span className="text-[15px] font-semibold text-primary">
                {renewalLabel}
              </span>
            }
          />
          <BillingListRow
            icon={<Users size={17} />}
            label={t("billing.members")}
            value={
              <span className="text-[15px] font-semibold tabular-nums text-primary">
                {workspace.members_count}
              </span>
            }
          />
        </BillingList>

        {!canManageBilling && (
          <p className="rounded-[20px] border border-subtle bg-subtle/50 px-5 py-4 text-[15px] text-muted">
            {t("billing.readOnly")}
          </p>
        )}

        <BillingList
          title={t("billing.planCredits")}
          description={t("billing.planCreditsHint")}
        >
          <BillingCreditStat
            icon={Video}
            label={t("billing.creditVideos")}
            used={videosUsed}
            limit={limits.videos}
            unlimitedLabel={t("billing.unlimited")}
            remainingLabel={t("billing.creditsRemaining")}
            usedOfLabel={t("billing.creditsUsed")}
          />
          <BillingCreditStat
            icon={HardDrive}
            label={t("billing.creditStorage")}
            used={0}
            limit={limits.storageGb}
            suffix=" GB"
            unlimitedLabel={t("billing.unlimited")}
            remainingLabel={t("billing.creditsRemaining")}
            usedOfLabel={t("billing.creditsUsed")}
          />
          <BillingCreditStat
            icon={Users}
            label={t("billing.creditSeats")}
            used={workspace.members_count}
            limit={limits.seats}
            unlimitedLabel={t("billing.unlimited")}
            remainingLabel={t("billing.creditsRemaining")}
            usedOfLabel={t("billing.creditsUsed")}
          />
        </BillingList>
      </div>
    </BillingShell>
  );
}
