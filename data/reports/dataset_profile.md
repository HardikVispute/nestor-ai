# NESTOR AI — Dataset Inspection & Profiling Report

> **Dataset Candidate**: Kaggle `juhibhojani/house-price` (Indian Real Estate Listings)  
> **Source File**: `data/raw/house_prices.csv` (101.23 MB)  
> **Generated**: 2026-11-10  
> **Total Records**: 187,531  
> **Total Columns**: 21  

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
| **Exact Duplicate Rows** | 0 (0.0%) | Drop duplicates in preprocessing |
| **Semantic Duplicate Listings** | 121,459 (64.77%) | Deduplicate by Title, Price, Location, Carpet, Floor |
| **Invalid or Missing Target Price** | 9,684 (5.16%) | Drop rows without valid price |
| **Missing Both Carpet & Super Area** | 827 (0.44%) | Drop rows without valid area dimension |
| **BHK Unidentifiable in Title** | 31 (0.02%) | Impute via median for property scale |

---

## 3. Column Profiling & Missingness Matrix

| Column Name | Data Type | Missing Count | Missing % | Unique Count | Sample Values |
|---|---|---|---|---|---|
| `Index` | `int64` | 0 | 0.0% | 187,531 | `0`, `1` |
| `Title` | `str` | 0 | 0.0% | 32,446 | `1 BHK Ready to Occupy Flat for sale in Srushti Siddhi Mangal Murti Complex Bhiwandi`, `2 BHK Ready to Occupy Flat for sale in Dosti Vihar Pokhran Road` |
| `Description` | `str` | 3,023 | 1.61% | 65,634 | `Bhiwandi, Thane has an attractive 1 BHK Flat for sale. The property is ideally located in a strategic location in Srushti Siddhi Mangal Murti Complex township. This flat for resale is a choice property. This apartment ready to move in the Bhiwandi is available for an attractive price of INR 42 Lac. You will find it unfurnished.`, `One can find this stunning 2 BHK flat for sale in Pokhran Road, Thane. It enjoys an excellent location within the Dosti Vihar. This flat for resale is a choice property. This ready to move flat in Pokhran Road can be availed at a reasonable price of INR 98 Lac. This semi-furnished flat is strategically designed with all the amenities to enhance the living experience. The property is strategically placed near prominent places as near singhaniya school which make for the smooth living of residents.` |
| `Amount(in rupees)` | `str` | 0 | 0.0% | 1,561 | `42 Lac `, `98 Lac ` |
| `Price (in rupees)` | `float64` | 17,665 | 9.42% | 10,958 | `6000.0`, `13799.0` |
| `location` | `str` | 0 | 0.0% | 81 | `thane`, `thane` |
| `Carpet Area` | `str` | 80,673 | 43.02% | 2,758 | `500 sqft`, `473 sqft` |
| `Status` | `str` | 615 | 0.33% | 1 | `Ready to Move`, `Ready to Move` |
| `Floor` | `str` | 7,077 | 3.77% | 947 | `10 out of 11`, `3 out of 22` |
| `Transaction` | `str` | 83 | 0.04% | 4 | `Resale`, `Resale` |
| `Furnishing` | `str` | 2,897 | 1.54% | 3 | `Unfurnished`, `Semi-Furnished` |
| `facing` | `str` | 70,233 | 37.45% | 8 | `East`, `East` |
| `overlooking` | `str` | 81,436 | 43.43% | 19 | `Garden/Park`, `Garden/Park` |
| `Society` | `str` | 109,678 | 58.49% | 10,376 | `Srushti Siddhi Mangal Murti Complex`, `Dosti Vihar` |
| `Bathroom` | `str` | 828 | 0.44% | 11 | `1`, `2` |
| `Balcony` | `str` | 48,935 | 26.09% | 11 | `2`, `1` |
| `Car Parking` | `str` | 103,357 | 55.11% | 229 | `1 Open`, `1 Covered` |
| `Ownership` | `str` | 65,517 | 34.94% | 4 | `Freehold`, `Freehold` |
| `Super Area` | `str` | 107,685 | 57.42% | 2,976 | `680 sqft`, `575 sqft` |
| `Dimensions` | `float64` | 187,531 | 100.0% | 0 |  |
| `Plot Area` | `float64` | 187,531 | 100.0% | 0 |  |

---

## 4. Key Statistical Distributions

### 4.1 Target Price (`Amount(in rupees)`)
- **Valid Non-Zero Listings**: 177,847
- **Median Price**: ₹78.00 Lakhs (₹0.78 Cr)
- **Mean Price**: ₹119.81 Lakhs
- **25th Percentile**: ₹48.40 Lakhs
- **75th Percentile**: ₹145.00 Lakhs
- **95th Percentile**: ₹3.39 Cr
- **99th Percentile**: ₹7.00 Cr

### 4.2 Area Dimensions
- **Carpet Area Median**: 1,064.0 sq.ft.
- **Carpet Area Interquartile Range (IQR)**: 800.0 to 1,500.0 sq.ft.
- **Plausible Range (100 to 20,000 sq.ft.)**: 105,096 records.

### 4.3 BHK Configuration Distribution
- **1 BHK**: 13,174 listings (7.02%)
- **2 BHK**: 75,508 listings (40.26%)
- **3 BHK**: 80,848 listings (43.11%)
- **4 BHK**: 16,600 listings (8.85%)
- **5 BHK**: 1,183 listings (0.63%)
- **6 BHK**: 98 listings (0.05%)
- **7 BHK**: 22 listings (0.01%)
- **8 BHK**: 17 listings (0.01%)
- **9 BHK**: 7 listings (0.0%)
- **10 BHK**: 43 listings (0.02%)

### 4.4 Top 15 Locations
- **New-Delhi**: 27,599 listings (14.72%)
- **Bangalore**: 24,030 listings (12.81%)
- **Kolkata**: 22,380 listings (11.93%)
- **Gurgaon**: 20,070 listings (10.7%)
- **Ahmedabad**: 12,750 listings (6.8%)
- **Hyderabad**: 12,300 listings (6.56%)
- **Chennai**: 10,500 listings (5.6%)
- **Jaipur**: 8,490 listings (4.53%)
- **Greater-Noida**: 4,710 listings (2.51%)
- **Faridabad**: 3,840 listings (2.05%)
- **Vadodara**: 2,388 listings (1.27%)
- **Surat**: 2,370 listings (1.26%)
- **Pune**: 2,225 listings (1.19%)
- **Thane**: 1,933 listings (1.03%)
- **Mumbai**: 1,860 listings (0.99%)

---

## 5. Architectural Recommendations for `ml/preprocessing.py`

1. **Target**: Parse `Amount(in rupees)` to `price_inr` (numeric float). Train regression models using `log1p(price_inr)` to handle heavy right skew.
2. **Area**: Standardize unit strings into `area_sqft`. Prioritize `Carpet Area`; if absent, compute fallback from `Super Area` with a $0.75$ carpet-to-super factor.
3. **Layout**: Extract `bhk` from `Title`. Parse `Bathroom` and `Balcony` into numeric integers with median imputation.
4. **Vertical Position**: Parse `Floor` into `floor_number` and `total_floors`. Compute `floor_ratio` (floor / total_floors).
5. **Categorical Pipeline**: One-Hot Encode `location`, `Status`, `Transaction`, and `Furnishing`.
6. **Leakage Enforcement**: Drop `Price (in rupees)` permanently prior to feature encoding.
