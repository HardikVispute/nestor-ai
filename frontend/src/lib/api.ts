import type {
  HealthResponse,
  LocationsResponse,
  PropertyFormData,
  ValuationResult,
  CityMarketData,
} from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

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
  } catch (err) {
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
// Public API functions
// ============================================================

/** GET /api/health */
export async function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/api/health')
}

/** GET /api/meta/locations */
export async function fetchLocations(): Promise<LocationsResponse> {
  return apiFetch<LocationsResponse>('/api/meta/locations')
}

/** GET /api/market/trends */
export async function fetchMarketTrends(): Promise<CityMarketData[]> {
  return apiFetch<CityMarketData[]>('/api/market/trends')
}

/** POST /api/valuation */
export async function submitValuation(
  data: PropertyFormData,
): Promise<ValuationResult> {
  return apiFetch<ValuationResult>('/api/valuation', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
