'use client'

import { motion } from 'framer-motion'

const CHARS = 'VokCGStudio'.split('')

export function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-canvas)' }}
    >
      {/* Ambient glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2"
        style={{
          width: 520,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0"
        style={{
          width: 360,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.07) 0%, transparent 70%)',
          filter: 'blur(48px)',
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* Icon mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative flex h-20 w-20 items-center justify-center"
        >
          {/* Rotating conic ring */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'conic-gradient(from 0deg, #3b82f6 0%, #8b5cf6 40%, transparent 70%)',
              borderRadius: 22,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Inner card */}
          <div
            className="absolute inset-[3px] flex items-center justify-center"
            style={{ background: 'var(--bg-surface)', borderRadius: 18 }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#loading-grad)"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="loading-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="2.5" ry="2.5" />
              <path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5" />
            </svg>
          </div>

          {/* Pulse rings */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{ border: '1.5px solid rgba(59,130,246,0.5)', borderRadius: 22 }}
              animate={{ scale: [1, 1.55], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: i * 0.7 }}
            />
          ))}
        </motion.div>

        {/* App name — letter-by-letter */}
        <div className="flex gap-[1px]">
          {CHARS.map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.045, type: 'spring', stiffness: 320, damping: 20 }}
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color:
                  ch === ch.toUpperCase() && ch !== ch.toLowerCase()
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
              }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="relative h-[3px] w-48 overflow-hidden rounded-full"
          style={{ background: 'var(--border-default)' }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.6, 1], repeatDelay: 0.2 }}
          />
        </motion.div>
      </div>
    </div>
  )
}
