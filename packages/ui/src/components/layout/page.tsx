"use client";

import { Tag } from "antd";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  PAGE_SPACING,
  STUDIO_PAGE,
  type PageSpacing,
  type StudioPageWidth,
} from "@vokcg/config";

export type PageWidth = StudioPageWidth;
export type { PageSpacing };

export type PageProps = {
  title?: ReactNode;
  description?: ReactNode;
  badge?: string;
  /** Header right side — maps to Vben `extra` slot */
  extra?: ReactNode;
  footer?: ReactNode;
  /** Auto-calculate content height for full-height tables (Vben `autoContentHeight`) */
  autoContentHeight?: boolean;
  /** Extra px subtracted from content height when `autoContentHeight` is on */
  heightOffset?: number;
  /** Content max-width preset */
  width?: PageWidth;
  /** Fill available parent height (recommended for list/studio pages) */
  fill?: boolean;
  /** Shorthand — applies the same preset to content, header, and gap spacing */
  spacing?: PageSpacing;
  /** Top offset below header, or from top when headerless @default 'default' */
  contentPadding?: PageSpacing;
  /** Vertical gap between direct content children @default 'default' */
  contentGap?: PageSpacing;
  /** Header inner vertical padding @default 'default' */
  headerPadding?: PageSpacing;
  /** Footer inner vertical padding @default 'default' */
  footerPadding?: PageSpacing;
  /**
   * Horizontal inset on header inner, content, and footer inner.
   * Pass `false` to disable. @default 'default'
   */
  insetX?: boolean | PageSpacing;
  /** @deprecated Use `insetX` */
  contentInsetX?: boolean | PageSpacing;
  /** Scroll content independently. Defaults to `!autoContentHeight`. */
  scroll?: boolean;
  /** Stick the page header to the top on scroll @default false */
  stickyHeader?: boolean;
  /** Show a divider under the header @default true */
  headerBorder?: boolean;
  contentClass?: string;
  headerClass?: string;
  headerInnerClass?: string;
  footerClass?: string;
  footerInnerClass?: string;
  className?: string;
  children: ReactNode;
};

function hasNode(value: ReactNode) {
  return value !== null && value !== undefined && value !== false;
}

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function resolveInsetX(
  insetX: boolean | PageSpacing | undefined,
  legacyInsetX: boolean | PageSpacing | undefined,
): PageSpacing {
  const value = insetX ?? legacyInsetX;
  if (value === false) return "none";
  if (value === true) return "default";
  return value ?? "default";
}

export function Page({
  title,
  description,
  badge,
  extra,
  footer,
  autoContentHeight = false,
  heightOffset = 0,
  width = "full",
  fill = true,
  spacing,
  contentPadding,
  contentGap,
  headerPadding,
  footerPadding,
  insetX,
  contentInsetX,
  scroll,
  stickyHeader = false,
  headerBorder = true,
  contentClass = "",
  headerClass = "",
  headerInnerClass = "",
  footerClass = "",
  footerInnerClass = "",
  className = "",
  children,
}: PageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [measuredStyle, setMeasuredStyle] = useState<CSSProperties>({});

  const showHeader =
    hasNode(title) || hasNode(description) || hasNode(extra) || Boolean(badge);
  const hasTitleBlock = hasNode(title) || Boolean(badge);
  const hasOnlyExtra =
    !hasTitleBlock && !hasNode(description) && hasNode(extra);
  const headerAlign = hasTitleBlock
    ? "items-start justify-between"
    : hasNode(description)
      ? "items-center justify-between"
      : "items-center justify-end";

  const resolvedContentPadding = contentPadding ?? spacing ?? "default";
  const resolvedContentGap = contentGap ?? spacing ?? "default";
  const resolvedHeaderPadding = headerPadding ?? spacing ?? "default";
  const resolvedFooterPadding = footerPadding ?? spacing ?? "default";
  const resolvedInsetX = resolveInsetX(insetX, contentInsetX);
  const insetXClass = PAGE_SPACING.insetX[resolvedInsetX];
  const shouldScroll = scroll ?? !autoContentHeight;

  const contentOffset = showHeader
    ? PAGE_SPACING.contentOffset[resolvedContentPadding].withHeader
    : PAGE_SPACING.contentOffset[resolvedContentPadding].bare;

  const contentStyle = autoContentHeight ? measuredStyle : {};

  useLayoutEffect(() => {
    if (!autoContentHeight) return;

    const root = rootRef.current;
    if (!root) return;

    const update = () => {
      const headerH = headerRef.current?.offsetHeight ?? 0;
      const footerH = footerRef.current?.offsetHeight ?? 0;
      const rootH = root.clientHeight;
      const next = Math.max(rootH - headerH - footerH - heightOffset, 160);
      setMeasuredStyle((prev) => {
        const height = next;
        if (prev.height === height && prev.minHeight === 0 && prev.overflow === "hidden") {
          return prev;
        }
        return { height, minHeight: 0, overflow: "hidden" };
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    if (headerRef.current) observer.observe(headerRef.current);
    if (footerRef.current) observer.observe(footerRef.current);

    return () => observer.disconnect();
  }, [autoContentHeight, heightOffset, showHeader, footer]);

  const contentClasses = joinClasses(
    "page-content flex min-h-0 w-full flex-col",
    PAGE_SPACING.contentGap[resolvedContentGap],
    contentOffset,
    insetXClass,
    autoContentHeight ? "" : "flex-1",
    shouldScroll ? "overflow-y-auto" : "",
    contentClass,
  );

  const widthClass = STUDIO_PAGE.width[width];

  return (
    <div
      ref={rootRef}
      className={joinClasses(
        "page flex min-h-0 w-full flex-col",
        fill && "h-full",
        widthClass,
        className,
      )}
    >
      {showHeader && (
        <div
          ref={headerRef}
          className={joinClasses(
            "page-header w-full shrink-0",
            stickyHeader && "sticky top-0 z-10",
            headerBorder && "border-b border-default",
            stickyHeader && "backdrop-blur-md",
            headerClass,
          )}
          style={
            stickyHeader
              ? {
                  background:
                    "color-mix(in srgb, var(--bg-surface) 90%, transparent)",
                }
              : undefined
          }
        >
          <div
            className={joinClasses(
              "page-header-inner",
              insetXClass,
              PAGE_SPACING.headerY[resolvedHeaderPadding],
              headerInnerClass,
            )}
          >
            <div
              className={`flex flex-wrap gap-3 ${hasOnlyExtra ? "items-center justify-end" : headerAlign}`}
            >
              {(hasTitleBlock || hasNode(description)) && (
                <div className="min-w-0 flex-1">
                  {hasTitleBlock && (
                    <div className="flex flex-wrap items-center gap-2">
                      {hasNode(title) && (
                        <h1 className="text-base font-bold tracking-tight text-primary">
                          {title}
                        </h1>
                      )}
                      {badge && (
                        <Tag className="m-0 inline-flex items-center gap-1 border-amber-500/30 bg-amber-500/10 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
                            style={{
                              animation:
                                "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                            }}
                          />
                          {badge}
                        </Tag>
                      )}
                    </div>
                  )}
                  {hasNode(description) && (
                    <p
                      className={joinClasses(
                        "text-[13px] leading-relaxed text-muted",
                        hasTitleBlock ? "mt-1" : "",
                      )}
                    >
                      {description}
                    </p>
                  )}
                </div>
              )}
              {hasNode(extra) && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {extra}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={contentClasses} style={contentStyle}>
        {children}
      </div>

      {hasNode(footer) && (
        <div
          ref={footerRef}
          className={joinClasses(
            "page-footer w-full shrink-0 border-t border-default",
            footerClass,
          )}
        >
          <div
            className={joinClasses(
              "page-footer-inner",
              insetXClass,
              PAGE_SPACING.footerY[resolvedFooterPadding],
              footerInnerClass,
            )}
          >
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}
