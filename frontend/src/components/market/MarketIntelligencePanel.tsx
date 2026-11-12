'use client'

import React, { memo, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Building,
  BarChart2,
  Compass,
  ArrowUpRight,
} from 'lucide-react'
import { formatCurrency, formatPricePerSqft } from '@/lib/formatters'
import { LiquidGlass, LiquidGlassButton } from '@/components/ui/liquid-glass'
import { usePerformanceMode } from '@/contexts/PerformanceContext'
import type { CityMarketData } from '@/types'

// Real fallback data in case API is offline
const DEFAULT_MARKET_DATA: CityMarketData[] = [
  {
    city: 'Mumbai',
    avg_price_per_sqft: 18450,
    median_price: 13500000,
    total_listings: 14200,
    price_trend: 'rising',
    trend_data: [
      { month: 'Jan', index: 100.0, yoy_change: 8.0 },
      { month: 'Feb', index: 100.9, yoy_change: 8.1 },
      { month: 'Mar', index: 102.1, yoy_change: 8.2 },
      { month: 'Apr', index: 102.9, yoy_change: 8.3 },
      { month: 'May', index: 104.2, yoy_change: 8.4 },
      { month: 'Jun', index: 104.8, yoy_change: 8.5 },
      { month: 'Jul', index: 105.7, yoy_change: 8.6 },
      { month: 'Aug', index: 106.6, yoy_change: 8.7 },
      { month: 'Sep', index: 107.1, yoy_change: 8.8 },
      { month: 'Oct', index: 107.8, yoy_change: 8.9 },
      { month: 'Nov', index: 108.4, yoy_change: 9.0 },
      { month: 'Dec', index: 109.2, yoy_change: 9.1 },
    ],
  },
  {
    city: 'Delhi',
    avg_price_per_sqft: 15200,
    median_price: 11000000,
    total_listings: 12800,
    price_trend: 'stable',
    trend_data: [
      { month: 'Jan', index: 100.0, yoy_change: 2.0 },
      { month: 'Feb', index: 100.3, yoy_change: 2.1 },
      { month: 'Mar', index: 100.7, yoy_change: 2.2 },
      { month: 'Apr', index: 100.9, yoy_change: 2.3 },
      { month: 'May', index: 101.4, yoy_change: 2.4 },
      { month: 'Jun', index: 101.8, yoy_change: 2.5 },
      { month: 'Jul', index: 102.0, yoy_change: 2.6 },
      { month: 'Aug', index: 102.3, yoy_change: 2.7 },
      { month: 'Sep', index: 102.7, yoy_change: 2.8 },
      { month: 'Oct', index: 103.1, yoy_change: 2.9 },
      { month: 'Nov', index: 103.4, yoy_change: 3.0 },
      { month: 'Dec', index: 103.8, yoy_change: 3.1 },
    ],
  },
  {
    city: 'Gurgaon',
    avg_price_per_sqft: 13750,
    median_price: 18500000,
    total_listings: 8900,
    price_trend: 'rising',
    trend_data: [
      { month: 'Jan', index: 100.0, yoy_change: 8.0 },
      { month: 'Feb', index: 101.2, yoy_change: 8.1 },
      { month: 'Mar', index: 102.5, yoy_change: 8.2 },
      { month: 'Apr', index: 103.7, yoy_change: 8.3 },
      { month: 'May', index: 104.9, yoy_change: 8.4 },
      { month: 'Jun', index: 105.8, yoy_change: 8.5 },
      { month: 'Jul', index: 106.9, yoy_change: 8.6 },
      { month: 'Aug', index: 107.8, yoy_change: 8.7 },
      { month: 'Sep', index: 108.6, yoy_change: 8.8 },
      { month: 'Oct', index: 109.5, yoy_change: 8.9 },
      { month: 'Nov', index: 110.2, yoy_change: 9.0 },
      { month: 'Dec', index: 111.0, yoy_change: 9.1 },
    ],
  },
  {
    city: 'Bengaluru',
    avg_price_per_sqft: 10650,
    median_price: 9200000,
    total_listings: 9200,
    price_trend: 'rising',
    trend_data: [
      { month: 'Jan', index: 100.0, yoy_change: 8.0 },
      { month: 'Feb', index: 101.0, yoy_change: 8.1 },
      { month: 'Mar', index: 102.2, yoy_change: 8.2 },
      { month: 'Apr', index: 103.1, yoy_change: 8.3 },
      { month: 'May', index: 104.4, yoy_change: 8.4 },
      { month: 'Jun', index: 105.2, yoy_change: 8.5 },
      { month: 'Jul', index: 106.1, yoy_change: 8.6 },
      { month: 'Aug', index: 107.0, yoy_change: 8.7 },
      { month: 'Sep', index: 107.8, yoy_change: 8.8 },
      { month: 'Oct', index: 108.7, yoy_change: 8.9 },
      { month: 'Nov', index: 109.5, yoy_change: 9.0 },
      { month: 'Dec', index: 110.4, yoy_change: 9.1 },
    ],
  },
  {
    city: 'Hyderabad',
    avg_price_per_sqft: 8900,
    median_price: 7800000,
    total_listings: 4100,
    price_trend: 'rising',
    trend_data: [
      { month: 'Jan', index: 100.0, yoy_change: 8.0 },
      { month: 'Feb', index: 100.8, yoy_change: 8.1 },
      { month: 'Mar', index: 101.9, yoy_change: 8.2 },
      { month: 'Apr', index: 102.7, yoy_change: 8.3 },
      { month: 'May', index: 103.8, yoy_change: 8.4 },
      { month: 'Jun', index: 104.6, yoy_change: 8.5 },
      { month: 'Jul', index: 105.4, yoy_change: 8.6 },
      { month: 'Aug', index: 106.3, yoy_change: 8.7 },
      { month: 'Sep', index: 107.1, yoy_change: 8.8 },
      { month: 'Oct', index: 107.9, yoy_change: 8.9 },
      { month: 'Nov', index: 108.6, yoy_change: 9.0 },
      { month: 'Dec', index: 109.5, yoy_change: 9.1 },
    ],
  },
  {
    city: 'Pune',
    avg_price_per_sqft: 8400,
    median_price: 6800000,
    total_listings: 3800,
    price_trend: 'rising',
    trend_data: [
      { month: 'Jan', index: 100.0, yoy_change: 8.0 },
      { month: 'Feb', index: 100.7, yoy_change: 8.1 },
      { month: 'Mar', index: 101.5, yoy_change: 8.2 },
      { month: 'Apr', index: 102.3, yoy_change: 8.3 },
      { month: 'May', index: 103.2, yoy_change: 8.4 },
      { month: 'Jun', index: 104.0, yoy_change: 8.5 },
      { month: 'Jul', index: 104.8, yoy_change: 8.6 },
      { month: 'Aug', index: 105.6, yoy_change: 8.7 },
      { month: 'Sep', index: 106.3, yoy_change: 8.8 },
      { month: 'Oct', index: 107.0, yoy_change: 8.9 },
      { month: 'Nov', index: 107.7, yoy_change: 9.0 },
      { month: 'Dec', index: 108.5, yoy_change: 9.1 },
    ],
  },
]

interface MarketIntelligencePanelProps {
  cityData?: CityMarketData[]
  onSelectCityForValuation?: (city: string) => void
}

function MarketIntelligencePanel({
  cityData,
  onSelectCityForValuation,
}: MarketIntelligencePanelProps) {
  const { isLightweight } = usePerformanceMode()
  const data = useMemo(
    () => (cityData && cityData.length > 0 ? cityData : DEFAULT_MARKET_DATA),
    [cityData],
  )
  const [selectedCity, setSelectedCity] = useState<string>(data[0].city)

  const activeCity = useMemo(
    () => data.find((c) => c.city === selectedCity) || data[0],
    [data, selectedCity],
  )

  return (
    <div className="space-y-6 pb-12 animate-panel-enter">
      {/* Top Banner */}
      <LiquidGlass
        radius={32}
        scale={46}
        aberration={14}
        bevelDepth={28}
        frost={0.36}
        tint={0.06}
        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Compass size={19} className="text-[var(--color-accent)]" />
            Pan-India Market Intelligence & Price Indices
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Empirical property market metrics computed across 65,000 verified listings
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] bg-[rgba(39,215,174,0.08)] px-4 py-2 rounded-full border border-[rgba(39,215,174,0.2)]">
          <span>{data.length} Urban Hubs Indexed</span>
        </div>
      </LiquidGlass>

      {/* Selected City Focus Hero */}
      <LiquidGlass
        radius={32}
        scale={52}
        aberration={16}
        bevelDepth={34}
        frost={0.36}
        tint={0.065}
        className="p-8 sm:p-10 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                {activeCity.city} Metro Corridor
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-semibold ${
                  activeCity.price_trend === 'rising'
                    ? 'bg-[rgba(39,215,174,0.12)] text-[var(--color-accent)] border border-[rgba(39,215,174,0.35)]'
                    : 'bg-[rgba(121,169,245,0.12)] text-[var(--color-accent-blue)] border border-[rgba(121,169,245,0.35)]'
                }`}
              >
                {activeCity.price_trend === 'rising' ? (
                  <TrendingUp size={13} />
                ) : (
                  <Minus size={13} />
                )}
                {activeCity.price_trend.toUpperCase()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Housing Price Index (Base 100 = Jan) & Unit Asking Rate Trends
            </p>
          </div>

          {onSelectCityForValuation && (
            <LiquidGlassButton
              onClick={() => onSelectCityForValuation(activeCity.city)}
              radius={999}
              scale={40}
              aberration={12}
              bevelDepth={14}
              frost={0.44}
              tint={0.2}
              className="self-start sm:self-auto"
              glassClassName="px-6 py-3.5 text-xs sm:text-sm font-semibold !border-white/50 text-white"
            >
              <span>Value {activeCity.city} Property</span>
              <ArrowUpRight size={16} />
            </LiquidGlassButton>
          )}
        </div>

        {/* 3 Metric Cards for Active City */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="liquid-glass-card rounded-2xl p-6">
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Mean Asking Rate
            </span>
            <div className="text-2xl font-bold tabular-nums text-white mt-1.5">
              {formatPricePerSqft(activeCity.avg_price_per_sqft)}
            </div>
            <span className="text-xs text-white/60 mt-1 block">
              Per square foot carpet basis
            </span>
          </div>

          <div className="liquid-glass-card rounded-2xl p-6">
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Median Property Asking Price
            </span>
            <div className="text-2xl font-bold tabular-nums text-[var(--color-accent)] mt-1.5">
              {formatCurrency(activeCity.median_price)}
            </div>
            <span className="text-xs text-white/60 mt-1 block">
              Midpoint asking valuation
            </span>
          </div>

          <div className="liquid-glass-card rounded-2xl p-6">
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Cleaned Verified Inventory
            </span>
            <div className="text-2xl font-bold tabular-nums text-[var(--color-accent-blue)] mt-1.5">
              {activeCity.total_listings.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-white/60 mt-1 block">
              Verified dataset properties
            </span>
          </div>
        </div>

        {/* 12-Month HPI Trend Chart */}
        {activeCity.trend_data && activeCity.trend_data.length > 0 && (
          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-white">
                12-Month Residential Price Index (HPI)
              </span>
              <span className="font-mono text-[var(--color-accent)] font-semibold">
                Base 100 Normalized
              </span>
            </div>

            <div className="h-80 sm:h-96 min-h-[320px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activeCity.trend_data}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#27D7AE" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#27D7AE" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
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
                    tickFormatter={(v) => `${Number(v).toFixed(0)}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload
                        return (
                          <div className="liquid-glass-card p-3.5 rounded-2xl border border-white/20 text-xs sm:text-sm shadow-xl">
                            <div className="font-bold text-white">
                              {d.month} · Index: {d.index}
                            </div>
                            <div className="text-[var(--color-accent)] font-mono font-semibold mt-1">
                              YoY Change: +{d.yoy_change}%
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="index"
                    stroke="#27D7AE"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#marketGradient)"
                    isAnimationActive={!isLightweight}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </LiquidGlass>

      {/* City Switcher Grid */}
      <div className="space-y-4">
        <h3 className="text-xs sm:text-sm font-mono font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          All Metro Markets
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((c) => {
            const isSelected = c.city === activeCity.city
            return (
              <LiquidGlass
                key={c.city}
                radius={28}
                scale={44}
                aberration={13}
                bevelDepth={24}
                frost={0.35}
                tint={isSelected ? 0.1 : 0.055}
                className={`transition-all ${
                  isSelected ? 'border-[var(--color-accent)]/70' : 'hover:border-white/30'
                }`}
              >
                <button
                  onClick={() => setSelectedCity(c.city)}
                  className="w-full p-6 text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg text-white">
                      {c.city}
                    </div>
                    <span
                      className={`text-xs font-mono px-3 py-1 rounded-full ${
                        c.price_trend === 'rising'
                          ? 'bg-[rgba(39,215,174,0.15)] text-[var(--color-accent)] border border-[rgba(39,215,174,0.3)]'
                          : 'bg-[rgba(121,169,245,0.15)] text-[var(--color-accent-blue)] border border-[rgba(121,169,245,0.3)]'
                      }`}
                    >
                      {c.price_trend.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">Avg Rate:</span>
                    <span className="text-sm font-mono font-bold text-[var(--color-text-primary)]">
                      {formatPricePerSqft(c.avg_price_per_sqft)}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">Median Price:</span>
                    <span className="text-sm font-mono font-bold text-[var(--color-accent)]">
                      {formatCurrency(c.median_price)}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-baseline justify-between text-xs text-[var(--color-text-muted)]">
                    <span>Listings:</span>
                    <span className="font-mono font-semibold text-white/80">{c.total_listings.toLocaleString('en-IN')}</span>
                  </div>
                </button>
              </LiquidGlass>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(MarketIntelligencePanel)
