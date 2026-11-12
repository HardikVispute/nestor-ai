'use client'

import React, { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useHealth } from '@/hooks/useHealth'
import { fetchLocations, fetchMarketTrends, submitValuation } from '@/lib/api'
import {
  saveValuationToHistory,
  type ValuationHistoryEntry,
} from '@/lib/historyStorage'
import Sidebar from '@/components/layout/Sidebar'
import BackgroundWaves from '@/components/shared/BackgroundWaves'
import { LiquidGlass } from '@/components/ui/liquid-glass'
import type {
  NavItem,
  LocationsResponse,
  ValuationResult,
  PropertyFormData,
  CityMarketData,
} from '@/types'

function WorkspaceSkeleton() {
  return (
    <div className="liquid-glass-panel rounded-[32px] p-10 min-h-[420px] flex items-center justify-center animate-pulse">
      <div className="text-xs font-mono uppercase tracking-widest text-white/40">
        Loading Workspace Module...
      </div>
    </div>
  )
}

// Lazy-loaded tab workspaces: inactive tabs are never loaded in the background
const OverviewPanel = dynamic(() => import('@/components/overview/OverviewPanel'), {
  loading: () => <WorkspaceSkeleton />,
})
const PropertyForm = dynamic(() => import('@/components/valuation/PropertyForm'), {
  loading: () => <WorkspaceSkeleton />,
})
const ValuationResultPanel = dynamic(
  () => import('@/components/valuation/ValuationResultPanel'),
  { loading: () => <WorkspaceSkeleton /> },
)
const ValuationHistoryPanel = dynamic(
  () => import('@/components/history/ValuationHistoryPanel'),
  { loading: () => <WorkspaceSkeleton /> },
)
const MarketIntelligencePanel = dynamic(
  () => import('@/components/market/MarketIntelligencePanel'),
  { loading: () => <WorkspaceSkeleton /> },
)
const MethodologyPanel = dynamic(
  () => import('@/components/methodology/MethodologyPanel'),
  { loading: () => <WorkspaceSkeleton /> },
)

export default function Home() {
  const { health, status: modelStatus } = useHealth()

  const [activeNav, setActiveNav] = useState<NavItem>('overview')
  const [locations, setLocations] = useState<LocationsResponse | null>(null)
  const [marketData, setMarketData] = useState<CityMarketData[]>([])
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null)
  const [currentFormData, setCurrentFormData] = useState<PropertyFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [valuationError, setValuationError] = useState<string | null>(null)

  // Restore active tab query param on initial mount without fetching unrelated tab APIs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab') as NavItem | null
      if (tab && ['overview', 'valuation', 'history', 'market', 'methodology'].includes(tab)) {
        setActiveNav(tab)
      }
    }
  }, [])

  // Lazy-fetch + cache locations ONLY when Valuation tab is active
  useEffect(() => {
    if (activeNav !== 'valuation' || locations !== null) return
    let active = true
    fetchLocations()
      .then((res) => {
        if (active) setLocations(res)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [activeNav, locations])

  // Lazy-fetch + cache market indices ONLY when Market Intelligence tab is active
  useEffect(() => {
    if (activeNav !== 'market' || marketData.length > 0) return
    let active = true
    fetchMarketTrends()
      .then((res) => {
        if (active) setMarketData(res)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [activeNav, marketData.length])

  const handleNavChange = useCallback((nav: NavItem) => {
    setActiveNav(nav)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', nav)
      window.history.replaceState(null, '', url.toString())
    }
  }, [])

  const handleGoToValuation = useCallback(() => {
    handleNavChange('valuation')
  }, [handleNavChange])

  const handleValuationSubmit = useCallback(async (data: PropertyFormData) => {
    setIsSubmitting(true)
    setValuationError(null)
    setCurrentFormData(data)
    try {
      const result = await submitValuation(data)
      setValuationResult(result)
      saveValuationToHistory(data, result)
    } catch (err) {
      setValuationError(
        err instanceof Error ? err.message : 'An unexpected error occurred during valuation.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleSelectHistoryEntry = useCallback(
    (entry: ValuationHistoryEntry) => {
      setCurrentFormData(entry.formData)
      setValuationResult(entry.result)
      setValuationError(null)
      handleNavChange('valuation')
    },
    [handleNavChange],
  )

  const handleSelectCityForValuation = useCallback(
    (cityName: string) => {
      setCurrentFormData((prev) => ({
        city: cityName,
        property_type: prev?.property_type || 'Apartment',
        carpet_area: prev?.carpet_area || 1000,
        super_builtup_area: prev?.super_builtup_area || 1300,
        bhk: prev?.bhk || 2,
        bathrooms: prev?.bathrooms || 2,
        balconies: prev?.balconies || 1,
        floor_number: prev?.floor_number || 5,
        total_floors: prev?.total_floors || 14,
        property_age: prev?.property_age || 3,
        furnishing_status: prev?.furnishing_status || 'Semi-Furnished',
        parking: prev?.parking ?? true,
        ownership_type: prev?.ownership_type || 'Freehold',
      }))
      handleNavChange('valuation')
    },
    [handleNavChange],
  )

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-black font-body">
      {/* 00. Ambient Cinematic Chrome/HLS Waves Background */}
      <BackgroundWaves />

      {/* 01. Floating 5-Icon Navigation Dock */}
      <Sidebar activeNav={activeNav} onNavChange={handleNavChange} />

      {/* 02. Main Workspace Layout (no global header; Overview renders its own Overview header) */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-7">
          <div className="max-w-7xl mx-auto w-full">
            {activeNav === 'overview' && (
              <OverviewPanel
                health={health}
                modelStatus={modelStatus}
                onNavigateToValuation={handleGoToValuation}
              />
            )}

            {activeNav === 'valuation' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 animate-panel-enter">
                {/* Form Column (5 cols) */}
                <LiquidGlass
                  radius={32}
                  scale={48}
                  aberration={14}
                  bevelDepth={32}
                  frost={0.36}
                  tint={0.06}
                  className="lg:col-span-5 p-7"
                >
                  <PropertyForm
                    onSubmit={handleValuationSubmit}
                    locations={locations}
                    isSubmitting={isSubmitting}
                    initialValues={currentFormData}
                  />
                </LiquidGlass>

                {/* Results Column (7 cols) */}
                <div className="lg:col-span-7">
                  <ValuationResultPanel
                    result={valuationResult}
                    isLoading={isSubmitting}
                    error={valuationError}
                  />
                </div>
              </div>
            )}

            {activeNav === 'history' && (
              <ValuationHistoryPanel
                onSelectEntry={handleSelectHistoryEntry}
                onNewValuation={() => handleNavChange('valuation')}
              />
            )}

            {activeNav === 'market' && (
              <MarketIntelligencePanel
                cityData={marketData}
                onSelectCityForValuation={handleSelectCityForValuation}
              />
            )}

            {activeNav === 'methodology' && <MethodologyPanel />}
          </div>
        </main>
      </div>
    </div>
  )
}
