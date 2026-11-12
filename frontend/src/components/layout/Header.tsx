'use client'

import React, { memo } from 'react'
import {
  Search,
  PlusCircle,
  Database,
  Zap,
  Sparkles,
} from 'lucide-react'
import { usePerformanceMode } from '@/contexts/PerformanceContext'
import { LiquidGlass, LiquidGlassButton } from '@/components/ui/liquid-glass'
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

function Header({
  activeNav,
  modelStatus,
  health,
  onNewValuation,
}: HeaderProps) {
  const { mode, toggleMode, isLightweight } = usePerformanceMode()
  const currentSection = SECTION_TITLES[activeNav] || SECTION_TITLES.overview
  const isReady = modelStatus === 'ready' && health?.model_ready

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between flex-shrink-0 px-8 border-b border-white/10"
      style={{
        height: 84,
        backgroundColor: isLightweight ? 'rgba(0, 0, 0, 0.92)' : 'rgba(0, 0, 0, 0.75)',
        backdropFilter: isLightweight ? 'none' : 'blur(24px)',
        WebkitBackdropFilter: isLightweight ? 'none' : 'blur(24px)',
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
        <LiquidGlass
          eager
          radius={16}
          scale={40}
          aberration={12}
          bevelDepth={14}
          frost={0.32}
          tint={0.07}
          onClick={onNewValuation}
          className="relative w-full hover:border-white/35 cursor-pointer"
          contentClassName="flex items-center px-5 py-3 justify-start text-left"
        >
          <Search size={16} className="text-white/50 mr-3 flex-shrink-0" />
          <span className="text-sm text-white/50 truncate flex-1">
            Search 65,000 listings, 20 metro markets...
          </span>
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-mono bg-white/10 border border-white/15 text-white/70">
            ⌘K
          </div>
        </LiquidGlass>
      </div>

      {/* Right: Actions & Live Telemetry Badges */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Full FX / Performance Mode Toggle */}
        <LiquidGlassButton
          eager
          data-testid="performance-mode-toggle"
          onClick={toggleMode}
          radius={16}
          scale={36}
          aberration={12}
          bevelDepth={12}
          frost={0.32}
          tint={isLightweight ? 0.08 : 0.1}
          title={
            mode === 'performance'
              ? 'Performance Mode active — click for Full FX Experience'
              : 'Full FX Experience active — click for Performance Mode'
          }
          className="flex-shrink-0"
          glassClassName={`px-3.5 py-2.5 text-xs font-mono font-medium whitespace-nowrap ${
            isLightweight
              ? '!bg-[rgba(39,215,174,0.14)] !border-[rgba(39,215,174,0.4)] text-[var(--color-accent)]'
              : 'text-white/90 hover:text-white'
          }`}
        >
          {isLightweight ? (
            <Zap size={14} className="flex-shrink-0" />
          ) : (
            <Sparkles size={14} className="text-[var(--color-accent)] flex-shrink-0" />
          )}
          <span className="hidden md:inline whitespace-nowrap">
            {mode === 'performance' ? 'Performance' : 'Full FX'}
          </span>
        </LiquidGlassButton>

        {/* Dataset Counter Badge */}
        <LiquidGlass
          eager
          radius={16}
          scale={34}
          aberration={10}
          bevelDepth={12}
          frost={0.32}
          tint={0.07}
          className="hidden lg:flex flex-shrink-0"
          contentClassName="flex items-center gap-2 px-4 py-2.5 text-xs font-mono text-white/80 whitespace-nowrap"
          title="65,000 Cleaned Indian Residential Listings Loaded"
        >
          <Database size={15} className="text-[var(--color-accent-blue)] flex-shrink-0" />
          <span className="font-semibold text-white">65,000</span>
          <span className="text-white/40">Listings</span>
        </LiquidGlass>

        {/* Live Model Status Badge with animated ping */}
        <LiquidGlass
          eager
          radius={16}
          scale={34}
          aberration={10}
          bevelDepth={12}
          frost={0.32}
          tint={0.07}
          className="flex flex-shrink-0"
          contentClassName="flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-medium whitespace-nowrap"
        >
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            {!isLightweight && (isReady || modelStatus === 'loading') && (
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
        </LiquidGlass>

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

export default memo(Header)
