'use client'

import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { usePerformanceMode } from '@/contexts/PerformanceContext'
import {
  STATIC_WAVE_POSTER,
  useOptimizedHlsVideo,
} from '@/hooks/useOptimizedHlsVideo'
import LiquidChromeWavesCanvas from '@/components/shared/LiquidChromeWavesCanvas'
import { LiquidGlassButton } from '@/components/ui/liquid-glass'

const MUX_HLS_SRC =
  'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8'

const CtaFooter = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { isLightweight } = usePerformanceMode()

  const { hasError, isPlaying, isInView, isDocumentVisible, activeResolution } =
    useOptimizedHlsVideo({
      src: MUX_HLS_SRC,
      videoRef,
      containerRef: sectionRef,
      maxHeight: isLightweight ? 480 : 1080,
      preferLowest: isLightweight,
      reducedMotion: false,
      rootMargin: '120px',
    })

  const showChromeFallback = !isPlaying || hasError

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-6 md:px-16 lg:px-24 text-center overflow-hidden bg-black"
    >
      {/* Moving liquid chrome wave fallback if Mux HLS is unauthorized/buffering */}
      {showChromeFallback && (
        <LiquidChromeWavesCanvas
          paused={isLightweight || !isInView || !isDocumentVisible}
          opacity={isLightweight ? 0.5 : 0.9}
        />
      )}

      {/* Background HLS Video (lazy initialized via IntersectionObserver) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster={STATIC_WAVE_POSTER}
        data-hls-playing={isPlaying ? 'true' : 'false'}
        data-hls-status={hasError ? 'unauthorized_fallback' : isPlaying ? 'playing' : 'pending'}
        data-hls-resolution={activeResolution || 'none'}
        className={`absolute inset-0 w-full h-full object-cover z-0 ${
          isPlaying && !hasError ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 z-[1] pointer-events-none"
        style={{
          height: '200px',
          background: 'linear-gradient(to bottom, black, transparent)',
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none"
        style={{
          height: '200px',
          background: 'linear-gradient(to top, black, transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white tracking-tight leading-[0.95] max-w-3xl mx-auto mb-4">
          Your next website starts here.
        </h2>
        <p className="text-white/60 font-body font-light text-sm md:text-base max-w-xl mx-auto mb-8">
          Book a free strategy call. See what AI&#8209;powered design can do. No
          commitment, no pressure. Just possibilities.
        </p>
        <div className="flex items-center justify-center gap-6">
          <LiquidGlassButton
            radius={999}
            scale={46}
            aberration={14}
            bevelDepth={16}
            frost={0.34}
            tint={0.1}
            glassClassName="px-9 py-4 text-base font-semibold"
          >
            <span>Book a Call</span>
            <ArrowUpRight className="h-5 w-5" />
          </LiquidGlassButton>
          <LiquidGlassButton
            radius={999}
            scale={46}
            aberration={14}
            bevelDepth={16}
            frost={0.44}
            tint={0.2}
            glassClassName="px-9 py-4 text-base font-semibold !border-white/50 text-white"
          >
            <span>View Pricing</span>
            <ArrowUpRight className="h-4 w-4" />
          </LiquidGlassButton>
        </div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 font-body font-light text-xs">
            &copy; 2026 NESTOR AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-white/40 hover:text-white/70 font-body font-light text-xs transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaFooter
