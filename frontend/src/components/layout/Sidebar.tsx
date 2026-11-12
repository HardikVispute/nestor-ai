'use client'

import React from 'react'
import {
  LayoutDashboard,
  Calculator,
  History,
  TrendingUp,
  BookOpen,
} from 'lucide-react'
import type { NavItem } from '@/types'

interface SidebarProps {
  activeNav: NavItem
  onNavChange: (nav: NavItem) => void
}

interface NavConfig {
  id: NavItem
  label: string
  shortLabel: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const NAV_ITEMS: NavConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'valuation',
    label: 'New Valuation',
    shortLabel: 'Valuation',
    icon: Calculator,
  },
  {
    id: 'history',
    label: 'Valuation History',
    shortLabel: 'History',
    icon: History,
  },
  {
    id: 'market',
    label: 'Market Intelligence',
    shortLabel: 'Market',
    icon: TrendingUp,
  },
  {
    id: 'methodology',
    label: 'Model Methodology',
    shortLabel: 'Method',
    icon: BookOpen,
  },
]

export default function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  return (
    <aside
      className="relative z-30 flex flex-col items-center justify-between flex-shrink-0 h-screen select-none border-r border-white/10 w-[88px] min-w-[88px] max-w-[88px]"
      style={{
        width: 88,
        minWidth: 88,
        maxWidth: 88,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
      aria-label="Primary Navigation Rail"
    >
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center justify-center pt-6 pb-4 w-full">
        <button
          onClick={() => onNavChange('overview')}
          className="group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 focus:outline-none liquid-glass-card cursor-pointer"
          title="NESTOR AI — Property Valuation Intelligence"
        >
          <span className="text-xl font-bold tracking-wider text-[var(--color-accent)] font-mono">
            N
          </span>
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-black bg-[var(--color-accent)]" />
        </button>
        <span className="text-[10px] font-bold tracking-widest uppercase mt-2 text-white/50">
          NESTOR
        </span>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-3 w-full px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id
          const Icon = item.icon
          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <button
                onClick={() => onNavChange(item.id)}
                className={`relative flex flex-col items-center justify-center w-16 h-16 min-w-16 min-h-16 flex-shrink-0 rounded-2xl transition-all duration-200 focus:outline-none cursor-pointer ${
                  isActive
                    ? 'liquid-glass-card text-[var(--color-accent)] border-[var(--color-accent)]/50 bg-white/[0.08]'
                    : 'text-white/40 hover:text-white/90 hover:bg-white/[0.05]'
                }`}
                aria-label={item.label}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium tracking-tight mt-1">
                  {item.shortLabel}
                </span>
              </button>

              {/* Flyout Tooltip */}
              <div className="!absolute left-[84px] top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shadow-xl bg-black/90 border border-white/20 backdrop-blur-xl">
                {item.label}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Bottom Engine Telemetry */}
      <div className="pb-6 flex flex-col items-center text-white/40 font-mono text-[11px] font-semibold">
        v1.0
      </div>
    </aside>
  )
}
