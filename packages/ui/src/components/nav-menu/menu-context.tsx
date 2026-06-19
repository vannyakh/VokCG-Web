"use client"

import { createContext, useContext } from 'react'
import type { MenuContext } from './types'

// ── Mirrors Vben createMenuContext / useMenuContext ──────────────────────────

const Ctx = createContext<MenuContext | null>(null)

export const MenuContextProvider = Ctx.Provider

export function useMenuContext(): MenuContext {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMenuContext must be used inside <NavMenu>')
  return ctx
}

// ── Sub-menu level context (mirrors Vben SubMenuProvider) ────────────────────
// Each nested <NavSubMenu> increments the level so children can calculate indent.

const LevelCtx = createContext<number>(0)

export const LevelProvider = LevelCtx.Provider

export function useMenuLevel(): number {
  return useContext(LevelCtx)
}
