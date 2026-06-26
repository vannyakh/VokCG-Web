"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip } from "./tooltip";

type CopyIconButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  size?: number;
};

export function CopyIconButton({
  text,
  label = "Copy",
  copiedLabel = "Copied!",
  className = "",
  size = 14,
}: CopyIconButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <Tooltip content={copied ? copiedLabel : label}>
      <motion.button
        type="button"
        aria-label={copied ? copiedLabel : label}
        onClick={(e) => void handleCopy(e)}
        whileTap={{ scale: 0.88 }}
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all duration-300",
          copied
            ? "border-[var(--color-primary)]/35 bg-[var(--bg-active)] text-[var(--color-primary)] shadow-[0_0_8px_rgba(59,130,246,0.15)]"
            : "border-transparent text-muted hover:border-default hover:bg-subtle hover:text-primary",
          className,
        ].join(" ")}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "check" : "copy"}
            initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {copied ? (
              <Check size={size} strokeWidth={2.5} />
            ) : (
              <Copy size={size} strokeWidth={2} />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </Tooltip>
  );
}
