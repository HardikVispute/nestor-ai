"""
NESTOR AI — Model Evaluation Module
Phase 2 Implementation.

Computes MAE, RMSE, MAPE, and R2 on actual INR scale.
Generates evaluation breakdown, residual metrics, and city-wise analysis.
"""
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score


def mean_absolute_percentage_error_safe(y_true, y_pred) -> float:
    """Compute safe MAPE percentage on positive prices."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    mask = y_true > 0
    if not np.any(mask):
        return 0.0
    mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100.0
    return float(mape)


def compute_metrics(y_true, y_pred) -> dict:
    """
    Compute MAE, RMSE, MAPE, and R2 on original monetary INR scale.
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    y_pred = np.clip(y_pred, a_min=100000.0, a_max=None)

    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(root_mean_squared_error(y_true, y_pred))
    mape = float(mean_absolute_percentage_error_safe(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))

    return {
        "MAE_INR": round(mae, 2),
        "RMSE_INR": round(rmse, 2),
        "MAPE_pct": round(mape, 2),
        "R2_score": round(r2, 4),
    }


def evaluate_by_city(y_true, y_pred, cities) -> dict:
    """
    Calculate performance breakdown by city.
    """
    df = pd.DataFrame({
        "y_true": np.asarray(y_true),
        "y_pred": np.asarray(y_pred),
        "city": np.asarray(cities),
    })

    city_report = {}
    for city, group in df.groupby("city"):
        if len(group) >= 50:
            metrics = compute_metrics(group["y_true"], group["y_pred"])
            metrics["sample_count"] = int(len(group))
            metrics["median_actual_inr"] = float(group["y_true"].median())
            city_report[city] = metrics

    return city_report


def compute_residual_stats(y_true, y_pred) -> dict:
    """
    Compute residual distribution statistics.
    """
    residuals = np.asarray(y_true) - np.asarray(y_pred)
    pct_residuals = ((np.asarray(y_true) - np.asarray(y_pred)) / np.asarray(y_true)) * 100.0

    return {
        "mean_residual_inr": float(np.mean(residuals)),
        "std_residual_inr": float(np.std(residuals)),
        "within_10_pct_accuracy": float(np.mean(np.abs(pct_residuals) <= 10.0) * 100.0),
        "within_20_pct_accuracy": float(np.mean(np.abs(pct_residuals) <= 20.0) * 100.0),
        "within_30_pct_accuracy": float(np.mean(np.abs(pct_residuals) <= 30.0) * 100.0),
    }
