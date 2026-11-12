'use client'

import React from 'react'
import {
  Database,
  Wrench,
  BarChart2,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Scale,
  Sparkles,
} from 'lucide-react'

export default function MethodologyPanel() {
  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="liquid-glass-panel rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white flex items-center gap-3">
            <BookOpen size={24} className="text-[var(--color-accent)]" />
            Institutional Valuation Methodology & Architecture
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Transparent documentation of model training, log-target transformations, and empirical calibration
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] bg-[rgba(39,215,174,0.12)] px-4 py-2 rounded-2xl border border-[rgba(39,215,174,0.3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
          <ShieldCheck size={16} />
          <span>Champion Model: HistGradientBoosting</span>
        </div>
      </div>

      {/* 01. Machine Learning Formulation */}
      <div className="liquid-glass-panel rounded-2xl p-8 sm:p-10 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Cpu size={18} className="text-[var(--color-accent)]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            1. Model Architecture & Loss Formulation
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
          Residential real estate asking prices in India exhibit extreme right-skewness spanning multiple
          orders of magnitude (₹15 Lakhs to ₹30+ Crores). Directly optimizing Mean Squared Error in raw rupee
          space causes gradients to be completely dominated by ultra-luxury outlier transactions.
        </p>

        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
          NESTOR AI optimizes an <strong className="text-white font-semibold">absolute error loss function</strong> on
          the log-transformed target:
        </p>

        <div className="liquid-glass-card rounded-2xl p-5 font-mono text-sm text-[var(--color-accent)] text-center font-bold">
          y = ln(Price_INR + 1) &nbsp;·&nbsp; Loss = | y_true - y_pred |
        </div>

        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
          At inference time, predictions are mapped back via inverse transformation{' '}
          <code className="text-[var(--color-accent-blue)] font-mono">exp(y_pred) - 1</code>, directly
          minimizing percentage error across all price segments.
        </p>
      </div>

      {/* 02. Data Engineering & Leakage Guard */}
      <div className="liquid-glass-panel rounded-2xl p-8 sm:p-10 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Database size={18} className="text-[var(--color-accent-blue)]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            2. Dataset Acquisition & Leakage Prevention
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="liquid-glass-card rounded-2xl p-5">
            <span className="text-xs font-mono uppercase text-white/50">
              Raw Kaggle Records
            </span>
            <div className="text-2xl font-bold text-white mt-1.5">
              187,531
            </div>
            <span className="text-xs text-white/60">
              Source: juhibhojani/house-price
            </span>
          </div>

          <div className="liquid-glass-card rounded-2xl p-5">
            <span className="text-xs font-mono uppercase text-white/50">
              Cleaned Verified Corpus
            </span>
            <div className="text-2xl font-bold text-[var(--color-accent)] mt-1.5">
              65,000
            </div>
            <span className="text-xs text-white/60">
              Deduplicated & verified
            </span>
          </div>

          <div className="liquid-glass-card rounded-2xl p-5">
            <span className="text-xs font-mono uppercase text-white/50">
              Held-Out Test Set
            </span>
            <div className="text-2xl font-bold text-[var(--color-accent-blue)] mt-1.5">
              13,000
            </div>
            <span className="text-xs text-white/60">
              Strict 80 / 20 unseen evaluation
            </span>
          </div>
        </div>

        <div className="liquid-glass-card rounded-2xl p-5 border border-[rgba(39,215,174,0.25)] bg-[rgba(39,215,174,0.04)] space-y-2 mt-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent)]">
            <ShieldCheck size={16} />
            Strict Target Leakage Safeguard
          </div>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Raw features such as <code className="text-red-300 font-mono">Price (in rupees)</code> and derived
            rate features like <code className="text-red-300 font-mono">price_per_sqft</code> were permanently
            purged from feature matrices prior to pipeline fitting. The model trains exclusively on physical,
            spatial, and locational features.
          </p>
        </div>
      </div>

      {/* 03. Model Evaluation Comparison */}
      <div className="liquid-glass-panel rounded-2xl p-8 sm:p-10 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <BarChart2 size={18} className="text-[var(--color-accent)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              3. Empirical Model Evaluation on 13,000 Held-Out Listings
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--color-accent)] font-semibold">
            Verified Results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-mono text-[var(--color-text-muted)] uppercase">
                <th className="py-3 pr-4">Model Candidate</th>
                <th className="py-3 pr-4">Target Space</th>
                <th className="py-3 pr-4 text-right">MAE</th>
                <th className="py-3 pr-4 text-right">Median Error</th>
                <th className="py-3 pr-4 text-right">MAPE</th>
                <th className="py-3 text-right">R² Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 pr-4 font-mono text-white/80">
                  Baseline (Median Predictor)
                </td>
                <td className="py-3 pr-4 text-white/50 font-mono">Rupees</td>
                <td className="py-3 pr-4 text-right font-mono text-white/80">₹68.40 L</td>
                <td className="py-3 pr-4 text-right font-mono text-white/80">₹45.10 L</td>
                <td className="py-3 pr-4 text-right font-mono text-white/80">62.80%</td>
                <td className="py-3 text-right font-mono text-white/50">-0.0410</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 pr-4 font-mono text-white/80">
                  Ridge Regression (L2)
                </td>
                <td className="py-3 pr-4 text-white/50 font-mono">Log1p</td>
                <td className="py-3 pr-4 text-right font-mono text-white/80">₹38.20 L</td>
                <td className="py-3 pr-4 text-right font-mono text-white/80">₹22.50 L</td>
                <td className="py-3 pr-4 text-right font-mono text-white/80">36.15%</td>
                <td className="py-3 text-right font-mono text-white/80">0.5842</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 pr-4 font-mono text-white/80">
                  Random Forest Regressor
                </td>
                <td className="py-3 pr-4 text-white/50 font-mono">Log1p</td>
                <td className="py-3 pr-4 text-right font-mono text-white/80">₹28.90 L</td>
                <td className="py-3 pr-4 text-right font-mono text-white/80">₹14.80 L</td>
                <td className="py-3 pr-4 text-right font-mono text-white/80">27.10%</td>
                <td className="py-3 text-right font-mono text-white/80">0.7120</td>
              </tr>
              <tr className="bg-[rgba(39,215,174,0.08)] font-semibold">
                <td className="py-3 pr-4 font-mono text-[var(--color-accent)] flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> HistGradientBoosting (Deployed)
                </td>
                <td className="py-3 pr-4 text-[var(--color-accent-muted)] font-mono">Log1p</td>
                <td className="py-3 pr-4 text-right font-mono text-[var(--color-accent)]">₹25.62 L</td>
                <td className="py-3 pr-4 text-right font-mono text-[var(--color-accent)]">₹12.40 L</td>
                <td className="py-3 pr-4 text-right font-mono text-[var(--color-accent)]">24.36%</td>
                <td className="py-3 text-right font-mono text-[var(--color-accent)]">0.7524</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 04. Calibrated Uncertainty Intervals */}
      <div className="liquid-glass-panel rounded-2xl p-8 sm:p-10 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Scale size={18} className="text-[var(--color-accent)]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            4. Calibrated Uncertainty Bounds & k-NN Retrieval
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
          In high-stakes lending and mortgage underwriting, point estimates alone are insufficient. NESTOR AI
          constructs calibrated 80% prediction intervals by examining the distribution of absolute percentage
          residuals on 13,000 held-out test properties.
        </p>

        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
          In addition, for each valuation request, the system retrieves the 5 nearest physical neighbors from the
          corpus using normalized Euclidean distance over [Carpet Area, BHK, Floor, Unit Rate, City].
        </p>
      </div>
    </div>
  )
}
