'use client'

export function LoadingScreen() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4"
      style={{ background: 'var(--bg-canvas)' }}
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--color-primary)]"
        aria-hidden
      />
      <p className="text-sm text-muted">Loading…</p>
    </div>
  )
}
