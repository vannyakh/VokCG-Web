"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { NAV_FLYOUT } from "./nav-styles";

// ─── Hover state machine ──────────────────────────────────────────────────────
function useFlyoutHover(openDelay = 60, closeDelay = 100) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const enter = () => {
    clear();
    timer.current = setTimeout(() => setOpen(true), openDelay);
  };
  const leave = () => {
    clear();
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  };
  const pin = () => {
    clear();
    setOpen(true);
  };

  return { open, enter, leave, pin };
}

// ─── Component ────────────────────────────────────────────────────────────────
type CollapsedNavFlyoutProps = {
  trigger: ReactNode;
  children: ReactNode;
  title?: string;
  align?: "center" | "start";
};

export function CollapsedNavFlyout({
  trigger,
  children,
  title,
  align = "center",
}: CollapsedNavFlyoutProps) {
  const { open, enter, leave, pin } = useFlyoutHover();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setCoords({
        left: rect.right + NAV_FLYOUT.offsetX,
        top: align === "start" ? rect.top : rect.top + rect.height / 2,
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true, capture: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, align]);

  const flyout =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="collapsed-nav-flyout"
                role="menu"
                aria-label={title}
                className="fixed z-[200]"
                style={{
                  left: coords.left,
                  top: coords.top,
                  translateY: align === "center" ? "-50%" : 0,
                }}
                initial={{ opacity: 0, x: -8, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -4, scale: 0.98 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={pin}
                onMouseLeave={leave}
              >
                {/* Arrow pointer */}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: -5,
                    top: align === "start" ? 14 : "50%",
                    transform: align === "start" ? "none" : "translateY(-50%)",
                    width: 8,
                    height: 8,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-divider)",
                    borderRight: "none",
                    borderBottom: "none",
                    borderTopLeftRadius: 2,
                    rotate: "-45deg",
                    boxShadow: "-1px -1px 2px rgba(0,0,0,0.04)",
                  }}
                />

                {/* Panel */}
                <div
                  className="overflow-hidden"
                  style={{
                    minWidth: NAV_FLYOUT.minWidth,
                    borderRadius: NAV_FLYOUT.radius,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-divider)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  {title && (
                    <div
                      style={{
                        padding: `${NAV_FLYOUT.headerPaddingY}px ${NAV_FLYOUT.headerPaddingX}px`,
                        borderBottom: "1px solid var(--border-divider)",
                      }}
                    >
                      <p className="truncate text-[12px] font-semibold uppercase tracking-wide text-muted">
                        {title}
                      </p>
                    </div>
                  )}
                  <div>{children}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      {trigger}
      {flyout}
    </div>
  );
}
