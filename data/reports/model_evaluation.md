# NESTOR AI — Model Training & Evaluation Report

> **Evaluation Date**: 2026-11-10  
> **Dataset**: `data/processed/cleaned_properties.csv` (65,000 clean records)  
> **Train/Test Split**: 80% Train (52,000 listings) / 20% Held-Out Test (13,000 listings)  
> **Random Seed**: 42  
> **Target Variable**: `price_inr` (Modeled via $\log(1 + \text{price})$, metrics evaluated on actual INR scale)  
> **Leakage Prevention**: Strictly excluded `price_per_sqft` and raw descriptions.  

---

## 1. Candidate Models Benchmark Comparison

All metrics evaluated strictly on original Indian Rupee (INR) scale against the held-out test set:

| Model Architecture | MAE (₹ Lakhs) | RMSE (₹ Lakhs) | MAPE (%) | $R^2$ Score |
|---|---|---|---|---|
| **Baseline (Median)**  | ₹59.20 L | ₹138.30 L | **64.15%** | **-0.0695** |
| **Ridge Regression**  | ₹207.21 L | ₹18,766.23 L | **45.55%** | **-19689.7183** |
| **Random Forest**  | ₹26.62 L | ₹62.54 L | **27.09%** | **0.7813** |
| **HistGradientBoosting** 🏆 **Champion** | ₹25.62 L | ₹66.54 L | **24.36%** | **0.7524** |

---

## 2. Champion Model Performance Analysis (`HistGradientBoosting`)

### 2.1 Predictive Lift Over Naive Baseline
- **Baseline (Median) MAPE**: 64.15%
- **Champion Model MAPE**: **24.36%**
- **Relative Error Reduction**: **39.79 percentage points improvement**.
- **$R^2$ Score**: **0.7524** (explains 75.2% of price variance across Indian cities).

### 2.2 Residual Accuracy Distribution
- **Within ±10% of Actual Asking Price**: **28.6%** of test properties
- **Within ±20% of Actual Asking Price**: **53.4%** of test properties
- **Within ±30% of Actual Asking Price**: **71.58%** of test properties
- **Mean Absolute Error (MAE)**: ₹2,561,670.25 (₹25.62 Lakhs)

---

## 3. City-Wise Model Performance Breakdown

| City | Test Samples | Median Price | MAE (₹ Lakhs) | MAPE (%) | $R^2$ Score |
|---|---|---|---|---|---|
| **Greater Noida** | 618 | ₹61.35 L | ₹14.66 L | 19.79% | 0.7376 |
| **Gurgaon** | 591 | ₹200.00 L | ₹72.45 L | 27.0% | 0.5705 |
| **Chennai** | 587 | ₹67.00 L | ₹33.36 L | 29.5% | 0.6568 |
| **Faridabad** | 576 | ₹75.50 L | ₹16.89 L | 19.93% | 0.8035 |
| **Delhi** | 574 | ₹160.00 L | ₹68.30 L | 30.57% | 0.7743 |
| **Bengaluru** | 564 | ₹84.50 L | ₹36.78 L | 26.62% | 0.6588 |
| **Ahmedabad** | 559 | ₹68.00 L | ₹22.54 L | 23.71% | 0.789 |
| **Hyderabad** | 542 | ₹93.50 L | ₹30.56 L | 20.44% | 0.7565 |
| **Jaipur** | 538 | ₹53.95 L | ₹15.67 L | 22.57% | 0.7409 |
| **Kolkata** | 529 | ₹49.00 L | ₹24.60 L | 28.31% | 0.6693 |
| **Vadodara** | 479 | ₹40.00 L | ₹11.09 L | 21.5% | 0.6339 |
| **Pune** | 434 | ₹75.00 L | ₹24.02 L | 24.94% | 0.7795 |
| **Surat** | 426 | ₹60.00 L | ₹18.31 L | 21.1% | 0.7851 |
| **Visakhapatnam** | 383 | ₹56.00 L | ₹16.11 L | 23.3% | 0.7492 |
| **Zirakpur** | 306 | ₹65.00 L | ₹13.46 L | 19.06% | 0.4538 |

---

## 4. Artifact Serialization Summary
- Champion Pipeline saved to: [`artifacts/model.joblib`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/artifacts/model.joblib)
- Production Metadata saved to: [`artifacts/model_metadata.json`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/artifacts/model_metadata.json)
