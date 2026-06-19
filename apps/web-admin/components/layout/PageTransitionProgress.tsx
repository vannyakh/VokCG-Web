"use client"

import { useEffect, useRef, useState } from 'react'

type Props = { activeKey: string; enabled: boolean }

/**
 * Vben-style top progress bar during admin page / tab switches.
 * Animates 0 → 85% quickly, then completes on the next frame after key change settles.
 */
export function PageTransitionProgress({ activeKey, enabled }: Props) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    if (timerRef.current) clearTimeout(timerRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true)
    setProgress(0)

    rafRef.current = requestAnimationFrame(() => {
      setProgress(72)
      timerRef.current = setTimeout(() => setProgress(92), 180)
    })

    const done = setTimeout(() => {
      setProgress(100)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 220)
    }, 340)

    return () => {
      clearTimeout(done)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [activeKey, enabled])

  if (!enabled || !visible) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-50 h-[2px] overflow-hidden"
      aria-hidden
    >
      <div
        className="h-full rounded-full transition-[width] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          background: 'var(--color-primary)',
          boxShadow: '0 0 8px color-mix(in srgb, var(--color-primary) 60%, transparent)',
        }}
      />
    </div>
  )
}
