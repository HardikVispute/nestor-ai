'use client'

import { useEffect, useRef } from 'react'

interface LiquidChromeWavesCanvasProps {
  paused?: boolean
  opacity?: number
}

/**
 * High-contrast iridescent liquid-chrome wave shader rendered on HTML5 2D canvas.
 * Engineered with bright silver specular crests, deep obsidian shadow folds, and
 * subtle violet / copper-amber / sapphire interference bands so LiquidGlass Snell's-law
 * bevels visibly refract and separate RGB chromatic light even without Mux video.
 */
export default function LiquidChromeWavesCanvas({
  paused = false,
  opacity = 0.96,
}: LiquidChromeWavesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let width = 0
    let height = 0
    let t = 0.8

    const resize = () => {
      const parent = canvas.parentElement
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent?.clientWidth || window.innerWidth
      height = parent?.clientHeight || window.innerHeight
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const ribbons = [
      {
        baseY: 0.43,
        amp1: 0.16,
        amp2: 0.08,
        freq: 0.95,
        speed: 0.34,
        phase: 0.35,
        thickness: 0.25,
        tilt: 0.22,
        stops: [
          [0.0, 'rgba(0, 0, 0, 0)'],
          [0.18, 'rgba(72, 46, 138, 0.65)'],
          [0.42, 'rgba(182, 170, 245, 0.72)'],
          [0.54, 'rgba(236, 242, 255, 0.80)'],
          [0.68, 'rgba(235, 152, 98, 0.54)'],
          [0.86, 'rgba(16, 24, 46, 0.88)'],
          [1.0, 'rgba(0, 0, 0, 0.96)'],
        ] as const,
        crestStops: [
          [0.0, 'rgba(255, 255, 255, 0)'],
          [0.2, 'rgba(186, 210, 255, 0.85)'],
          [0.5, 'rgba(255, 255, 255, 0.92)'],
          [0.75, 'rgba(255, 198, 152, 0.78)'],
          [1.0, 'rgba(255, 255, 255, 0)'],
        ] as const,
        bloomColor: 'rgba(198, 216, 255, 0.36)',
      },
      {
        baseY: 0.56,
        amp1: 0.13,
        amp2: 0.09,
        freq: 1.18,
        speed: -0.27,
        phase: 1.9,
        thickness: 0.21,
        tilt: -0.18,
        stops: [
          [0.0, 'rgba(0, 0, 0, 0)'],
          [0.2, 'rgba(42, 114, 214, 0.58)'],
          [0.44, 'rgba(204, 224, 255, 0.72)'],
          [0.55, 'rgba(232, 240, 255, 0.78)'],
          [0.72, 'rgba(128, 86, 206, 0.62)'],
          [0.9, 'rgba(10, 14, 24, 0.92)'],
          [1.0, 'rgba(0, 0, 0, 0.98)'],
        ] as const,
        crestStops: [
          [0.0, 'rgba(255, 255, 255, 0)'],
          [0.25, 'rgba(130, 196, 255, 0.92)'],
          [0.55, 'rgba(255, 255, 255, 0.96)'],
          [0.82, 'rgba(185, 150, 255, 0.82)'],
          [1.0, 'rgba(255, 255, 255, 0)'],
        ] as const,
        bloomColor: 'rgba(130, 186, 255, 0.32)',
      },
      {
        baseY: 0.68,
        amp1: 0.14,
        amp2: 0.06,
        freq: 0.88,
        speed: 0.23,
        phase: 3.3,
        thickness: 0.18,
        tilt: 0.14,
        stops: [
          [0.0, 'rgba(0, 0, 0, 0)'],
          [0.22, 'rgba(214, 118, 72, 0.48)'],
          [0.45, 'rgba(232, 238, 255, 0.84)'],
          [0.58, 'rgba(39, 215, 174, 0.42)'],
          [0.78, 'rgba(46, 78, 142, 0.62)'],
          [1.0, 'rgba(0, 0, 0, 0.96)'],
        ] as const,
        crestStops: [
          [0.0, 'rgba(255, 255, 255, 0)'],
          [0.22, 'rgba(255, 192, 140, 0.82)'],
          [0.52, 'rgba(255, 255, 255, 0.95)'],
          [0.8, 'rgba(121, 215, 245, 0.82)'],
          [1.0, 'rgba(255, 255, 255, 0)'],
        ] as const,
        bloomColor: 'rgba(195, 232, 255, 0.28)',
      },
    ]

    const drawRibbonCurve = (pts: Array<{ x: number; y: number }>, move: boolean) => {
      if (move) ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]
        const curr = pts[i]
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) / 2, (prev.y + curr.y) / 2)
      }
    }

    const drawFrame = (time: number) => {
      if (!width || !height) return

      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)

      // Cool obsidian & violet atmospheric glow behind chrome curves
      const bgGlow = ctx.createRadialGradient(
        width * (0.52 + 0.08 * Math.sin(time * 0.25)),
        height * (0.48 + 0.06 * Math.cos(time * 0.2)),
        width * 0.04,
        width * 0.5,
        height * 0.5,
        width * 0.78,
      )
      bgGlow.addColorStop(0, 'rgba(84, 72, 168, 0.28)')
      bgGlow.addColorStop(0.45, 'rgba(32, 56, 112, 0.16)')
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = bgGlow
      ctx.fillRect(0, 0, width, height)

      const steps = 72
      for (const r of ribbons) {
        const topPts: Array<{ x: number; y: number }> = []
        const midPts: Array<{ x: number; y: number }> = []
        const botPts: Array<{ x: number; y: number }> = []

        for (let i = 0; i <= steps; i++) {
          const u = i / steps
          const x = -50 + u * (width + 100)
          const wave1 = Math.sin(u * Math.PI * 2.15 * r.freq + time * r.speed + r.phase)
          const wave2 = Math.cos(
            u * Math.PI * 3.55 * r.freq - time * r.speed * 0.72 + r.phase * 1.35,
          )
          const centerY =
            height * (r.baseY + (u - 0.5) * r.tilt + wave1 * r.amp1 + wave2 * r.amp2)
          const localThickness =
            height *
            r.thickness *
            (0.68 + 0.42 * Math.sin(u * Math.PI * 2.1 + time * 0.42 + r.phase))
          topPts.push({ x, y: centerY - localThickness * 0.45 })
          midPts.push({ x, y: centerY - localThickness * 0.14 })
          botPts.push({ x, y: centerY + localThickness * 0.58 })
        }

        // Main sculpted metallic chrome fold
        ctx.beginPath()
        drawRibbonCurve(topPts, true)
        ctx.lineTo(botPts[botPts.length - 1].x, botPts[botPts.length - 1].y)
        for (let i = botPts.length - 2; i >= 0; i--) {
          const prev = botPts[i + 1]
          const curr = botPts[i]
          ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) / 2, (prev.y + curr.y) / 2)
        }
        ctx.closePath()

        const grad = ctx.createLinearGradient(
          0,
          height * (r.baseY - 0.28),
          width * 0.2,
          height * (r.baseY + 0.34),
        )
        for (const [stop, color] of r.stops) {
          grad.addColorStop(stop, color)
        }
        ctx.fillStyle = grad
        ctx.fill()

        // Specular core bloom along outer ridge
        const crestGrad = ctx.createLinearGradient(0, 0, width, 0)
        for (const [stop, color] of r.crestStops) {
          crestGrad.addColorStop(stop, color)
        }

        ctx.save()
        ctx.beginPath()
        drawRibbonCurve(topPts, true)
        ctx.strokeStyle = r.bloomColor
        ctx.lineWidth = 10
        ctx.stroke()

        // Crisp chrome specular rim highlight (primary refraction driver)
        ctx.beginPath()
        drawRibbonCurve(topPts, true)
        ctx.strokeStyle = crestGrad
        ctx.lineWidth = 2.6
        ctx.stroke()

        // Fine interior silk fold line
        ctx.beginPath()
        drawRibbonCurve(midPts, true)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)'
        ctx.lineWidth = 1.3
        ctx.stroke()
        ctx.restore()
      }
    }

    drawFrame(t)

    if (paused) {
      return () => {
        window.removeEventListener('resize', resize)
      }
    }

    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      drawFrame(t)
      animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [paused])

  return (
    <canvas
      ref={canvasRef}
      data-liquid-chrome-canvas={paused ? 'paused' : 'animating'}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    />
  )
}
