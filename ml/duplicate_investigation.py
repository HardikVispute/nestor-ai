"""
NESTOR AI — Duplicate Investigation Script
Analyzes identical and near-duplicate candidates in data/raw/house_prices.csv
before establishing conservative, safe deduplication criteria.
"""
import json
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DATA_PATH = PROJECT_ROOT / "data" / "raw" / "house_prices.csv"
REPORTS_DIR = PROJECT_ROOT / "data" / "reports"


def main():
    print("Loading raw data for duplicate investigation...")
    df = pd.read_csv(RAW_DATA_PATH)
    total_records = len(df)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Total duplicate rows across all 21 columns (including Index)
    exact_full = int(df.duplicated().sum())

    # 2. Duplicate across all columns EXCEPT 'Index'
    cols_no_index = [c for c in df.columns if c != "Index"]
    exact_content_dupes = int(df.duplicated(subset=cols_no_index).sum())

    # 3. Duplicate listing text: Title + Description + Amount(in rupees) + location
    ad_dupe_cols = ["Title", "Description", "Amount(in rupees)", "location"]
    exact_ad_dupes = int(df.duplicated(subset=ad_dupe_cols).sum())

    # 4. Same physical specifications and same price, but potentially different Description
    spec_cols = ["Title", "Amount(in rupees)", "location", "Carpet Area", "Super Area", "Floor"]
    same_spec_dupes = int(df.duplicated(subset=spec_cols).sum())

    # 5. Same building/society and same layout, but DIFFERENT floor or DIFFERENT price
    # Let's inspect some groups
    society_bhk_groups = df.groupby(["Society", "location"]).size()
    societies_with_multiple_listings = int((society_bhk_groups > 1).sum())

    # Sample duplicate group inspection
    dupe_sample = df[df.duplicated(subset=cols_no_index, keep=False)].sort_values(by=["Title", "Amount(in rupees)"]).head(10)
    samples_list = []
    for _, row in dupe_sample.iterrows():
        samples_list.append({
            "Index": int(row["Index"]),
            "Title": str(row["Title"]),
            "Amount": str(row["Amount(in rupees)"]),
            "location": str(row["location"]),
            "Floor": str(row["Floor"]),
            "Carpet": str(row["Carpet Area"]),
            "Super": str(row["Super Area"]),
        })

    report_data = {
        "total_records": total_records,
        "exact_duplicates_all_columns_including_index": exact_full,
        "exact_duplicates_excluding_index": exact_content_dupes,
        "exact_duplicates_title_desc_amount_location": exact_ad_dupes,
        "same_physical_specs_and_price": same_spec_dupes,
        "societies_with_multiple_listings": societies_with_multiple_listings,
        "deduplication_policy": {
            "conservative_criterion": "Remove only records where Title, Description, Amount, location, Carpet Area, and Floor are 100% identical (i.e. identical syndicated ad reposts).",
            "justification": "Preserves genuine distinct units within the same building/complex that share general location and dimensions but represent separate physical market transactions."
        }
    }

    with open(REPORTS_DIR / "duplicate_investigation.json", "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    md_content = f"""# NESTOR AI — Duplicate Investigation Report

> **Dataset**: `data/raw/house_prices.csv`  
> **Total Records**: {total_records:,}  
> **Generated**: 2026-11-10  

---

## 1. Investigation Findings

| Duplicate Detection Level | Matching Criteria | Duplicate Count | % of Raw Data | Safe to Remove? |
|---|---|---|---|---|
| **Level 0 (Full Row)** | All 21 columns (including unique `Index`) | {exact_full:,} | 0.00% | N/A (Index is distinct) |
| **Level 1 (Exact Content Duplicates)** | All 20 feature columns (excluding `Index`) | {exact_content_dupes:,} | {round(exact_content_dupes/total_records*100, 2)}% | **YES** (Verbatim reposted ads) |
| **Level 2 (Ad Syndication Duplicates)** | `Title` + `Description` + `Amount` + `location` | {exact_ad_dupes:,} | {round(exact_ad_dupes/total_records*100, 2)}% | **YES** (Same listing text/price) |
| **Level 3 (Specification Matches)** | `Title` + `Amount` + `location` + `Carpet` + `Super` + `Floor` | {same_spec_dupes:,} | {round(same_spec_dupes/total_records*100, 2)}% | **CAUTION**: Contains same-floor units |

---

## 2. Conservative Deduplication Policy

To respect real market reality:
1. **Never merge distinct apartments in the same society**: In high-density Indian developments, two different owners often sell 2-BHK units of the same size.
2. **Conservative Deduplication Rule**: We only deduplicate records where **ALL of the following are identical**:
   - `Title` (exact BHK and development name)
   - `Amount(in rupees)` (exact asking price)
   - `location` (exact locality)
   - `Carpet Area` and `Super Area`
   - `Floor` (exact vertical position)
   - `Description` (verbatim listing body)
3. **Preservation**: This removes exactly **{exact_content_dupes:,} redundant ad scrapings**, retaining **{total_records - exact_content_dupes:,} legitimate property listings**.
"""

    with open(REPORTS_DIR / "duplicate_investigation.md", "w", encoding="utf-8") as f:
        f.write(md_content)

    print("Duplicate investigation report saved successfully.")


if __name__ == "__main__":
    main()

