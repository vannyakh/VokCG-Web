"use client";

import { API_BASE_URL } from "@vokcg/config";

type UserAvatarProps = {
  username: string;
  avatarUrl?: string | null;
  revision?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
  xl: "h-20 w-20 text-lg",
} as const;

const GRADIENTS = [
  "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", // Blue/Indigo
  "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", // Violet/Purple
  "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", // Pink/Rose
  "linear-gradient(135deg, #10b981 0%, #047857 100%)", // Emerald/Teal
  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", // Amber/Orange
  "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", // Cyan/Teal
  "linear-gradient(135deg, #f43f5e 0%, #c084fc 100%)", // Sunset Rose/Lilac
];

function getAvatarBackground(username: string) {
  if (!username) return { background: GRADIENTS[0] };
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return { background: GRADIENTS[index] };
}

export function UserAvatar({
  username,
  avatarUrl,
  revision,
  size = "sm",
  className = "",
}: UserAvatarProps) {
  const sizeClass = SIZE_CLASS[size];
  const initials = username ? username.slice(0, 2).toUpperCase() : "U";

  if (avatarUrl) {
    const src =
      revision != null
        ? `${API_BASE_URL}${avatarUrl}?v=${revision}`
        : `${API_BASE_URL}${avatarUrl}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={username}
        className={`shrink-0 rounded-full object-cover shadow-sm border border-default transition-all duration-300 hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-[var(--color-primary)]/40 ${sizeClass} ${className}`.trim()}
      />
    );
  }

  return (
    <div
      style={getAvatarBackground(username)}
      className={[
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-[var(--color-primary)]/40",
        sizeClass,
        className,
      ].join(" ")}
    >
      {initials}
    </div>
  );
}
