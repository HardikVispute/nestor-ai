'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

export default function BackgroundWaves() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const src = 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8'

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls({
        autoStartLoad: true,
        startLevel: -1,
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.play().catch(() => {})
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [])

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 bg-[#030508]"
      aria-hidden="true"
    >
      {/* Ambient Luminous Aurora Mesh (always visible, refracted by LiquidGlass bevels) */}
      <div
        className="absolute -top-[18%] -left-[8%] w-[62vw] h-[62vw] rounded-full opacity-45 blur-[110px]"
        style={{
          background:
            'radial-gradient(circle, rgba(39, 215, 174, 0.36) 0%, rgba(18, 125, 118, 0.16) 45%, transparent 72%)',
        }}
      />
      <div
        className="absolute top-[12%] -right-[10%] w-[58vw] h-[58vw] rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(121, 169, 245, 0.34) 0%, rgba(79, 70, 229, 0.18) 45%, transparent 72%)',
        }}
      />
      <div
        className="absolute -bottom-[20%] left-[22%] w-[64vw] h-[54vw] rounded-full opacity-35 blur-[125px]"
        style={{
          background:
            'radial-gradient(circle, rgba(45, 212, 191, 0.28) 0%, rgba(56, 189, 248, 0.15) 45%, transparent 75%)',
        }}
      />

      {/* Background HLS Cinematic Light Waves */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-55 filter brightness-110 contrast-125 saturate-150 transition-opacity duration-1000"
      />

      {/* Precision Architectural Dot Matrix & Light Streaks for Optical Refraction */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.28) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <svg
        className="absolute inset-0 w-full h-full opacity-45"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-ribbon-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(39,215,174,0)" />
            <stop offset="30%" stopColor="rgba(39,215,174,0.45)" />
            <stop offset="65%" stopColor="rgba(121,169,245,0.48)" />
            <stop offset="100%" stopColor="rgba(121,169,245,0)" />
          </linearGradient>
          <linearGradient id="wave-ribbon-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(121,169,245,0)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.32)" />
            <stop offset="75%" stopColor="rgba(39,215,174,0.42)" />
            <stop offset="100%" stopColor="rgba(39,215,174,0)" />
          </linearGradient>
        </defs>
        <path
          d="M-80 280 C 320 120, 680 460, 1120 240 C 1380 110, 1540 220, 1700 180"
          fill="none"
          stroke="url(#wave-ribbon-1)"
          strokeWidth="3"
        />
        <path
          d="M-80 320 C 340 160, 700 500, 1140 280 C 1400 150, 1560 260, 1700 220"
          fill="none"
          stroke="url(#wave-ribbon-2)"
          strokeWidth="1.5"
        />
        <path
          d="M-80 680 C 360 820, 740 480, 1180 690 C 1420 800, 1560 640, 1700 680"
          fill="none"
          stroke="url(#wave-ribbon-1)"
          strokeWidth="2.5"
        />
        <path
          d="M-80 720 C 380 860, 760 520, 1200 730 C 1440 840, 1580 680, 1700 720"
          fill="none"
          stroke="url(#wave-ribbon-2)"
          strokeWidth="1.2"
        />
      </svg>

      {/* Balanced Contrast Vignette (preserves luminous edges while keeping legibility crisp) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.58) 100%)',
        }}
      />
    </div>
  )
}
