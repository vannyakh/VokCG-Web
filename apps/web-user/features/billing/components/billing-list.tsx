"use client";

import type { ReactNode } from "react";

type BillingListProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function BillingList({
  title,
  description,
  children,
}: BillingListProps) {
  return (
    <section>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold tracking-tight text-primary">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-[15px] text-muted">{description}</p>
          )}
        </div>
      )}
      <div className="billing-list overflow-hidden rounded-[20px]">
        {children}
      </div>
    </section>
  );
}

type BillingListRowProps = {
  icon?: ReactNode;
  label: string;
  hint?: string;
  value?: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
  large?: boolean;
};

export function BillingListRow({
  icon,
  label,
  hint,
  value,
  extra,
  children,
  large = false,
}: BillingListRowProps) {
  return (
    <div
      className={[
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        large ? "px-6 py-6 sm:px-7" : "px-5 py-5 sm:px-6",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        {icon && (
          <div
            className={[
              "flex shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent",
              large ? "h-11 w-11" : "h-10 w-10",
            ].join(" ")}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p
            className={
              large
                ? "text-base font-bold text-primary"
                : "text-[15px] font-semibold text-primary"
            }
          >
            {label}
          </p>
          {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
          {children}
        </div>
      </div>
      {(value || extra) && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
          {value}
          {extra}
        </div>
      )}
    </div>
  );
}
