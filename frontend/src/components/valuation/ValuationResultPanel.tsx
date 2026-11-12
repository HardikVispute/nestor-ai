'use client'

import React from 'react'
import {
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Building2,
  Layers,
  Sparkles,
  Printer,
  Share2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatPricePerSqft, formatConfidence, formatArea } from '@/lib/formatters'
import StatusBadge from '@/components/shared/StatusBadge'
import type { ValuationResult } from '@/types'

interface ValuationResultPanelProps {
  result: ValuationResult | null
  isLoading: boolean
  error: string | null
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ backgroundColor: 'rgba(19, 33, 55, 0.6)' }}
    />
  )
}

function SkeletonResults() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-44 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
      </div>
      <SkeletonBlock className="h-32 w-full" />
      <SkeletonBlock className="h-56 w-full" />
      <SkeletonBlock className="h-40 w-full" />
    </div>
  )
}

export default function ValuationResultPanel({
  result,
  isLoading,
  error,
}: ValuationResultPanelProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            Computing Model Inferences...
          </span>
          <span className="text-xs font-mono text-[var(--color-accent)] animate-pulse">
            HistGradientBoosting
          </span>
        </div>
        <SkeletonResults />
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-6 border-red-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-[var(--color-danger)] flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-danger)]">
              Valuation Request Intercepted
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">{error}</p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-3">
              Ensure property dimensions are physically plausible (e.g. Super Built-up Area ≥ Carpet
              Area) and backend service is running on port 8000.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Empty State
  if (!result) {
    return (
      <div className="liquid-glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center h-[560px]">
        <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/20 text-[var(--color-accent)] mb-4 shadow-[0_8px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]">
          <Building2 size={36} />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
          Valuation Engine Ready
        </h3>
        <p className="text-sm sm:text-base font-body font-light text-white/70 max-w-md mt-2.5 leading-relaxed">
          Configure property specifications on the left or select an institutional archetype preset,
          then click <strong className="text-[var(--color-accent)] font-semibold">Generate Institutional Valuation</strong> to
          compute asking value, calibrated intervals, and nearest comparable properties.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-white/70 font-mono">
          <span className="flex items-center gap-2 px-4 py-2 rounded-2xl liquid-glass-card">
            <CheckCircle2 size={15} className="text-[var(--color-accent)]" /> 65,000 Verified Listings
          </span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-2xl liquid-glass-card">
            <ShieldCheck size={15} className="text-[var(--color-accent-blue)]" /> 80% Calibrated Bounds
          </span>
        </div>
      </div>
    )
  }

  const { lower, upper } = result.prediction_interval
  const range = upper - lower
  const valueFraction = range > 0 ? (result.estimated_price - lower) / range : 0.5

  const sortedFactors = [...result.valuation_factors]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* 01. Hero Valuation Card */}
      <div className="liquid-glass-panel rounded-2xl p-8 sm:p-9 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <span className="text-xs sm:text-sm font-mono font-medium uppercase tracking-wider text-white/50">
              Estimated Market Asking Price
            </span>
            <div className="text-5xl sm:text-6xl font-extrabold tabular-nums tracking-tight text-[var(--color-accent)] mt-2 font-heading [text-shadow:0_2px_16px_rgba(39,215,174,0.3)]">
              {formatCurrency(result.estimated_price)}
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-2">
            <span className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-mono font-bold bg-[rgba(39,215,174,0.12)] text-[var(--color-accent)] border border-[rgba(39,215,174,0.35)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
              {formatConfidence(result.confidence)} Confidence
            </span>
            <span className="text-xs text-white/50 font-mono">
              Model v{result.model_version} · Log-HGBR
            </span>
          </div>
        </div>

        {/* 2-Metric Sub-strip */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="liquid-glass-card rounded-2xl p-5">
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Unit Rate (₹ / sq.ft.)
            </span>
            <div className="text-xl sm:text-2xl font-bold tabular-nums text-white mt-1.5">
              {formatPricePerSqft(result.price_per_sqft)}
            </div>
          </div>

          <div className="liquid-glass-card rounded-2xl p-5">
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Confidence Band
            </span>
            <div className="text-xl sm:text-2xl font-bold tabular-nums text-[var(--color-accent-blue)] mt-1.5">
              High Institutional
            </div>
          </div>
        </div>
      </div>

      {/* 02. Calibrated 80% Valuation Range */}
      <div className="liquid-glass-panel rounded-2xl p-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-[var(--color-accent)]" />
            Calibrated 80% Valuation Envelope
          </span>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            Empirical Test Residuals
          </span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-mono tabular-nums pt-1">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] block">Lower Bound (10th %ile)</span>
            <span className="font-bold text-[var(--color-text-primary)] text-sm sm:text-base">{formatCurrency(lower)}</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-[var(--color-accent)] block">Estimated Midpoint</span>
            <span className="font-bold text-[var(--color-accent)] text-sm sm:text-base">
              {formatCurrency(result.estimated_price)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-[var(--color-text-muted)] block">Upper Bound (90th %ile)</span>
            <span className="font-bold text-[var(--color-text-primary)] text-sm sm:text-base">{formatCurrency(upper)}</span>
          </div>
        </div>

        {/* Range Gauge Bar */}
        <div className="relative h-3 w-full bg-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden my-3">
          <div
            className="absolute top-0 bottom-0 rounded-xl"
            style={{
              left: '12%',
              right: '12%',
              background: 'linear-gradient(90deg, rgba(39,215,174,0.2), rgba(121,169,245,0.4), rgba(39,215,174,0.2))',
            }}
          />
          {/* Estimated Point Indicator */}
          <div
            className="absolute top-0 bottom-0 w-2 rounded-xl bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]"
            style={{
              left: `${Math.max(8, Math.min(92, valueFraction * 100))}%`,
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        <p className="text-xs text-white/50 text-center leading-normal">
          Empirical 80% prediction interval calibrated against 13,000 test holdout properties.
        </p>
      </div>

      {/* 03. Key Valuation Factors */}
      {sortedFactors.length > 0 && (
        <div className="liquid-glass-panel rounded-2xl p-7 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--color-accent-blue)]" />
              Primary Value Drivers & Attribution
            </span>
            <span className="text-xs font-mono text-white/50">
              Impact Magnitude
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedFactors}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: '#65758A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={120}
                  tick={{ fill: '#95A4B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload
                      return (
                        <div className="liquid-glass-card p-3 rounded-2xl border border-white/20 text-xs">
                          <div className="font-bold text-white">{d.feature}</div>
                          <div className="text-[var(--color-accent)] font-mono mt-0.5 font-bold">
                            Impact: {d.impact >= 0 ? '+' : ''}
                            {d.impact.toFixed(3)}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="impact" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {sortedFactors.map((entry, index) => (
                    <Cell
                      key={`factor-${index}`}
                      fill={entry.impact >= 0 ? '#27D7AE' : '#F07878'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 04. Nearest Comparable Properties Table */}
      {result.comparable_properties.length > 0 && (
        <div className="liquid-glass-panel rounded-2xl p-7 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin size={16} className="text-[var(--color-accent)]" />
              Nearest Comparable Listings (65k Dataset)
            </span>
            <span className="text-xs font-mono text-white/50">
              Euclidean Distance Match
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono text-[var(--color-text-muted)] uppercase">
                  <th className="py-2.5 pr-2">Location</th>
                  <th className="py-2.5 pr-2 text-center">BHK</th>
                  <th className="py-2.5 pr-2 text-right">Carpet Area</th>
                  <th className="py-2.5 pr-2 text-right">Asking Price</th>
                  <th className="py-2.5 pr-2 text-right">₹/sq.ft.</th>
                  <th className="py-2.5 text-right">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {result.comparable_properties.slice(0, 5).map((comp) => {
                  const matchPct = Math.round(comp.similarity_score * 100)
                  return (
                    <tr key={comp.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 pr-2 font-medium text-white truncate max-w-[140px]">
                        {comp.locality || comp.city}
                      </td>
                      <td className="py-3 pr-2 text-center text-white/80 font-mono">
                        {comp.bhk}B
                      </td>
                      <td className="py-3 pr-2 text-right text-white/80 font-mono tabular-nums">
                        {formatArea(comp.carpet_area)}
                      </td>
                      <td className="py-3 pr-2 text-right font-bold text-[var(--color-accent)] tabular-nums">
                        {formatCurrency(comp.price)}
                      </td>
                      <td className="py-3 pr-2 text-right text-white/60 font-mono tabular-nums text-xs">
                        {formatPricePerSqft(comp.price_per_sqft)}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-block px-2.5 py-1 rounded-xl text-xs font-mono font-semibold bg-[rgba(39,215,174,0.12)] text-[var(--color-accent)] border border-[rgba(39,215,174,0.25)]">
                          {matchPct}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 05. Risk & Anomaly Assessment */}
      {result.risk_indicators.length > 0 && (
        <div className="liquid-glass-panel rounded-2xl p-7 space-y-4">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <AlertTriangle size={16} className="text-[var(--color-warning)]" />
            Risk & Anomaly Audit
          </span>

          <div className="space-y-3">
            {result.risk_indicators.map((risk, i) => (
              <div
                key={i}
                className="liquid-glass-card rounded-2xl p-4 flex items-start gap-3.5 border border-white/10"
              >
                <StatusBadge level={risk.level} label={risk.level.toUpperCase()} />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {risk.label}
                  </div>
                  <div className="text-xs sm:text-sm text-white/70 mt-1 leading-normal">
                    {risk.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
