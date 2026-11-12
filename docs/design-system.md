# NESTOR AI — Design System & Visual Specification

> **Version**: 2.0.0 (Phase 2 Master Redesign)  
> **Philosophy**: Liquid Glass + Institutional Fintech Command Center  
> **Reference Layout**: OrbitPayout Command Center Architecture + Apple Liquid Glass Materials

---

## 1. Product Identity & Design Principles

NESTOR AI is an institutional-grade property valuation intelligence platform engineered for lenders, mortgage underwriters, fintech risk officers, and real estate analysts participating in the **Hero Housing Fintech Challenge**.

### Core Tenets

1. **Precision & Financial Rigor**: High-density typography, tabular numerals for currency and metrics, clear demarcation of empirical statistical intervals vs point predictions.
2. **Liquid Glass Materiality**: Translucent surfaces (`rgba(11, 22, 37, 0.78)` with `backdrop-filter: blur(18px) saturate(145%)`), specular top highlights, subtle slate borders (`rgba(148, 163, 184, 0.14)`), and zero opaque muddy containers.
3. **Restrained Color Discipline**: Strict institutional dark navy palette with an authoritative emerald accent (`#27D7AE`) and ice blue secondary accent (`#79A9F5`). **Strict prohibition of purple gradients, neon glowing blobs, or consumer marketplace styling.**
4. **Structural Geometry**: Full-viewport fixed vertical navigation rail (76px width), sticky top telemetry header (72px height), and continuous 4-segment KPI metric strip.

---

## 2. Color Palette & Design Tokens

| Token | Hex / RGBA | Role / Usage |
|---|---|---|
| `--color-bg` | `#050A12` | Primary application canvas background |
| `--color-bg-secondary` | `#08111E` | Secondary container & navigation rail base |
| `--color-surface-glass` | `rgba(11, 22, 37, 0.78)` | Translucent Liquid Glass material |
| `--color-surface-elevated` | `#132137` | Hover states, active tabs, inset elements |
| `--color-surface-subtle` | `#0F1B2C` | Sub-panels & metric tiles |
| `--color-border` | `rgba(148, 163, 184, 0.14)` | Primary structural borders |
| `--color-border-glass` | `rgba(180, 205, 230, 0.12)` | Specular glass highlight borders |
| `--color-accent` | `#27D7AE` | Primary emerald brand accent & positive telemetry |
| `--color-accent-dim` | `rgba(39, 215, 174, 0.12)` | Subtle emerald badge & selection fill |
| `--color-accent-blue` | `#79A9F5` | Secondary ice blue accent for volume & tech stats |
| `--color-text-primary` | `#EDF3FA` | Primary headings, active values, high contrast |
| `--color-text-secondary` | `#95A4B8` | Subtitles, labels, descriptions |
| `--color-text-muted` | `#65758A` | Micro-labels, metadata timestamps, table headers |
| `--color-warning` | `#F5C451` | Risk warning indicators & cautionary states |
| `--color-danger` | `#F07878` | Negative valuation impact & error alerts |

---

## 3. Layout Geometry & Architecture

```
+----+---------------------------------------------------------------+
|    | Header (72px) [Breadcrumb | Search ⌘K | Model Status | + New] |
|    +---------------------------------------------------------------+
|    | Main Scrollable Workspace (px-6 lg:px-8 py-6)                 |
| N  |                                                               |
| A  | 1. Continuous 4-Segment KPI Strip                             |
| V  |    [65k Listings | 20 Metros | 24.36% MAPE | Model Active]    |
|    |                                                               |
| R  | 2. Main Analytics Split (60% / 40%)                           |
| A  |    [Metro Area Chart] | [Champion Model Intelligence]         |
| I  |                                                               |
| L  | 3. Lower Telemetry Panels (50% / 50%)                         |
|    |    [Metro Cluster Coverage] | [Residual Dispersion Profile]   |
| 76 |                                                               |
+----+---------------------------------------------------------------+
```

### Component Breakdown

1. **Navigation Rail (`Sidebar.tsx`)**:
   - Fixed 76px width, 100vh full-height sticky positioning.
   - Top: Squircle emblem with letter "N", institutional emerald border & glow.
   - Vertical buttons with 19px Lucide icons, uppercase micro-labels, and hover flyout tooltips.
   - Active state: Emerald vertical indicator pill on left edge (`width: 3px`) + elevated background.
2. **Telemetry Header (`Header.tsx`)**:
   - Sticky top 72px height, glass material (`backdrop-filter: blur(18px)`).
   - Left: Breadcrumb hierarchy (`NESTOR AI / Section`) + challenge tag.
   - Center: Interactive search command bar with keyboard shortcut (`⌘K`).
   - Right: Real-time model pulse dot (`Model Ready · HistGradientBoosting`), 65k listings count, and "+ New Valuation" CTA.
3. **Overview Command Center (`OverviewPanel.tsx`)**:
   - Continuous 4-segment KPI strip partitioned by subtle vertical dividers (`divide-[rgba(148,163,184,0.12)]`).
   - Interactive Recharts Area/Line chart for unit asking rates (₹/sq.ft.) with toggle for volume.
   - Champion Model specifications: Loss formulation, 52k/13k data split, test MAE (₹25.62 L), and target leakage guard.
   - Metro cluster distribution progress bars and 13k test residual dispersion tiers.
4. **Valuation Workspace (`PropertyForm.tsx` & `ValuationResultPanel.tsx`)**:
   - Preset chips: 4 real institutional archetypes (Bengaluru Tech Corridor, Mumbai High-Rise, Gurgaon Golf Course, South Delhi Builder Floor).
   - Grouped 4-section layout: Geographic Location, Room Configuration, Space & Elevation, Asset Condition & Ownership Title.
   - Inline physical validation: Checks `super_builtup_area >= carpet_area` and `floor_number <= total_floors`.
   - Hero valuation card with INR formatting (Crores / Lakhs), unit rate, 80% empirical envelope gauge, factor attribution waterfall, and 5 nearest comps.
5. **Valuation Audit Trail (`ValuationHistoryPanel.tsx`)**:
   - Session persistence using `localStorage`.
   - Search & city filtering.
   - Single-click "Inspect" action to reload any historical valuation back into the workspace.
   - One-click CSV audit ledger export.
6. **Market Intelligence (`MarketIntelligencePanel.tsx`)**:
   - Connected to `/api/market/trends` serving 14 real city aggregates from `cleaned_properties.csv`.
   - 12-month housing price index (HPI) normalized area chart.

---

## 4. Typography & Numerals

- **Font Family**: Inter, ui-sans-serif, system-ui, -apple-system.
- **Monospace & Telemetry**: ui-monospace, Cascadia Code, Menlo.
- **Financial Figures**: All currency, square footages, percentages, and timestamps must use `font-variant-numeric: tabular-nums` (`tabular-nums` CSS class) to guarantee alignment across tables and metric cards.

