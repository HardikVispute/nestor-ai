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
    const updated = [newEntry, ...existing].slice(0, 50)
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

export function clearValuationHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore storage failures
  }
}
