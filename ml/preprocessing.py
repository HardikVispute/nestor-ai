"""
NESTOR AI — Data Preprocessing & Cleaning Pipeline
Phase 2 Implementation.

Clean raw listings from data/raw/house_prices.csv into data/processed/cleaned_properties.csv.
Adheres strictly to:
1. Conservative deduplication (no indiscriminate merging).
2. Explicit area_basis feature without universal 0.75 carpet assumptions.
3. No fake property_age derived from status.
4. Permanent exclusion of 'Price (in rupees)' and target leakage.
"""
import re
import json
import logging
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("nestor.preprocessing")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DATA_PATH = PROJECT_ROOT / "data" / "raw" / "house_prices.csv"
PROCESSED_DATA_PATH = PROJECT_ROOT / "data" / "processed" / "cleaned_properties.csv"
REPORTS_DIR = PROJECT_ROOT / "data" / "reports"

CITY_CANONICAL_MAP = {
    "bangalore": "Bengaluru",
    "bengaluru": "Bengaluru",
    "new-delhi": "Delhi",
    "delhi": "Delhi",
    "gurgaon": "Gurgaon",
    "greater-noida": "Greater Noida",
    "noida": "Noida",
    "faridabad": "Faridabad",
    "ghaziabad": "Ghaziabad",
    "mumbai": "Mumbai",
    "thane": "Thane",
    "navi-mumbai": "Navi Mumbai",
    "kolkata": "Kolkata",
    "chennai": "Chennai",
    "hyderabad": "Hyderabad",
    "pune": "Pune",
    "ahmedabad": "Ahmedabad",
    "jaipur": "Jaipur",
    "surat": "Surat",
    "vadodara": "Vadodara",
    "lucknow": "Lucknow",
    "nagpur": "Nagpur",
    "indore": "Indore",
    "bhopal": "Bhopal",
    "patna": "Patna",
    "ludhiana": "Ludhiana",
    "agra": "Agra",
    "nashik": "Nashik",
    "kanpur": "Kanpur",
    "chandigarh": "Chandigarh",
    "coimbatore": "Coimbatore",
    "kochi": "Kochi",
    "visakhapatnam": "Visakhapatnam",
    "dehradun": "Dehradun",
    "goa": "Goa",
    "varanasi": "Varanasi",
}


def parse_amount(val) -> float:
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


def parse_area(val) -> float:
    """Parse area string (sqft, sqyrd, sqm, acre) into float sq.ft."""
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


def parse_bhk(title) -> int:
    """Extract BHK number from title string (e.g. '2 BHK Flat for sale')."""
    if pd.isna(title):
        return 2
    match = re.search(r"(\d+)\s*BHK", str(title), re.IGNORECASE)
    if match:
        bhk = int(match.group(1))
        return min(max(bhk, 1), 10)
    if re.search(r"\bStudio\b", str(title), re.IGNORECASE):
        return 1
    return 2


def parse_floor(val) -> tuple[float, float, int]:
    """
    Extract (floor_number, total_floors, is_floor_missing) from floor string.
    e.g. '10 out of 11' -> (10, 11, 0)
    """
    if pd.isna(val):
        return np.nan, np.nan, 1
    val_str = str(val).strip()
    match = re.search(r"(Ground|Upper Basement|Lower Basement|\d+)\s*out of\s*(\d+)", val_str, re.IGNORECASE)
    if match:
        f_str = match.group(1)
        tot_str = match.group(2)
        try:
            total = min(max(int(tot_str), 1), 100)
            if f_str.isdigit():
                floor = min(int(f_str), total)
            else:
                floor = 0
            return float(floor), float(total), 0
        except ValueError:
            pass
    return np.nan, np.nan, 1


def clean_dataset(raw_df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Execute full cleaning, deduplication, and feature construction.
    Returns (cleaned_dataframe, audit_statistics_dict).
    """
    initial_count = len(raw_df)
    logger.info("Cleaning pipeline started with %d raw records...", initial_count)
    df = raw_df.copy()

    # 1. Conservative Deduplication
    # Remove records that are 100% duplicate across content columns (excluding unique index)
    content_cols = [c for c in df.columns if c != "Index"]
    exact_content_dupes = int(df.duplicated(subset=content_cols).sum())
    df = df.drop_duplicates(subset=content_cols).reset_index(drop=True)
    post_dedupe_count = len(df)
    logger.info("Removed %d exact content duplicates. Remaining: %d", exact_content_dupes, post_dedupe_count)

    # 2. Parse Target Variable (price_inr)
    df["price_inr"] = df["Amount(in rupees)"].apply(parse_amount)
    
    # 3. Permanent Target Leakage Removal
    if "Price (in rupees)" in df.columns:
        df = df.drop(columns=["Price (in rupees)"])
        logger.info("Permanently dropped 'Price (in rupees)' to prevent target leakage.")

    # Drop invalid/missing prices (keep realistic prices: ₹3 Lakhs to ₹100 Crores)
    valid_price_mask = df["price_inr"].notna() & (df["price_inr"] >= 300000) & (df["price_inr"] <= 1000000000)
    invalid_price_count = int((~valid_price_mask).sum())
    df = df[valid_price_mask].copy()
    logger.info("Removed %d invalid price records. Remaining: %d", invalid_price_count, len(df))

    # 4. Parse Areas & Establish area_basis
    df["carpet_area_sqft"] = df["Carpet Area"].apply(parse_area)
    df["super_area_sqft"] = df["Super Area"].apply(parse_area)

    # Filter out extreme non-residential values (< 100 sqft or > 30,000 sqft)
    df.loc[df["carpet_area_sqft"] < 100, "carpet_area_sqft"] = np.nan
    df.loc[df["carpet_area_sqft"] > 30000, "carpet_area_sqft"] = np.nan
    df.loc[df["super_area_sqft"] < 100, "super_area_sqft"] = np.nan
    df.loc[df["super_area_sqft"] > 40000, "super_area_sqft"] = np.nan

    # Drop records missing BOTH areas
    has_area_mask = df["carpet_area_sqft"].notna() | df["super_area_sqft"].notna()
    missing_both_areas_count = int((~has_area_mask).sum())
    df = df[has_area_mask].copy()
    logger.info("Removed %d records missing both carpet and super area. Remaining: %d", missing_both_areas_count, len(df))

    # Create area_basis feature and missing indicators
    def get_area_basis(row):
        c = pd.notna(row["carpet_area_sqft"])
        s = pd.notna(row["super_area_sqft"])
        if c and s:
            return "both"
        elif c:
            return "carpet"
        elif s:
            return "super"
        return "none"

    df["area_basis"] = df.apply(get_area_basis, axis=1)
    df["is_carpet_missing"] = df["carpet_area_sqft"].isna().astype(int)
    df["is_super_missing"] = df["super_area_sqft"].isna().astype(int)

    # 5. Extract BHK
    df["bhk"] = df["Title"].apply(parse_bhk)

    # 6. Parse Bathrooms & Balconies
    df["bathrooms"] = pd.to_numeric(df["Bathroom"], errors="coerce").fillna(df["bhk"]).clip(lower=1, upper=8)
    df["balconies"] = pd.to_numeric(df["Balcony"], errors="coerce").fillna(0).clip(lower=0, upper=5)
    df["is_balcony_missing"] = df["Balcony"].isna().astype(int)

    # 7. Parse Floors
    floor_res = df["Floor"].apply(parse_floor)
    df["floor_number"] = [r[0] for r in floor_res]
    df["total_floors"] = [r[1] for r in floor_res]
    df["is_floor_missing"] = [r[2] for r in floor_res]

    # Calculate floor_ratio when both available
    df["floor_ratio"] = df["floor_number"] / df["total_floors"]
    df["floor_ratio"] = df["floor_ratio"].clip(lower=0.0, upper=1.0)

    # 8. City Normalization
    def clean_city(loc):
        if pd.isna(loc):
            return "Other"
        k = str(loc).lower().strip()
        return CITY_CANONICAL_MAP.get(k, k.title())

    df["city"] = df["location"].apply(clean_city)

    # 9. Locality Extraction (from Society or Title)
    def extract_locality(row):
        soc = row["Society"]
        if pd.notna(soc) and str(soc).strip() != "":
            return str(soc).strip().title()[:40]
        loc = row["location"]
        if pd.notna(loc) and str(loc).strip() != "":
            return str(loc).strip().title()[:40]
        return "Unknown Locality"

    df["locality"] = df.apply(extract_locality, axis=1)

    # 10. Status & Transaction Type
    df["status"] = df["Status"].fillna("Ready to Move").apply(
        lambda s: "Ready to Move" if "ready" in str(s).lower() else ("Under Construction" if "construction" in str(s).lower() else "Ready to Move")
    )
    df["transaction_type"] = df["Transaction"].fillna("Resale").apply(
        lambda t: "Resale" if "resale" in str(t).lower() else ("New Property" if "new" in str(t).lower() else "Resale")
    )

    # 11. Furnishing Status
    valid_furnishing = {"Furnished", "Semi-Furnished", "Unfurnished"}
    df["furnishing_status"] = df["Furnishing"].astype(str).str.strip().apply(
        lambda f: f if f in valid_furnishing else "Unfurnished"
    )

    # 12. Ownership Type
    valid_ownership = {"Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"}
    df["ownership_type"] = df["Ownership"].astype(str).str.strip().apply(
        lambda o: o if o in valid_ownership else "Freehold"
    )

    # 13. Parking Availability
    df["has_parking"] = df["Car Parking"].notna() & (~df["Car Parking"].astype(str).str.contains(r"^0\b|no|none", case=False, na=False))
    df["has_parking"] = df["has_parking"].astype(int)

    # Selected Model Features Schema
    feature_columns = [
        "city",
        "locality",
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
        "price_inr",
    ]

    clean_df = df[feature_columns].reset_index(drop=True)
    final_count = len(clean_df)
    logger.info("Cleaned dataset ready: %d records retained (%.2f%% of raw data).", final_count, final_count / initial_count * 100)

    audit_stats = {
        "raw_record_count": initial_count,
        "exact_duplicates_removed": exact_content_dupes,
        "post_dedupe_count": post_dedupe_count,
        "invalid_price_records_removed": invalid_price_count,
        "missing_both_areas_removed": missing_both_areas_count,
        "final_cleaned_record_count": final_count,
        "retention_rate_pct": round(final_count / initial_count * 100, 2),
        "area_basis_breakdown": clean_df["area_basis"].value_counts().to_dict(),
        "median_price_inr": float(clean_df["price_inr"].median()),
        "mean_price_inr": float(clean_df["price_inr"].mean()),
        "p25_price_inr": float(clean_df["price_inr"].quantile(0.25)),
        "p75_price_inr": float(clean_df["price_inr"].quantile(0.75)),
        "city_distribution": clean_df["city"].value_counts().to_dict(),
    }
    return clean_df, audit_stats


def build_preprocessor() -> ColumnTransformer:
    """
    Construct production ColumnTransformer for model training and serving.
    Handles numerical scaling, median imputation, and one-hot encoding.
    """
    numeric_features = [
        "carpet_area_sqft",
        "super_area_sqft",
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
        "has_parking",
    ]

    categorical_features = [
        "city",
        "area_basis",
        "furnishing_status",
        "ownership_type",
        "transaction_type",
        "status",
    ]

    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ],
        remainder="drop",
    )
    return preprocessor


def main():
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)

    print(f"Reading raw dataset from {RAW_DATA_PATH}...")
    raw_df = pd.read_csv(RAW_DATA_PATH)
    clean_df, audit = clean_dataset(raw_df)

    clean_df.to_csv(PROCESSED_DATA_PATH, index=False)
    print(f"Saved cleaned dataset to {PROCESSED_DATA_PATH}")

    # Write cleaning report markdown
    report_md = f"""# NESTOR AI — Data Cleaning & Preprocessing Report

> **Source**: `data/raw/house_prices.csv`  
> **Destination**: `data/processed/cleaned_properties.csv`  
> **Execution Date**: 2026-11-10  
> **Initial Records**: {audit['raw_record_count']:,}  
> **Retained Clean Records**: {audit['final_cleaned_record_count']:,} ({audit['retention_rate_pct']}%)  

---

## 1. Cleaning & Hygiene Steps Applied

1. **Target Leakage Prohibition**: `Price (in rupees)` permanently excluded prior to feature matrix construction.
2. **Conservative Deduplication**: Removed {audit['exact_duplicates_removed']:,} exact content duplicates (verbatim syndicated ad reposts). Distinct units within the same complex are strictly preserved.
3. **Target Parsing**: Parsed human-readable amounts into `price_inr`. Filtered out {audit['invalid_price_records_removed']:,} unphysical or non-positive price records.
4. **Area Basis Transparency**:
   - Preserved `carpet_area_sqft` and `super_area_sqft` independently.
   - Removed {audit['missing_both_areas_removed']:,} listings missing both area dimensions.
   - Built explicit `area_basis` categorical feature (`both`, `carpet`, `super`).
   - Added binary missing indicators (`is_carpet_missing`, `is_super_missing`).
5. **No Synthetic Age Assumption**: Removed artificial `property_age` derived from `Status`. Preserved `status` (`Ready to Move` vs `Under Construction`) directly as a predictor.
6. **Layout & Vertical Extraction**: Parsed `bhk` from listing title, `floor_number`, `total_floors`, and computed `floor_ratio`.

---

## 2. Area Basis Breakdown in Cleaned Data

| Area Basis Category | Listing Count | Percentage |
|---|---|---|
"""
    for basis, count in audit["area_basis_breakdown"].items():
        pct = round(count / audit["final_cleaned_record_count"] * 100, 2)
        report_md += f"| `{basis}` | {count:,} | {pct}% |\n"

    report_md += f"""
---

## 3. Top Cities Distribution in Cleaned Dataset

| City | Retained Clean Listings | % of Total |
|---|---|---|
"""
    for city, count in list(audit["city_distribution"].items())[:15]:
        pct = round(count / audit["final_cleaned_record_count"] * 100, 2)
        report_md += f"| **{city}** | {count:,} | {pct}% |\n"

    report_md += f"""
---

## 4. Price Distribution in Cleaned Dataset (INR)
- **Median Price**: ₹{audit['median_price_inr']/1e5:,.2f} Lakhs (₹{audit['median_price_inr']/1e7:,.2f} Cr)
- **Mean Price**: ₹{audit['mean_price_inr']/1e5:,.2f} Lakhs (₹{audit['mean_price_inr']/1e7:,.2f} Cr)
- **25th Percentile**: ₹{audit['p25_price_inr']/1e5:,.2f} Lakhs
- **75th Percentile**: ₹{audit['p75_price_inr']/1e5:,.2f} Lakhs
"""

    report_path = REPORTS_DIR / "cleaning_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_md)
    print(f"Saved cleaning report to {report_path}")


if __name__ == "__main__":
    main()
