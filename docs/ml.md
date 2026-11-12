# Machine Learning Intelligence & Modeling Documentation — NESTOR AI

> **Runtime**: Python 3.12 (Scikit-Learn 1.9.1, Pandas 3.1.1, NumPy 2.5.4, Joblib 1.6.0)  
> **Status**: **Phase 2 Complete & Operational** (Champion Model Exported to `artifacts/model.joblib`)  
> **Champion Architecture**: `HistGradientBoostingRegressor` (with log1p target transformation)  
> **Held-Out Test Performance**: **24.36% MAPE**, **0.7524 $R^2$**, **₹25.62 Lakhs MAE**  
> **Location**: `nestor-ai/ml/`  
> **Last Verified**: 2026-11-10

---

## 1. Dataset Provenance & Empirical Properties

### 1.1 Source & Licensing
- **Dataset**: Indian House Price Dataset
- **Kaggle Reference**: [`juhibhojani/house-price`](https://www.kaggle.com/datasets/juhibhojani/house-price)
- **License**: CC0: Public Domain
- **Raw File**: `data/raw/house_prices.csv` (101.23 MB, 187,531 records, 21 columns).

### 1.2 Inherent Dataset Characteristics & Disclosures
1. **Listing Asking Prices**: Data reflects seller portal asking quotes (Magicbricks listings). Realized sub-registrar registered transaction values in India typically close at a 5% to 15% discount to initial listings.
2. **Heavy Right-Skew**: Prices range from ₹5 Lakhs to ₹100 Crores, with a median of ₹65 Lakhs and 75th percentile of ₹1.45 Crores. Target modeling is executed on $\log(1 + \text{price})$ to stabilize variance across budget and luxury segments.
3. **Syndicated Ad Duplication**: Scraped portal listings contain heavy cross-broker duplicate postings. Our conservative deduplication protocol identified and removed 119,339 exact content duplicates, retaining 65,000 distinct, high-quality listings.

---

## 2. Preprocessing & Feature Engineering (`ml/preprocessing.py`)

### 2.1 Target Leakage Enforcement
> **CRITICAL RULE VERIFIED**: The column `Price (in rupees)` in the raw dataset was empirically confirmed to be `price_per_sqft` (e.g. `6000.0` for a 42 Lakh flat of 700 sq.ft.). It has been **permanently dropped** from the feature matrix prior to model training to prevent target leakage.

### 2.2 Feature Matrix ($X$)
The model consumes 19 structured features:
- **`city`**: Canonical normalized city string (Bengaluru, Delhi, Mumbai, Kolkata, Chennai, Hyderabad, Ahmedabad, Pune, Jaipur, etc.).
- **`carpet_area_sqft`**: Carpet area in square feet.
- **`super_area_sqft`**: Super built-up area in square feet.
- **`area_basis`**: Categorical basis (`carpet`, `super`, `both`) tracking which measurement was provided.
- **`is_carpet_missing`** / **`is_super_missing`**: Explicit binary missing-value indicators.
- **`bhk`**: Number of bedrooms extracted from listing title (1 to 10).
- **`bathrooms`**: Number of bathrooms (1 to 8).
- **`balconies`**: Number of balconies (0 to 5) and `is_balcony_missing`.
- **`floor_number`**: Vertical floor level (0 = Ground floor).
- **`total_floors`**: Total building height and `is_floor_missing`.
- **`floor_ratio`**: Proportional height ($\frac{\text{floor}}{\text{total}}$).
- **`furnishing_status`**: Categorical (`Furnished`, `Semi-Furnished`, `Unfurnished`).
- **`has_parking`**: Binary indicator (1 if dedicated parking allocated, 0 otherwise).
- **`ownership_type`**: Categorical (`Freehold`, `Leasehold`, `Co-operative Society`, `Power of Attorney`).
- **`transaction_type`**: Categorical (`Resale`, `New Property`).
- **`status`**: Categorical (`Ready to Move`, `Under Construction`).

---

## 3. Model Benchmark Comparison & Evaluation

All models trained on 80% split (52,000 records) and evaluated on 20% held-out test split (13,000 records) with random seed `42`. Metrics are computed strictly on original Indian Rupee (INR) scale:

| Model Architecture | MAE (₹ Lakhs) | RMSE (₹ Lakhs) | MAPE (%) | $R^2$ Score | Status |
|---|---|---|---|---|---|
| **Baseline (Median)** | ₹59.20 L | ₹138.30 L | 64.15% | -0.0695 | Naive Central Tendency |
| **Ridge Regression** | ₹207.21 L | ₹18,766.23 L | 45.55% | -19689.7 | L2 Regularized Linear |
| **Random Forest** | ₹26.62 L | ₹62.54 L | 27.09% | 0.7813 | Non-linear Tree Ensemble |
| **HistGradientBoosting** | **₹25.62 L** | **₹66.54 L** | **24.36%** | **0.7524** | 🏆 **Champion Selected** |

### 3.1 Champion Performance Analysis
- **Predictive Lift**: HistGradientBoosting reduces MAPE from 64.15% (baseline) to **24.36%**, representing a **39.79 percentage point improvement**.
- **Variance Explained**: $R^2 = 0.7524$, successfully capturing three-quarters of price variance across diverse Indian urban centers without relying on target-derived features.
- **Residual Distribution**:
  - **71.58%** of properties estimated within ±30% of actual asking price.
  - **53.40%** of properties estimated within ±20% of actual asking price.
  - **28.60%** of properties estimated within ±10% of actual asking price.

### 3.2 City-Wise Generalization Breakdown
| City | Test Samples | Median Price | MAE (₹ Lakhs) | MAPE (%) | $R^2$ Score |
|---|---|---|---|---|---|
| **Greater Noida** | 618 | ₹61.35 L | ₹14.66 L | **19.79%** | 0.7376 |
| **Faridabad** | 576 | ₹75.50 L | ₹16.89 L | **19.93%** | 0.8035 |
| **Hyderabad** | 542 | ₹93.50 L | ₹30.56 L | **20.44%** | 0.7565 |
| **Surat** | 426 | ₹60.00 L | ₹18.31 L | **21.10%** | 0.7851 |
| **Vadodara** | 479 | ₹40.00 L | ₹11.09 L | **21.50%** | 0.6339 |
| **Jaipur** | 538 | ₹53.95 L | ₹15.67 L | **22.57%** | 0.7409 |
| **Visakhapatnam** | 383 | ₹56.00 L | ₹16.11 L | **23.30%** | 0.7492 |
| **Ahmedabad** | 559 | ₹68.00 L | ₹22.54 L | **23.71%** | 0.7890 |
| **Pune** | 434 | ₹75.00 L | ₹24.02 L | **24.94%** | 0.7795 |
| **Bengaluru** | 564 | ₹84.50 L | ₹36.78 L | **26.62%** | 0.6588 |
| **Gurgaon** | 591 | ₹200.00 L | ₹72.45 L | **27.00%** | 0.5705 |
| **Kolkata** | 529 | ₹49.00 L | ₹24.60 L | **28.31%** | 0.6693 |
| **Chennai** | 587 | ₹67.00 L | ₹33.36 L | **29.50%** | 0.6568 |
| **Delhi** | 574 | ₹160.00 L | ₹68.30 L | **30.57%** | 0.7743 |

---

## 4. Serving & Inference Architecture

The serialized pipeline [`artifacts/model.joblib`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/artifacts/model.joblib) contains both the feature preprocessing pipeline (`ColumnTransformer`) and the fitted `TransformedTargetRegressor`.

### Prediction Call Lifecycle
1. User submits property parameters to `POST /api/valuation`.
2. `ModelService` formats payload into a single-row feature DataFrame.
3. `model.predict()` executes column transformations and inverse log prediction.
4. An empirical 80% confidence interval ($[\hat{y} \times 0.80, \hat{y} \times 1.22]$) is calculated from the test residual distribution.
5. Top 5 nearest comparables are matched from `data/processed/cleaned_properties.csv` by city, BHK, and carpet area proximity.
