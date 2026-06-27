import type { Transition, Variants } from "framer-motion";

export const spring: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 26,
};
export const ease: Transition = { duration: 0.2, ease: "easeOut" };
export const easeFast: Transition = { duration: 0.15, ease: "easeOut" };

export const mobileDrawerSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.85,
};

export const sidebarShellSpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 38,
  mass: 0.88,
};

export const sidebarPanelSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.85,
};

export const backdropFade: Transition = { duration: 0.22, ease: "easeOut" };
export const pageFade: Transition = { duration: 0.24, ease: "easeOut" };
export const pageFadeFast: Transition = { duration: 0.16, ease: "easeOut" };

export const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: pageFade },
  exit: { opacity: 0, transition: pageFadeFast },
};

export const adminPageTransition: Transition = {
  duration: 0.22,
  ease: [0.25, 0.1, 0.25, 1],
};
export const adminPageExit: Transition = {
  duration: 0.16,
  ease: [0.4, 0, 1, 1],
};

export const adminPageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: adminPageTransition,
  },
  exit: {
    opacity: 0,
    y: -4,
    pointerEvents: "none",
    transition: adminPageExit,
  },
};

export const contentFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: ease },
  exit: { opacity: 0, transition: easeFast },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0, transition: ease },
  exit: { opacity: 0, y: -6, transition: easeFast },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: ease },
};

export const navContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

export const navItem: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: ease },
};

export const panelSlide: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: pageFade },
  exit: { opacity: 0, transition: pageFadeFast },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.035, delayChildren: 0.03 } },
};

export const fadeUpItem: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: ease },
  exit: { opacity: 0, transition: easeFast },
};

export const viewSwitch: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: ease },
  exit: { opacity: 0, transition: easeFast },
};

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: backdropFade },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
};

export const modalPanelSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};

export const modalPanel: Variants = {
  initial: { opacity: 0, scale: 0.94, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0, transition: modalPanelSpring },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.16, ease: "easeIn" },
  },
};

export const modalOptionStagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

export const modalOptionItem: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: ease },
};
