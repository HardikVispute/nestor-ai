// No 'use client' needed — purely presentational, no hooks
import React from 'react'

interface LoadingSpinnerProps {
  size?: number
  color?: string
  className?: string
}

export default function LoadingSpinner({
  size = 20,
  color = 'var(--color-accent)',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin ${className}`}
      aria-label="Loading"
      role="img"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
