'use client'

import React from 'react'

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  tint?: number
  scale?: number
  bevelDepth?: number
  aberration?: number
}

const GLASS_SHADOW =
  'shadow-[0_10px_40px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.45)]'

export function LiquidGlass({
  children,
  className = '',
  contentClassName = '',
  tint = 0.06,
  scale = 32,
  bevelDepth = 12,
  aberration = 0,
  ...props
}: LiquidGlassProps) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden backdrop-blur-2xl border border-white/20 ${GLASS_SHADOW} transition-all duration-300 ${className}`}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${tint})`,
      }}
      {...props}
    >
      {/* Top specular glint reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.65) 50%, transparent 95%)',
        }}
      />
      <div className={contentClassName}>{children}</div>
    </div>
  )
}

export default LiquidGlass

