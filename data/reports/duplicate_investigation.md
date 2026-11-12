# NESTOR AI — Duplicate Investigation Report

> **Dataset**: `data/raw/house_prices.csv`  
> **Total Records**: 187,531  
> **Generated**: 2026-11-10  

---

## 1. Investigation Findings

| Duplicate Detection Level | Matching Criteria | Duplicate Count | % of Raw Data | Safe to Remove? |
|---|---|---|---|---|
| **Level 0 (Full Row)** | All 21 columns (including unique `Index`) | 0 | 0.00% | N/A (Index is distinct) |
| **Level 1 (Exact Content Duplicates)** | All 20 feature columns (excluding `Index`) | 119,339 | 63.64% | **YES** (Verbatim reposted ads) |
| **Level 2 (Ad Syndication Duplicates)** | `Title` + `Description` + `Amount` + `location` | 119,571 | 63.76% | **YES** (Same listing text/price) |
| **Level 3 (Specification Matches)** | `Title` + `Amount` + `location` + `Carpet` + `Super` + `Floor` | 121,173 | 64.61% | **CAUTION**: Contains same-floor units |

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
3. **Preservation**: This removes exactly **119,339 redundant ad scrapings**, retaining **68,192 legitimate property listings**.
