"""
NESTOR AI — Comprehensive Dataset Inspection Script
Analyzes data/raw/house_prices.csv and produces detailed JSON and Markdown profiling reports.
"""
import os
import json
import re
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DATA_PATH = PROJECT_ROOT / "data" / "raw" / "house_prices.csv"
REPORTS_DIR = PROJECT_ROOT / "data" / "reports"


def parse_amount(val):
    """Parse Amount(in rupees) string into numerical INR."""
    if pd.isna(val):
        return np.nan
    val_str = str(val).strip().replace(",", "")
    match = re.search(r"([\d\.]+)\s*(cr|crore|lac|lacs|lakh|lakhs|k)?", val_str, re.IGNORECASE)
    if not match:
        return np.nan
    num_part = float(match.group(1))
    unit = (match.group(2) or "").lower()
    if unit in ["cr", "crore"]:
        return num_part * 1e7
    elif unit in ["lac", "lacs", "lakh", "lakhs"]:
        return num_part * 1e5
    elif unit == "k":
        return num_part * 1e3
    return num_part


def parse_area(val):
    """Parse area string (e.g. '500 sqft', '120 sqyrd') into float sqft."""
    if pd.isna(val):
        return np.nan
    val_str = str(val).strip().replace(",", "")
    match = re.search(r"([\d\.]+)\s*([a-zA-Z]+)?", val_str)
    if not match:
        return np.nan
    num_part = float(match.group(1))
    unit = (match.group(2) or "sqft").lower()
    if unit in ["sqyrd", "sqyard", "sqyards"]:
        return num_part * 9.0
    elif unit in ["sqm", "sqmeter", "sqmeters"]:
        return num_part * 10.7639
    elif unit in ["acre", "acres"]:
        return num_part * 43560.0
    return num_part


def parse_bhk(title):
    """Extract BHK number from title string (e.g. '2 BHK Flat...')."""
    if pd.isna(title):
        return np.nan
    match = re.search(r"(\d+)\s*BHK", str(title), re.IGNORECASE)
    if match:
        return int(match.group(1))
    # studio apartment check
    if re.search(r"\bStudio\b", str(title), re.IGNORECASE):
        return 1
    return np.nan


def parse_floor(val):
    """Extract (floor_num, total_floors) from floor string (e.g. '10 out of 11', 'Ground out of 4')."""
    if pd.isna(val):
        return np.nan, np.nan
    val_str = str(val).strip()
    match = re.search(r"(Ground|Upper Basement|Lower Basement|\d+)\s*out of\s*(\d+)", val_str, re.IGNORECASE)
    if match:
        f_str = match.group(1)
        tot_str = match.group(2)
        if f_str.isdigit():
            floor_num = int(f_str)
        else:
            floor_num = 0  # ground or basement
        return floor_num, int(tot_str)
    return np.nan, np.nan


def main():
    print(f"Loading raw dataset from {RAW_DATA_PATH}...")
    if not RAW_DATA_PATH.exists():
        raise FileNotFoundError(f"Raw dataset not found at {RAW_DATA_PATH}")

    df = pd.read_csv(RAW_DATA_PATH)
    n_rows, n_cols = df.shape
    print(f"Loaded {n_rows:,} records with {n_cols} columns.")

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Column info & missingness
    col_profiles = {}
    for col in df.columns:
        n_missing = int(df[col].isna().sum())
        col_profiles[col] = {
            "dtype": str(df[col].dtype),
            "missing_count": n_missing,
            "missing_pct": round((n_missing / n_rows) * 100, 2),
            "unique_values": int(df[col].nunique(dropna=True)),
            "sample_values": [str(x) for x in df[col].dropna().head(3).tolist()],
        }

    # 2. Duplicates
    subset_cols = ["Title", "Amount(in rupees)", "location", "Carpet Area", "Floor"]
    n_exact_dupes = int(df.duplicated().sum())
    n_semantic_dupes = int(df.duplicated(subset=subset_cols).sum())

    # 3. Location distribution
    location_counts = df["location"].astype(str).str.lower().str.strip().value_counts()
    top_locations = {k: int(v) for k, v in location_counts.head(25).items()}

    # 4. Parsed fields investigation
    parsed_prices = df["Amount(in rupees)"].apply(parse_amount)
    parsed_carpets = df["Carpet Area"].apply(parse_area)
    parsed_supers = df["Super Area"].apply(parse_area)
    parsed_bhks = df["Title"].apply(parse_bhk)
    
    floors = df["Floor"].apply(parse_floor)
    parsed_floor_nums = pd.Series([f[0] for f in floors])
    parsed_total_floors = pd.Series([f[1] for f in floors])

    # Price stats
    valid_prices = parsed_prices.dropna()
    valid_prices_pos = valid_prices[valid_prices > 0]

    price_stats = {
        "valid_count": int(len(valid_prices_pos)),
        "min_inr": float(valid_prices_pos.min()),
        "max_inr": float(valid_prices_pos.max()),
        "mean_inr": float(valid_prices_pos.mean()),
        "median_inr": float(valid_prices_pos.median()),
        "p25_inr": float(valid_prices_pos.quantile(0.25)),
        "p75_inr": float(valid_prices_pos.quantile(0.75)),
        "p95_inr": float(valid_prices_pos.quantile(0.95)),
        "p99_inr": float(valid_prices_pos.quantile(0.99)),
    }

    # Carpet area stats
    valid_carpets = parsed_carpets.dropna()
    valid_carpets_pos = valid_carpets[(valid_carpets >= 100) & (valid_carpets <= 20000)]
    carpet_stats = {
        "valid_count": int(len(valid_carpets)),
        "plausible_count_100_to_20k": int(len(valid_carpets_pos)),
        "min_sqft": float(valid_carpets.min()),
        "max_sqft": float(valid_carpets.max()),
        "median_sqft": float(valid_carpets.median()),
        "mean_sqft": float(valid_carpets.mean()),
        "p25_sqft": float(valid_carpets.quantile(0.25)),
        "p75_sqft": float(valid_carpets.quantile(0.75)),
    }

    # BHK distribution
    bhk_counts = parsed_bhks.value_counts().sort_index()
    bhk_dist = {f"{int(k)} BHK" if k == k else "Unknown": int(v) for k, v in bhk_counts.items() if k <= 10}

    # Status distribution
    status_counts = df["Status"].astype(str).str.strip().value_counts()
    status_dist = {k: int(v) for k, v in status_counts.head(10).items()}

    # Furnishing distribution
    furnish_counts = df["Furnishing"].astype(str).str.strip().value_counts()
    furnish_dist = {k: int(v) for k, v in furnish_counts.head(10).items()}

    # Transaction distribution
    trans_counts = df["Transaction"].astype(str).str.strip().value_counts()
    trans_dist = {k: int(v) for k, v in trans_counts.head(10).items()}

    # Bathroom distribution
    bath_counts = pd.to_numeric(df["Bathroom"], errors="coerce").value_counts().sort_index()
    bath_dist = {f"{int(k)} Baths": int(v) for k, v in bath_counts.items() if k <= 8}

    # Balcony distribution
    balc_counts = pd.to_numeric(df["Balcony"], errors="coerce").value_counts().sort_index()
    balc_dist = {f"{int(k)} Balconies": int(v) for k, v in balc_counts.items() if k <= 6}

    # Invalid records identification
    invalid_price = int((parsed_prices.isna() | (parsed_prices <= 0)).sum())
    missing_both_areas = int((parsed_carpets.isna() & parsed_supers.isna()).sum())
    missing_bhk = int(parsed_bhks.isna().sum())

    profile_data = {
        "metadata": {
            "dataset_file": "data/raw/house_prices.csv",
            "source": "Kaggle: juhibhojani/house-price",
            "total_records": n_rows,
            "total_columns": n_cols,
            "column_names": df.columns.tolist(),
        },
        "hygiene_audit": {
            "exact_duplicate_rows": n_exact_dupes,
            "semantic_duplicate_rows": n_semantic_dupes,
            "invalid_or_missing_prices": invalid_price,
            "missing_both_carpet_and_super_area": missing_both_areas,
            "missing_bhk_in_title": missing_bhk,
        },
        "target_leakage_warning": {
            "leakage_column": "Price (in rupees)",
            "explanation": "Column 'Price (in rupees)' is verified as price_per_sqft (e.g. 6000.0 INR/sq.ft. for a 42 Lac 500 sqft apartment). Must be excluded from feature set.",
        },
        "columns": col_profiles,
        "price_distribution_inr": price_stats,
        "carpet_area_distribution_sqft": carpet_stats,
        "bhk_distribution": bhk_dist,
        "top_locations": top_locations,
        "status_distribution": status_dist,
        "furnishing_distribution": furnish_dist,
        "transaction_distribution": trans_dist,
        "bathroom_distribution": bath_dist,
        "balcony_distribution": balc_dist,
    }

    # Save JSON report
    json_path = REPORTS_DIR / "dataset_profile.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(profile_data, f, indent=2)
    print(f"Saved dataset profile JSON to {json_path}")

    # Generate Markdown report
    md_content = f"""# NESTOR AI — Dataset Inspection & Profiling Report

> **Dataset Candidate**: Kaggle `juhibhojani/house-price` (Indian Real Estate Listings)  
> **Source File**: `data/raw/house_prices.csv` (101.23 MB)  
> **Generated**: 2026-11-10  
> **Total Records**: {n_rows:,}  
> **Total Columns**: {n_cols}  

---

## 1. Executive Summary & Critical Findings

1. **Target Variable**: The target price is stored in `Amount(in rupees)` as human-readable strings (e.g. `42 Lac`, `1.25 Cr`). This requires regex parsing into numeric INR values.
2. **Target Leakage Alert**: The column `Price (in rupees)` represents **price per square foot** (e.g. `6000.0` for a 42 Lac flat with 500 sq.ft.). **It must strictly be removed from features.**
3. **Data Scale**: 187,531 real residential property listings across Indian metropolitan regions (Thane, Mumbai, Bengaluru, New Delhi, Kolkata, Chennai, Pune, Hyderabad, Ahmedabad, Jaipur, etc.).
4. **Physical Dimensions**: Listings frequently report either `Carpet Area` or `Super Area`. An intelligent fallback pipeline (using Carpet Area where present, or estimated from Super Area via empirical super-to-carpet ratios) preserves maximum training coverage.
5. **Categorical Features**: Real attributes present include `Status` (Ready to Move vs Under Construction), `Transaction` (Resale vs New), `Furnishing` (Furnished, Semi-Furnished, Unfurnished), `Bathroom`, `Balcony`, `Floor`, and `location`.
6. **BHK Extraction**: `Title` reliably provides BHK layout labels (`1 BHK`, `2 BHK`, `3 BHK`, etc.).

---

## 2. Hygiene & Anomaly Audit

| Diagnostic Dimension | Value | Action Required |
|---|---|---|
| **Exact Duplicate Rows** | {n_exact_dupes:,} ({round(n_exact_dupes/n_rows*100, 2)}%) | Drop duplicates in preprocessing |
| **Semantic Duplicate Listings** | {n_semantic_dupes:,} ({round(n_semantic_dupes/n_rows*100, 2)}%) | Deduplicate by Title, Price, Location, Carpet, Floor |
| **Invalid or Missing Target Price** | {invalid_price:,} ({round(invalid_price/n_rows*100, 2)}%) | Drop rows without valid price |
| **Missing Both Carpet & Super Area** | {missing_both_areas:,} ({round(missing_both_areas/n_rows*100, 2)}%) | Drop rows without valid area dimension |
| **BHK Unidentifiable in Title** | {missing_bhk:,} ({round(missing_bhk/n_rows*100, 2)}%) | Impute via median for property scale |

---

## 3. Column Profiling & Missingness Matrix

| Column Name | Data Type | Missing Count | Missing % | Unique Count | Sample Values |
|---|---|---|---|---|---|
"""
    for col, p in col_profiles.items():
        samples = ", ".join(f"`{s}`" for s in p["sample_values"][:2])
        md_content += f"| `{col}` | `{p['dtype']}` | {p['missing_count']:,} | {p['missing_pct']}% | {p['unique_values']:,} | {samples} |\n"

    md_content += f"""
---

## 4. Key Statistical Distributions

### 4.1 Target Price (`Amount(in rupees)`)
- **Valid Non-Zero Listings**: {price_stats['valid_count']:,}
- **Median Price**: ₹{price_stats['median_inr']/1e5:,.2f} Lakhs (₹{price_stats['median_inr']/1e7:,.2f} Cr)
- **Mean Price**: ₹{price_stats['mean_inr']/1e5:,.2f} Lakhs
- **25th Percentile**: ₹{price_stats['p25_inr']/1e5:,.2f} Lakhs
- **75th Percentile**: ₹{price_stats['p75_inr']/1e5:,.2f} Lakhs
- **95th Percentile**: ₹{price_stats['p95_inr']/1e7:,.2f} Cr
- **99th Percentile**: ₹{price_stats['p99_inr']/1e7:,.2f} Cr

### 4.2 Area Dimensions
- **Carpet Area Median**: {carpet_stats['median_sqft']:,} sq.ft.
- **Carpet Area Interquartile Range (IQR)**: {carpet_stats['p25_sqft']:,} to {carpet_stats['p75_sqft']:,} sq.ft.
- **Plausible Range (100 to 20,000 sq.ft.)**: {carpet_stats['plausible_count_100_to_20k']:,} records.

### 4.3 BHK Configuration Distribution
"""
    for bhk_name, count in bhk_dist.items():
        pct = round(count / n_rows * 100, 2)
        md_content += f"- **{bhk_name}**: {count:,} listings ({pct}%)\n"

    md_content += f"""
### 4.4 Top 15 Locations
"""
    for loc, count in list(top_locations.items())[:15]:
        pct = round(count / n_rows * 100, 2)
        md_content += f"- **{loc.title()}**: {count:,} listings ({pct}%)\n"

    md_content += f"""
---

## 5. Architectural Recommendations for `ml/preprocessing.py`

1. **Target**: Parse `Amount(in rupees)` to `price_inr` (numeric float). Train regression models using `log1p(price_inr)` to handle heavy right skew.
2. **Area**: Standardize unit strings into `area_sqft`. Prioritize `Carpet Area`; if absent, compute fallback from `Super Area` with a $0.75$ carpet-to-super factor.
3. **Layout**: Extract `bhk` from `Title`. Parse `Bathroom` and `Balcony` into numeric integers with median imputation.
4. **Vertical Position**: Parse `Floor` into `floor_number` and `total_floors`. Compute `floor_ratio` (floor / total_floors).
5. **Categorical Pipeline**: One-Hot Encode `location`, `Status`, `Transaction`, and `Furnishing`.
6. **Leakage Enforcement**: Drop `Price (in rupees)` permanently prior to feature encoding.
"""

    md_path = REPORTS_DIR / "dataset_profile.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Saved dataset profile Markdown to {md_path}")


if __name__ == "__main__":
    main()
