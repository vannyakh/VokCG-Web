"use client";

import { Card } from "antd";
import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <Card
      className={`h-full bg-surface border-default ${className}`}
      size="small"
      title={
        <div className="flex flex-col gap-0.5 py-0.5">
          <span className="text-[13px] font-bold text-primary">{title}</span>
          {subtitle && (
            <span className="text-[11px] font-normal text-muted">{subtitle}</span>
          )}
        </div>
      }
      styles={{ body: { padding: "8px 12px 12px" } }}
    >
      {children}
    </Card>
  );
}
