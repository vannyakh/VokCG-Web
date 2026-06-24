'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

type SeekBarProps = {
  progress: number
  duration: number
  onSeek: (pct: number) => void
  onScrubStart?: () => void
  onScrubEnd?: () => void
}

function SeekBar({ progress, duration, onSeek, onScrubStart, onScrubEnd }: SeekBarProps) {
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

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    onScrubStart?.()
    seekAt(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pct = pctFromClientX(e.clientX)
    setHoverPct(pct)
    if (dragging) seekAt(e.clientX)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
    onScrubEnd?.()
  }

  const showValue = hovering || dragging
  const tooltipPct = dragging ? progress : hoverPct
  const tooltipTime = duration > 0 ? (tooltipPct / 100) * duration : 0

  return (
    <div
      className="relative mb-1 pb-2 pt-2"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        if (!dragging) setHovering(false)
      }}
    >
      {showValue && duration > 0 && (
        <div
          className="pointer-events-none absolute top-0 z-[3] whitespace-nowrap rounded-[6px] border px-2 py-0.5 text-[10px] font-bold font-mono text-white"
          style={{
            left: `${tooltipPct}%`,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            borderColor: 'rgba(255,255,255,0.3)',
          }}
        >
          {formatTime(tooltipTime)}
        </div>
      )}
      <div
        ref={trackRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="relative cursor-pointer rounded-full"
        style={{
          height: hovering || dragging ? '6px' : '4px',
          background: 'rgba(255,255,255,0.2)',
          transition: 'height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          touchAction: 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div 
          className="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-accent shadow-[0_0_8px_var(--color-primary)]" 
          style={{ width: `${progress}%` }} 
        />
        <div
          className="pointer-events-none absolute top-1/2 rounded-full bg-white transition-all duration-200"
          style={{
            left: `${progress}%`,
            width: hovering || dragging ? 12 : 6,
            height: hovering || dragging ? 12 : 6,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 0 3px var(--color-primary)',
            opacity: hovering || dragging ? 1 : 0,
          }}
        />
      </div>
    </div>
  )
}

type CustomVideoPlayerProps = {
  src: string
  aspectRatio?: string
  objectFit?: 'cover' | 'contain'
  fill?: boolean
  width?: number
  height?: number
}

export function CustomVideoPlayer({
  src,
  aspectRatio = '16 / 9',
  objectFit,
  fill = false,
  width,
  height,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [showPlayAnim, setShowPlayAnim] = useState(false)
  const [animType, setAnimType] = useState<'play' | 'pause'>('play')
  const [animKey, setAnimKey] = useState(0)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const controlsVisible = hovering || scrubbing || !playing || showControls

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (!scrubbing) setShowControls(false)
    }, 2800)
  }, [scrubbing])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    v.load()
  }, [src])

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    },
    [],
  )

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
      setPlaying(true)
      setAnimType('play')
    } else {
      v.pause()
      setPlaying(false)
      setAnimType('pause')
    }
    setAnimKey((prev) => prev + 1)
    setShowPlayAnim(true)
    resetHideTimer()
  }

  const seek = (value: number) => {
    const v = videoRef.current
    if (!v || !duration) return
    v.currentTime = (value / 100) * duration
    setCurrent(v.currentTime)
    resetHideTimer()
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    resetHideTimer()
  }

  const toggleFullscreen = async () => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      await el.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
    resetHideTimer()
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0
  const fit = objectFit ?? (fill ? 'cover' : 'contain')

  const containerStyle: React.CSSProperties = fill
    ? {
        position: 'relative',
        width: width && width > 0 ? `${width}px` : '100%',
        height: height && height > 0 ? `${height}px` : '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        background: '#000000',
        overflow: 'hidden',
      }
    : {
        position: 'relative',
        width: '100%',
        aspectRatio,
        maxHeight: '70vh',
        margin: '0 auto',
        background: '#000000',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
      }

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onMouseEnter={() => {
        setHovering(true)
        resetHideTimer()
      }}
      onMouseLeave={() => {
        setHovering(false)
        if (playing && !scrubbing) setShowControls(false)
      }}
      onMouseMove={resetHideTimer}
    >
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        playsInline
        style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }}
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (!scrubbing) setCurrent(videoRef.current?.currentTime ?? 0)
        }}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <AnimatePresence>
        {showPlayAnim && (
          <motion.div
            key={animKey}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onAnimationComplete={() => setShowPlayAnim(false)}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur-md border border-white/20 shadow-lg shadow-black/40">
              {animType === 'play' ? (
                <Play size={24} fill="white" className="ml-1" />
              ) : (
                <Pause size={24} fill="white" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!playing && !showPlayAnim && (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300"
            style={{
              background: 'rgba(15,23,42,0.65)',
              borderColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              opacity: hovering ? 1 : 0.85,
              boxShadow: '0 4px 18px rgba(0,0,0,0.4)',
            }}
          >
            <Play size={20} color="white" fill="white" className="ml-0.5" />
          </motion.div>
        </div>
      )}

      <motion.div
        initial={false}
        animate={{ opacity: controlsVisible ? 1 : 0, y: controlsVisible ? 0 : 8 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, pointerEvents: controlsVisible ? 'auto' : 'none' }}
      >
        <div className="px-4 pb-4 pt-12" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)' }}>
          <div 
            className="px-4 py-2.5 rounded-xl border border-white/10 backdrop-blur-md shadow-lg shadow-black/30"
            style={{
              background: 'rgba(15,23,42,0.45)',
            }}
          >
            <SeekBar
              progress={progress}
              duration={duration}
              onSeek={seek}
              onScrubStart={() => setScrubbing(true)}
              onScrubEnd={() => {
                setScrubbing(false)
                resetHideTimer()
              }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={togglePlay} className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors">
                  {playing ? <Pause size={15} /> : <Play size={15} />}
                </button>
                <button type="button" aria-label={muted ? 'Unmute' : 'Mute'} onClick={toggleMute} className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors">
                  {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <span className="min-w-[80px] font-mono text-[11px] font-semibold text-white/80 select-none ml-1">
                  {formatTime(current)} / {formatTime(duration)}
                </span>
              </div>
              <button type="button" aria-label="Fullscreen" onClick={() => void toggleFullscreen()} className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors">
                <Maximize size={14} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
