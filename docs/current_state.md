# Current Project State — NESTOR AI

> **Status Snapshot Date**: 2026-11-12  
> **Platform Version**: `v0.3.1-full-fx` (Full Visual Experience Restored + Optional Performance Mode)  
> **Active Model**: `hist_gbm_v1` (HistGradientBoostingRegressor with log1p target transformation)  
> **Master Operating Manual**: [`AGENTS.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/AGENTS.md)

---

## 1. Executive Summary

NESTOR AI has achieved **Phase 2: Real Machine Learning Pipeline & Serving**. 
- Ingested 187,531 real Indian residential property records from Kaggle (`juhibhojani/house-price`).
- Investigated and executed conservative deduplication (dropping 119,339 verbatim duplicate reposts while preserving distinct units in identical buildings), producing 65,000 clean, unique records.
- Enforced strict target leakage guards by permanently removing `Price (in rupees)` (which was empirically verified to represent `price_per_sqft`).
- Benchmarked 4 candidate model families (Dummy Baseline, Ridge, Random Forest, HistGradientBoosting) on an 80/20 held-out test split.
- Selected and serialized the Champion model (**HistGradientBoosting**: **24.36% MAPE**, **0.7524 $R^2$**, **₹25.62 Lakhs MAE**), achieving a 39.8 percentage point error reduction over the baseline.
- Integrated the champion model into the FastAPI `ModelService`. The valuation endpoint (`POST /api/valuation`) now serves live, genuine property predictions, calibrated confidence intervals, valuation drivers, and top 5 nearest comparables.
- System health now reports `status: "ok"` and `model_ready: true`.

---

## 2. Feature & Subsystem Status Matrix

| Subsystem / Feature | Implementation Status | Test Status | Verified Performance & Notes |
|---|---|---|---|
| **Raw Dataset Ingestion** | Implemented | Verified (101 MB) | `data/raw/house_prices.csv` (187,531 records, 21 columns) |
| **Duplicate Investigation** | Implemented | Verified | `data/reports/duplicate_investigation.md` (119,339 verbatim duplicates identified) |
| **Data Cleaning Pipeline** | Implemented | Verified (65,000 rows) | `data/processed/cleaned_properties.csv` and `data/reports/cleaning_report.md` |
| **Area Basis Architecture** | Implemented | Verified | Explicit `area_basis` (`carpet`, `super`, `both`) + missing value indicators |
| **Target Leakage Guard** | Implemented | Verified Clean | `Price (in rupees)` permanently deleted prior to feature encoding |
| **Model Benchmarking** | Implemented | Verified (4 Models) | `ml/train.py` (Dummy, Ridge, Random Forest, HistGradientBoosting) |
| **Champion Model Pipeline** | Implemented | Verified (Joblib) | `artifacts/model.joblib` & `artifacts/model_metadata.json` |
| **Model Evaluation Suite** | Implemented | Verified on Held-out | MAE: ₹25.62 L, MAPE: 24.36%, $R^2$: 0.7524 |
| **Backend Model Service** | Implemented | Verified Clean Exec | Live inference, 80% prediction intervals, nearest comparables |
| **Health API (`GET /api/health`)** | Implemented | Verified Clean Exec | Reports `status: "ok"`, `model_ready: true`, `dataset_available: true` |
| **Metadata API (`GET /api/meta/locations`)** | Implemented | Verified Clean Exec | 20 canonical Indian urban centers |
| **Valuation API (`POST /api/valuation`)** | Implemented & Live | Verified Clean Exec | Returns live price, price/sq.ft., interval, drivers, 5 comps |
| **Pydantic Validation** | Implemented | Verified Clean Exec | Rejects `super < carpet` and invalid bounds with HTTP 422 |
| **Frontend Shell & Panels** | Implemented | Verified Clean Build | Next.js 16 App Router, Turbopack, Recharts |
| **Liquid Glass Redesign** | Implemented | Verified (Port 3001) | OrbitPayout Command Center, 76px rail, 4-metric KPI strip |
| **Valuation History Ledger** | Implemented | Verified | LocalStorage persistence, search/filter & CSV export |
| **Market Intelligence API** | Implemented | Verified Clean Exec | `GET /api/market/trends` serving 14 real city aggregates |
| **CORS Security Architecture** | Implemented | Verified (20/20 Checks) | Explicit 4-origin whitelist (`localhost` & `127.0.0.1` on 3000/3001) |
| **Vercel Multi-Service Config** | Implemented | Verified Clean Build & Tests | Root `vercel.json` (`frontend/` Next.js + `backend/` FastAPI), bundled runtime assets |
| **Automated Test Suites** | Implemented | 35/35 Tests Passed | `test_api.py`, `test_prediction.py` (10/10), `test_cors_verification.py` (20/20) |

---

## 3. Verified Benchmark Results (Held-Out Test Set)

All metrics computed on original Indian Rupee (INR) scale:

| Model Architecture | MAE (₹ Lakhs) | RMSE (₹ Lakhs) | MAPE (%) | $R^2$ Score | Status |
|---|---|---|---|---|---|
| **Baseline (Median)** | ₹59.20 L | ₹138.30 L | 64.15% | -0.0695 | Naive Benchmark |
| **Ridge Regression** | ₹207.21 L | ₹18,766.23 L | 45.55% | -19689.7 | Linear Baseline |
| **Random Forest** | ₹26.62 L | ₹62.54 L | 27.09% | 0.7813 | Non-linear Baseline |
| **HistGradientBoosting** | **₹25.62 L** | **₹66.54 L** | **24.36%** | **0.7524** | 🏆 **Champion Model Exported** |

### Residual Accuracy
- Within ±10% of asking price: **28.6%** of properties
- Within ±20% of asking price: **53.4%** of properties
- Within ±30% of asking price: **71.58%** of properties

---

## 4. Subsystem Health Diagnostics

### 4.1 Backend Health Response (`GET /api/health`)
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

### 4.2 Frontend Compilation & Visual Restoration (`v0.3.1-full-fx`)
- **TypeScript & Production Build**: `npm run build` (`next build --webpack`) compiled cleanly with exit code `0`.
- **Default Experience (`Full FX`)**: Restored full optical `<LiquidGlass>` 3-pass RGB chromatic aberration (`aberration={8–12}`, `frost={0.55–0.7}`) across all Overview, Valuation, Market, History, and Methodology glass panels; restored layered `backdrop-filter: blur(20px–28px)` glass cards/inputs/nav; restored infinite `animate-ping` status indicators, chart animations, and entrance/result reveal transitions.
- **Cinematic Moving Metallic Waves (`BackgroundWaves.tsx` + `LiquidChromeWavesCanvas.tsx`)**: Attempts original Mux HLS stream and renders 60fps animated liquid metallic chrome waves with emerald reflections whenever external Mux CDN returns `403 Not Authorized` or buffers.
- **Optional Performance Mode & Polling**: Retains opt-in `Performance` toggle in header (`localStorage`) alongside 60s visibility-aware `useHealth` polling and `React.memo` optimizations.

---

## 5. Verified Prediction Samples (Live Model Output)

1. **Mumbai / Thane Starter Flat (450 sq.ft. 1 BHK)**:
   - Estimated Value: **₹71.41 Lakhs** (₹15,868/sq.ft.)
   - Calibrated 80% Range: ₹57.12 L to ₹87.11 L (Confidence: 88%)
   - Comparables: 5 real properties retrieved from Thane/Mumbai dataset records
2. **Bengaluru Tech Corridor (950 sq.ft. 2 BHK)**:
   - Estimated Value: **₹1.01 Crores** (₹10,653/sq.ft.)
3. **Gurgaon High-Rise (1650 sq.ft. 3 BHK)**:
   - Estimated Value: **₹2.27 Crores** (₹13,773/sq.ft.)
4. **Delhi Luxury Penthouse (4200 sq.ft. 5 BHK)**:
   - Estimated Value: **₹10.64 Crores** (₹25,343/sq.ft.)
5. **Unknown / Unseen City (Tiruchirappalli 800 sq.ft.)**:
   - Estimated Value: **₹37.11 Lakhs** (Confidence discounted to 78% for unfamiliar geography)

---

## 6. Next Immediate Implementation Task

**Phase 3: Persistent Valuation History & Advanced Location Intelligence**
1. Implement persistent client-side / server-side history storage for previous valuations in the "Valuation History" tab.
2. Integrate micro-market geospatial coordinates and distance-to-CBD features.
3. Integrate official NHB RESIDEX quarterly series into the Market Intelligence dashboard.

---

## 7. Vercel Multi-Service Deployment Readiness (2026-11-12)

- **Multi-Service Architecture**: Added root [`vercel.json`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/vercel.json) defining `frontend` (`frontend/`, Next.js) and `backend` (`backend/`, FastAPI `app.main:app`) as one Vercel project.
- **Vercel Routing**: Configured top-level `rewrites` routing `/api/(.*)` to `{ "service": "backend" }` (preserving `/api/*` paths) and `/(.*)` to `{ "service": "frontend" }`.
- **API Configuration**: Updated [`frontend/src/lib/api.ts`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/frontend/src/lib/api.ts) so production defaults to same-origin relative `/api/*` paths (with trailing `/` and `/api` normalization preventing `/api/api/...`), while `frontend/.env.local` retains `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001` for local development.
- **Runtime Assets**: Packaged `backend/artifacts/model.joblib` (271 KB), `backend/artifacts/model_metadata.json` (2.2 KB), and `backend/data/cleaned_properties.csv` (8.05 MB) inside `backend/`, with `BACKEND_ROOT`-first resolution in `model_service.py` and `market.py`, `backend/.python-version` (`3.12`), `backend/.vercelignore`, and pinned runtime dependencies in `backend/requirements.txt` (~320.28 MB total uncompressed backend footprint).
- **Environment Variables**: `NEXT_PUBLIC_API_URL` is local-only (`frontend/.env.local`, ignored by Git); `CORS_ORIGINS` remains an optional backend override while preserving local dev origins.
- **Verification**: `npx tsc --noEmit` (0 errors), `npm run build` (clean production build), `test_api.py`, `test_prediction.py` (10/10), `test_cors_verification.py` (20/20), and an isolated `backend/`-only import/model-load/inference check all passed.
