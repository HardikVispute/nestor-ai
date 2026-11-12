# NESTOR AI — Data Cleaning & Preprocessing Report

> **Source**: `data/raw/house_prices.csv`  
> **Destination**: `data/processed/cleaned_properties.csv`  
> **Execution Date**: 2026-11-10  
> **Initial Records**: 187,531  
> **Retained Clean Records**: 65,000 (34.66%)  

---

## 1. Cleaning & Hygiene Steps Applied

1. **Target Leakage Prohibition**: `Price (in rupees)` permanently excluded prior to feature matrix construction.
2. **Conservative Deduplication**: Removed 119,339 exact content duplicates (verbatim syndicated ad reposts). Distinct units within the same complex are strictly preserved.
3. **Target Parsing**: Parsed human-readable amounts into `price_inr`. Filtered out 2,965 unphysical or non-positive price records.
4. **Area Basis Transparency**:
   - Preserved `carpet_area_sqft` and `super_area_sqft` independently.
   - Removed 227 listings missing both area dimensions.
   - Built explicit `area_basis` categorical feature (`both`, `carpet`, `super`).
   - Added binary missing indicators (`is_carpet_missing`, `is_super_missing`).
5. **No Synthetic Age Assumption**: Removed artificial `property_age` derived from `Status`. Preserved `status` (`Ready to Move` vs `Under Construction`) directly as a predictor.
6. **Layout & Vertical Extraction**: Parsed `bhk` from listing title, `floor_number`, `total_floors`, and computed `floor_ratio`.

---

## 2. Area Basis Breakdown in Cleaned Data

| Area Basis Category | Listing Count | Percentage |
|---|---|---|
| `carpet` | 36,549 | 56.23% |
| `super` | 28,451 | 43.77% |

---

## 3. Top Cities Distribution in Cleaned Dataset

| City | Retained Clean Listings | % of Total |
|---|---|---|
| **Bengaluru** | 2,925 | 4.5% |
| **Faridabad** | 2,919 | 4.49% |
| **Gurgaon** | 2,910 | 4.48% |
| **Chennai** | 2,904 | 4.47% |
| **Greater Noida** | 2,893 | 4.45% |
| **Kolkata** | 2,855 | 4.39% |
| **Ahmedabad** | 2,843 | 4.37% |
| **Delhi** | 2,788 | 4.29% |
| **Hyderabad** | 2,750 | 4.23% |
| **Jaipur** | 2,735 | 4.21% |
| **Vadodara** | 2,352 | 3.62% |
| **Pune** | 2,174 | 3.34% |
| **Surat** | 2,168 | 3.34% |
| **Visakhapatnam** | 1,712 | 2.63% |
| **Zirakpur** | 1,476 | 2.27% |

---

## 4. Price Distribution in Cleaned Dataset (INR)
- **Median Price**: ₹65.00 Lakhs (₹0.65 Cr)
- **Mean Price**: ₹103.08 Lakhs (₹1.03 Cr)
- **25th Percentile**: ₹41.20 Lakhs
- **75th Percentile**: ₹110.00 Lakhs
