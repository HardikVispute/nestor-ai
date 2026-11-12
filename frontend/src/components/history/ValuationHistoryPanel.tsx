'use client'

import React, { memo, useMemo, useState, useEffect } from 'react'
import {
  History,
  Trash2,
  Download,
  ArrowUpRight,
  Calculator,
  Search,
  Filter,
} from 'lucide-react'
import { formatCurrency, formatPricePerSqft, formatConfidence } from '@/lib/formatters'
import { LiquidGlass, LiquidGlassButton, LiquidGlassSelect } from '@/components/ui/liquid-glass'
import {
  saveValuationToHistory,
  loadValuationHistory,
  clearValuationHistory,
  type ValuationHistoryEntry,
} from '@/lib/historyStorage'

export { saveValuationToHistory, loadValuationHistory, type ValuationHistoryEntry }

interface ValuationHistoryPanelProps {
  onSelectEntry: (entry: ValuationHistoryEntry) => void
  onNewValuation: () => void
}

function ValuationHistoryPanel({
  onSelectEntry,
  onNewValuation,
}: ValuationHistoryPanelProps) {
  const [history, setHistory] = useState<ValuationHistoryEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')

  useEffect(() => {
    setHistory(loadValuationHistory())
  }, [])

  function handleClearHistory() {
    if (window.confirm('Are you sure you want to clear all valuation history records?')) {
      clearValuationHistory()
      setHistory([])
    }
  }

  function handleExportCSV() {
    if (history.length === 0) return
    const headers = [
      'Valuation ID',
      'Timestamp',
      'City',
      'Property Type',
      'BHK',
      'Carpet Area (sqft)',
      'Estimated Price (INR)',
      'Price Per Sqft (INR)',
      'Confidence (%)',
    ]
    const rows = history.map((item) => [
      item.id,
      item.timestamp,
      item.formData.city,
      item.formData.property_type,
      item.formData.bhk,
      item.formData.carpet_area,
      item.result.estimated_price,
      item.result.price_per_sqft,
      Math.round(item.result.confidence * 100),
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `nestor_valuation_audit_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter
  const filtered = useMemo(() => {
    const queryLower = searchQuery.toLowerCase()
    const cityLower = selectedCity.toLowerCase()
    return history.filter((item) => {
      const matchesCity =
        selectedCity === 'all' || item.formData.city.toLowerCase() === cityLower
      const matchesSearch =
        queryLower === '' ||
        item.formData.city.toLowerCase().includes(queryLower) ||
        item.id.toLowerCase().includes(queryLower) ||
        item.formData.property_type.toLowerCase().includes(queryLower)
      return matchesCity && matchesSearch
    })
  }, [history, searchQuery, selectedCity])

  const uniqueCities = useMemo(
    () => Array.from(new Set(history.map((h) => h.formData.city))),
    [history],
  )

  return (
    <div className="space-y-6 pb-12 animate-panel-enter">
      {/* Top Controls Banner */}
      <LiquidGlass
        radius={32}
        scale={48}
        aberration={14}
        bevelDepth={30}
        frost={0.36}
        tint={0.06}
        className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-3">
            <History size={22} className="text-[var(--color-accent)]" />
            Valuation Audit Trail
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Audit history of property valuation inferences, calibrated bounds, and model predictions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <>
              <LiquidGlassButton
                onClick={handleExportCSV}
                radius={999}
                scale={40}
                aberration={12}
                bevelDepth={14}
                frost={0.32}
                tint={0.1}
                glassClassName="px-4 py-2.5 text-xs font-semibold"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </LiquidGlassButton>
              <LiquidGlassButton
                onClick={handleClearHistory}
                radius={999}
                scale={40}
                aberration={12}
                bevelDepth={14}
                frost={0.32}
                tint={0.08}
                glassClassName="px-4 py-2.5 text-xs font-semibold !bg-red-500/15 text-[var(--color-danger)] !border-red-500/30 hover:!border-red-400/60"
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </LiquidGlassButton>
            </>
          )}

          <LiquidGlassButton
            onClick={onNewValuation}
            radius={999}
            scale={38}
            aberration={12}
            bevelDepth={14}
            frost={0.44}
            tint={0.2}
            glassClassName="px-5 py-2.5 text-xs sm:text-sm font-semibold !border-white/50 text-white"
          >
            <Calculator size={15} />
            <span>New Valuation</span>
          </LiquidGlassButton>
        </div>
      </LiquidGlass>

      {/* Filter and Search Bar */}
      <LiquidGlass
        radius={999}
        scale={44}
        aberration={13}
        bevelDepth={26}
        frost={0.36}
        tint={0.055}
        className="p-4 sm:px-5 flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by ID, city, or property type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/25 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/55 backdrop-blur-md"
          />
        </div>

        {uniqueCities.length > 0 && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto min-w-[180px]">
            <Filter size={15} className="text-white/40 flex-shrink-0" />
            <LiquidGlassSelect
              ariaLabel="Filter by city"
              value={selectedCity}
              onChange={(val) => setSelectedCity(val)}
              options={[
                { value: 'all', label: `All Cities (${history.length})` },
                ...uniqueCities.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>
        )}
      </LiquidGlass>

      {/* Table / Empty State */}
      {history.length === 0 ? (
        <LiquidGlass
          radius={32}
          scale={52}
          aberration={16}
          bevelDepth={34}
          frost={0.36}
          tint={0.065}
          className="p-14 text-center flex flex-col items-center justify-center"
        >
          <div className="p-4 rounded-full bg-white/[0.05] border border-white/20 text-[var(--color-accent)] mb-4">
            <History size={32} />
          </div>
          <h3 className="text-xl font-bold font-heading text-white">
            No Valuation Records Yet
          </h3>
          <p className="text-sm font-body text-white/60 max-w-sm mt-1.5 mb-6 leading-relaxed">
            Run your first property valuation in the workspace. All estimations and comparative
            metrics are automatically persisted to this audit ledger.
          </p>
          <LiquidGlassButton
            onClick={onNewValuation}
            radius={999}
            scale={40}
            aberration={12}
            bevelDepth={14}
            frost={0.44}
            tint={0.2}
            glassClassName="px-6 py-3 text-sm font-semibold !border-white/50 text-white"
          >
            <span>Run First Valuation</span>
            <ArrowUpRight size={16} />
          </LiquidGlassButton>
        </LiquidGlass>
      ) : filtered.length === 0 ? (
        <LiquidGlass
          radius={32}
          scale={44}
          aberration={13}
          bevelDepth={28}
          frost={0.36}
          tint={0.055}
          className="p-10 text-center text-sm text-white/50"
        >
          No records matching the filter criteria.
        </LiquidGlass>
      ) : (
        <LiquidGlass
          radius={32}
          scale={48}
          aberration={14}
          bevelDepth={32}
          frost={0.36}
          tint={0.06}
          className=""
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="py-3.5 px-5 font-mono font-medium uppercase text-xs text-white/50">
                    Audit ID & Date
                  </th>
                  <th className="py-3.5 px-5 font-mono font-medium uppercase text-xs text-white/50">
                    Property Spec
                  </th>
                  <th className="py-3.5 px-5 font-mono font-medium uppercase text-xs text-white/50 text-right">
                    Carpet Area
                  </th>
                  <th className="py-3.5 px-5 font-mono font-medium uppercase text-xs text-white/50 text-right">
                    Estimated Price
                  </th>
                  <th className="py-3.5 px-5 font-mono font-medium uppercase text-xs text-white/50 text-right">
                    Price / Sq.Ft.
                  </th>
                  <th className="py-3.5 px-5 font-mono font-medium uppercase text-xs text-white/50 text-center">
                    Confidence
                  </th>
                  <th className="py-3.5 px-5 font-mono font-medium uppercase text-xs text-white/50 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-mono font-semibold text-white">
                        {item.id}
                      </div>
                      <div className="text-xs text-white/40 font-mono mt-0.5">
                        {new Date(item.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white">
                        {item.formData.city}
                      </div>
                      <div className="text-xs text-white/70">
                        {item.formData.bhk} BHK {item.formData.property_type} · Floor{' '}
                        {item.formData.floor_number}/{item.formData.total_floors}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right tabular-nums text-white/80">
                      {item.formData.carpet_area.toLocaleString('en-IN')} sq.ft.
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="font-bold tabular-nums text-[var(--color-accent)] text-base font-heading">
                        {formatCurrency(item.result.estimated_price)}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right tabular-nums text-white/80 font-mono">
                      {formatPricePerSqft(item.result.price_per_sqft)}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[rgba(39,215,174,0.12)] text-[var(--color-accent)] border border-[rgba(39,215,174,0.25)]">
                        {formatConfidence(item.result.confidence)}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <LiquidGlassButton
                        onClick={() => onSelectEntry(item)}
                        radius={999}
                        scale={36}
                        aberration={12}
                        bevelDepth={12}
                        frost={0.3}
                        tint={0.1}
                        glassClassName="px-3.5 py-1.5 text-xs font-semibold hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight size={13} />
                      </LiquidGlassButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LiquidGlass>
      )}
    </div>
  )
}

export default memo(ValuationHistoryPanel)

