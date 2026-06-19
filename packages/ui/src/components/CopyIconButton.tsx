'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Tooltip } from './tooltip'

type CopyIconButtonProps = {
  text: string
  label?: string
  copiedLabel?: string
  className?: string
  size?: number
}

export function CopyIconButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className = '',
  size = 14,
}: CopyIconButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <Tooltip content={copied ? copiedLabel : label}>
      <button
        type="button"
        aria-label={copied ? copiedLabel : label}
        onClick={(e) => void handleCopy(e)}
        className={[
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all',
          copied
            ? 'border-accent/35 bg-accent-muted text-accent'
            : 'border-transparent text-muted hover:border-default hover:bg-subtle hover:text-primary',
          className,
        ].join(' ')}
      >
        {copied ? <Check size={size} strokeWidth={2.5} /> : <Copy size={size} strokeWidth={2} />}
      </button>
    </Tooltip>
  )
}
