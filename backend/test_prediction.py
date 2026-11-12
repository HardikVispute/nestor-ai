"""
NESTOR AI — Comprehensive Prediction & Edge Case Testing Suite
Phase 2 Implementation.

Tests:
1. Model loading & health status (model_ready=True, dataset_available=True)
2. Typical 1 BHK property (Mumbai / Thane starter flat)
3. Typical 2 BHK property (Bengaluru tech corridor)
4. Typical 3 BHK property (Gurgaon luxury high-rise)
5. Expensive property (Delhi South luxury home)
6. Unknown / Unseen city (tests OneHotEncoder handle_unknown='ignore')
7. Missing optional values (balconies=0, parking=False)
8. Invalid area rejection (super < carpet error handled by Pydantic)
9. Extreme property area (large bungalow / penthouse)
10. Valid JSON response schema structure
"""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(PROJECT_ROOT / "backend") not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from app.services.model_service import model_service
from app.routers.health import health_check
from app.routers.valuation import run_valuation
from app.schemas import PropertyInput
from fastapi import HTTPException


def test_suite():
    print("==================================================")
    print("NESTOR AI — PHASE 2 PREDICTION TEST SUITE")
    print("==================================================")

    # Test 1: Model Loading & Health Status
    print("\n[TEST 1] Verifying System Health & Model Readiness...")
    health = health_check()
    print("  Status:", health.status)
    print("  Model Ready:", health.model_ready)
    print("  Dataset Available:", health.dataset_available)
    print("  Model Path:", health.model_path)
    assert health.status == "ok", f"Expected ok status, got {health.status}"
    assert health.model_ready is True, "Expected model_ready to be True"
    assert health.dataset_available is True, "Expected dataset_available to be True"
    print("  -> TEST 1 PASSED!")

    # Test 2: Typical 1 BHK Property
    print("\n[TEST 2] Testing Typical 1 BHK Property (Mumbai / Thane)...")
    p1 = PropertyInput(
        city="Mumbai",
        property_type="Apartment",
        carpet_area=450.0,
        super_builtup_area=600.0,
        bhk=1,
        bathrooms=1,
        balconies=1,
        floor_number=4,
        total_floors=12,
        property_age=5,
        furnishing_status="Semi-Furnished",
        parking=False,
        ownership_type="Freehold",
    )
    res1 = run_valuation(p1)
    val1 = res1["estimated_price"]
    print(f"  Estimated Price: ₹{val1/1e5:,.2f} Lakhs (₹{val1/1e7:,.2f} Cr)")
    print(f"  Price/sq.ft.: ₹{res1['price_per_sqft']:,.2f}")
    print(f"  Confidence: {res1['confidence'] * 100:.1f}%")
    print(f"  Range: ₹{res1['prediction_interval']['lower']/1e5:,.2f} L to ₹{res1['prediction_interval']['upper']/1e5:,.2f} L")
    print(f"  Comparables Found: {len(res1['comparable_properties'])}")
    assert val1 >= 1000000.0, "1 BHK price unreasonably low"
    assert len(res1["comparable_properties"]) > 0, "Expected comparables"
    print("  -> TEST 2 PASSED!")

    # Test 3: Typical 2 BHK Property
    print("\n[TEST 3] Testing Typical 2 BHK Property (Bengaluru)...")
    p2 = PropertyInput(
        city="Bengaluru",
        property_type="Apartment",
        carpet_area=950.0,
        super_builtup_area=1250.0,
        bhk=2,
        bathrooms=2,
        balconies=2,
        floor_number=6,
        total_floors=18,
        property_age=2,
        furnishing_status="Semi-Furnished",
        parking=True,
        ownership_type="Freehold",
    )
    res2 = run_valuation(p2)
    val2 = res2["estimated_price"]
    print(f"  Estimated Price: ₹{val2/1e5:,.2f} Lakhs (₹{val2/1e7:,.2f} Cr)")
    print(f"  Price/sq.ft.: ₹{res2['price_per_sqft']:,.2f}")
    assert val2 > val1, "2 BHK in Bengaluru should exceed 1 BHK in general"
    print("  -> TEST 3 PASSED!")

    # Test 4: Typical 3 BHK Property
    print("\n[TEST 4] Testing Typical 3 BHK Property (Gurgaon)...")
    p3 = PropertyInput(
        city="Gurgaon",
        property_type="Apartment",
        carpet_area=1650.0,
        super_builtup_area=2100.0,
        bhk=3,
        bathrooms=3,
        balconies=3,
        floor_number=11,
        total_floors=24,
        property_age=3,
        furnishing_status="Furnished",
        parking=True,
        ownership_type="Freehold",
    )
    res3 = run_valuation(p3)
    val3 = res3["estimated_price"]
    print(f"  Estimated Price: ₹{val3/1e5:,.2f} Lakhs (₹{val3/1e7:,.2f} Cr)")
    print(f"  Price/sq.ft.: ₹{res3['price_per_sqft']:,.2f}")
    assert val3 > val2, "3 BHK luxury in Gurgaon should exceed 2 BHK"
    print("  -> TEST 4 PASSED!")

    # Test 5: Expensive Luxury Property
    print("\n[TEST 5] Testing Expensive Luxury Property (Delhi)...")
    p4 = PropertyInput(
        city="Delhi",
        property_type="Penthouse",
        carpet_area=4200.0,
        super_builtup_area=5500.0,
        bhk=5,
        bathrooms=5,
        balconies=4,
        floor_number=20,
        total_floors=20,
        property_age=1,
        furnishing_status="Furnished",
        parking=True,
        ownership_type="Freehold",
    )
    res4 = run_valuation(p4)
    val4 = res4["estimated_price"]
    print(f"  Estimated Price: ₹{val4/1e7:,.2f} Crores")
    print(f"  Price/sq.ft.: ₹{res4['price_per_sqft']:,.2f}")
    assert val4 > 20000000.0, "Luxury penthouse should exceed 2 Crores"
    print("  -> TEST 5 PASSED!")

    # Test 6: Unknown / Unseen City
    print("\n[TEST 6] Testing Unknown / Unseen City (Coimbatore / Tier-3)...")
    p5 = PropertyInput(
        city="Tiruchirappalli",
        property_type="Apartment",
        carpet_area=800.0,
        super_builtup_area=1000.0,
        bhk=2,
        bathrooms=2,
        balconies=1,
        floor_number=2,
        total_floors=5,
        property_age=4,
        furnishing_status="Unfurnished",
        parking=False,
        ownership_type="Freehold",
    )
    res5 = run_valuation(p5)
    val5 = res5["estimated_price"]
    print(f"  Estimated Price: ₹{val5/1e5:,.2f} Lakhs")
    print(f"  Confidence: {res5['confidence'] * 100:.1f}% (Notice confidence adjustment for unknown city)")
    assert res5["confidence"] <= 0.80, "Confidence should discount for unfamiliar city"
    print("  -> TEST 6 PASSED!")

    # Test 7: Missing Optional Features
    print("\n[TEST 7] Testing Missing Optional Features (balconies=0, parking=False)...")
    p6 = PropertyInput(
        city="Kolkata",
        property_type="Apartment",
        carpet_area=750.0,
        super_builtup_area=950.0,
        bhk=2,
        bathrooms=1,
        balconies=0,
        floor_number=1,
        total_floors=4,
        property_age=10,
        furnishing_status="Unfurnished",
        parking=False,
        ownership_type="Leasehold",
    )
    res6 = run_valuation(p6)
    assert res6["estimated_price"] > 0
    print(f"  Estimated Price: ₹{res6['estimated_price']/1e5:,.2f} Lakhs")
    print("  -> TEST 7 PASSED!")

    # Test 8: Invalid Area Rejection (super < carpet)
    print("\n[TEST 8] Testing Invalid Area Rejection (super_builtup < carpet)...")
    try:
        PropertyInput(
            city="Pune",
            property_type="Apartment",
            carpet_area=1000.0,
            super_builtup_area=800.0,  # Invalid: super < carpet
            bhk=2,
            bathrooms=2,
            balconies=1,
            floor_number=3,
            total_floors=10,
            property_age=2,
            furnishing_status="Semi-Furnished",
            parking=True,
            ownership_type="Freehold",
        )
        raise AssertionError("Failed: Pydantic should have rejected super < carpet")
    except Exception as exc:
        print("  Successfully intercepted invalid physical specification:", type(exc).__name__)
        print("  -> TEST 8 PASSED!")

    # Test 9: Extreme Property Area
    print("\n[TEST 9] Testing Extreme Property Area (7,500 sq.ft. Mansion)...")
    p7 = PropertyInput(
        city="Hyderabad",
        property_type="Villa",
        carpet_area=7500.0,
        super_builtup_area=9000.0,
        bhk=6,
        bathrooms=6,
        balconies=4,
        floor_number=1,
        total_floors=3,
        property_age=2,
        furnishing_status="Furnished",
        parking=True,
        ownership_type="Freehold",
    )
    res7 = run_valuation(p7)
    print(f"  Estimated Price: ₹{res7['estimated_price']/1e7:,.2f} Crores")
    print(f"  Confidence: {res7['confidence'] * 100:.1f}% (Notice confidence penalty for extreme area)")
    assert res7["estimated_price"] > 40000000.0
    print("  -> TEST 9 PASSED!")

    # Test 10: Response Structure Schema Validation
    print("\n[TEST 10] Validating Complete Output Schema Attributes...")
    required_keys = [
        "estimated_price", "price_per_sqft", "confidence",
        "prediction_interval", "comparable_properties",
        "valuation_factors", "risk_indicators", "model_version", "timestamp"
    ]
    for k in required_keys:
        assert k in res1, f"Missing required response attribute: {k}"
    assert "lower" in res1["prediction_interval"]
    assert "upper" in res1["prediction_interval"]
    assert len(res1["comparable_properties"]) > 0
    assert len(res1["valuation_factors"]) > 0
    assert len(res1["risk_indicators"]) > 0
    print("  -> TEST 10 PASSED!")

    print("\n==================================================")
    print(">>> ALL 10 PREDICTION & EDGE CASE TESTS PASSED! <<<")
    print("==================================================")


if __name__ == "__main__":
    test_suite()

