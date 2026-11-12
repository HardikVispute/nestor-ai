import React from 'react'

type BadgeLevel = 'low' | 'medium' | 'high' | 'ready' | 'not_ready' | 'loading'

interface StatusBadgeProps {
  level: BadgeLevel
  label: string
  className?: string
}

const DOT_COLOR: Record<BadgeLevel, string> = {
  low: '#10B981',    // emerald
  ready: '#10B981',
  medium: '#F59E0B', // amber
  loading: '#F59E0B',
  high: '#EF4444',   // red
  not_ready: '#EF4444',
}

const TEXT_COLOR: Record<BadgeLevel, string> = {
  low: '#6EE7B7',
  ready: '#6EE7B7',
  medium: '#FDE68A',
  loading: '#FDE68A',
  high: '#FCA5A5',
  not_ready: '#FCA5A5',
}

export default function StatusBadge({ level, label, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-xl ${className}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: TEXT_COLOR[level],
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: DOT_COLOR[level] }}
      />
      {label}
    </span>
  )
}
