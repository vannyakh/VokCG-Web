'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'

const WAVEFORM = [
  4, 6, 8, 10, 14, 18, 22, 26, 30, 34, 36, 34, 30, 26, 22, 18, 14, 10, 8, 6,
  8, 12, 16, 22, 28, 32, 36, 40, 36, 32, 28, 22, 16, 12, 8,
  10, 14, 18, 24, 30, 34, 30, 24, 18, 14, 10, 8, 6, 4,
] as const

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

type WaveformTrackProps = {
  progress: number
  duration: number
  onSeek: (pct: number) => void
  onScrubStart?: () => void
  onScrubEnd?: () => void
}

function WaveformTrack({ progress, duration, onSeek, onScrubStart, onScrubEnd }: WaveformTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [hoverPct, setHoverPct] = useState(0)

  const pctFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    if (rect.width <= 0) return 0
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  }, [])

  const seekAt = useCallback(
    (clientX: number) => {
      const pct = pctFromClientX(clientX)
      setHoverPct(pct)
      onSeek(pct)
    },
    [onSeek, pctFromClientX],
  )

  const playedBars = Math.round((progress / 100) * WAVEFORM.length)

  return (
    <div
      className="relative flex-1 min-w-0"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        if (!dragging) setHovering(false)
      }}
    >
      {(hovering || dragging) && duration > 0 && (
        <div
          className="pointer-events-none absolute z-[2] -top-[22px] rounded-[4px] bg-black/80 px-1.5 py-0.5 text-[10px] font-bold font-mono text-white"
          style={{ left: `${dragging ? progress : hoverPct}%`, transform: 'translateX(-50%)' }}
        >
          {formatTime(((dragging ? progress : hoverPct) / 100) * duration)}
        </div>
      )}

      <div
        ref={trackRef}
        role="slider"
        aria-label="Audio seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="flex h-9 cursor-pointer select-none items-center justify-center gap-[2px]"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.currentTarget.setPointerCapture(e.pointerId)
          setDragging(true)
          onScrubStart?.()
          seekAt(e.clientX)
        }}
        onPointerMove={(e) => {
          const pct = pctFromClientX(e.clientX)
          setHoverPct(pct)
          if (dragging) seekAt(e.clientX)
        }}
        onPointerUp={(e) => {
          if (!dragging) return
          e.currentTarget.releasePointerCapture(e.pointerId)
          setDragging(false)
          onScrubEnd?.()
        }}
        onPointerCancel={(e) => {
          if (!dragging) return
          e.currentTarget.releasePointerCapture(e.pointerId)
          setDragging(false)
          onScrubEnd?.()
        }}
      >
        {WAVEFORM.map((h, i) => {
          const played = i < playedBars
          return (
            <div
              key={i}
              className="pointer-events-none w-[2px] shrink-0 rounded-full transition-[background,opacity] duration-[120ms]"
              style={{
                height: `${h}px`,
                background: played ? 'white' : 'rgba(255,255,255,0.35)',
                opacity: played ? 1 : hovering || dragging ? 0.7 : 0.45,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

type CustomAudioPlayerProps = {
  src: string
  autoPlay?: boolean
}

export function CustomAudioPlayer({ src, autoPlay = false }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    a.load()
    if (autoPlay) {
      void a.play().catch(() => undefined)
    }
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
      className="w-full rounded-full border px-2 py-1.5 shadow-md"
      style={{ background: 'rgba(45,45,48,0.96)', borderColor: 'rgba(255,255,255,0.15)' }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => {
          if (!scrubbing) setCurrent(audioRef.current?.currentTime ?? 0)
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <div className="flex w-full items-center gap-2">
        <button
          type="button"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={togglePlay}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-transform hover:scale-105 hover:opacity-90 active:scale-95"
        >
          {playing ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" style={{ marginLeft: 2 }} />}
        </button>

        <WaveformTrack
          progress={progress}
          duration={duration}
          onSeek={seek}
          onScrubStart={() => setScrubbing(true)}
          onScrubEnd={() => setScrubbing(false)}
        />

        <span className="min-w-[72px] shrink-0 text-right font-mono text-xs font-semibold text-white/90">
          {formatTime(current)} / {formatTime(duration)}
        </span>

        <button
          type="button"
          aria-label={muted ? 'Unmute' : 'Mute'}
          onClick={toggleMute}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15"
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </div>
  )
}
