# Security, Privacy & Compliance Architecture — NESTOR AI

> **Classification**: Internal Engineering Security Specification  
> **Status**: Phase 1 Baseline Implemented; Enterprise Access Controls Planned  
> **Last Verified**: 2026-11-10

---

## 1. Security Architecture Overview

NESTOR AI is designed to process property attributes and financial valuation telemetry. While the current stage focuses on algorithmic valuation and exploratory intelligence, security controls are built into the foundation to protect data integrity, prevent model tampering, and ensure safe deployment.

---

## 2. Implemented Security Controls vs Planned Controls

| Security Dimension | Implemented (Phase 1) | Planned (Phases 10-11) |
|---|---|---|
| **Input Sanitization** | Pydantic v2 strict typing & boundary checks | Web Application Firewall (WAF) & Cloudflare |
| **Cross-Field Validation** | Enforced (e.g. `super_builtup >= carpet`) | Schema anomaly anomaly detection |
| **Secrets Management** | `.env.example` template; `.env` excluded | HashiCorp Vault / AWS Secrets Manager |
| **Git Leakage Prevention** | `.gitignore` blocking `.env`, data, artifacts | Pre-commit automated secrets scanning (GitGuardian) |
| **CORS Policy** | Whitelisted local dev origins (`3000`, `3001`) | Domain-restricted production CORS headers |
| **Error Shielding** | Structured JSON errors without stack traces | Centralized error monitoring (Sentry / Datadog) |
| **Model Protection** | Graceful 503 rejection when un-trained | Model artifact SHA-256 cryptographic checksums |
| **Authentication** | Open development endpoints | JWT Bearer tokens, OAuth2, and API keys |
| **Rate Limiting** | None | SlowAPI / Redis-backed token bucket rate limits |
| **Role-Based Access** | Single workspace mode | RBAC (Underwriter, Appraiser, Auditor, Admin) |

---

## 3. Input Validation & Request Hygiene

All inputs entering the platform are validated through two independent layers:

### Layer 1: Client-Side Schema Validation (Zod)
In [`PropertyForm.tsx`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/frontend/src/components/valuation/PropertyForm.tsx), every field is constrained by bounds (e.g. `carpet_area` between 100 and 50,000 sq.ft., `bhk` between 1 and 10). Invalid submissions are blocked before dispatching network requests.

### Layer 2: Server-Side Strict Pydantic Validation
In [`backend/app/schemas.py`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/backend/app/schemas.py), Pydantic v2 models validate data types, range bounds, and logical relationships:
- Strings are parsed and stripped.
- Numerical values are strictly coerced to validated floats and integers.
- Cross-field validator `super_must_be_gte_carpet` rejects invalid inputs with HTTP 422, shielding the machine learning layer from mathematical or physical contradictions.

---

## 4. Secrets Management & Environment Hygiene

1. **Zero Hardcoded Secrets**: No API keys, passwords, database credentials, or secret tokens exist in the source code.
2. **Environment Variable Configuration**:
   - `frontend/.env.local`: Houses `NEXT_PUBLIC_API_URL`.
   - `backend/.env`: Houses `PORT`, `LOG_LEVEL`, and `CORS_ORIGINS`.
3. **Strict `.gitignore` Policy**:
   The root [`.gitignore`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/.gitignore) explicitly excludes:
   - All `.env` and `.env.*` files.
   - All raw datasets (`data/raw/*.csv`, `data/raw/*.xlsx`).
   - All processed datasets (`data/processed/*.csv`, `data/processed/*.parquet`).
   - All serialized model artifacts (`artifacts/*.joblib`, `artifacts/*.pkl`).
   - All Python virtual environments (`.venv/`, `venv/`).
   - All Node dependency and build caches (`node_modules/`, `.next/`, `.turbo/`).

---

## 5. Model Artifact & Data Security

### Model Integrity
- Machine learning binaries (`artifacts/model.joblib`) represent compiled algorithmic assets. In production, models must be loaded from read-only filesystem paths with SHA-256 integrity verification to prevent binary deserialization attacks.
- Untrusted pickle files are strictly disallowed; artifacts are serialized and deserialized using pinned `joblib` versions matching the runtime.

### Data Privacy & Confidentiality
- The training dataset is derived from public Kaggle listings released under the CC0 Public Domain license. It contains no Personally Identifiable Information (PII) such as owner names, personal phone numbers, or Aadhaar / PAN identity details.
- User inputs during valuation sessions are processed in memory and are not logged or stored alongside identifiable user identifiers in Phase 1.

---

## 6. Regulatory & Compliance Disclaimers

> **IMPORTANT REGULATORY NOTICE**: NESTOR AI is an automated valuation and analytics technology demonstration developed for the Hero Housing Fintech Challenge.  
> 
> - **Not an Official Statutory Appraisal**: Outputs produced by this platform do not constitute registered statutory valuation reports under the Companies (Registered Valuers and Valuation) Rules, 2017 or guidelines issued by the Insolvency and Bankruptcy Board of India (IBBI).
> - **Regulatory Compliance**: NESTOR AI does **not** claim formal compliance with Reserve Bank of India (RBI) or National Housing Bank (NHB) collateral appraisal circulars at this development stage. Any future commercial deployment by a regulated housing finance company (HFC) or non-banking financial company (NBFC) will require formal institutional model risk management (MRM) validation, audit trails, and human appraiser oversight.

---

## 7. Security Risks & Mitigations Matrix

| Risk Scenario | Likelihood | Impact | Implemented / Planned Mitigation |
|---|---|---|---|
| **Model Inversion / Extraction** | Low | Medium | Rate-limiting valuation requests to prevent scraping full price surfaces |
| **Target Leakage Exploit** | High (if unmanaged) | High | Architecture strictly blocks `price_per_sqft` from entering feature matrix |
| **Denial of Service (DoS)** | Medium | Medium | FastAPI asynchronous concurrency + future Cloudflare rate limiting |
| **Adversarial Input Outliers** | Medium | Low | Strict Pydantic numeric range limits discard unphysical property records |
| **Un-trained Model Inaccuracies** | High (if unmanaged) | High | Backend throws HTTP 503 instead of generating fabricated valuation numbers |

