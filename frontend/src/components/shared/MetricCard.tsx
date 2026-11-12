import React from 'react'

interface MetricCardProps {
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  className?: string
}

export default function MetricCard({
  label,
  value,
  subValue,
  trend,
  icon,
  className = '',
}: MetricCardProps) {
  const trendColor =
    trend === 'up'
      ? 'var(--color-accent)'
      : trend === 'down'
        ? 'var(--color-danger)'
        : 'var(--color-text-muted)'

  const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

  return (
    <div
      className={`liquid-glass-card rounded-2xl p-5 flex flex-col gap-1.5 ${className}`}
    >
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color: 'var(--color-text-muted)' }}>{icon}</span>
        )}
      </div>

      {/* Value */}
      <span
        className="text-2xl font-bold leading-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {value}
      </span>

      {/* Sub-value / trend */}
      {(subValue || trend) && (
        <div className="flex items-center gap-2 mt-0.5">
          {subValue && (
            <span
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {subValue}
            </span>
          )}
          {trend && (
            <span className="text-xs font-medium" style={{ color: trendColor }}>
              {trendArrow}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
