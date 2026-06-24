'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize, Pause, Play, Volume1, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { Popover, Slider } from 'antd'

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
  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1.0)
  const [hovering, setHovering] = useState(false)
  const [volHover, setVolHover] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [error, setError] = useState(false)
  
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  
  const [showControls, setShowControls] = useState(false)
  const [showPlayAnim, setShowPlayAnim] = useState(false)
  const [animType, setAnimType] = useState<'play' | 'pause'>('play')
  const [animKey, setAnimKey] = useState(0)

  const SPEED_OPTIONS = [0.5, 1.0, 1.25, 1.5, 2.0]
  const controlsVisible = hovering || scrubbing || !playing || showControls

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (!scrubbing && !showSpeedMenu) setShowControls(false)
    }, 2800)
  }, [scrubbing, showSpeedMenu])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    setPlaybackRate(1.0)
    setError(false)
    setBuffering(false)
    v.playbackRate = 1.0
    v.load()
  }, [src])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume
    v.muted = muted
  }, [volume, muted])

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (clickTimeout.current) clearTimeout(clickTimeout.current)
    }
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play().catch(() => {})
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

  const handleVideoClick = () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current)
      clickTimeout.current = null
      void toggleFullscreen()
    } else {
      clickTimeout.current = setTimeout(() => {
        togglePlay()
        clickTimeout.current = null
      }, 250)
    }
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    const v = videoRef.current
    if (!v) return
    v.volume = val
    setVolume(val)
    if (val > 0) {
      v.muted = false
      setMuted(false)
    } else {
      v.muted = true
      setMuted(true)
    }
    resetHideTimer()
  }

  const toggleFullscreen = async () => {
    const el = containerRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err)
    }
    resetHideTimer()
  }

  const changeSpeed = (rate: number) => {
    const v = videoRef.current
    if (!v) return
    v.playbackRate = rate
    setPlaybackRate(rate)
    setShowSpeedMenu(false)
    resetHideTimer()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const activeEl = document.activeElement
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
      return
    }

    const v = videoRef.current
    if (!v) return

    switch (e.key) {
      case ' ':
        e.preventDefault()
        togglePlay()
        break
      case 'ArrowLeft':
        e.preventDefault()
        v.currentTime = Math.max(0, v.currentTime - 5)
        setCurrent(v.currentTime)
        resetHideTimer()
        break
      case 'ArrowRight':
        e.preventDefault()
        v.currentTime = Math.min(duration, v.currentTime + 5)
        setCurrent(v.currentTime)
        resetHideTimer()
        break
      case 'ArrowUp':
        e.preventDefault()
        const newVolUp = Math.min(1, v.volume + 0.1)
        v.volume = newVolUp
        setVolume(newVolUp)
        if (newVolUp > 0 && muted) {
          v.muted = false
          setMuted(false)
        }
        resetHideTimer()
        break
      case 'ArrowDown':
        e.preventDefault()
        const newVolDown = Math.max(0, v.volume - 0.1)
        v.volume = newVolDown
        setVolume(newVolDown)
        if (newVolDown === 0) {
          v.muted = true
          setMuted(true)
        }
        resetHideTimer()
        break
      case 'm':
      case 'M':
        e.preventDefault()
        toggleMute()
        break
      case 'f':
      case 'F':
        e.preventDefault()
        void toggleFullscreen()
        break
    }
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
      tabIndex={0}
      className="outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      onMouseEnter={() => {
        setHovering(true)
        resetHideTimer()
      }}
      onMouseLeave={() => {
        setHovering(false)
        setShowSpeedMenu(false)
        if (playing && !scrubbing) setShowControls(false)
      }}
      onMouseMove={resetHideTimer}
      onKeyDown={handleKeyDown}
    >
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        playsInline
        style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }}
        onClick={handleVideoClick}
        onTimeUpdate={() => {
          if (!scrubbing) setCurrent(videoRef.current?.currentTime ?? 0)
        }}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onSeeking={() => setBuffering(true)}
        onSeeked={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onError={() => setError(true)}
      />

      {/* Loading Spinner */}
      {buffering && !error && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/25 backdrop-blur-[2px]">
          <Loader2 className="h-10 w-10 animate-spin text-white opacity-85" />
        </div>
      )}

      {/* Error Fallback */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 text-white p-4 text-center">
          <p className="text-sm font-semibold text-red-400">Failed to load video</p>
          <p className="text-xs text-white/50 mt-1">Please verify the connection or media source path.</p>
        </div>
      )}

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
            <div className="flex items-center justify-center text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {animType === 'play' ? (
                <Play size={44} fill="white" className="ml-1" />
              ) : (
                <Pause size={44} fill="white" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!playing && !showPlayAnim && !buffering && !error && (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
          <motion.button
            type="button"
            onClick={togglePlay}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="pointer-events-auto flex items-center justify-center text-white cursor-pointer focus:outline-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          >
            <Play size={44} color="white" fill="white" className="ml-1" />
          </motion.button>
        </div>
      )}

      <motion.div
        initial={false}
        animate={{ opacity: controlsVisible ? 1 : 0, y: controlsVisible ? 0 : 8 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, pointerEvents: controlsVisible ? 'auto' : 'none' }}
      >
        <div className="px-6 pb-6 pt-16" style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%)' }}>
          <div className="flex flex-col">
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
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-2">
                <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={togglePlay} className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors">
                  {playing ? <Pause size={15} /> : <Play size={15} />}
                </button>
                
                <div 
                  className="flex items-center"
                  onMouseEnter={() => setVolHover(true)}
                  onMouseLeave={() => setVolHover(false)}
                >
                  <button type="button" aria-label={muted ? 'Unmute' : 'Mute'} onClick={toggleMute} className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors">
                    {muted || volume === 0 ? (
                      <VolumeX size={15} />
                    ) : volume < 0.5 ? (
                      <Volume1 size={15} />
                    ) : (
                      <Volume2 size={15} />
                    )}
                  </button>
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: volHover ? 64 : 0, opacity: volHover ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden flex items-center h-7"
                  >
                    <Slider
                      min={0}
                      max={1}
                      step={0.05}
                      value={muted ? 0 : volume}
                      onChange={(val) => {
                        const v = videoRef.current
                        if (!v) return
                        v.volume = val
                        setVolume(val)
                        if (val > 0) {
                          v.muted = false
                          setMuted(false)
                        } else {
                          v.muted = true
                          setMuted(true)
                        }
                        resetHideTimer()
                      }}
                      tooltip={{ open: false }}
                      className="w-12 h-1 mx-2 bg-transparent"
                      style={{ margin: '0 8px', height: '4px' }}
                    />
                  </motion.div>
                </div>

                <Popover
                  content={
                    <div className="flex flex-col gap-1.5 min-w-[125px]">
                      <div className="flex justify-between items-center gap-4 text-[10px] font-medium font-mono text-slate-400">
                        <span>Elapsed</span>
                        <span className="text-white font-semibold">{formatTime(current)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4 text-[10px] font-medium font-mono text-slate-400">
                        <span>Remaining</span>
                        <span className="text-white font-semibold">-{formatTime(duration - current)}</span>
                      </div>
                      <div className="h-px bg-white/10 my-0.5" />
                      <div className="flex justify-between items-center gap-4 text-[10px] font-medium font-mono text-slate-400">
                        <span>Duration</span>
                        <span className="text-white font-semibold">{formatTime(duration)}</span>
                      </div>
                    </div>
                  }
                  trigger="hover"
                  placement="top"
                  overlayStyle={{ zIndex: 100 }}
                  color="rgba(15, 23, 42, 0.95)"
                >
                  <span className="cursor-help font-mono text-[11px] font-semibold text-white/80 select-none ml-1">
                    {formatTime(current)} / {formatTime(duration)}
                  </span>
                </Popover>
              </div>

              <div className="relative flex items-center gap-1">
                <Popover
                  content={
                    <div className="flex flex-col gap-0.5 p-0.5 min-w-[70px]">
                      {SPEED_OPTIONS.map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => changeSpeed(rate)}
                          className={`rounded px-2.5 py-1 text-[10px] font-semibold transition-colors text-left ${
                            playbackRate === rate
                              ? 'bg-white/15 text-white'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  }
                  trigger="click"
                  open={showSpeedMenu}
                  onOpenChange={setShowSpeedMenu}
                  placement="topRight"
                  color="rgba(15, 23, 42, 0.95)"
                  overlayStyle={{ zIndex: 100 }}
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white/80 hover:text-white hover:bg-white/15 transition-colors focus:outline-none"
                  >
                    <span>{playbackRate}x</span>
                  </button>
                </Popover>

                <button type="button" aria-label="Fullscreen" onClick={() => void toggleFullscreen()} className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors">
                  <Maximize size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
