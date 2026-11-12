import type {
  HealthResponse,
  LocationsResponse,
  PropertyFormData,
  ValuationResult,
  CityMarketData,
} from '@/types'

const RAW_API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').trim()
// Strip trailing slashes and any trailing '/api' so callers passing '/api/...' never produce '/api/api/...'
const API_BASE = RAW_API_BASE.replace(/\/+$/, '').replace(/\/api$/i, '')

// ============================================================
// APIError — typed error class
// ============================================================

export class APIError extends Error {
  public readonly status: number
  public readonly endpoint: string

  constructor(message: string, status: number, endpoint: string) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.endpoint = endpoint
  }
}

// ============================================================
// Client Cache & Request Deduplication Utilities
// ============================================================

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()
const inflightRequests = new Map<string, Promise<unknown>>()
const valuationResultCache = new Map<string, ValuationResult>()

const MAX_VALUATION_CACHE = 25

function readSessionCache<T>(storageKey: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry<T>
    if (parsed && typeof parsed.expiresAt === 'number' && parsed.expiresAt > Date.now()) {
      return parsed.data
    }
    window.sessionStorage.removeItem(storageKey)
  } catch {
    // ignore storage quota / privacy mode failures
  }
  return null
}

function writeSessionCache<T>(storageKey: string, data: T, ttlMs: number): void {
  if (typeof window === 'undefined') return
  try {
    const payload: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs }
    window.sessionStorage.setItem(storageKey, JSON.stringify(payload))
  } catch {
    // ignore storage failures
  }
}

function cachedGet<T>(
  key: string,
  path: string,
  ttlMs: number,
  storageKey?: string,
): Promise<T> {
  const now = Date.now()
  const mem = memoryCache.get(key) as CacheEntry<T> | undefined
  if (mem && mem.expiresAt > now) {
    return Promise.resolve(mem.data)
  }

  if (storageKey) {
    const stored = readSessionCache<T>(storageKey)
    if (stored !== null) {
      memoryCache.set(key, { data: stored, expiresAt: now + ttlMs })
      return Promise.resolve(stored)
    }
  }

  const existing = inflightRequests.get(key) as Promise<T> | undefined
  if (existing) {
    return existing
  }

  const req = apiFetch<T>(path)
    .then((data) => {
      memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs })
      if (storageKey) {
        writeSessionCache(storageKey, data, ttlMs)
      }
      return data
    })
    .finally(() => {
      inflightRequests.delete(key)
    })

  inflightRequests.set(key, req)
  return req
}

// ============================================================
// Internal helper
// ============================================================

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`
  let response: Response

  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new APIError(
      `Network error — could not reach ${url}. Is the backend running?`,
      0,
      path,
    )
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      if (body?.detail) detail = body.detail
    } catch {
      // ignore JSON parse failure
    }
    throw new APIError(
      `API error ${response.status}: ${detail}`,
      response.status,
      path,
    )
  }

  return response.json() as Promise<T>
}

// ============================================================
// Public API functions (Cached + Deduplicated)
// ============================================================

/** GET /api/health (deduplicated with 4s micro-cache) */
export async function fetchHealth(): Promise<HealthResponse> {
  return cachedGet<HealthResponse>('health', '/api/health', 4_000)
}

/** GET /api/meta/locations (cached in memory + sessionStorage for 30m) */
export async function fetchLocations(): Promise<LocationsResponse> {
  return cachedGet<LocationsResponse>(
    'locations',
    '/api/meta/locations',
    30 * 60_000,
    'nestor_cache_locations_v1',
  )
}

/** GET /api/market/trends (cached in memory + sessionStorage for 10m) */
export async function fetchMarketTrends(): Promise<CityMarketData[]> {
  return cachedGet<CityMarketData[]>(
    'market_trends',
    '/api/market/trends',
    10 * 60_000,
    'nestor_cache_market_v1',
  )
}

/** POST /api/valuation (deterministic payload LRU cache + in-flight deduplication) */
export async function submitValuation(
  data: PropertyFormData,
): Promise<ValuationResult> {
  const cacheKey = JSON.stringify({
    city: data.city,
    property_type: data.property_type,
    carpet_area: Number(data.carpet_area),
    super_builtup_area: Number(data.super_builtup_area),
    bhk: Number(data.bhk),
    bathrooms: Number(data.bathrooms),
    balconies: Number(data.balconies),
    floor_number: Number(data.floor_number),
    total_floors: Number(data.total_floors),
    property_age: Number(data.property_age),
    furnishing_status: data.furnishing_status,
    parking: Boolean(data.parking),
    ownership_type: data.ownership_type,
  })

  const cached = valuationResultCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const inflightKey = `valuation:${cacheKey}`
  const existing = inflightRequests.get(inflightKey) as Promise<ValuationResult> | undefined
  if (existing) {
    return existing
  }

  const req = apiFetch<ValuationResult>('/api/valuation', {
    method: 'POST',
    body: JSON.stringify(data),
  })
    .then((result) => {
      if (valuationResultCache.size >= MAX_VALUATION_CACHE) {
        const oldestKey = valuationResultCache.keys().next().value
        if (oldestKey) valuationResultCache.delete(oldestKey)
      }
      valuationResultCache.set(cacheKey, result)
      return result
    })
    .finally(() => {
      inflightRequests.delete(inflightKey)
    })

  inflightRequests.set(inflightKey, req)
  return req
}
