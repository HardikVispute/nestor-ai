# Frontend Architecture & Component Documentation — NESTOR AI

> **Framework**: Next.js 16.4.6 (App Router, Turbopack, React 19.3.0)  
> **Language**: TypeScript 5 (Strict Mode)  
> **Styling**: Tailwind CSS v4 + Liquid Glass Design Tokens (see [`docs/design-system.md`](file:///c:/PC/Hardik/Projects/Nestor%20AI/nestor-ai/docs/design-system.md))  
> **Location**: `nestor-ai/frontend/`  
> **Last Verified**: 2026-11-10

---

## 1. Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css                # CSS variables, backdrop filters & reset rules
│   │   ├── layout.tsx                 # Full-height dark root layout
│   │   └── page.tsx                   # Master workspace client controller
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Sticky 72px telemetry header & command bar
│   │   │   └── Sidebar.tsx            # Sticky 76px navigation rail
│   │   ├── overview/
│   │   │   └── OverviewPanel.tsx      # OrbitPayout KPI strip, Recharts & telemetry
│   │   ├── valuation/
│   │   │   ├── PropertyForm.tsx       # Grouped 4-section form with presets & validation
│   │   │   └── ValuationResultPanel.tsx # Hero asking value, 80% gauge, comps & factors
│   │   ├── history/
│   │   │   └── ValuationHistoryPanel.tsx # localStorage audit trail, search & CSV export
│   │   ├── market/
│   │   │   └── MarketIntelligencePanel.tsx # Real 14-metro aggregations & 12M HPI chart
│   │   ├── methodology/
│   │   │   └── MethodologyPanel.tsx   # Model specs, log-target loss & calibration
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx     # Accessible SVG spinner
│   │       ├── MetricCard.tsx         # Structured data-dense metric tile
│   │       └── StatusBadge.tsx        # Colored status indicator pill
│   ├── hooks/
│   │   └── useHealth.ts               # React hook polling /api/health
│   ├── lib/
│   │   ├── api.ts                     # Typed fetch client with APIError & market trends
│   │   └── formatters.ts              # Indian currency (Cr/L) & area formatters
│   └── types/
│       └── index.ts                   # Canonical TypeScript interfaces
├── package.json
├── tsconfig.json
└── next.config.ts                     # Next.js Turbopack configuration
```

---

## 2. Institutional Design System & Styling Tokens

NESTOR AI enforces a restrained, data-dense institutional aesthetic modeled after the **OrbitPayout Command Center** and **Apple Liquid Glass** functional material principles.

### Key CSS Tokens

```css
:root {
  /* Canvas Layers */
  --color-bg: #050A12;
  --color-bg-secondary: #08111E;
  
  /* Liquid Glass Surfaces */
  --color-surface-glass: rgba(11, 22, 37, 0.78);
  --color-surface-elevated: #132137;
  --color-surface-subtle: #0F1B2C;

  /* Specular Highlights & Borders */
  --color-border: rgba(148, 163, 184, 0.14);
  --color-border-glass: rgba(180, 205, 230, 0.12);

  /* Typography */
  --color-text-primary: #EDF3FA;
  --color-text-secondary: #95A4B8;
  --color-text-muted: #65758A;

  /* Institutional Accents */
  --color-accent: #27D7AE;             /* Institutional Emerald */
  --color-accent-blue: #79A9F5;        /* Ice Blue */
  --color-warning: #F5C451;            /* Amber warning */
  --color-danger: #F07878;             /* Coral error */
}
```

### Prohibited Elements
- **No purple gradients or "AI glowing blobs"**.
- **No unconstrained body scrolling** (full viewport height `h-screen` geometry).
- **No browser default list bullets** (strictly reset in `globals.css`).

---

## 3. Core Panels & Navigation Routing

The application implements a single-page workspace in [`src/app/page.tsx`](file:///c:/PC/Hardik/Projects/Nestor AI/nestor-ai/frontend/src/app/page.tsx) driven by state `activeNav: NavItem`:

### 3.1 Navigation Rail (`Sidebar.tsx`)
Width: 76px fixed rail. Displays the "N" brand squircle emblem and 5 navigation tabs:
1. **Overview** (`overview`): Continuous 4-segment KPI strip, Recharts metro unit rates, champion model specs, and 13k test residual breakdown.
2. **New Valuation** (`valuation`): Property valuation form with presets, physical validation, hero asking value, 80% empirical envelope, and 5 nearest comps.
3. **Valuation History** (`history`): LocalStorage audit trail of session valuations, search/filtering, and CSV export.
4. **Market Intelligence** (`market`): 14 real city aggregates from `cleaned_properties.csv` and 12-month housing price index.
5. **Methodology** (`methodology`): Technical documentation of model training, log-target loss, and empirical calibration.

### 3.2 Telemetry Header (`Header.tsx`)
Height: 72px sticky top. Displays active section breadcrumbs, challenge edition badge, interactive quick search command bar (`⌘K`), live model pulse dot (`HistGradientBoosting`), and "+ New Valuation" CTA.
