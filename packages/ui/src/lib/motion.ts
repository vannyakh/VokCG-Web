import type { Transition, Variants } from 'framer-motion'

export const spring: Transition = { type: 'spring', stiffness: 320, damping: 26 }
export const ease: Transition = { duration: 0.2, ease: 'easeOut' }
export const easeFast: Transition = { duration: 0.15, ease: 'easeOut' }

export const mobileDrawerSpring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 40,
  mass: 0.85,
}

export const sidebarShellSpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 38,
  mass: 0.88,
}

export const sidebarPanelSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 34,
  mass: 0.85,
}

export const backdropFade: Transition = { duration: 0.22, ease: 'easeOut' }
export const pageFade: Transition = { duration: 0.24, ease: 'easeOut' }
export const pageFadeFast: Transition = { duration: 0.16, ease: 'easeOut' }

export const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: pageFade },
  exit: { opacity: 0, transition: pageFadeFast },
}

export const adminPageTransition: Transition = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }
export const adminPageExit: Transition = { duration: 0.16, ease: [0.4, 0, 1, 1] }

export const adminPageVariants: Variants = {
  initial: { opacity: 0, y: 10, filter: 'blur(2px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: adminPageTransition },
  exit: { opacity: 0, y: -6, filter: 'blur(1px)', transition: adminPageExit },
}
