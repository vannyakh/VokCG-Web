'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'

/* ── Waveform extraction ────────────────────────────────────────────────── */
const NUM_BARS = 80
const MIN_H    = 2
const MAX_H    = 36
// Each bar is 2 px wide + 1 px gap ≈ 3 px pitch
const BAR_PITCH = 3

function flatBars(n = NUM_BARS, h = 6): number[] {
  return Array.from({ length: n }, () => h)
}

async function extractWaveform(src: string, numBars: number): Promise<number[]> {
  try {
    const response = await fetch(src)
    const buffer   = await response.arrayBuffer()
    const ctx      = new AudioContext()
    const decoded  = await ctx.decodeAudioData(buffer)
    await ctx.close()

    const raw           = decoded.getChannelData(0)
    const samplesPerBar = Math.max(1, Math.floor(raw.length / numBars))

    const rms: number[] = []
    for (let i = 0; i < numBars; i++) {
      let sum = 0
      for (let j = 0; j < samplesPerBar; j++) {
        const v = raw[i * samplesPerBar + j] ?? 0
        sum += v * v
      }
      rms.push(Math.sqrt(sum / samplesPerBar))
    }

    const peak = Math.max(...rms, 1e-6)
    return rms.map((v) => Math.max(MIN_H, Math.round((v / peak) * MAX_H)))
  } catch {
    return flatBars(numBars, MIN_H)
  }
}

/* ── Time formatter ─────────────────────────────────────────────────────── */
function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
}

/* ── useContainerWidth ───────────────────────────────────────────────────── */
function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0)
    })
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [ref])
  return width
}

/* ── Waveform track ─────────────────────────────────────────────────────── */
type WaveformTrackProps = {
  bars: number[]
  loading: boolean
  progress: number
  duration: number
  onSeek: (pct: number) => void
  onScrubStart?: () => void
  onScrubEnd?: () => void
}

function WaveformTrack({ bars, loading, progress, duration, onSeek, onScrubStart, onScrubEnd }: WaveformTrackProps) {
  const trackRef  = useRef<HTMLDivElement>(null)
  const outerRef  = useRef<HTMLDivElement>(null)
  const trackWidth = useContainerWidth(outerRef)

  const [hovering, setHovering] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [hoverPct, setHoverPct] = useState(0)

  // Subsample full bars array to fit the available pixel width
  const numVisible = trackWidth > 0
    ? Math.min(bars.length, Math.max(16, Math.floor(trackWidth / BAR_PITCH)))
    : bars.length

  const visibleBars = useMemo(() => {
    if (numVisible >= bars.length) return bars
    return Array.from({ length: numVisible }, (_, i) =>
      bars[Math.round((i / numVisible) * bars.length)] ?? MIN_H,
    )
  }, [bars, numVisible])

  const pctFromX = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el) return 0
    const r = el.getBoundingClientRect()
    return r.width <= 0 ? 0 : Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))
  }, [])

  const seekAt = useCallback((clientX: number) => {
    const pct = pctFromX(clientX)
    setHoverPct(pct)
    onSeek(pct)
  }, [onSeek, pctFromX])

  const playedBars = Math.round((progress / 100) * visibleBars.length)
  const scrubPct   = dragging ? progress : hoverPct

  return (
    <div ref={outerRef} className="relative min-w-0 flex-1">
      {/* Scrub tooltip */}
      {(hovering || dragging) && duration > 0 && (
        <div
          className="pointer-events-none absolute z-10 -top-6 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white"
          style={{
            left: `${scrubPct}%`,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {formatTime((scrubPct / 100) * duration)}
        </div>
      )}

      {/* Bars */}
      <div
        ref={trackRef}
        role="slider"
        aria-label="Audio seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="flex h-10 w-full cursor-pointer select-none items-center justify-center gap-px overflow-hidden"
        style={{ touchAction: 'none' }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => { if (!dragging) setHovering(false) }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.currentTarget.setPointerCapture(e.pointerId)
          setDragging(true)
          onScrubStart?.()
          seekAt(e.clientX)
        }}
        onPointerMove={(e) => {
          setHoverPct(pctFromX(e.clientX))
          if (dragging) seekAt(e.clientX)
        }}
        onPointerUp={(e) => {
          if (!dragging) return
          e.currentTarget.releasePointerCapture(e.pointerId)
          setDragging(false)
          onScrubEnd?.()
        }}
        onPointerCancel={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId)
          setDragging(false)
          onScrubEnd?.()
        }}
      >
        {visibleBars.map((h, i) => {
          const played    = i < playedBars
          const isHover   = hovering || dragging
          const nearScrub = Math.abs((i / visibleBars.length) * 100 - scrubPct) < 4
          return (
            <div
              key={i}
              className="pointer-events-none shrink-0 rounded-full"
              style={{
                width: 2,
                height: loading ? `${MIN_H + 2}px` : `${h}px`,
                background: played
                  ? 'rgba(255,255,255,0.95)'
                  : nearScrub && isHover
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(255,255,255,0.28)',
                transition: loading
                  ? `height 300ms ease ${i * 4}ms`
                  : 'height 200ms ease, background 80ms ease',
                opacity: played ? 1 : isHover ? 0.8 : 0.55,
              }}
            />
          )
        })}
      </div>

      {/* Playhead */}
      {duration > 0 && (
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px"
          style={{
            left: `${progress}%`,
            background: 'rgba(255,255,255,0.7)',
            transition: 'left 80ms linear',
          }}
          aria-hidden
        />
      )}
    </div>
  )
}

/* ── Main player ────────────────────────────────────────────────────────── */
type CustomAudioPlayerProps = {
  src: string
  autoPlay?: boolean
}

export function CustomAudioPlayer({ src, autoPlay = false }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const playerWidth = useContainerWidth(playerRef)

  const [playing,   setPlaying]   = useState(false)
  const [current,   setCurrent]   = useState(0)
  const [duration,  setDuration]  = useState(0)
  const [muted,     setMuted]     = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [bars,      setBars]      = useState<number[]>(flatBars())
  const [loading,   setLoading]   = useState(true)

  // Layout breakpoints derived from actual container width
  const isNarrow  = playerWidth > 0 && playerWidth < 260   // hide mute, compact gaps
  const isTiny    = playerWidth > 0 && playerWidth < 200   // minimal: just play + time

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    setBars(flatBars())
    setLoading(true)
    a.load()
    if (autoPlay) void a.play().catch(() => undefined)

    extractWaveform(src, NUM_BARS).then((data) => {
      setBars(data)
      setLoading(false)
    })
  }, [src, autoPlay])

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) void a.play()
    else a.pause()
  }

  const seek = (pct: number) => {
    const a = audioRef.current
    if (!a || !duration) return
    a.currentTime = (pct / 100) * duration
    setCurrent(a.currentTime)
  }

  const toggleMute = () => {
    const a = audioRef.current
    if (!a) return
    a.muted = !a.muted
    setMuted(a.muted)
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div
      ref={playerRef}
      className="w-full rounded-2xl shadow-lg"
      style={{
        padding: isNarrow ? '6px 10px' : '8px 12px',
        background: 'rgba(18,18,22,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => { if (!scrubbing) setCurrent(audioRef.current?.currentTime ?? 0) }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrent(0) }}
      />

      <div
        className="flex w-full items-center"
        style={{ gap: isNarrow ? 6 : 10 }}
      >
        {/* Play / Pause */}
        <button
          type="button"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={togglePlay}
          className="flex shrink-0 items-center justify-center rounded-full transition-all duration-150 active:scale-95"
          style={{
            width:  isNarrow ? 28 : 32,
            height: isNarrow ? 28 : 32,
            background: 'var(--color-primary)',
            boxShadow: '0 2px 8px color-mix(in srgb, var(--color-primary) 50%, transparent)',
          }}
        >
          {playing
            ? <Pause size={isNarrow ? 11 : 13} fill="white" color="white" />
            : <Play  size={isNarrow ? 11 : 13} fill="white" color="white" style={{ marginLeft: 1 }} />
          }
        </button>

        {/* Waveform — hidden on tiny screens to avoid layout breakage */}
        {!isTiny && (
          <WaveformTrack
            bars={bars}
            loading={loading}
            progress={progress}
            duration={duration}
            onSeek={seek}
            onScrubStart={() => setScrubbing(true)}
            onScrubEnd={() => setScrubbing(false)}
          />
        )}

        {/* Time */}
        <span
          className="shrink-0 tabular-nums"
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: isNarrow ? 10 : 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            minWidth: isNarrow ? 54 : 68,
            textAlign: 'right',
          }}
        >
          {formatTime(current)}{!isNarrow && ' / '}{!isNarrow && formatTime(duration)}
          {isNarrow && <span style={{ opacity: 0.45 }}> / {formatTime(duration)}</span>}
        </span>

        {/* Mute — hidden on narrow players */}
        {!isNarrow && (
          <button
            type="button"
            aria-label={muted ? 'Unmute' : 'Mute'}
            onClick={toggleMute}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
            style={{ color: muted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        )}
      </div>
    </div>
  )
}
