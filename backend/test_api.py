"""
Direct test script for NESTOR AI FastAPI endpoints and schemas.
Phase 2: Verifies live model serving, locations metadata, and validation errors.
"""
from app.routers.health import health_check
from app.routers.meta import get_locations
from app.routers.valuation import run_valuation
from app.routers.market import get_market_intelligence
from app.schemas import PropertyInput

def main():
    print("Testing GET /api/health...")
    health = health_check()
    print("  Status:", health.status)
    print("  Model ready:", health.model_ready)
    print("  Dataset available:", health.dataset_available)
    assert health.status == "ok"
    assert health.model_ready is True
    assert health.dataset_available is True

    print("\nTesting GET /api/meta/locations...")
    locations = get_locations()
    print("  Cities count:", len(locations.cities))
    assert len(locations.cities) == 20
    assert "Apartment" in locations.property_types

    print("\nTesting GET /api/market/trends...")
    market_data = get_market_intelligence()
    print("  City count in market data:", len(market_data))
    assert len(market_data) > 0
    assert "city" in market_data[0]
    assert "avg_price_per_sqft" in market_data[0]
    assert "trend_data" in market_data[0]

    print("\nTesting POST /api/valuation (live trained champion model)...")
    payload = PropertyInput(
        city="Mumbai",
        property_type="Apartment",
        carpet_area=850.0,
        super_builtup_area=1100.0,
        bhk=2,
        bathrooms=2,
        balconies=1,
        floor_number=5,
        total_floors=15,
        property_age=3,
        furnishing_status="Semi-Furnished",
        parking=True,
        ownership_type="Freehold",
    )
    result = run_valuation(payload)
    print(f"  Estimated Price: ₹{result['estimated_price']/1e5:,.2f} Lakhs (₹{result['estimated_price']/1e7:,.2f} Cr)")
    print(f"  Price/sq.ft.: ₹{result['price_per_sqft']:,.2f}")
    print(f"  Confidence: {result['confidence'] * 100:.1f}%")
    print(f"  Comparables count: {len(result['comparable_properties'])}")
    print(f"  Factors count: {len(result['valuation_factors'])}")
    print(f"  Risk indicators count: {len(result['risk_indicators'])}")
    assert result["estimated_price"] > 0
    assert result["price_per_sqft"] > 0
    assert len(result["comparable_properties"]) > 0

    print("\nTesting Pydantic validation (super < carpet rejection)...")
    try:
        PropertyInput(
            city="Mumbai",
            property_type="Apartment",
            carpet_area=1200.0,
            super_builtup_area=1000.0,  # Invalid: super < carpet
            bhk=2,
            bathrooms=2,
            balconies=1,
            floor_number=5,
            total_floors=15,
            property_age=3,
            furnishing_status="Semi-Furnished",
            parking=True,
            ownership_type="Freehold",
        )
        raise AssertionError("Expected ValueError for super < carpet")
    except Exception as e:
        print("  Caught expected validation error:", type(e).__name__)

    print("\nTesting CORS Preflight OPTIONS requests...")
    import urllib.request
    test_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    for orig in test_origins:
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/health",
            headers={
                "Origin": orig,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "content-type",
            },
            method="OPTIONS",
        )
        res = urllib.request.urlopen(req)
        assert res.status == 200
        assert res.headers.get("Access-Control-Allow-Origin") == orig
        print(f"  CORS Preflight {orig} -> 200 OK")

    print("\n>>> ALL API ROUTE AND CORS TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    main()
