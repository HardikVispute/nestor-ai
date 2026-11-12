'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchHealth } from '@/lib/api'
import type { HealthResponse, ModelStatus } from '@/types'

const POLL_INTERVAL_MS = 30_000

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

  const doFetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHealth()
      setHealth(data)
      setStatus(data.model_ready ? 'ready' : 'not_ready')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setStatus('error')
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    doFetch()
  }, [doFetch])

  // Polling
  useEffect(() => {
    const timer = setInterval(doFetch, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [doFetch])

  return { health, status, loading, error, refetch: doFetch }
}
