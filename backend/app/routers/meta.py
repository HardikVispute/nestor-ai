"""Metadata router — locations, enumerations."""
from fastapi import APIRouter
from app.schemas import LocationsResponse

router = APIRouter(tags=["Metadata"])

CITIES = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai",
    "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal",
    "Patna", "Vadodara", "Ludhiana", "Agra", "Nashik",
]

PROPERTY_TYPES = ["Apartment", "Villa", "Independent House", "Penthouse", "Studio"]

FURNISHING_STATUSES = ["Furnished", "Semi-Furnished", "Unfurnished"]

OWNERSHIP_TYPES = [
    "Freehold",
    "Leasehold",
    "Co-operative Society",
    "Power of Attorney",
]

@router.get("/locations", response_model=LocationsResponse)
def get_locations():
    return LocationsResponse(
        cities=CITIES,
        property_types=PROPERTY_TYPES,
        furnishing_statuses=FURNISHING_STATUSES,
        ownership_types=OWNERSHIP_TYPES,
    )
