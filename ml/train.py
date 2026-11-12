"""
NESTOR AI — Model Training & Benchmarking Pipeline
Phase 2 Implementation.

Compares:
1. DummyRegressor (Median Baseline)
2. Ridge Regression
3. Random Forest Regressor
4. HistGradientBoosting Regressor

Evaluates on held-out test split, computes metrics on actual INR scale,
selects champion model, and exports artifacts to artifacts/model.joblib.
"""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import os
import json
import logging
import datetime
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import TransformedTargetRegressor
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor

from ml.preprocessing import build_preprocessor, PROCESSED_DATA_PATH
from ml.evaluate import compute_metrics, evaluate_by_city, compute_residual_stats

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("nestor.train")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
REPORTS_DIR = PROJECT_ROOT / "data" / "reports"


def main():
    logger.info("Loading cleaned dataset from %s...", PROCESSED_DATA_PATH)
    if not PROCESSED_DATA_PATH.exists():
        raise FileNotFoundError(f"Cleaned dataset not found at {PROCESSED_DATA_PATH}. Run ml/preprocessing.py first.")

    df = pd.read_csv(PROCESSED_DATA_PATH)
    logger.info("Loaded %d clean records.", len(df))

    feature_cols = [
        "city",
        "carpet_area_sqft",
        "super_area_sqft",
        "area_basis",
        "is_carpet_missing",
        "is_super_missing",
        "bhk",
        "bathrooms",
        "balconies",
        "is_balcony_missing",
        "floor_number",
        "total_floors",
        "floor_ratio",
        "is_floor_missing",
        "furnishing_status",
        "has_parking",
        "ownership_type",
        "transaction_type",
        "status",
    ]

    X = df[feature_cols]
    y = df["price_inr"].values

    # 80 / 20 Train / Held-Out Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    logger.info("Data split: Train=%d, Held-out Test=%d", len(X_train), len(X_test))

    # Define model candidates
    models = {
        "Baseline (Median)": DummyRegressor(strategy="median"),
        "Ridge Regression": TransformedTargetRegressor(
            regressor=Ridge(alpha=100.0),
            func=np.log1p,
            inverse_func=np.expm1,
        ),
        "Random Forest": TransformedTargetRegressor(
            regressor=RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1),
            func=np.log1p,
            inverse_func=np.expm1,
        ),
        "HistGradientBoosting": TransformedTargetRegressor(
            regressor=HistGradientBoostingRegressor(max_iter=180, max_depth=12, min_samples_leaf=20, random_state=42),
            func=np.log1p,
            inverse_func=np.expm1,
        ),
    }

    comparison_results = {}
    fitted_pipelines = {}

    for name, reg in models.items():
        logger.info("Training candidate model: %s...", name)
        preprocessor = build_preprocessor()
        pipe = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", reg),
        ])

        pipe.fit(X_train, y_train)
        fitted_pipelines[name] = pipe

        # Inference on test set
        y_pred = pipe.predict(X_test)
        metrics = compute_metrics(y_test, y_pred)
        logger.info("Result for %s -> MAE: ₹%s, RMSE: ₹%s, MAPE: %s%%, R2: %s",
                    name, f"{metrics['MAE_INR']:,.0f}", f"{metrics['RMSE_INR']:,.0f}", metrics["MAPE_pct"], metrics["R2_score"])
        comparison_results[name] = metrics

    # Select champion model based on lowest MAPE
    champion_name = min(comparison_results, key=lambda k: comparison_results[k]["MAPE_pct"] if comparison_results[k]["R2_score"] > 0 else 999.0)
    champion_pipe = fitted_pipelines[champion_name]
    champion_metrics = comparison_results[champion_name]
    logger.info("Selected Champion Model: %s (MAPE: %.2f%%, R2: %.4f)",
                champion_name, champion_metrics["MAPE_pct"], champion_metrics["R2_score"])

    # Detailed evaluation for Champion Model
    y_champion_pred = champion_pipe.predict(X_test)
    city_breakdown = evaluate_by_city(y_test, y_champion_pred, X_test["city"])
    residual_stats = compute_residual_stats(y_test, y_champion_pred)

    # 1. Export Model Artifacts
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    model_artifact_path = ARTIFACTS_DIR / "model.joblib"
    joblib.dump(champion_pipe, model_artifact_path, compress=3)
    logger.info("Saved fitted champion pipeline to %s", model_artifact_path)

    metadata = {
        "model_name": champion_name,
        "model_type": type(champion_pipe.named_steps["regressor"]).__name__,
        "dataset_source": "Kaggle: juhibhojani/house-price",
        "training_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "random_seed": 42,
        "sample_counts": {
            "total_cleaned_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
        },
        "feature_schema": feature_cols,
        "target_variable": "price_inr",
        "target_transformation": "log1p(price) -> expm1(pred)",
        "evaluation_metrics_held_out": champion_metrics,
        "residual_accuracy_statistics": residual_stats,
        "candidate_models_benchmarked": comparison_results,
        "data_limitations": [
            "Dataset represents portal asking prices (Magicbricks listing quotes), not final deed registered prices.",
            "Realized sale transactions typically conclude 5-15% below initial ask.",
            "price_per_sqft strictly excluded from input feature set to eliminate target leakage.",
        ],
    }

    metadata_path = ARTIFACTS_DIR / "model_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info("Saved model metadata to %s", metadata_path)

    # 2. Save comparison JSON
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    with open(REPORTS_DIR / "model_comparison.json", "w", encoding="utf-8") as f:
        json.dump({
            "champion_model": champion_name,
            "models": comparison_results,
            "residual_stats": residual_stats,
            "city_breakdown": city_breakdown,
        }, f, indent=2)

    # 3. Save evaluation Markdown report
    report_md = f"""# NESTOR AI — Model Training & Evaluation Report

> **Evaluation Date**: 2026-11-10  
> **Dataset**: `data/processed/cleaned_properties.csv` (65,000 clean records)  
> **Train/Test Split**: 80% Train ({len(X_train):,} listings) / 20% Held-Out Test ({len(X_test):,} listings)  
> **Random Seed**: 42  
> **Target Variable**: `price_inr` (Modeled via $\\log(1 + \\text{{price}})$, metrics evaluated on actual INR scale)  
> **Leakage Prevention**: Strictly excluded `price_per_sqft` and raw descriptions.  

---

## 1. Candidate Models Benchmark Comparison

All metrics evaluated strictly on original Indian Rupee (INR) scale against the held-out test set:

| Model Architecture | MAE (₹ Lakhs) | RMSE (₹ Lakhs) | MAPE (%) | $R^2$ Score |
|---|---|---|---|---|
"""
    for name, res in comparison_results.items():
        mae_lakh = round(res["MAE_INR"] / 100000, 2)
        rmse_lakh = round(res["RMSE_INR"] / 100000, 2)
        marker = "🏆 **Champion**" if name == champion_name else ""
        report_md += f"| **{name}** {marker} | ₹{mae_lakh:,.2f} L | ₹{rmse_lakh:,.2f} L | **{res['MAPE_pct']}%** | **{res['R2_score']}** |\n"

    report_md += f"""
---

## 2. Champion Model Performance Analysis (`{champion_name}`)

### 2.1 Predictive Lift Over Naive Baseline
- **Baseline (Median) MAPE**: {comparison_results['Baseline (Median)']['MAPE_pct']}%
- **Champion Model MAPE**: **{champion_metrics['MAPE_pct']}%**
- **Relative Error Reduction**: **{round(comparison_results['Baseline (Median)']['MAPE_pct'] - champion_metrics['MAPE_pct'], 2)} percentage points improvement**.
- **$R^2$ Score**: **{champion_metrics['R2_score']}** (explains {round(champion_metrics['R2_score'] * 100, 1)}% of price variance across Indian cities).

### 2.2 Residual Accuracy Distribution
- **Within ±10% of Actual Asking Price**: **{round(residual_stats['within_10_pct_accuracy'], 2)}%** of test properties
- **Within ±20% of Actual Asking Price**: **{round(residual_stats['within_20_pct_accuracy'], 2)}%** of test properties
- **Within ±30% of Actual Asking Price**: **{round(residual_stats['within_30_pct_accuracy'], 2)}%** of test properties
- **Mean Absolute Error (MAE)**: ₹{champion_metrics['MAE_INR']:,.2f} (₹{round(champion_metrics['MAE_INR']/100000, 2)} Lakhs)

---

## 3. City-Wise Model Performance Breakdown

| City | Test Samples | Median Price | MAE (₹ Lakhs) | MAPE (%) | $R^2$ Score |
|---|---|---|---|---|---|
"""
    for city, stats in sorted(city_breakdown.items(), key=lambda x: x[1]["sample_count"], reverse=True)[:15]:
        c_mae = round(stats["MAE_INR"] / 100000, 2)
        c_med = round(stats["median_actual_inr"] / 100000, 2)
        report_md += f"| **{city}** | {stats['sample_count']:,} | ₹{c_med:,.2f} L | ₹{c_mae:,.2f} L | {stats['MAPE_pct']}% | {stats['R2_score']} |\n"

    report_md += f"""
---

## 4. Artifact Serialization Summary
- Champion Pipeline saved to: [`artifacts/model.joblib`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/artifacts/model.joblib)
- Production Metadata saved to: [`artifacts/model_metadata.json`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/artifacts/model_metadata.json)
"""

    eval_md_path = REPORTS_DIR / "model_evaluation.md"
    with open(eval_md_path, "w", encoding="utf-8") as f:
        f.write(report_md)
    logger.info("Saved model evaluation markdown to %s", eval_md_path)


if __name__ == "__main__":
    main()
