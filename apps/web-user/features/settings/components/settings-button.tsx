"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  size?: "sm" | "md";
  className?: string;
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "disabled" | "type"
>;

const SIZE_CLASS = {
  sm: "h-9 gap-1.5 px-4 text-[13px]",
  md: "h-11 gap-2 px-5 text-sm",
} as const;

function SettingsButtonBase({
  children,
  icon,
  loading = false,
  size = "md",
  className = "",
  disabled,
  onClick,
  type = "button",
  toneClass,
}: BaseProps & { toneClass: string }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center rounded-full font-semibold disabled:opacity-60",
        SIZE_CLASS[size],
        toneClass,
        className,
      ].join(" ")}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
}

export function SettingsPrimaryButton(props: BaseProps) {
  return <SettingsButtonBase {...props} toneClass="billing-primary-btn" />;
}

export function SettingsGhostButton(props: BaseProps) {
  return (
    <SettingsButtonBase {...props} toneClass="billing-primary-btn--ghost" />
  );
}

export function SettingsOutlineButton(props: BaseProps) {
  return (
    <SettingsButtonBase {...props} toneClass="billing-primary-btn--outline" />
  );
}

export function SettingsDangerButton(props: BaseProps) {
  return (
    <SettingsButtonBase
      {...props}
      toneClass="border border-red-500/40 bg-transparent text-red-500"
    />
  );
}
