# Backend Services & API Documentation — NESTOR AI

> **Runtime**: Python 3.12 (Windows AMD64 `.venv`)  
> **Framework**: FastAPI 0.162.2 / Starlette 1.10.0 / Uvicorn 0.54.0  
> **Status**: **Phase 2 Complete — Live Model Serving Active**  
> **Location**: `nestor-ai/backend/`  
> **Last Verified**: 2026-11-12

---

## 1. Directory Structure

```
backend/
├── app/
│   ├── __init__.py               # Package marker
│   ├── main.py                   # FastAPI app, CORS, lifespan hooks
│   ├── schemas.py                # Pydantic v2 schemas and validators
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py             # GET /api/health endpoint
│   │   ├── market.py             # GET /api/market/trends endpoint
│   │   ├── meta.py               # GET /api/meta/locations endpoint
│   │   └── valuation.py          # POST /api/valuation endpoint
│   └── services/
│       ├── __init__.py
│       └── model_service.py      # Model loader, inference engine & comparable matcher
├── artifacts/
│   ├── model.joblib              # Trained champion HistGradientBoosting pipeline (271 KB)
│   └── model_metadata.json       # Training & evaluation metadata (2.2 KB)
├── data/
│   └── cleaned_properties.csv    # Cleaned 65,000-row dataset for comparables & trends (8.05 MB)
├── test_api.py                   # Route and schema verification test suite
├── test_cors_verification.py     # Exhaustive 20-case CORS & endpoint verification suite
├── test_prediction.py            # Comprehensive 10-case model prediction test suite
├── .python-version               # Pinned Python 3.12 runtime for Vercel
├── .vercelignore                 # Excludes .venv/, __pycache__/, .env*, and test_*.py
├── requirements.txt              # Pinned runtime Python dependencies
└── .env.example                  # Environment variables template
```

---

## 2. API Endpoints Reference

### 2.1 `GET /api/health`

- **Purpose**: Reports system health, model readiness, and dataset availability.
- **Input**: None.
- **Output Schema**: `HealthResponse`
  ```json
  {
    "status": "ok",
    "model_ready": true,
    "dataset_available": true,
    "model_path": "C:\\PC\\Hardik\\Projects\\Nestor AI\\nestor-ai\\artifacts\\model.joblib",
    "dataset_path": "C:\\PC\\Hardik\\Projects\\Nestor AI\\nestor-ai\\data\\processed\\cleaned_properties.csv",
    "timestamp": "2026-11-10T11:18:15Z"
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Server operational. Returns `status: "ok"` with `model_ready: true`.
- **Implementation Status**: **Implemented, Active & Verified**.

---

### 2.2 `GET /api/meta/locations`

- **Purpose**: Supplies the frontend with supported Indian cities, property categories, furnishing options, and ownership types.
- **Input**: None.
- **Output Schema**: `LocationsResponse`
  ```json
  {
    "cities": [
      "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai",
      "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat",
      "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal",
      "Patna", "Vadodara", "Ludhiana", "Agra", "Nashik"
    ],
    "property_types": ["Apartment", "Villa", "Independent House", "Penthouse", "Studio"],
    "furnishing_statuses": ["Furnished", "Semi-Furnished", "Unfurnished"],
    "ownership_types": ["Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"]
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Successfully returned lists.
- **Implementation Status**: **Implemented & Verified**.

---

### 2.3 `POST /api/valuation`

- **Purpose**: Executes real-time valuation prediction using the trained champion model (`HistGradientBoosting`), computes 80% prediction intervals, extracts value drivers, and retrieves 5 nearest comparables.
- **Input Schema**: `PropertyInput`
  ```json
  {
    "city": "Mumbai",
    "property_type": "Apartment",
    "carpet_area": 850.0,
    "super_builtup_area": 1100.0,
    "bhk": 2,
    "bathrooms": 2,
    "balconies": 1,
    "floor_number": 5,
    "total_floors": 15,
    "property_age": 3,
    "furnishing_status": "Semi-Furnished",
    "parking": true,
    "ownership_type": "Freehold"
  }
  ```
- **Validation Constraints**:
  - `carpet_area`: Float $\ge 100$ and $\le 50,000$.
  - `super_builtup_area`: Float $\ge 100$ and $\le 60,000$.
  - `super_builtup_area >= carpet_area`: Strictly enforced via Pydantic validator.
- **Output Schema**: `ValuationResponse`
  ```json
  {
    "estimated_price": 21585223.0,
    "price_per_sqft": 25394.38,
    "confidence": 0.88,
    "prediction_interval": {
      "lower": 17268178.4,
      "upper": 26333972.06
    },
    "comparable_properties": [
      {
        "id": "COMP-485",
        "city": "Mumbai",
        "locality": "Hiranandani Gardens Powai",
        "bhk": 2,
        "carpet_area": 845.0,
        "price": 21000000.0,
        "price_per_sqft": 24852.07,
        "property_age": 3,
        "furnishing_status": "Semi-Furnished",
        "similarity_score": 0.97
      }
    ],
    "valuation_factors": [
      {
        "feature": "Dedicated Parking",
        "impact": 250000.0,
        "direction": "positive",
        "description": "Allocated car parking adds substantial capital and resale premium."
      }
    ],
    "risk_indicators": [
      {
        "label": "Tenure Title Risk",
        "level": "low",
        "description": "Freehold title provides clear, bankable ownership."
      }
    ],
    "model_version": "hist_gbm_v1",
    "timestamp": "2026-11-10T11:18:15Z"
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Successful real-time valuation prediction.
  - `422 Unprocessable Entity`: Schema or range validation error (e.g. `super_builtup_area < carpet_area`).
  - `503 Service Unavailable`: Returned if model artifact is removed.
- **Implementation Status**: **Implemented, Live & Verified**.

---

### 2.4 `GET /api/market/trends`

- **Purpose**: Supplies macro and micro-market intelligence aggregated across canonical Indian metropolitan hubs, including historical rate progressions, rental yields, inventory supply, and absorption indices.
- **Input**: None.
- **Output Schema**: Array of `CityMarketTrend` objects:
  ```json
  [
    {
      "city": "Bengaluru",
      "avg_price_per_sqft": 9957.41,
      "yoy_appreciation_pct": 11.4,
      "rental_yield_pct": 3.8,
      "inventory_months": 8.2,
      "absorption_rate_pct": 68.5,
      "trend_data": [
        {"quarter": "Q1 2025", "avg_rate": 8950.0},
        {"quarter": "Q2 2025", "avg_rate": 9240.0},
        {"quarter": "Q3 2025", "avg_rate": 9580.0},
        {"quarter": "Q4 2025", "avg_rate": 9957.41}
      ]
    }
  ]
  ```
- **HTTP Status Codes**:
  - `200 OK`: Real-time market trends returned.
- **Implementation Status**: **Implemented & Verified**.

---

## 3. CORS Policy & Middleware Architecture

NESTOR AI enforces strict, explicit origin validation to secure financial data while supporting local multi-port development environments.

### 3.1 Allowed Origins Policy
Starlette `CORSMiddleware` is configured in `backend/app/main.py` with explicit origins:
```python
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]
```
- **Credentials Support**: `allow_credentials=True`. Wildcard origins (`*`) are disallowed when credentials are enabled.
- **HTTP Methods Allowed**: `allow_methods=["*"]` (covers `GET`, `POST`, `OPTIONS`, `PUT`, `DELETE`).
- **Headers Allowed**: `allow_headers=["*"]` (covers `Content-Type`, `Authorization`, custom headers).
- **Environment Override**: Configurable via `CORS_ORIGINS` in `.env` (comma-separated list).

### 3.2 Preflight Handling
Browser preflight requests (`OPTIONS`) from any allowed origin return:
- Status: `200 OK`
- Header: `Access-Control-Allow-Origin: <origin>`
- Header: `Access-Control-Allow-Credentials: true`
- Header: `Access-Control-Allow-Methods: *`
- Header: `Access-Control-Allow-Headers: *`

---

## 4. Running Automated Backend Tests

```powershell
# 1. Route, schema, and CORS preflight verification
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\backend"
& ".\.venv\Scripts\python.exe" test_api.py

# 2. Comprehensive 10-case prediction & edge-case test suite
& ".\.venv\Scripts\python.exe" test_prediction.py

# 3. Exhaustive 20-case CORS and endpoint verification suite
& ".\.venv\Scripts\python.exe" test_cors_verification.py
```
All backend test cases execute and pass cleanly.

---

## 5. Vercel Multi-Service Deployment Architecture

NESTOR AI deploys as a single Vercel multi-service project configured by the repository-root [`vercel.json`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/vercel.json).

### 5.1 Multi-Service Definition & Routing
- **`frontend` service**: `root: "frontend/"`, `framework: "nextjs"`. Serves all non-API UI routes via rewrite `/(.*) -> { "service": "frontend" }`.
- **`backend` service**: `root: "backend/"`, `framework: "fastapi"`, `entrypoint: "app.main:app"`. Serves all API endpoints via rewrite `/api/(.*) -> { "service": "backend" }`.
- Vercel Services rewrites forward the original `/api/...` path unchanged to FastAPI, matching the existing `/api`, `/api/meta`, and `/api/market` router prefixes in `backend/app/main.py`.

### 5.2 API Configuration & Same-Origin Behavior
- In [`frontend/src/lib/api.ts`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/frontend/src/lib/api.ts), `API_BASE` reads `process.env.NEXT_PUBLIC_API_URL ?? ""` and strips any trailing `/` or `/api` suffix to prevent duplicate `/api/api/...` paths.
- **Production (Vercel)**: Leave `NEXT_PUBLIC_API_URL` unset so the browser issues same-origin relative requests (`/api/health`, `/api/meta/locations`, `/api/market/trends`, `/api/valuation`) without requiring cross-origin CORS.
- **Local Development**: `frontend/.env.local` sets `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001` (ignored by Git via `.env*`), and `ALLOWED_ORIGINS` in `backend/app/main.py` preserves `localhost` and `127.0.0.1` on ports `3000` and `3001`.

### 5.3 Backend Runtime Assets & Bundle Budget
Because Vercel isolates the `backend` service to `backend/`, all runtime assets required for inference, comparable retrieval, and market trends reside inside `backend/`:
- `backend/artifacts/model.joblib` (277,953 bytes / ~271 KB)
- `backend/artifacts/model_metadata.json` (2,267 bytes / ~2.2 KB)
- `backend/data/cleaned_properties.csv` (8,439,489 bytes / ~8.05 MB)

`backend/app/services/model_service.py` and `backend/app/routers/market.py` resolve assets inside `BACKEND_ROOT` (`backend/`) first, falling back to repo-root `artifacts/` and `data/processed/` only if absent locally.
- `backend/.vercelignore` excludes `.venv/`, `__pycache__/`, `.env*`, and `test_*.py`.
- `backend/requirements.txt` pins `scikit-learn==1.9.1`, `numpy==2.5.4`, `pandas==3.1.1`, `scipy==1.18.1`, and `joblib==1.6.0` to guarantee exact pickle compatibility with `model.joblib`, and drops unused packages (`httpx`, `python-dotenv`, `uvicorn[standard]` extras).
- Measured uncompressed backend footprint: ~8.34 MB application + runtime assets + ~311.94 MB Python runtime packages = **~320.28 MB** total (within Vercel's 500 MB Python function limit).

### 5.4 Environment Variables
- **Frontend (`frontend/.env.local`, local dev only)**: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001` (do **not** set in Vercel production so requests stay same-origin).
- **Backend (optional)**: `CORS_ORIGINS` (comma-separated origin override if a separate external frontend origin is ever needed).
- No API keys, database credentials, or secrets are stored in `NEXT_PUBLIC_*` variables or committed to Git.
