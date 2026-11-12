'use client'

import React, { useState, useEffect } from 'react'
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
import type { PropertyFormData, ValuationResult } from '@/types'

export interface ValuationHistoryEntry {
  id: string
  timestamp: string
  formData: PropertyFormData
  result: ValuationResult
}

const STORAGE_KEY = 'nestor_valuation_history'

export function saveValuationToHistory(
  formData: PropertyFormData,
  result: ValuationResult,
): ValuationHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const existing: ValuationHistoryEntry[] = raw ? JSON.parse(raw) : []
    const newEntry: ValuationHistoryEntry = {
      id: `VAL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      formData,
      result,
    }
    const updated = [newEntry, ...existing].slice(0, 50) // keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

export function loadValuationHistory(): ValuationHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

interface ValuationHistoryPanelProps {
  onSelectEntry: (entry: ValuationHistoryEntry) => void
  onNewValuation: () => void
}

export default function ValuationHistoryPanel({
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
      localStorage.removeItem(STORAGE_KEY)
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
  const filtered = history.filter((item) => {
    const matchesCity =
      selectedCity === 'all' || item.formData.city.toLowerCase() === selectedCity.toLowerCase()
    const matchesSearch =
      searchQuery === '' ||
      item.formData.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formData.property_type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCity && matchesSearch
  })

  const uniqueCities = Array.from(new Set(history.map((h) => h.formData.city)))

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Banner */}
      <div className="liquid-glass-panel rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-red-500/15 text-[var(--color-danger)] border border-red-500/25 hover:bg-red-500/25 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            </>
          )}

          <button
            onClick={onNewValuation}
            className="solid-white-btn rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-semibold gap-2 cursor-pointer"
          >
            <Calculator size={15} />
            <span>New Valuation</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="liquid-glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by ID, city, or property type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/15 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {uniqueCities.length > 0 && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Filter size={15} className="text-white/40" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-black/60 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="all">All Cities ({history.length})</option>
              {uniqueCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table / Empty State */}
      {history.length === 0 ? (
        <div className="liquid-glass-panel rounded-2xl p-14 text-center flex flex-col items-center justify-center">
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/20 text-[var(--color-accent)] mb-4">
            <History size={32} />
          </div>
          <h3 className="text-xl font-bold font-heading text-white">
            No Valuation Records Yet
          </h3>
          <p className="text-sm font-body text-white/60 max-w-sm mt-1.5 mb-6 leading-relaxed">
            Run your first property valuation in the workspace. All estimations and comparative
            metrics are automatically persisted to this audit ledger.
          </p>
          <button
            onClick={onNewValuation}
            className="solid-white-btn rounded-2xl px-6 py-3 text-sm font-semibold gap-2 cursor-pointer"
          >
            <span>Run First Valuation</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="liquid-glass-panel rounded-2xl p-10 text-center text-sm text-white/50">
          No records matching the filter criteria.
        </div>
      ) : (
        <div className="liquid-glass-panel rounded-2xl overflow-hidden">
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
                      <span className="inline-block px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-[rgba(39,215,174,0.12)] text-[var(--color-accent)] border border-[rgba(39,215,174,0.25)]">
                        {formatConfidence(item.result.confidence)}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onSelectEntry(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 border border-white/20 text-white hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

