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
   - Fixed `88px` layout column that smoothly expands to `268px` on hover/focus (`duration-200`), keeping `28px` Lucide icons anchored while `16px` Glacial Indifference labels appear on the right side without triggering workspace reflow.
   - Top: `52x52` squircle emblem with letter "N", institutional emerald border.
   - Full `blur(28px) saturate(160%)` glass surface in Full FX (optional Performance Mode disables heavy blur).
2. **Telemetry Header (`Header.tsx`)**:
   - Sticky top `84px` height, `backdrop-filter: blur(24px)` glass material.
   - Left: Breadcrumb hierarchy (`NESTOR AI / Section`) + Glacial Indifference title.
   - Center: Interactive search command bar (`⌘K`).
   - Right: Unobtrusive `Full FX` (default) / `Performance` toggle, 65k listings counter, animated `animate-ping` model status dot, and "+ New Valuation" CTA.
3. **Overview Command Center (`OverviewPanel.tsx`)**:
   - Full optical `<LiquidGlass>` refraction (`scale={36–40}`, `aberration={10–12}`, `bevelDepth={20–24}`, `frost={0.6–0.7}`) across Hero, 4-segment KPI strip, Metro Market chart panel, Valuation Intelligence panel, Metro Cluster Coverage, and Residual Dispersion.
   - Interactive Recharts Area/Bar charts with smooth entrance/draw animations in Full FX.
4. **Valuation Workspace (`PropertyForm.tsx` & `ValuationResultPanel.tsx`)**:
   - Preset chips: 4 real institutional archetypes.
   - Nested inputs with `bg-black/60 backdrop-blur-md` glass styling.
   - All result panels rendered with full optical `<LiquidGlass>` refraction, animated result reveal (`animate-result-reveal`), INR formatting, 80% empirical envelope gauge, factor drivers, and 5 nearest comps.
5. **Valuation Audit Trail (`ValuationHistoryPanel.tsx`)**:
   - Session persistence using `localStorage`, memoized filtering, full `<LiquidGlass>` surfaces, single-click reload, and CSV export.
6. **Market Intelligence (`MarketIntelligencePanel.tsx`)**:
   - Connected to `/api/market/trends` serving 14 real city aggregates; full `<LiquidGlass>` refraction across banner, active city hero, and metro city grid cards.

---

## 4. Typography & Numerals

- **Primary Font Family**: `'Glacial Indifference', 'Barlow', sans-serif` (locally bundled via `typeface-glacial-indifference` & `/fonts/glacial-indifference/`).
- **Monospace & Telemetry**: `ui-monospace, Cascadia Code, Menlo`.
- **Financial Figures**: All currency, square footages, percentages, and timestamps use `font-variant-numeric: tabular-nums` (`tabular-nums` CSS class).

---

## 5. Cinematic Backdrop & Experience Modes

- **Cinematic Waves (`BackgroundWaves.tsx` + `LiquidChromeWavesCanvas.tsx`)**:
  - Attempts the Mux HLS stream (`useOptimizedHlsVideo.ts`) and renders a live 60fps animated liquid chrome & emerald metallic wave canvas (`LiquidChromeWavesCanvas`) whenever external HLS is unauthorized (HTTP 403) or buffering.
- **Experience Modes (`PerformanceContext.tsx`)**:
  - **Full FX (Default)**: Full optical `LiquidGlass` RGB chromatic aberration (`aberration={8–12}`, `frost={0.55–0.7}`), animated metallic chrome waves, `animate-ping` telemetry indicators, chart animations, and layered glass blurs.
  - **Performance Mode (Optional Toggle)**: Persisted in `localStorage`; disables SVG displacement filters, drops backdrop blurs, pauses animated wave canvas motion, and disables hover/entrance animations.

