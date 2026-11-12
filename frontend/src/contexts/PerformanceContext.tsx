'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type ExperienceMode = 'full' | 'performance'

interface PerformanceContextValue {
  mode: ExperienceMode
  setMode: (next: ExperienceMode) => void
  toggleMode: () => void
  isLightweight: boolean
}

const STORAGE_KEY = 'nestor_experience_mode'

const PerformanceContext = createContext<PerformanceContextValue>({
  mode: 'full',
  setMode: () => {},
  toggleMode: () => {},
  isLightweight: false,
})

export function PerformanceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Always default to Full FX — never silently downgrade on load
  const [mode, setModeState] = useState<ExperienceMode>('full')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === 'performance' || saved === 'full') {
        setModeState(saved)
      }
    } catch {
      // Ignore storage failures
    }
  }, [])

  const isLightweight = mode === 'performance'

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('performance-mode', isLightweight)
  }, [isLightweight])

  const setMode = useCallback((next: ExperienceMode) => {
    setModeState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore storage failures
    }
  }, [])

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: ExperienceMode = prev === 'full' ? 'performance' : 'full'
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Ignore storage failures
      }
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      isLightweight,
    }),
    [mode, setMode, toggleMode, isLightweight],
  )

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformanceMode(): PerformanceContextValue {
  return useContext(PerformanceContext)
}
