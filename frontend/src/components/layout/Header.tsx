'use client'

import React from 'react'
import {
  Search,
  PlusCircle,
  Database,
  Layers,
} from 'lucide-react'
import type { ModelStatus, HealthResponse, NavItem } from '@/types'

interface HeaderProps {
  activeNav: NavItem
  modelStatus: ModelStatus
  health: HealthResponse | null
  onNewValuation: () => void
}

const SECTION_TITLES: Record<NavItem, { title: string; subtitle: string }> = {
  overview: {
    title: 'Command Center & Market Telemetry',
    subtitle: 'Institutional Property Valuation Platform · 65,000 Cleaned Listings',
  },
  valuation: {
    title: 'Property Valuation Workspace',
    subtitle: 'High-Precision Regression Inference & Calibrated Valuation Bounds',
  },
  history: {
    title: 'Valuation Audit & History Log',
    subtitle: 'Session-Persisted Valuation Inferences & Comparative Records',
  },
  market: {
    title: 'Pan-India Market Intelligence',
    subtitle: 'Metro Price Trends, Price-per-Sq.Ft. Indices & Velocity Analytics',
  },
  methodology: {
    title: 'Architecture & Model Methodology',
    subtitle: 'HistGradientBoosting Formulation, Log1p Transformations & Calibration',
  },
}

export default function Header({
  activeNav,
  modelStatus,
  health,
  onNewValuation,
}: HeaderProps) {
  const currentSection = SECTION_TITLES[activeNav] || SECTION_TITLES.overview
  const isReady = modelStatus === 'ready' && health?.model_ready

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between flex-shrink-0 px-8 border-b border-white/10"
      style={{
        height: 84,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Left: Section Title */}
      <div className="flex flex-col justify-center min-w-0 pr-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            NESTOR AI
          </span>
          <span className="text-xs text-white/20">/</span>
          <span className="text-xs font-mono uppercase tracking-wider text-white/50">
            {activeNav}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-white mt-0.5 truncate">
          {currentSection.title}
        </h1>
      </div>

      {/* Center: Search Command Bar */}
      <div className="hidden xl:flex items-center flex-1 max-w-lg mx-6">
        <div
          className="relative w-full flex items-center rounded-2xl px-5 py-3 transition-all duration-200 liquid-glass-card justify-start text-left cursor-pointer hover:border-white/30"
          onClick={() => onNewValuation()}
        >
          <Search size={16} className="text-white/50 mr-3 flex-shrink-0" />
          <span className="text-sm text-white/50 truncate flex-1">
            Search 65,000 listings, 20 metro markets...
          </span>
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-mono bg-white/10 border border-white/15 text-white/70">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right: Actions & Live Telemetry Badges */}
      <div className="flex items-center gap-4">
        {/* Dataset Counter Badge */}
        <div
          className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono liquid-glass-card text-white/80"
          title="65,000 Cleaned Indian Residential Listings Loaded"
        >
          <Database size={15} className="text-[var(--color-accent-blue)]" />
          <span className="font-semibold text-white">65,000</span>
          <span className="text-white/40">Listings</span>
        </div>

        {/* Live Model Status Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-mono font-medium liquid-glass-card">
          <span className="relative flex h-2.5 w-2.5">
            {(isReady || modelStatus === 'loading') && (
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{
                  backgroundColor: isReady
                    ? 'var(--color-accent)'
                    : 'var(--color-warning)',
                }}
              />
            )}
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{
                backgroundColor: isReady
                  ? 'var(--color-accent)'
                  : modelStatus === 'loading'
                    ? 'var(--color-warning)'
                    : 'var(--color-danger)',
              }}
            />
          </span>
          <span className="hidden sm:inline text-white/90">
            {isReady
              ? 'Model Active · HistGradientBoosting'
              : modelStatus === 'loading'
                ? 'Connecting to Engine...'
                : 'Model Offline'}
          </span>
          <span className="sm:hidden text-white/90">
            {isReady ? 'Active' : modelStatus === 'loading' ? 'Connecting' : 'Offline'}
          </span>
        </div>

        {/* Primary Action Button */}
        {activeNav !== 'valuation' && (
          <button
            onClick={onNewValuation}
            className="solid-white-btn rounded-2xl px-6 py-3 text-sm font-semibold gap-2 cursor-pointer shadow-lg"
          >
            <PlusCircle size={16} />
            <span>New Valuation</span>
          </button>
        )}
      </div>
    </header>
  )
}
