"""Pydantic schemas for NESTOR AI API."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
import datetime


class PropertyInput(BaseModel):
    city: str = Field(..., description="City where the property is located")
    property_type: str = Field(..., description="Type of property")
    carpet_area: float = Field(..., ge=100, le=50000, description="Carpet area in sq.ft.")
    super_builtup_area: float = Field(..., ge=100, le=60000, description="Super built-up area in sq.ft.")
    bhk: int = Field(..., ge=1, le=10, description="Number of bedrooms")
    bathrooms: int = Field(..., ge=1, le=10, description="Number of bathrooms")
    balconies: int = Field(..., ge=0, le=5, description="Number of balconies")
    floor_number: int = Field(..., ge=0, le=100, description="Floor number (0 = Ground)")
    total_floors: int = Field(..., ge=1, le=100, description="Total floors in building")
    property_age: int = Field(..., ge=0, le=100, description="Property age in years")
    furnishing_status: str = Field(..., description="Furnishing status")
    parking: bool = Field(default=False, description="Parking availability")
    ownership_type: str = Field(..., description="Ownership type")

    @field_validator("super_builtup_area")
    @classmethod
    def super_must_be_gte_carpet(cls, v, info):
        if "carpet_area" in info.data and v < info.data["carpet_area"]:
            raise ValueError("Super built-up area must be >= carpet area")
        return v


class ComparableProperty(BaseModel):
    id: str
    city: str
    locality: str
    bhk: int
    carpet_area: float
    price: float
    price_per_sqft: float
    property_age: int
    furnishing_status: str
    similarity_score: float


class ValuationFactor(BaseModel):
    feature: str
    impact: float
    direction: Literal["positive", "negative", "neutral"]
    description: str


class RiskIndicator(BaseModel):
    label: str
    level: Literal["low", "medium", "high"]
    description: str


class PredictionInterval(BaseModel):
    lower: float
    upper: float


class ValuationResponse(BaseModel):
    estimated_price: float
    price_per_sqft: float
    confidence: float
    prediction_interval: PredictionInterval
    comparable_properties: list[ComparableProperty]
    valuation_factors: list[ValuationFactor]
    risk_indicators: list[RiskIndicator]
    model_version: str
    timestamp: str


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    model_ready: bool
    dataset_available: bool
    model_path: Optional[str]
    dataset_path: Optional[str]
    timestamp: str


class LocationsResponse(BaseModel):
    cities: list[str]
    property_types: list[str]
    furnishing_statuses: list[str]
    ownership_types: list[str]


class ModelNotReadyError(BaseModel):
    message: str
    model_path: Optional[str]
    hint: str
