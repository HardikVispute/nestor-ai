'use client'

import React, { memo, useCallback, useRef, useState } from 'react'
import {
  LayoutDashboard,
  Calculator,
  History,
  TrendingUp,
  BookOpen,
} from 'lucide-react'
import { usePerformanceMode } from '@/contexts/PerformanceContext'
import { LiquidGlass } from '@/components/ui/liquid-glass'
import type { NavItem } from '@/types'

interface SidebarProps {
  activeNav: NavItem
  onNavChange: (nav: NavItem) => void
}

interface NavConfig {
  id: NavItem
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const NAV_ITEMS: NavConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'valuation',
    label: 'New Valuation',
    icon: Calculator,
  },
  {
    id: 'history',
    label: 'Valuation History',
    icon: History,
  },
  {
    id: 'market',
    label: 'Market Intelligence',
    icon: TrendingUp,
  },
  {
    id: 'methodology',
    label: 'Model Methodology',
    icon: BookOpen,
  },
]

const ITEM_SIZE = 52
const ITEM_GAP = 10
const ITEM_STEP = ITEM_SIZE + ITEM_GAP

function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const [dragTop, setDragTop] = useState<number | null>(null)
  const dragStateRef = useRef<{
    startY: number
    startTop: number
    lastIndex: number
  } | null>(null)

  const { isLightweight } = usePerformanceMode()

  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) => item.id === activeNav),
  )
  const maxTop = (NAV_ITEMS.length - 1) * ITEM_STEP
  const restingTop = activeIndex * ITEM_STEP
  const currentBubbleTop = dragTop !== null ? dragTop : restingTop
  const previewIndex = Math.max(
    0,
    Math.min(NAV_ITEMS.length - 1, Math.round(currentBubbleTop / ITEM_STEP)),
  )

  const handleBubblePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      dragStateRef.current = {
        startY: e.clientY,
        startTop: restingTop,
        lastIndex: activeIndex,
      }
      setDragTop(restingTop)
    },
    [restingTop, activeIndex],
  )

  const handleBubblePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const state = dragStateRef.current
      if (!state) return
      const deltaY = e.clientY - state.startY
      const clamped = Math.max(0, Math.min(maxTop, state.startTop + deltaY))
      setDragTop(clamped)

      const nextIndex = Math.max(
        0,
        Math.min(NAV_ITEMS.length - 1, Math.round(clamped / ITEM_STEP)),
      )
      if (nextIndex !== state.lastIndex) {
        state.lastIndex = nextIndex
        onNavChange(NAV_ITEMS[nextIndex].id)
      }
    },
    [maxTop, onNavChange],
  )

  const finishDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const state = dragStateRef.current
      if (!state) return
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      const finalIndex = Math.max(
        0,
        Math.min(NAV_ITEMS.length - 1, Math.round((dragTop ?? restingTop) / ITEM_STEP)),
      )
      dragStateRef.current = null
      setDragTop(null)
      if (NAV_ITEMS[finalIndex].id !== activeNav) {
        onNavChange(NAV_ITEMS[finalIndex].id)
      }
    },
    [dragTop, restingTop, activeNav, onNavChange],
  )

  return (
    <>
      {/* Desktop Floating Navigation Dock (>= md) - 100% Original GitHub Implementation & Animations */}
      <div
        className="hidden md:flex relative flex-shrink-0 h-screen z-40 select-none items-center justify-center"
        style={{ width: 100, minWidth: 100, maxWidth: 100 }}
      >
        <aside
          className="relative z-40"
          style={{ width: 76 }}
          aria-label="Primary Floating Navigation"
        >
          <LiquidGlass
            eager
            radius={999}
            scale={32}
            aberration={12}
            bevelDepth={14}
            frost={0.34}
            tint={0.07}
            className="w-full p-3 !border-white/25"
            style={{
              backgroundColor: isLightweight ? 'rgba(10, 14, 22, 0.9)' : 'rgba(255, 255, 255, 0.065)',
            }}
          >
            <nav
              className="relative flex flex-col w-full"
              style={{ gap: ITEM_GAP }}
            >
              {/* 5 Icon-Only Navigation Items */}
              {NAV_ITEMS.map((item, idx) => {
                const isSelected = idx === previewIndex
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    aria-label={item.label}
                    onClick={() => onNavChange(item.id)}
                    className={`relative z-10 flex items-center justify-center w-[52px] h-[52px] rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                      isSelected
                        ? 'text-white'
                        : 'text-white/55 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <Icon size={25} className="flex-shrink-0" />
                  </button>
                )
              })}

              {/* Hovering, Vertically Draggable Frosted Apple Liquid Glass Lens Bubble */}
              <div
                role="slider"
                aria-label="Drag up or down to switch pages"
                aria-valuemin={1}
                aria-valuemax={NAV_ITEMS.length}
                aria-valuenow={previewIndex + 1}
                data-testid="sidebar-liquid-bubble"
                onPointerDown={handleBubblePointerDown}
                onPointerMove={handleBubblePointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                className={`absolute left-0 right-0 z-20 touch-none cursor-grab active:cursor-grabbing ${
                  dragTop !== null
                    ? 'scale-[1.06]'
                    : 'transition-[top,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04]'
                }`}
                style={{
                  top: currentBubbleTop,
                  width: ITEM_SIZE,
                  height: ITEM_SIZE,
                }}
              >
                <LiquidGlass
                  eager
                  radius={999}
                  scale={30}
                  aberration={12}
                  bevelDepth={11}
                  frost={0.22}
                  tint={0.14}
                  className="w-full h-full !border-white/50 !shadow-[0_14px_34px_rgba(0,0,0,0.58),inset_0_2px_1px_rgba(255,255,255,0.75),inset_0_-1.5px_2px_rgba(0,0,0,0.28)]"
                />
              </div>
            </nav>
          </LiquidGlass>
        </aside>
      </div>

      {/* Mobile Floating Bottom Dock (< md) */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 select-none">
        <aside aria-label="Mobile Bottom Navigation">
          <LiquidGlass
            eager
            radius={999}
            scale={24}
            aberration={6}
            bevelDepth={10}
            frost={0.34}
            tint={0.12}
            className="p-1.5 !border-white/30 shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
            style={{
              backgroundColor: isLightweight ? 'rgba(10, 14, 22, 0.94)' : 'rgba(255, 255, 255, 0.09)',
            }}
          >
            <nav className="relative flex flex-row items-center gap-1">
              {NAV_ITEMS.map((item, idx) => {
                const isSelected = item.id === activeNav
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    aria-label={item.label}
                    onClick={() => onNavChange(item.id)}
                    className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'text-white'
                        : 'text-white/55 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                  </button>
                )
              })}

              {/* Mobile Active Liquid Glass Lens Pill */}
              <div
                className="absolute top-0 bottom-0 z-0 transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                style={{
                  left: activeIndex * 48,
                  width: 44,
                  height: 44,
                }}
              >
                <LiquidGlass
                  eager
                  radius={999}
                  scale={22}
                  aberration={6}
                  bevelDepth={9}
                  frost={0.22}
                  tint={0.16}
                  className="w-full h-full !border-white/60 !shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_2px_1px_rgba(255,255,255,0.85)]"
                />
              </div>
            </nav>
          </LiquidGlass>
        </aside>
      </div>
    </>
  )
}

export default memo(Sidebar)
