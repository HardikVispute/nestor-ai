import urllib.request
import json

origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
]

endpoints = [
    '/api/health',
    '/api/meta/locations',
    '/api/market/trends',
    '/api/valuation',
]

print("=== 1. TESTING ALL 16 CORS PREFLIGHT (OPTIONS) REQUESTS ===")
for origin in origins:
    for ep in endpoints:
        req = urllib.request.Request(
            f"http://127.0.0.1:8000{ep}",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST" if "valuation" in ep else "GET",
                "Access-Control-Request-Headers": "content-type",
            },
            method="OPTIONS",
        )
        res = urllib.request.urlopen(req)
        assert res.status == 200, f"Expected 200, got {res.status}"
        assert res.headers.get("Access-Control-Allow-Origin") == origin, f"Mismatch in allow-origin"
        assert res.headers.get("Access-Control-Allow-Credentials") == "true", "Missing Allow-Credentials"
        print(f"  [OK] OPTIONS {ep:20} from {origin:22} -> HTTP 200 (Allow-Origin: {origin})")

print("\n=== 2. TESTING GET /api/health WITH ORIGIN HEADER ===")
req = urllib.request.Request("http://127.0.0.1:8000/api/health", headers={"Origin": "http://localhost:3000"})
res = urllib.request.urlopen(req)
assert res.status == 200
data = json.loads(res.read().decode("utf-8"))
print(f"  Status: {data['status']} | Model Ready: {data['model_ready']} | Dataset Available: {data['dataset_available']}")
assert res.headers.get("Access-Control-Allow-Origin") == "http://localhost:3000"

print("\n=== 3. TESTING GET /api/meta/locations WITH ORIGIN HEADER ===")
req = urllib.request.Request("http://127.0.0.1:8000/api/meta/locations", headers={"Origin": "http://127.0.0.1:3000"})
res = urllib.request.urlopen(req)
assert res.status == 200
data = json.loads(res.read().decode("utf-8"))
print(f"  Cities count: {len(data['cities'])} | Property types: {data['property_types']}")
assert res.headers.get("Access-Control-Allow-Origin") == "http://127.0.0.1:3000"

print("\n=== 4. TESTING GET /api/market/trends WITH ORIGIN HEADER ===")
req = urllib.request.Request("http://127.0.0.1:8000/api/market/trends", headers={"Origin": "http://localhost:3001"})
res = urllib.request.urlopen(req)
assert res.status == 200
data = json.loads(res.read().decode("utf-8"))
print(f"  Indexed metros count: {len(data)} | Sample city: {data[0]['city']} | Rate: ₹{data[0]['avg_price_per_sqft']:,.2f}")
assert res.headers.get("Access-Control-Allow-Origin") == "http://localhost:3001"

print("\n=== 5. TESTING POST /api/valuation WITH ORIGIN HEADER ===")
payload = json.dumps({
    "city": "Bengaluru",
    "property_type": "Apartment",
    "carpet_area": 950,
    "super_builtup_area": 1250,
    "bhk": 2,
    "bathrooms": 2,
    "balconies": 1,
    "floor_number": 6,
    "total_floors": 14,
    "property_age": 3,
    "furnishing_status": "Semi-Furnished",
    "parking": True,
    "ownership_type": "Freehold",
}).encode("utf-8")
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/valuation",
    data=payload,
    headers={"Content-Type": "application/json", "Origin": "http://127.0.0.1:3001"},
    method="POST",
)
res = urllib.request.urlopen(req)
assert res.status == 200
val = json.loads(res.read().decode("utf-8"))
est = val["estimated_price"]
sqft = val["price_per_sqft"]
print(f"  Estimated Price: ₹{est/1e5:,.2f} Lakhs (₹{est/1e7:,.2f} Cr) | Rate: ₹{sqft:,.2f}/sq.ft.")
print(f"  Confidence: {val['confidence']*100:.1f}% | Comparables: {len(val['comparable_properties'])}")
assert res.headers.get("Access-Control-Allow-Origin") == "http://127.0.0.1:3001"

print("\n=======================================================")
print(">>> ALL 20 PREFLIGHT AND ACTUAL API ENDPOINT TESTS PASSED! <<<")
print("=======================================================")

