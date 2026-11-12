'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import Hls from 'hls.js'

export const STATIC_WAVE_POSTER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'><defs><linearGradient id='w1' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%23000000'/><stop offset='35%' stop-color='%233c2a6e' stop-opacity='0.65'/><stop offset='65%' stop-color='%237483b8' stop-opacity='0.55'/><stop offset='100%' stop-color='%23000000'/></linearGradient><linearGradient id='w2' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='%23000000'/><stop offset='40%' stop-color='%239aa8d6' stop-opacity='0.35'/><stop offset='75%' stop-color='%235b3a70' stop-opacity='0.45'/><stop offset='100%' stop-color='%23000000'/></linearGradient></defs><rect width='1280' height='720' fill='%23000000'/><path d='M-60 440 C 260 220, 620 580, 980 370 C 1150 270, 1250 320, 1340 290 L 1340 460 C 1180 510, 940 590, 620 640 C 320 690, 120 560, -60 600 Z' fill='url(%23w1)'/><path d='M-60 480 C 300 320, 680 540, 1040 410 C 1200 350, 1280 390, 1340 370 L 1340 510 C 1160 560, 860 590, 560 610 C 260 630, 80 530, -60 540 Z' fill='url(%23w2)'/></svg>"

interface UseOptimizedHlsOptions {
  src: string
  videoRef: RefObject<HTMLVideoElement | null>
  containerRef: RefObject<HTMLElement | null>
  maxHeight?: number
  preferLowest?: boolean
  reducedMotion?: boolean
  rootMargin?: string
}

interface UseOptimizedHlsResult {
  isInView: boolean
  isDocumentVisible: boolean
  isPlaying: boolean
  hasError: boolean
  activeResolution: string | null
}

export function useOptimizedHlsVideo({
  src,
  videoRef,
  containerRef,
  maxHeight = 720,
  preferLowest = false,
  reducedMotion = false,
  rootMargin = '120px',
}: UseOptimizedHlsOptions): UseOptimizedHlsResult {
  const hlsRef = useRef<Hls | null>(null)
  const initializedRef = useRef(false)
  const recoveredMediaOnceRef = useRef(false)

  const [isInView, setIsInView] = useState(false)
  const [isDocumentVisible, setIsDocumentVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState === 'visible',
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [activeResolution, setActiveResolution] = useState<string | null>(null)

  // 1. Track browser tab visibility
  useEffect(() => {
    if (typeof document === 'undefined') return
    const handleVisibility = () => {
      setIsDocumentVisible(document.visibilityState === 'visible')
    }
    handleVisibility()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // 2. Track viewport visibility lazily via IntersectionObserver
  useEffect(() => {
    const target = containerRef.current
    if (!target) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setIsInView(entry.isIntersecting)
        }
      },
      { rootMargin, threshold: 0.01 },
    )

    observer.observe(target)
    return () => {
      observer.disconnect()
    }
  }, [containerRef, rootMargin])

  // 3. Lazy HLS initialization (only once visible & reducedMotion is off)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (reducedMotion) {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      initializedRef.current = false
      video.pause()
      video.removeAttribute('src')
      video.load()
      setIsPlaying(false)
      setActiveResolution(null)
      return
    }

    if (!isInView || !isDocumentVisible || initializedRef.current) {
      return
    }

    initializedRef.current = true
    setHasError(false)
    recoveredMediaOnceRef.current = false

    if (Hls.isSupported()) {
      // Guard against duplicate HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }

      const hls = new Hls({
        autoStartLoad: true,
        capLevelToPlayerSize: true,
        maxBufferLength: 6,
        maxMaxBufferLength: 12,
        maxBufferSize: 12 * 1000 * 1000,
        backBufferLength: 4,
        startLevel: -1,
      })

      hlsRef.current = hls

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels = data?.levels || hls.levels || []
        if (levels.length > 0) {
          // Sort candidate indices by bitrate/height ascending
          const indexed = levels.map((lvl, idx) => ({
            idx,
            height: lvl.height || 0,
            bitrate: lvl.bitrate || 0,
          }))
          indexed.sort((a, b) => a.height - b.height || a.bitrate - b.bitrate)

          const withinCap = indexed.filter((l) => l.height <= maxHeight)
          const pool = withinCap.length > 0 ? withinCap : indexed

          // Pick lowest-bitrate rendition in Performance mode, or balanced mid-low <= 480p/720p
          const chosen = preferLowest
            ? pool[0]
            : pool.find((l) => l.height >= 480) || pool[0]

          const capTarget = withinCap.length > 0 ? withinCap[withinCap.length - 1].idx : chosen.idx
          hls.autoLevelCapping = capTarget
          hls.currentLevel = chosen.idx
          hls.loadLevel = chosen.idx

          const lvlObj = levels[chosen.idx]
          if (lvlObj?.width && lvlObj?.height) {
            setActiveResolution(`${lvlObj.width}x${lvlObj.height}`)
          }
        }

        if (document.visibilityState === 'visible') {
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
        }
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const lvl = hls.levels?.[data.level]
        if (lvl?.width && lvl?.height) {
          setActiveResolution(`${lvl.width}x${lvl.height}`)
        }
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recoveredMediaOnceRef.current) {
          recoveredMediaOnceRef.current = true
          hls.recoverMediaError()
          return
        }
        // Unrecoverable error: gracefully fall back to static poster
        setHasError(true)
        setIsPlaying(false)
        hls.destroy()
        hlsRef.current = null
      })

      hls.loadSource(src)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }, [src, videoRef, isInView, isDocumentVisible, reducedMotion, maxHeight, preferLowest])

  // 4. Dynamically switch resolution cap when maxHeight/preferLowest changes (e.g. toggling Performance Mode)
  useEffect(() => {
    const hls = hlsRef.current
    if (!hls || !hls.levels || hls.levels.length === 0) return

    const indexed = hls.levels.map((lvl, idx) => ({
      idx,
      height: lvl.height || 0,
      bitrate: lvl.bitrate || 0,
    }))
    indexed.sort((a, b) => a.height - b.height || a.bitrate - b.bitrate)

    const withinCap = indexed.filter((l) => l.height <= maxHeight)
    const pool = withinCap.length > 0 ? withinCap : indexed
    const chosen = preferLowest
      ? pool[0]
      : pool.find((l) => l.height >= 480) || pool[0]

    const capTarget = withinCap.length > 0 ? withinCap[withinCap.length - 1].idx : chosen.idx
    hls.autoLevelCapping = capTarget
    hls.nextLevel = chosen.idx
  }, [maxHeight, preferLowest])

  // 5. Pause & stop buffering when invisible or hidden; resume only when visible & active
  useEffect(() => {
    const video = videoRef.current
    const hls = hlsRef.current
    if (!video || !initializedRef.current || reducedMotion || hasError) return

    if (isInView && isDocumentVisible) {
      if (hls) hls.startLoad()
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    } else {
      video.pause()
      if (hls) hls.stopLoad()
      setIsPlaying(false)
    }
  }, [videoRef, isInView, isDocumentVisible, reducedMotion, hasError])

  // 6. Clean teardown on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      initializedRef.current = false
    }
  }, [])

  return {
    isInView,
    isDocumentVisible,
    isPlaying,
    hasError,
    activeResolution,
  }
}
