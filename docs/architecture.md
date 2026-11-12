# System Architecture — NESTOR AI

> **Product**: NESTOR AI — Property Valuation Intelligence Platform  
> **Challenge**: Hero Housing Fintech Challenge  
> **Target Jurisdiction**: Indian Residential Real Estate  
> **Current Version**: `v0.2.0-beta` (Phase 1 & Phase 2 Complete)  
> **Last Verified**: 2026-11-10

---

## 1. System Overview

NESTOR AI is architected as a decoupled, multi-tier automated valuation and analytics platform. It bridges high-density statistical modeling with an institutional web experience tailored for housing finance institutions, credit risk teams, underwriters, and property appraisers.

The system comprises three primary subsystems:
1. **Frontend Presentation Layer**: A Next.js 16 App Router application engineered with TypeScript, Tailwind CSS v4, and Recharts.
2. **Backend Services Layer**: A high-throughput FastAPI application enforcing strict Pydantic validation, health monitoring, and modular routing.
3. **Machine Learning Intelligence Layer**: An offline-trained and online-served pipeline built with Scikit-learn, Pandas, and Joblib for valuation inference, uncertainty calibration, and feature attribution.

---

## 2. Overall System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 16 / TypeScript)"]
        UI["Property Workspace & Forms"]
        Store["State Management & Hooks (useHealth)"]
        ApiClient["API Client (fetch / lib/api.ts)"]
        Viz["Visualizations (Recharts / ValuationPanels)"]
        UI --> Store
        Store --> ApiClient
        ApiClient --> Viz
    end

    subgraph Gateway["API Gateway & Validation (FastAPI)"]
        RouterHealth["/api/health (Status: OK)"]
        RouterMeta["/api/meta/locations"]
        RouterValuation["/api/valuation (Status: Live Inferences)"]
        RouterMarket["/api/market/trends (14 Metro Corridors)"]
        Pydantic["Pydantic Schema Validation (schemas.py)"]
        CORS["CORS Middleware"]
    end

    subgraph ServiceLayer["Backend Services"]
        ModelService["ModelService (app/services/model_service.py)"]
    end

    subgraph StorageLayer["Data & Artifact Persistence"]
        RawData["data/raw/house_prices.csv (187,531 rows)"]
        CleanData["data/processed/cleaned_properties.csv (65,000 clean rows)"]
        Artifacts["artifacts/model.joblib & artifacts/model_metadata.json"]
    end

    subgraph MLPipeline["Machine Learning Pipeline (Active)"]
        Preproc["ml/preprocessing.py (Deduplication & Area Basis)"]
        Train["ml/train.py (HistGradientBoosting Champion)"]
        Eval["ml/evaluate.py (24.36% MAPE, 0.7524 R2)"]
        RawData --> Preproc
        Preproc --> CleanData
        CleanData --> Train
        Train --> Eval
        Train --> Artifacts
    end

    ApiClient -->|"HTTP / REST (JSON)"| CORS
    CORS --> Pydantic
    Pydantic --> RouterHealth
    Pydantic --> RouterMeta
    Pydantic --> RouterValuation

    RouterHealth --> ModelService
    RouterValuation --> ModelService
    ModelService -.->|"Loads Champion Pipeline"| Artifacts
    ModelService -.->|"Matches Comparables"| CleanData
```

---

## 3. Valuation Request Flow (Live Execution)

```mermaid
sequenceDiagram

    autonumber
    actor User as Credit Analyst / Appraiser
    participant UI as PropertyForm (Frontend)
    participant Client as API Client (lib/api.ts)
    participant API as FastAPI (/api/valuation)
    participant Service as ModelService
    participant Model as Trained Artifacts (model.joblib)
    participant Data as Cleaned Properties (cleaned_properties.csv)

    User->>UI: Enter 13 Property Attributes
    UI->>UI: Client Validation (Zod Schema)
    alt Validation Fails
        UI-->>User: Show Field-Level Errors (Red text)
    else Validation Passes
        UI->>Client: submitValuation(formData)
        Client->>API: POST /api/valuation (JSON payload)
        API->>API: Pydantic Validation (super >= carpet)
        API->>Service: predict(PropertyInput)
        Service->>Model: Execute Pipeline Transformation & Model Predict
        Model-->>Service: Predict Target Price (INR)
        Service->>Service: Compute Calibrated 80% Prediction Interval
        Service->>Service: Extract Top Valuation Drivers
        Service->>Data: Query 5 Nearest Comparable Listings
        Data-->>Service: Return Comparable Records
        Service-->>API: ValuationResponse Schema
        API-->>Client: HTTP 200 OK (JSON)
        Client-->>UI: Return ValuationResult
        UI-->>User: Render Executive Valuation Console
    end
```

---

## 4. Local Development vs Future Production Deployment

### 4.1 Local Workstation (Current)
- Backend: Uvicorn on `http://localhost:8000`.
- Frontend: Next.js Turbopack on `http://localhost:3000`.
- ML Model: `artifacts/model.joblib` loaded on startup in under 150ms.

### 4.2 Target Production Architecture (Vercel + Cloud Run)
- Frontend deployed to Vercel Edge Network.
- Backend containerized in Docker with multi-stage build, running on Google Cloud Run or AWS App Runner.
- Cleaned dataset and model artifact bundled directly into the container or mounted via Cloud Storage.
