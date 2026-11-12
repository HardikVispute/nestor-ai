'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchHealth } from '@/lib/api'
import type { HealthResponse, ModelStatus } from '@/types'

const POLL_INTERVAL_MS = 60_000

interface UseHealthReturn {
  health: HealthResponse | null
  status: ModelStatus
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useHealth(): UseHealthReturn {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [status, setStatus] = useState<ModelStatus>('loading')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inFlightRef = useRef(false)
  const hasHealthRef = useRef(false)
  const lastFetchedAtRef = useRef(0)

  const doFetch = useCallback(async (force = false) => {
    if (inFlightRef.current) return
    if (!force && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return
    }

    inFlightRef.current = true
    if (!hasHealthRef.current) {
      setLoading(true)
    }

    try {
      const data = await fetchHealth()
      hasHealthRef.current = true
      lastFetchedAtRef.current = Date.now()
      setError(null)
      setStatus((prev) => {
        const next: ModelStatus = data.model_ready ? 'ready' : 'not_ready'
        return prev === next ? prev : next
      })
      // Preserve existing object reference when core health status hasn't changed
      setHealth((prev) => {
        if (
          prev &&
          prev.status === data.status &&
          prev.model_ready === data.model_ready &&
          prev.dataset_available === data.dataset_available
        ) {
          return prev
        }
        return data
      })
    } catch (err) {
      hasHealthRef.current = false
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError((prev) => (prev === message ? prev : message))
      setStatus((prev) => (prev === 'error' ? prev : 'error'))
      setHealth(null)
    } finally {
      inFlightRef.current = false
      setLoading(false)
    }
  }, [])

  // Initial fetch & visibility-aware polling
  useEffect(() => {
    doFetch(true)

    let timer: ReturnType<typeof setInterval> | null = null

    const startTimer = () => {
      if (timer) clearInterval(timer)
      timer = setInterval(() => {
        doFetch(false)
      }, POLL_INTERVAL_MS)
    }

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastFetchedAtRef.current >= POLL_INTERVAL_MS) {
          doFetch(true)
        }
        startTimer()
      } else {
        stopTimer()
      }
    }

    if (typeof document === 'undefined' || document.visibilityState === 'visible') {
      startTimer()
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility)
    }

    return () => {
      stopTimer()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    }
  }, [doFetch])

  const refetch = useCallback(() => {
    doFetch(true)
  }, [doFetch])

  return { health, status, loading, error, refetch }
}
