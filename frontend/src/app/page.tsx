'use client'

import React, { useState, useEffect } from 'react'
import { useHealth } from '@/hooks/useHealth'
import { fetchLocations, fetchMarketTrends, submitValuation } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import OverviewPanel from '@/components/overview/OverviewPanel'
import PropertyForm from '@/components/valuation/PropertyForm'
import ValuationResultPanel from '@/components/valuation/ValuationResultPanel'
import ValuationHistoryPanel, {
  saveValuationToHistory,
  ValuationHistoryEntry,
} from '@/components/history/ValuationHistoryPanel'
import MarketIntelligencePanel from '@/components/market/MarketIntelligencePanel'
import MethodologyPanel from '@/components/methodology/MethodologyPanel'
import BackgroundWaves from '@/components/shared/BackgroundWaves'
import type {
  NavItem,
  LocationsResponse,
  ValuationResult,
  PropertyFormData,
  CityMarketData,
} from '@/types'

export default function Home() {
  const { health, status: modelStatus } = useHealth()

  const [activeNav, setActiveNav] = useState<NavItem>('overview')
  const [locations, setLocations] = useState<LocationsResponse | null>(null)
  const [marketData, setMarketData] = useState<CityMarketData[]>([])
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null)
  const [currentFormData, setCurrentFormData] = useState<PropertyFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [valuationError, setValuationError] = useState<string | null>(null)

  // Fetch locations & market trends on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab') as NavItem | null
      if (tab && ['overview', 'valuation', 'history', 'market', 'methodology'].includes(tab)) {
        setActiveNav(tab)
      }
    }

    fetchLocations()
      .then(setLocations)
      .catch(() => {})

    fetchMarketTrends()
      .then(setMarketData)
      .catch(() => {})
  }, [])

  function handleNavChange(nav: NavItem) {
    setActiveNav(nav)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', nav)
      window.history.replaceState(null, '', url.toString())
    }
  }

  async function handleValuationSubmit(data: PropertyFormData) {
    setIsSubmitting(true)
    setValuationError(null)
    setCurrentFormData(data)
    try {
      const result = await submitValuation(data)
      setValuationResult(result)
      // Save to audit history ledger
      saveValuationToHistory(data, result)
    } catch (err) {
      setValuationError(
        err instanceof Error ? err.message : 'An unexpected error occurred during valuation.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSelectHistoryEntry(entry: ValuationHistoryEntry) {
    setCurrentFormData(entry.formData)
    setValuationResult(entry.result)
    setValuationError(null)
    handleNavChange('valuation')
  }

  function handleSelectCityForValuation(cityName: string) {
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
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-black font-body">
      {/* 00. Ambient Cinematic HLS Waves Background */}
      <BackgroundWaves />

      {/* 01. Fixed Navigation Rail (88px width, no flex shrink) */}
      <Sidebar activeNav={activeNav} onNavChange={handleNavChange} />

      {/* 02. Main Workspace Layout */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Sticky Header (72px height) */}
        <Header
          activeNav={activeNav}
          modelStatus={modelStatus}
          health={health}
          onNewValuation={() => handleNavChange('valuation')}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto w-full">
            {activeNav === 'overview' && (
              <OverviewPanel
                health={health}
                modelStatus={modelStatus}
                onNavigateToValuation={() => handleNavChange('valuation')}
              />
            )}

            {activeNav === 'valuation' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
                {/* Form Column (5 cols) */}
                <div className="lg:col-span-5 liquid-glass-panel rounded-2xl p-7">
                  <PropertyForm
                    onSubmit={handleValuationSubmit}
                    locations={locations}
                    isSubmitting={isSubmitting}
                    initialValues={currentFormData}
                  />
                </div>

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
