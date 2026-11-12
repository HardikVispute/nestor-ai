# NESTOR AI — Property Valuation Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.2-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.9.1-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-CC0_Public_Domain-lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> **Developed for the Hero Housing Fintech Challenge**  
> An institutional-grade automated valuation model (AVM) and property intelligence platform estimating residential apartment asking prices across major Indian metropolitan and urban hubs using machine learning, physical attributes, and location intelligence.

---

## 1. Problem Statement & The NESTOR AI Solution

Residential property appraisal in India has historically suffered from opacity, protracted turnaround times (typically 3 to 7 days for physical valuation reports), substantial appraiser subjectivity, and a lack of transparent uncertainty quantification.

**NESTOR AI** solves this by providing:
- **Instantaneous Statistically Defensible Appraisals**: Evaluates 13 key property attributes across physical dimensions, floor positions, age degradation, and legal tenure.
- **Trained Champion Machine Learning Engine**: Powered by an audited `HistGradientBoosting` ensemble achieving **24.36% MAPE** and **0.7524 $R^2$** on held-out test data.
- **Calibrated Uncertainty Bounds**: Delivers empirical 80% confidence intervals ($[\text{Lower}, \text{Upper}]$) rather than a single point estimate.
- **Transparent Attribution**: Highlights key positive and negative value drivers explaining *why* a property is priced at its valuation.
- **Comparable Asset Evidence**: Surfaces top 5 nearest comparable properties with similarity scoring to benchmark the estimate against real market listings.
- **Zero Hallucination / Target Leakage Safeguards**: Protects against model hallucination by refusing to fabricate numbers, and strictly banning `price_per_sqft` from entering feature sets.

---

## 2. Institutional Interface Preview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  NESTOR AI  |  Property Valuation Intelligence                       [● Model Ready]   │
├──────────────┬─────────────────────────────────────────────────────────────────────────┤
│ [Overview]   │  PROPERTY VALUATION WORKSPACE                                           │
│              │                                                                         │
│ [Valuation]  │  ┌─ Property Inputs ──────────────────┐  ┌─ Valuation Report ────────┐  │
│              │  │ City: Mumbai                       │  │ ₹2.16 Cr                  │  │
│ [History]    │  │ Type: Apartment                    │  │ ₹25,394 / sq.ft.          │  │
│              │  │ Carpet Area: 850 sq.ft.            │  │ Range: ₹1.73 Cr – ₹2.63 Cr│  │
│ [Market]     │  │ Super Area: 1100 sq.ft.            │  │ Confidence: 88%           │  │
│              │  │ BHK: 2 | Baths: 2 | Balconies: 1   │  │ Drivers: Parking (+), Area│  │
│ [Methodology]│  │ Floor: 5 of 15 | Age: 3 Years      │  │ Top 5 Comparables Listed  │  │
│              │  │ [ Run Valuation ]                  │  │ Risk: Low Legal Risk      │  │
│              │  └────────────────────────────────────┘  └───────────────────────────┘  │
└──────────────┴─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

- **Frontend**: Next.js 16.4.6 (App Router, Turbopack, React 19.3.0), TypeScript 5, Tailwind CSS v4, Recharts 3.10.1, Lucide React, React Hook Form, Zod.
- **Backend**: FastAPI 0.162.2, Starlette 1.10.0, Uvicorn 0.54.0, Pydantic v2 (Strict cross-field validation).
- **Machine Learning**: Scikit-Learn 1.9.1, Pandas 3.1.1, NumPy 2.5.4, Joblib 1.6.0.
- **Design System**: High data-density institutional fintech palette (`#0B0F1A` navy, `#111827` surface, `#10B981` emerald accent).

---

## 4. Benchmark Performance & Evaluation

Tested strictly on original Indian Rupee (INR) scale against a 20% held-out test split (13,000 listings):

| Model Architecture | MAE (₹ Lakhs) | RMSE (₹ Lakhs) | MAPE (%) | $R^2$ Score | Status |
|---|---|---|---|---|---|
| **Baseline (Median)** | ₹59.20 L | ₹138.30 L | 64.15% | -0.0695 | Naive Central Tendency |
| **Ridge Regression** | ₹207.21 L | ₹18,766.23 L | 45.55% | -19689.7 | L2 Regularized Linear |
| **Random Forest** | ₹26.62 L | ₹62.54 L | 27.09% | 0.7813 | Non-linear Tree Ensemble |
| **HistGradientBoosting** | **₹25.62 L** | **₹66.54 L** | **24.36%** | **0.7524** | 🏆 **Champion Selected** |

- **Residual Accuracy**: 71.58% within ±30%, 53.40% within ±20%, 28.60% within ±10%.
- **City Generalization**: Sub-25% MAPE across Greater Noida (19.8%), Faridabad (19.9%), Hyderabad (20.4%), Surat (21.1%), Vadodara (21.5%), Jaipur (22.6%), Visakhapatnam (23.3%), Ahmedabad (23.7%), and Pune (24.9%).

---

## 5. Quickstart Guide (Windows PowerShell)

### 5.1 Backend Setup & Running
```powershell
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\backend"
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

### 5.2 Frontend Setup & Running
In a new PowerShell window:
```powershell
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\frontend"
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

### 5.3 Automated Verification Test Suites
```powershell
# 1. Backend route and schema verification tests
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\backend"
& ".\.venv\Scripts\python.exe" test_api.py

# 2. Comprehensive 10-case model prediction & edge-case test suite
& ".\.venv\Scripts\python.exe" test_prediction.py

# 3. Frontend TypeScript verification
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\frontend"
npx tsc --noEmit

# 4. Production build
npm run build
```

---

## 6. Project Structure

```
nestor-ai/
├── AGENTS.md                  # Master instruction manual for AI agents
├── README.md                  # Project landing page & quickstart
├── docs/                      # Comprehensive technical knowledge base
│   ├── current_state.md       # Real-time implementation status & test logs
│   ├── architecture.md        # System architecture & Mermaid flow diagrams
│   ├── backend.md             # FastAPI endpoints, schemas & error contracts
│   ├── frontend.md            # Next.js App Router, components & design tokens
│   ├── ml.md                  # ML pipeline, leakage guards, baselines & metrics
│   ├── howtouse.md            # Step-by-step developer and operator manual
│   ├── githubupdate.md        # Git conventions, PR templates & release guide
│   ├── futureroutes.md        # 11-phase product and engineering roadmap
│   └── security.md            # Security controls, data privacy & compliance
├── frontend/                  # Next.js App Router frontend application
├── backend/                   # FastAPI backend services and schemas
├── ml/                        # ML training, preprocessing & evaluation scripts
├── data/                      # Raw and processed datasets (kept out of Git)
│   ├── raw/house_prices.csv   # Original Kaggle dataset (187,531 rows)
│   ├── processed/cleaned_properties.csv # Deduplicated clean dataset (65,000 rows)
│   └── reports/               # Profiling, duplicate, and model evaluation reports
└── artifacts/                 # Serialized model binaries (kept out of Git)
    ├── model.joblib           # Trained HistGradientBoosting champion pipeline
    └── model_metadata.json    # Full reproducibility & configuration metadata
```

---

## 7. Dataset Attribution & Licensing

- **Dataset**: Indian House Price Dataset
- **Source**: Kaggle — [`juhibhojani/house-price`](https://www.kaggle.com/datasets/juhibhojani/house-price)
- **License**: CC0: Public Domain
- **Attribution**: Derived from scraped residential apartment and home listings across Indian urban centers.
