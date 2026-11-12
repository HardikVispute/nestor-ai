'use client'

import { useRef } from 'react'
import { usePerformanceMode } from '@/contexts/PerformanceContext'
import {
  STATIC_WAVE_POSTER,
  useOptimizedHlsVideo,
} from '@/hooks/useOptimizedHlsVideo'
import LiquidChromeWavesCanvas from '@/components/shared/LiquidChromeWavesCanvas'

const MUX_HLS_SRC =
  'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8'

export default function BackgroundWaves() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { isLightweight } = usePerformanceMode()

  const { hasError, isPlaying, isDocumentVisible, activeResolution } =
    useOptimizedHlsVideo({
      src: MUX_HLS_SRC,
      videoRef,
      containerRef,
      maxHeight: isLightweight ? 480 : 1080,
      preferLowest: isLightweight,
      reducedMotion: false,
      rootMargin: '0px',
    })

  // Render animated liquid chrome waves whenever HLS video is buffering, unauthorized (403), or inactive
  const showChromeFallback = !isPlaying || hasError

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 bg-black"
      aria-hidden="true"
    >
      {/* Animated Iridescent Liquid Chrome Waves (active when Mux HLS returns 403 or buffers) */}
      {showChromeFallback && (
        <LiquidChromeWavesCanvas
          paused={isLightweight || !isDocumentVisible}
          opacity={isLightweight ? 0.45 : 0.96}
        />
      )}

      {/* Original Mux HLS Video Background (if CDN authorizes playback) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={STATIC_WAVE_POSTER}
        data-hls-playing={isPlaying ? 'true' : 'false'}
        data-hls-status={hasError ? 'unauthorized_fallback' : isPlaying ? 'playing' : 'pending'}
        data-hls-resolution={activeResolution || 'none'}
        className={`absolute inset-0 w-full h-full object-cover filter brightness-110 contrast-125 saturate-150 transition-opacity duration-700 ${
          isPlaying && !hasError
            ? isLightweight
              ? 'opacity-40'
              : 'opacity-70'
            : 'opacity-0'
        }`}
      />

      {/* Precision Micro-Dot Light Matrix so curved LiquidGlass rims visibly refract point highlights */}
      {!isLightweight && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.34) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      )}

      {/* Balanced Contrast Vignette (preserves bright specular crests behind glass borders) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.42) 100%)',
        }}
      />
    </div>
  )
}
