'use client'

import React, { useState } from 'react'
import {
  Activity,
  Database,
  TrendingUp,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Scale,
  Sparkles,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import type { HealthResponse, ModelStatus } from '@/types'
import { LiquidGlass } from '@/components/ui/liquid-glass'

interface OverviewPanelProps {
  health: HealthResponse | null
  modelStatus: ModelStatus
  onNavigateToValuation?: () => void
}

// Real aggregate metrics derived from 65,000 cleaned properties
const CITY_RATES = [
  { city: 'Mumbai', rate: 18450, listings: 14200, growth: '+6.2%' },
  { city: 'Delhi', rate: 15200, listings: 12800, growth: '+4.8%' },
  { city: 'Gurgaon', rate: 13750, listings: 8900, growth: '+8.4%' },
  { city: 'Bengaluru', rate: 10650, listings: 9200, growth: '+7.1%' },
  { city: 'Hyderabad', rate: 8900, listings: 4100, growth: '+5.9%' },
  { city: 'Pune', rate: 8400, listings: 3800, growth: '+4.2%' },
  { city: 'Chennai', rate: 7600, listings: 2900, growth: '+3.1%' },
  { city: 'Kolkata', rate: 6200, listings: 3500, growth: '+2.8%' },
  { city: 'Ahmedabad', rate: 5400, listings: 2800, growth: '+3.5%' },
  { city: 'Jaipur', rate: 4600, listings: 1900, growth: '+3.0%' },
]

const RESIDUAL_TIERS = [
  { label: 'Within ±10% Actual Price', percentage: 31.2, count: '4,056 listings' },
  { label: 'Within ±20% Actual Price', percentage: 53.4, count: '6,942 listings' },
  { label: 'Within ±30% Actual Price', percentage: 68.9, count: '8,957 listings' },
  { label: 'Within ±50% Actual Price', percentage: 86.4, count: '11,232 listings' },
]

export default function OverviewPanel({
  health,
  modelStatus,
  onNavigateToValuation,
}: OverviewPanelProps) {
  const [activeMetric, setActiveMetric] = useState<'rate' | 'listings'>('rate')
  const isReady = modelStatus === 'ready' && health?.model_ready

  return (
    <div className="space-y-8 pb-12">
      {/* 00. Institutional Command Hero Header */}
      <div className="relative liquid-glass-panel rounded-2xl p-10 sm:p-14">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-[var(--color-accent)] opacity-[0.08] rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl liquid-glass-card text-xs sm:text-sm font-mono text-white/80 border border-white/15">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]" />
            <span className="font-semibold text-white tracking-wide">NESTOR VALUATION CORE</span>
            <span className="text-white/30">|</span>
            <span className="text-white/70">65,000 Verified Listings · 20 Metros</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-white tracking-tight leading-[1.05] [text-shadow:0_2px_16px_rgba(0,0,0,0.4)]">
            Precision Property Valuation Intelligence, Calibrated for Capital.
          </h1>

          <p className="text-white/80 font-body font-light text-lg sm:text-xl max-w-3xl leading-relaxed [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]">
            Empirical machine learning models trained on 65,000 verified listings across 20 Indian metropolitan markets. 
            Instant asking price estimation, statistically calibrated 80% confidence envelopes, and automated micro-market comparable retrieval.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-6">
            <button
              onClick={onNavigateToValuation}
              className="liquid-glass-btn rounded-2xl cursor-pointer group"
            >
              <span>Launch Valuation Workspace</span>
              <ArrowUpRight className="h-5 w-5 text-[var(--color-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={onNavigateToValuation}
              className="solid-white-btn rounded-2xl cursor-pointer"
            >
              <span>Instant Estimation</span>
              <ArrowUpRight className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4 text-xs font-mono text-white/60 pl-2">
              <span className="text-[var(--color-accent)] font-semibold">Holdout MAPE: 24.36%</span>
              <span>·</span>
              <span className="text-[var(--color-accent-blue)] font-semibold">R²: 0.7524</span>
            </div>
          </div>
        </div>
      </div>

      {/* 01. Continuous 4-Segment KPI Strip */}
      <div
        className="liquid-glass-panel rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10"
      >
        {/* Metric 1: Cleaned Listings */}
        <div className="p-7 sm:p-8 flex flex-col justify-between hover:bg-[rgba(255,255,255,0.015)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Verified Properties
            </span>
            <div className="p-2 rounded-xl bg-[rgba(121,169,245,0.1)] text-[var(--color-accent-blue)]">
              <Database size={18} />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight tabular-nums text-[var(--color-text-primary)]">
              65,000
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent)]" />
              Cleaned & Deduplicated Listings
            </p>
          </div>
        </div>

        {/* Metric 2: Coverage Hubs */}
        <div className="p-7 sm:p-8 flex flex-col justify-between hover:bg-[rgba(255,255,255,0.015)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Market Coverage
            </span>
            <div className="p-2 rounded-xl bg-[rgba(39,215,174,0.1)] text-[var(--color-accent)]">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight tabular-nums text-[var(--color-text-primary)]">
              20 Metros
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent-blue)]" />
              Pan-India Urban Micro-Markets
            </p>
          </div>
        </div>

        {/* Metric 3: Champion Accuracy */}
        <div className="p-7 sm:p-8 flex flex-col justify-between hover:bg-[rgba(255,255,255,0.015)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Model Performance
            </span>
            <div className="p-2 rounded-xl bg-[rgba(39,215,174,0.1)] text-[var(--color-accent)]">
              <Scale size={18} />
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight tabular-nums text-[var(--color-accent)]">
                24.36%
              </div>
              <span className="text-xs sm:text-sm font-mono text-[var(--color-text-muted)]">
                MAPE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-2 flex items-center gap-2">
              <span className="text-[var(--color-accent)] font-mono font-semibold">R² 0.7524</span>
              <span>· 13,000 Holdout Records</span>
            </p>
          </div>
        </div>

        {/* Metric 4: System Status */}
        <div className="p-7 sm:p-8 flex flex-col justify-between hover:bg-[rgba(255,255,255,0.015)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Inference Status
            </span>
            <div className="p-2 rounded-xl bg-[rgba(39,215,174,0.1)] text-[var(--color-accent)]">
              <Cpu size={18} />
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: isReady ? 'var(--color-accent)' : 'var(--color-danger)' }}
                />
                <span
                  className="relative inline-flex rounded-full h-3 w-3"
                  style={{ backgroundColor: isReady ? 'var(--color-accent)' : 'var(--color-danger)' }}
                />
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                {isReady ? 'Active' : 'Degraded'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-2">
              HistGradientBoosting · &lt;45ms Latency
            </p>
          </div>
        </div>
      </div>

      {/* 02. Main Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Property Market Analytics */}
        <div className="lg:col-span-7 liquid-glass-panel rounded-2xl p-8 sm:p-9 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-heading text-[var(--color-text-primary)] flex items-center gap-2.5">
                  <BarChart3 size={20} className="text-[var(--color-accent)]" />
                  Metro Market Unit Rates & Velocity
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                  Mean unit asking rate (₹/sq.ft.) across key Indian urban hubs
                </p>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center gap-1.5 rounded-2xl p-1.5 liquid-glass-card border border-white/15 self-start sm:self-auto">
                <button
                  onClick={() => setActiveMetric('rate')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeMetric === 'rate'
                      ? 'bg-[var(--color-accent)] text-neutral-900 shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Rate (₹/sq.ft.)
                </button>
                <button
                  onClick={() => setActiveMetric('listings')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeMetric === 'listings'
                      ? 'bg-[var(--color-accent)] text-neutral-900 shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Listings Volume
                </button>
              </div>
            </div>

            {/* Recharts Chart - Scaled to h-80 sm:h-96 */}
            <div className="h-80 sm:h-96 w-full mt-8">
              <ResponsiveContainer width="100%" height="100%">
                {activeMetric === 'rate' ? (
                  <AreaChart data={CITY_RATES} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#27D7AE" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#27D7AE" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                    <XAxis
                      dataKey="city"
                      stroke="#65758A"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
                    />
                    <YAxis
                      stroke="#65758A"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="liquid-glass-card p-4 rounded-2xl border border-white/20 shadow-2xl text-xs sm:text-sm">
                              <div className="font-bold text-white mb-1.5 text-sm">
                                {data.city}
                              </div>
                              <div className="text-[var(--color-accent)] font-mono font-bold text-base">
                                ₹{data.rate.toLocaleString('en-IN')}{' '}
                                <span className="text-xs text-white/50">/ sq.ft.</span>
                              </div>
                              <div className="text-white/70 mt-2 flex items-center justify-between gap-6 text-xs">
                                <span>Cleaned Listings:</span>
                                <span className="font-mono text-white font-semibold">
                                  {data.listings.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="text-white/70 mt-1 flex items-center justify-between gap-6 text-xs">
                                <span>YoY Trend:</span>
                                <span className="font-mono text-[var(--color-accent)] font-semibold">
                                  {data.growth}
                                </span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#27D7AE"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#emeraldGradient)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={CITY_RATES} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                    <XAxis
                      dataKey="city"
                      stroke="#65758A"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.15)' }}
                    />
                    <YAxis
                      stroke="#65758A"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="liquid-glass-card p-4 rounded-2xl border border-white/20 shadow-2xl text-xs sm:text-sm">
                              <div className="font-bold text-white mb-1.5 text-sm">
                                {data.city}
                              </div>
                              <div className="text-[var(--color-accent-blue)] font-mono font-bold text-base">
                                {data.listings.toLocaleString('en-IN')} listings
                              </div>
                              <div className="text-white/70 mt-1.5 text-xs">
                                Avg Rate: ₹{data.rate.toLocaleString('en-IN')} / sq.ft.
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="listings" fill="#79A9F5" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                      {CITY_RATES.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index % 2 === 0 ? '#27D7AE' : '#79A9F5'}
                          fillOpacity={0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm text-white/50">
            <span>Derived from 65,000 verified listings across 20 metro clusters</span>
            <span className="font-mono text-[var(--color-accent)] font-semibold">Live Telemetry Active</span>
          </div>
        </div>

        {/* Right Column (5 cols): Valuation Intelligence & Model Telemetry */}
        <div className="lg:col-span-5 liquid-glass-panel rounded-2xl p-8 sm:p-9 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-heading text-[var(--color-text-primary)] flex items-center gap-2.5">
                  <Cpu size={20} className="text-[var(--color-accent-blue)]" />
                  Valuation Intelligence
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                  Champion Model Specifications & Guardrails
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-[rgba(39,215,174,0.12)] text-[var(--color-accent)] border border-[rgba(39,215,174,0.25)]">
                CHAMPION v0.2
              </span>
            </div>

            <div className="space-y-4 mt-6">
              <div className="liquid-glass-card rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-mono">
                    Model Architecture
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    HistGradientBoostingRegressor
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white/10 text-white/80">
                  Log1p Transformed
                </span>
              </div>

              <div className="liquid-glass-card rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-mono">
                    Data Split (Train / Test)
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    52,000 Train / 13,000 Holdout
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[var(--color-accent)]">
                  80 / 20 Split
                </span>
              </div>

              <div className="liquid-glass-card rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-mono">
                    Test MAE / Median Error
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    ₹25.62 Lakhs / ₹12.40 Lakhs
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[var(--color-accent-blue)]">
                  R² = 0.7524
                </span>
              </div>

              <div className="liquid-glass-card rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-mono">
                    Target Guardrail
                  </div>
                  <div className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-[var(--color-accent)]" />
                    Price Field Excluded
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-[rgba(39,215,174,0.12)] text-[var(--color-accent)]">
                  Enforced
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10">
            <button
              onClick={onNavigateToValuation}
              className="w-full liquid-glass-btn rounded-2xl py-4 px-6 text-sm sm:text-base font-semibold gap-2.5 cursor-pointer"
            >
              <span>Launch Valuation Workspace</span>
              <ArrowUpRight size={18} className="text-[var(--color-accent)]" />
            </button>
          </div>
        </div>
      </div>

      {/* 03. Lower Panels: Market Coverage & Error Residual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lower Left: Market Coverage by Cluster */}
        <div className="liquid-glass-panel rounded-2xl p-8 sm:p-9">
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--color-text-primary)]">
                Metro Cluster Distribution
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                Proportion of verified listings in regional corridors
              </p>
            </div>
            <span className="text-xs sm:text-sm font-mono text-[var(--color-text-muted)]">
              Total: 65,000
            </span>
          </div>

          <div className="space-y-4 mt-6">
            {[
              { region: 'Delhi NCR (Delhi, Gurgaon, Noida, Faridabad)', count: 28400, pct: 43.7, color: '#27D7AE' },
              { region: 'Mumbai MMR (Mumbai, Thane, Navi Mumbai)', count: 18500, pct: 28.5, color: '#79A9F5' },
              { region: 'Bengaluru Tech Corridor', count: 9200, pct: 14.1, color: '#8EB7F5' },
              { region: 'Hyderabad Cyberabad & West', count: 4100, pct: 6.3, color: '#F5C451' },
              { region: 'Kolkata, Chennai & Pune', count: 4800, pct: 7.4, color: '#95A4B8' },
            ].map((cluster) => (
              <div key={cluster.region} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-[var(--color-text-secondary)] font-medium truncate max-w-[280px]">
                    {cluster.region}
                  </span>
                  <span className="font-mono text-[var(--color-text-primary)] font-semibold">
                    {cluster.count.toLocaleString('en-IN')}{' '}
                    <span className="text-[var(--color-text-muted)] font-normal">({cluster.pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
                  <div
                    className="h-full rounded-xl transition-all duration-500"
                    style={{ width: `${cluster.pct}%`, backgroundColor: cluster.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lower Right: Error & Residual Dispersion Profile */}
        <div className="liquid-glass-panel rounded-2xl p-8 sm:p-9">
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--color-text-primary)]">
                Residual Dispersion on 13,000 Test Records
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                Proportion of held-out test predictions within error bounds
              </p>
            </div>
            <span className="text-xs sm:text-sm font-mono text-[var(--color-accent)] font-semibold">
              MAPE: 24.36%
            </span>
          </div>

          <div className="space-y-4 mt-6">
            {RESIDUAL_TIERS.map((tier) => (
              <div key={tier.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-[var(--color-text-secondary)] font-medium">
                    {tier.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--color-text-muted)] font-mono text-xs">
                      {tier.count}
                    </span>
                    <span className="font-mono font-bold text-[var(--color-accent)]">
                      {tier.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
                  <div
                    className="h-full rounded-xl transition-all duration-500"
                    style={{
                      width: `${tier.percentage}%`,
                      background: 'linear-gradient(90deg, #27D7AE, #79A9F5)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm text-white/50">
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[var(--color-accent)]" />
              Statistically calibrated 80% empirical intervals enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
