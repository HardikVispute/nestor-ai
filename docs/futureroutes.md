# Product & Engineering Roadmap — NESTOR AI

> **Product**: NESTOR AI — Property Valuation Intelligence Platform  
> **Challenge**: Hero Housing Fintech Challenge  
> **Target Jurisdiction**: Indian Residential Real Estate  
> **Current Version**: `v0.2.0-beta` (Phases 1–4 Operational)  
> **Last Updated**: 2026-11-10

---

## 1. 11-Phase Product & Engineering Master Roadmap

### Phase 1: Application Foundation
- **Objective**: Establish the institutional Next.js frontend, modular FastAPI backend, typed API client, and documentation foundation.
- **Status**: **Completed & Verified** (2026-11-10).

---

### Phase 2: Dataset Acquisition & Data Preparation
- **Objective**: Ingest, cleanse, deduplicate, and standardize candidate Indian property listing records from Kaggle (`juhibhojani/house-price`).
- **Achievements**:
  - Ingested 187,531 records into `data/raw/house_prices.csv` (101 MB).
  - Executed conservative deduplication removing 119,339 verbatim duplicate reposts.
  - Implemented transparent `area_basis` feature preserving carpet and super area independence without synthetic 0.75 multipliers.
  - Enforced permanent target leakage guard (dropped `Price (in rupees)`).
  - Produced 65,000 clean records in `data/processed/cleaned_properties.csv`.
- **Status**: **Completed & Verified** (2026-11-10).

---

### Phase 3: ML Training & Model Benchmarking
- **Objective**: Train and benchmark four candidate model families on an 80/20 held-out validation split.
- **Achievements**:
  - Trained Baseline Median, Ridge, Random Forest, and HistGradientBoosting.
  - Champion: **HistGradientBoosting** (**24.36% MAPE**, **0.7524 $R^2$**, **₹25.62 Lakhs MAE**).
  - Relative error reduction: 39.8 percentage points improvement over baseline.
  - Evaluated city-wise performance across 15+ urban hubs.
- **Status**: **Completed & Verified** (2026-11-10).

---

### Phase 4: Live Valuation Engine
- **Objective**: Connect the trained champion model to the FastAPI backend and Next.js frontend.
- **Achievements**:
  - Exported `artifacts/model.joblib` and `artifacts/model_metadata.json`.
  - Activated live predictions in `backend/app/services/model_service.py`.
  - Health check endpoint reports `status: "ok"` and `model_ready: true`.
  - Passed 10/10 automated prediction and edge-case tests.
- **Status**: **Completed & Verified** (2026-11-10).

---

### Phase 5: Advanced Explainability & Micro-Market Comparables
- **Objective**: Deepen valuation rationales and peer property benchmarks.
- **Achievements to Date**: Nearest comparable property retrieval (5 listings matched by city, BHK, and area) and empirical 80% prediction intervals implemented.
- **Next Up**: Per-prediction TreeSHAP local waterfall attribution plots.
- **Status**: **Partially Completed / Next Up**.

---

### Phase 6: Location Intelligence & Micro-Market Geo-Modeling
- **Objective**: Integrate geographic coordinates and micro-market distance features.
- **Features**: Latitude/longitude resolution, distance-to-CBD, and spatial cross-validation.
- **Status**: **Planned**.

---

### Phase 7: Market Intelligence & Live Macro-Feeds
- **Objective**: Upgrade the Market Intelligence panel with official quarterly housing price indices (NHB RESIDEX / RBI series).
- **Status**: **Planned**.

---

### Phase 8: Lending Risk & Underwriting Integration
- **Objective**: Tailor outputs for credit committees in housing finance institutions (HFIs).
- **Features**: Loan-to-Value (LTV) stress testing simulator, forced sale discount estimator, and collateral risk grading.
- **Status**: **Planned**.

---

### Phase 9: Comprehensive Testing & Optimization
- **Objective**: Playwright end-to-end UI automation testing and sub-100ms inference optimization.
- **Status**: **Planned**.

---

### Phase 10: Vercel & Cloud Deployment
- **Objective**: Deploy Next.js frontend to Vercel and containerized FastAPI backend to Cloud Run / Render.
- **Status**: **Planned**.

---

### Phase 11: Production Hardening & Pan-India Expansion
- **Objective**: Tier-2/Tier-3 city expansion, API Key authentication, and downloadable PDF Valuation Reports.
- **Status**: **Planned**.
