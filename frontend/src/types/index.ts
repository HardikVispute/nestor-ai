// ============================================================
// NESTOR AI — TypeScript Types
// ============================================================

// API types
export type ModelStatus = 'ready' | 'not_ready' | 'error' | 'loading'

export interface HealthResponse {
  status: 'ok' | 'degraded'
  model_ready: boolean
  dataset_available: boolean
  model_path: string | null
  dataset_path: string | null
  timestamp: string
}

export interface LocationsResponse {
  cities: string[]
  property_types: string[]
  furnishing_statuses: string[]
  ownership_types: string[]
}

export interface PropertyFormData {
  city: string
  property_type: string
  carpet_area: number
  super_builtup_area: number
  bhk: number
  bathrooms: number
  balconies: number
  floor_number: number
  total_floors: number
  property_age: number
  furnishing_status: string
  parking: boolean
  ownership_type: string
}

export interface ComparableProperty {
  id: string
  city: string
  locality: string
  bhk: number
  carpet_area: number
  price: number
  price_per_sqft: number
  property_age: number
  furnishing_status: string
  similarity_score: number
}

export interface ValuationFactor {
  feature: string
  impact: number
  direction: 'positive' | 'negative' | 'neutral'
  description: string
}

export interface RiskIndicator {
  label: string
  level: 'low' | 'medium' | 'high'
  description: string
}

export interface ValuationResult {
  estimated_price: number
  price_per_sqft: number
  confidence: number
  prediction_interval: {
    lower: number
    upper: number
  }
  comparable_properties: ComparableProperty[]
  valuation_factors: ValuationFactor[]
  risk_indicators: RiskIndicator[]
  model_version: string
  timestamp: string
}

export interface MarketTrend {
  month: string
  index: number
  yoy_change: number
}

export interface CityMarketData {
  city: string
  avg_price_per_sqft: number
  median_price: number
  total_listings: number
  price_trend: 'rising' | 'falling' | 'stable'
  trend_data: MarketTrend[]
}

export type NavItem = 'overview' | 'valuation' | 'history' | 'market' | 'methodology'
