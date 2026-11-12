# AGENTS.md — Master Autonomous Agent Operating Manual

> **Product**: NESTOR AI — Property Valuation Intelligence Platform  
> **Challenge**: Hero Housing Fintech Challenge  
> **Maintainer**: Lead Full-Stack & ML Engineering Team  
> **Target Jurisdiction**: Indian Residential Real Estate (Metropolitan & Tier-1/Tier-2 Cities)  
> **Repository Root**: `c:\PC\Hardik\Projects\Nestor AI\nestor-ai\`  
> **Last Verified**: 2026-11-10

---

## 1. Prime Directives for AI Agents

Every AI agent, pair programmer, or automated tool operating on this codebase **MUST** follow these 10 non-negotiable rules:

1. **Read Before Modifying**: Always read this file (`AGENTS.md`) and [`docs/current_state.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/docs/current_state.md) before planning or executing changes.
2. **Consult Domain Docs**: Read the corresponding domain document ([`docs/frontend.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/docs/frontend.md), [`docs/backend.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/docs/backend.md), [`docs/ml.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/docs/ml.md), or [`docs/architecture.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/docs/architecture.md)) before modifying files in that layer.
3. **Inspect Real Implementations**: Check existing code rather than assuming file contents or schemas. Do not recreate components or endpoints that already exist.
4. **Never Fabricate Data or Metrics**: Never invent property valuation numbers, mock ML evaluation metrics ($R^2$, MAE, RMSE, MAPE), or pretend a model is trained if artifacts are missing. If an artifact is absent, return explicit degraded/un-trained statuses.
5. **Enforce Leakage Prevention**: In ML workflows, **never** allow `price_per_sqft` or any derivative of the target price to enter the feature set. That is target leakage.
6. **No Breaking Changes Without Explicit Direction**: Maintain strict backward compatibility for schemas, types, and router paths.
7. **Verify With Actual Tool Runs**: Run tests and type checks after modifying code (`npx tsc --noEmit`, `npm run build`, and `python test_api.py`). Never report a task as complete without passing verification.
8. **Never Commit Sensitive Information**: Keep `.env`, virtual environments (`.venv/`), `node_modules/`, raw/processed data (`data/raw/`, `data/processed/`), and serialised model binaries (`artifacts/`) out of version control.
9. **Update Documentation Continuously**: Whenever an endpoint, component, schema, or model artifact changes, update the relevant document in `docs/` and log the update in [`docs/current_state.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/docs/current_state.md).
10. **Aesthetic Integrity**: Maintain the institutional fintech aesthetic. Strictly prohibit purple gradients, glowing neon blobs, frivolous decorative illustrations, or childish visual noise.

---

## 2. Project Identity & Objective

NESTOR AI is an institutional-grade automated valuation model (AVM) and property intelligence platform engineered for lenders, underwriters, real estate investors, and homebuyers in India.

- **Primary Goal**: Deliver transparent, statistically grounded, explainable residential property valuations with defensible uncertainty bounds and nearest comparable asset benchmarks.
- **Audience**: Institutional fintech evaluators, credit committees, housing finance institutions (HFIs), and professional property appraisers.
- **Design Philosophy**: High data density, restrained institutional palette (dark navy `#0B0F1A`, slate charcoal `#111827`, emerald green `#10B981` accents), zero decorative fluff, clear uncertainty indicators.

---

## 3. Technology Stack

### Frontend Layer
- **Framework**: Next.js 16.4.6 (App Router, Turbopack, React 19.3.0)
- **Language**: TypeScript 5 (Strict mode)
- **Design System**: Liquid Glass + Institutional Fintech Command Center (see [`docs/design-system.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/docs/design-system.md))
- **Styling**: Tailwind CSS v4 with custom CSS variables & backdrop filters
- **Visualisation**: Recharts 3.10.1 (Data-dense institutional line, bar, and area charts)
- **Icons**: Lucide React 1.71.0
- **Form Architecture**: React Hook Form 7.91.0 + Zod 4.6.7 validation schemas

### Backend Layer
- **Runtime**: Python 3.12 (Windows 64-bit AMD64 virtual environment `.venv`)
- **Web Framework**: FastAPI 0.162.2 (ASGI, Starlette 1.10.0, Uvicorn 0.54.0)
- **Schema Validation**: Pydantic 2.14.3 (Strict validation with cross-field validators)
- **Data Manipulation**: Pandas 3.1.1, NumPy 2.5.4, Scipy 1.18.1
- **Machine Learning**: Scikit-Learn 1.9.1, Joblib 1.6.0

---

## 4. Repository Structure & Separation of Concerns

```
nestor-ai/
├── AGENTS.md                  # Master instruction manual for AI coding agents
├── README.md                  # Public GitHub overview & onboarding documentation
├── .gitignore                 # Version control exclusions (data, artifacts, envs)
├── docs/                      # Authoritative project knowledge base
│   ├── current_state.md       # Real-time implementation status & test record
│   ├── architecture.md        # System architecture & Mermaid flow diagrams
│   ├── backend.md             # FastAPI endpoints, schemas, and service contracts
│   ├── frontend.md            # Next.js App Router, components, design tokens
│   ├── ml.md                  # ML pipeline, data hygiene, baselines & metrics
│   ├── howtouse.md            # Step-by-step developer and operator manual
│   ├── githubupdate.md        # Git workflow, PR templates & release conventions
│   ├── futureroutes.md        # 11-phase product and engineering roadmap
│   └── security.md            # Security controls, data privacy & risk mitigations
├── frontend/                  # Next.js frontend application
│   ├── src/
│   │   ├── app/               # App Router pages (layout.tsx, page.tsx, globals.css)
│   │   ├── components/        # Layout, valuation, market, methodology, shared UI
│   │   ├── hooks/             # Custom React hooks (useHealth)
│   │   ├── lib/               # Typed API client (api.ts) & formatters (formatters.ts)
│   │   └── types/             # Canonical TypeScript interfaces (index.ts)
│   ├── package.json           # Frontend dependency manifest
│   ├── tsconfig.json          # TypeScript compiler configuration
│   └── next.config.ts         # Next.js Turbopack build configuration
├── backend/                   # FastAPI backend application
│   ├── app/
│   │   ├── main.py            # FastAPI instantiation, CORS, routers, lifespan
│   │   ├── schemas.py         # Pydantic v2 validation models & error types
│   │   ├── routers/           # Endpoint handlers (health.py, meta.py, valuation.py)
│   │   └── services/          # Core business services (model_service.py)
│   ├── test_api.py            # Automated backend endpoint & validation verification
│   ├── requirements.txt       # Python dependency specifications
│   └── .env.example           # Backend environment variable template
├── ml/                        # Python Machine Learning pipeline
│   ├── train.py               # Model training script with Kaggle dataset integration
│   ├── preprocessing.py       # Data cleansing, unit normalization, leakage guards
│   ├── evaluate.py            # Performance evaluation (MAE, RMSE, MAPE, R²)
│   └── explainability.py      # Feature attribution & nearest comparable retrieval
├── data/
│   ├── raw/                   # Raw Kaggle CSV storage (.gitkeep, excluded from git)
│   └── processed/             # Cleaned, standardized tabular data (.gitkeep)
└── artifacts/                 # Serialised model.joblib & preprocessor.joblib (.gitkeep)
```

---

## 5. Coding & Quality Standards

### General Standards
- **Path Resolution**: In Python, resolve project paths relative to file location using `Path(__file__).resolve().parents[...]`. Never hardcode absolute file paths.
- **Asynchronous vs Synchronous Execution**: In FastAPI routers, use synchronous `def` for CPU-bound or disk I/O operations (such as scikit-learn inferences) so FastAPI automatically offloads them to its internal thread pool without blocking the async event loop.
- **Typed Contracts**: Every function signature must include complete type hints (Python `typing` / Pydantic; TypeScript interfaces). No implicit `any`.

### Frontend Rules
- **Directives**: Prepend `'use client'` to any component that uses React hooks (`useState`, `useEffect`), browser events (`onClick`, `onSubmit`), or browser APIs.
- **Design Consistency**: Follow the Liquid Glass design specification defined in [`docs/design-system.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/docs/design-system.md):
  - Canvas Background: `var(--color-bg)` (`#050A12`)
  - Secondary Base: `var(--color-bg-secondary)` (`#08111E`)
  - Liquid Glass Panels: `.glass-panel` (`rgba(11, 22, 37, 0.78)` + `backdrop-filter: blur(18px) saturate(145%)`)
  - Glass Cards: `.glass-card` (`rgba(11, 22, 37, 0.65)` + `backdrop-filter: blur(14px)`)
  - Elevated Cards / Inputs: `var(--color-surface-elevated)` (`#132137`)
  - Subtle Borders: `var(--color-border)` (`rgba(148, 163, 184, 0.14)`)
  - Specular Glass Highlight: `var(--color-border-glass)` (`rgba(180, 205, 230, 0.12)`)
  - Accent Emerald: `var(--color-accent)` (`#27D7AE`)
  - Accent Ice Blue: `var(--color-accent-blue)` (`#79A9F5`)
  - Tabular Numerals: Always apply `tabular-nums` class on currency, square feet, percentages, and metrics.
  - Zero tolerance for purple gradients, neon glowing blobs, or frivolous decorative illustrations.
- **Form Handling**: Use `react-hook-form` with `zodResolver`. When using coerced numerical fields (`z.coerce.number()`), parameterize `useForm<FormInput, any, FormOutput>` so form input strings and validated numerical outputs align without casting issues.
- **Component Design**: Favor composable, single-responsibility functions over monolithic components. Declare functional components using `export default function ComponentName(props: Props)`. Do not use `React.FC`.

### Backend Rules
- **Input Validation**: Validate every incoming request payload using Pydantic models in `backend/app/schemas.py`.
- **Cross-Field Validation**: Keep business logic constraints (e.g. `super_builtup_area >= carpet_area`) in Pydantic `@field_validator` or `@model_validator` methods.
- **Model Readiness Protection**: Never return dummy valuations when no model is trained. If `model_service.is_ready()` is `False`, raise HTTP `503 Service Unavailable` with structured diagnostic details (`ModelNotReadyError`).
- **CORS Protection**: Allow explicit local development origins (`http://localhost:3000`, `http://localhost:3001`). Configure environment variable overrides for production domains.

### Machine Learning Rules
- **Leakage Prohibition**: `price_per_sqft` is strictly derived from the target variable (`price / carpet_area`). It must **never** be used as a predictor.
- **Data Normalisation**: Standardize Indian numerical formats (Crores, Lakhs, thousands) and square footage units before feeding features into transformers.
- **Benchmark Baselines**: All model evaluation must benchmark against a naive central tendency baseline (Median/Mean Regressor) to demonstrate authentic value-add.
- **Metrics Standard**: Every candidate model must report:
  - **MAE** (Mean Absolute Error, in ₹)
  - **RMSE** (Root Mean Squared Error, in ₹)
  - **MAPE** (Mean Absolute Percentage Error, %)
  - **$R^2$** (Coefficient of Determination)
- **Held-Out Split**: Maintain strict chronological or stratified held-out test splits. Cross-validation folds must never bleed preprocessing statistics across train and validation sets.

---

## 6. Pre-Flight Verification Checklist for Agents

Before completing any task, an agent **must** run and observe clean exits on:

1. **Frontend Type Check**:
   ```powershell
   Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\frontend"
   npx tsc --noEmit
   ```
2. **Frontend Production Build**:
   ```powershell
   Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\frontend"
   npm run build
   ```
3. **Backend Test Suite**:
   ```powershell
   Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai\backend"
   & ".\.venv\Scripts\python.exe" test_api.py
   ```
4. **Docs Updated**:
   - Update [`docs/current_state.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/docs/current_state.md).
   - Update any relevant subsystem document in `docs/`.

