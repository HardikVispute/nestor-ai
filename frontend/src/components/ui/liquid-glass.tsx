"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePerformanceMode } from "@/contexts/PerformanceContext";

export type LiquidGlassProps = HTMLAttributes<HTMLDivElement> & {
  contentClassName?: string;
  /** Corner radius in px. Default 20 (matches --ui-radius). */
  radius?: number;
  /** Rim band that bends light, in px. */
  bevelDepth?: number;
  /** Displacement strength in px. */
  scale?: number;
  /** Chromatic aberration spread in px. */
  aberration?: number;
  /** Extra blur after refraction, in px. */
  frost?: number;
  /** White body tint 0-1. */
  tint?: number;
  /** Skip viewport lazy gating if always anchored on screen (e.g. header/sidebar). */
  eager?: boolean;
};

// Shared displacement PNG cache across identically sized LiquidGlass panels/buttons/cards
const MAX_DISPLACEMENT_CACHE = 64;
const displacementCache = new Map<string, Promise<string>>();

async function getCachedDisplacementBlobUrl(opts: DisplacementOptions): Promise<string> {
  const rKey = Math.round(opts.radius);
  const bKey = Math.round(opts.bevelDepth);
  const dprKey = Number((opts.dpr ?? 1).toFixed(2));
  const key = `${opts.width}x${opts.height}:${rKey}:${bKey}:${dprKey}`;

  const existing = displacementCache.get(key);
  if (existing) {
    // Refresh LRU order
    displacementCache.delete(key);
    displacementCache.set(key, existing);
    return existing;
  }

  const promise = (async () => {
    const mapUrl = await generateDisplacementBlobUrl(opts);
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = img.onerror = () => resolve();
      img.src = mapUrl;
    });
    return mapUrl;
  })();

  if (displacementCache.size >= MAX_DISPLACEMENT_CACHE) {
    const oldestKey = displacementCache.keys().next().value;
    if (oldestKey) {
      const evictedPromise = displacementCache.get(oldestKey);
      displacementCache.delete(oldestKey);
      evictedPromise?.then((u) => URL.revokeObjectURL(u)).catch(() => {});
    }
  }
  displacementCache.set(key, promise);
  return promise;
}

/**
 * Full optical Liquid Glass surface. A Snell's-law displacement map bends
 * whatever sits behind the element through an SVG filter used as `backdrop-filter`,
 * with 3-channel RGB chromatic aberration, bevel specular highlight, and frost.
 */
export function LiquidGlass({
  children,
  className,
  contentClassName,
  radius = 32,
  bevelDepth = 36,
  scale = 52,
  aberration = 15,
  frost = 0.34,
  tint = 0.085,
  eager = false,
  style,
  ...rest
}: LiquidGlassProps) {
  const reactId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const { isLightweight } = usePerformanceMode();

  const [isInView, setIsInView] = useState(eager);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [filter, setFilter] = useState<{ id: string; svg: string } | null>(
    null,
  );
  const [mode, setMode] = useState<"pending" | "simple" | "opaque">("pending");

  useEffect(() => {
    const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 768;
    if (prefersReducedTransparency()) {
      setMode("opaque");
    } else if (isLightweight || isSafariLike() || !supportsUrlBackdropFilter()) {
      setMode("simple");
    } else if (isMobileViewport && bevelDepth >= 24) {
      // On small mobile screens, large panels use frosted glass to avoid GPU shader glitching
      setMode("simple");
    } else {
      setMode("pending");
    }
  }, [isLightweight, bevelDepth]);

  // Lazy visibility tracking: skip computing/compositing displacement filters while off-screen
  useEffect(() => {
    if (eager) {
      setIsInView(true);
      return;
    }
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { rootMargin: "120px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || mode !== "pending" || !isInView) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      // Border box, so the map matches the backdrop-filter layer.
      const box = entry.borderBoxSize?.[0];
      const width = box?.inlineSize ?? entry.contentRect.width;
      const height = box?.blockSize ?? entry.contentRect.height;
      const nextW = Math.max(1, Math.round(width));
      const nextH = Math.max(1, Math.round(height));
      setSize((prev) =>
        prev.w === nextW && prev.h === nextH ? prev : { w: nextW, h: nextH },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode, isInView]);

  useEffect(() => {
    if (mode !== "pending" || !isInView || size.w <= 1 || size.h <= 1) {
      if (mode !== "pending") setFilter(null);
      return;
    }
    let cancelled = false;

    (async () => {
      const area = size.w * size.h;
      const rawDpr = window.devicePixelRatio || 1;
      const dpr = area > 250000 ? 1 : Math.min(rawDpr, 2);

      const mapUrl = await getCachedDisplacementBlobUrl({
        width: size.w,
        height: size.h,
        radius: Math.min(radius, size.w / 2, size.h / 2),
        bevelDepth: Math.min(bevelDepth, Math.min(size.w, size.h) / 2),
        dpr,
      });
      if (cancelled) return;

      const id = `lg-${reactId}-${size.w}x${size.h}-${Date.now().toString(36)}`;
      setFilter({
        id,
        svg: buildFilterSvg({
          id,
          mapUrl,
          width: size.w,
          height: size.h,
          scale,
          aberration,
          frost,
        }),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, isInView, size.w, size.h, radius, bevelDepth, scale, aberration, frost, reactId]);

  const activeFilter = isInView ? filter : null;

  const backdrop =
    mode === "opaque"
      ? "none"
      : mode === "simple"
        ? isLightweight
          ? "none"
          : "blur(22px) saturate(1.55)"
        : activeFilter
          ? `url(#${activeFilter.id}) saturate(1.4) brightness(1.02)`
          : "blur(20px) saturate(1.5)";

  return (
    <div
      ref={rootRef}
      data-refract={mode === "pending" && activeFilter ? "true" : "false"}
      className={cn(
        "relative overflow-hidden border border-white/28 shadow-[0_24px_60px_-8px_rgb(0_0_0/0.68),0_6px_18px_rgb(0_0_0/0.45),inset_0_1.5px_1px_rgb(255_255_255/0.68),inset_0_-1.5px_2px_rgb(0_0_0/0.35),inset_0_-1px_0_rgb(255_255_255/0.22),inset_1px_0_0_rgb(255_255_255/0.2)] transition-[border-color,box-shadow,transform] duration-300",
        mode === "simple" && "bg-[rgba(10,14,22,0.72)]",
        mode === "opaque" && "bg-neutral-950",
        className,
      )}
      style={{
        borderRadius: radius,
        backgroundColor:
          mode === "pending" ? `rgb(255 255 255 / ${tint})` : undefined,
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop,
        ...style,
      }}
      {...rest}
    >
      {/* Sculpted Optical Specular Rim Highlight & Internal Depth Bevel */}
      {mode === "pending" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 24%, rgba(255,255,255,0) 56%, rgba(255,255,255,0.08) 100%)",
            boxShadow:
              "inset 0 0 18px rgba(255, 255, 255, 0.06), inset 0 -10px 24px rgba(0, 0, 0, 0.18)",
          }}
        />
      )}
      {activeFilter && mode === "pending" ? (
        <span
          key={activeFilter.id}
          aria-hidden
          className="pointer-events-none absolute size-0 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: activeFilter.svg }}
        />
      ) : null}
      {contentClassName ? (
        <div className={contentClassName}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

export type LiquidGlassButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    radius?: number;
    bevelDepth?: number;
    scale?: number;
    aberration?: number;
    frost?: number;
    tint?: number;
    eager?: boolean;
    glassClassName?: string;
  };

/**
 * Interactive button backed by real optical LiquidGlass Snell's-law refraction
 * and RGB chromatic aberration in Full FX mode, degrading gracefully in Performance Mode.
 */
export function LiquidGlassButton({
  children,
  className,
  glassClassName,
  radius = 999,
  bevelDepth = 16,
  scale = 42,
  aberration = 14,
  frost = 0.42,
  tint = 0.14,
  eager = false,
  type = "button",
  ...buttonProps
}: LiquidGlassButtonProps) {
  const { isLightweight } = usePerformanceMode();

  return (
    <button
      type={type}
      className={cn(
        "group relative inline-flex cursor-pointer text-white transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50 disabled:cursor-not-allowed",
        !isLightweight && "hover:scale-[1.03] active:scale-[0.97]",
        className,
      )}
      style={{ borderRadius: radius }}
      {...buttonProps}
    >
      <LiquidGlass
        eager={eager}
        radius={radius}
        bevelDepth={bevelDepth}
        scale={scale}
        aberration={aberration}
        frost={frost}
        tint={tint}
        className={cn(
          "w-full h-full flex items-center justify-center border-white/32 group-hover:border-white/60",
          glassClassName,
        )}
        contentClassName="flex items-center justify-center gap-2.5 w-full h-full"
      >
        {children}
      </LiquidGlass>
    </button>
  );
}

export interface LiquidGlassOption {
  value: string;
  label: string;
}

export interface LiquidGlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LiquidGlassOption[];
  placeholder?: string;
  className?: string;
  radius?: number;
  ariaLabel?: string;
}

/**
 * Frosted Apple Liquid Glass custom dropdown with refractive trigger
 * and floating optical glass listbox menu.
 */
export function LiquidGlassSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  radius = 999,
  ariaLabel,
}: LiquidGlassSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{
    top: number;
    left: number;
    width: number;
    openUp: boolean;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 260 && rect.top > spaceBelow;
      setMenuRect({
        top: openUp ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        openUp,
      });
    };

    updatePosition();

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <LiquidGlassButton
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        radius={radius}
        scale={34}
        aberration={12}
        bevelDepth={12}
        frost={0.4}
        tint={0.12}
        className="w-full"
        glassClassName="px-4 py-3 text-sm font-normal justify-between text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className={cn("truncate", selected ? "text-white" : "text-white/50")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-white/60 flex-shrink-0 transition-transform duration-200",
            open && "rotate-180 text-white",
          )}
        />
      </LiquidGlassButton>

      {open &&
        menuRect &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999]"
            style={{
              left: menuRect.left,
              width: menuRect.width,
              top: menuRect.openUp ? undefined : menuRect.top,
              bottom: menuRect.openUp ? window.innerHeight - menuRect.top : undefined,
            }}
          >
            <LiquidGlass
              eager
              radius={28}
              scale={28}
              aberration={10}
              bevelDepth={12}
              frost={1.6}
              tint={0.14}
              className="w-full border-white/35 shadow-[0_24px_60px_rgba(0,0,0,0.92)]"
              style={{
                backgroundColor: "rgba(10, 14, 24, 0.86)",
              }}
            >
              <ul
                role="listbox"
                className="max-h-60 overflow-y-auto p-2 space-y-1 relative z-10"
              >
                {options.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(opt.value);
                          setOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm text-left transition-all cursor-pointer",
                          isSelected
                            ? "bg-white/20 text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
                            : "text-white/80 hover:bg-white/12 hover:text-white",
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check size={14} className="text-white flex-shrink-0 ml-2" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </LiquidGlass>
          </div>,
          document.body,
        )}
    </div>
  );
}

function supportsUrlBackdropFilter() {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return (
    CSS.supports("backdrop-filter", "url(#x)") ||
    CSS.supports("-webkit-backdrop-filter", "url(#x)")
  );
}

function prefersReducedTransparency() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
}

function isSafariLike() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
}

/* ---------------------------------------------------------------------------
 * Displacement map
 * R = horizontal bend, G = vertical bend, B = rim specular, A = shape mask.
 * ------------------------------------------------------------------------- */

type DisplacementOptions = {
  width: number;
  height: number;
  radius: number;
  bevelDepth: number;
  gain?: number;
  light?: { x: number; y: number };
  dpr?: number;
};

function sdRoundedBox(
  px: number,
  py: number,
  halfW: number,
  halfH: number,
  r: number,
) {
  const qx = Math.abs(px) - halfW + r;
  const qy = Math.abs(py) - halfH + r;
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inside = Math.min(Math.max(qx, qy), 0);
  return inside + outside - r;
}

function bendFromDepth(x: number) {
  const u = 1 - Math.min(1, Math.max(0, x));
  const denom = (1 - u ** 4) ** 0.75;
  if (denom < 1e-6) return 0;
  const thetaI = Math.atan(Math.min(u ** 3 / denom, 8));
  const sinT = Math.sin(thetaI) / 1.5;
  if (sinT >= 1) return Math.sin(thetaI);
  return Math.sin(thetaI - Math.asin(sinT));
}

function buildPhiTable(bevelPx: number) {
  const n = Math.max(1, Math.ceil(bevelPx));
  const phi = new Float32Array(n + 1);
  for (let d = 1; d <= n; d++) phi[d] = phi[d - 1] + bendFromDepth(d / n);
  return phi;
}

function samplePhi(phi: Float32Array, depth: number) {
  const max = phi.length - 1;
  if (depth <= 0) return phi[0];
  if (depth >= max) return phi[max];
  const i = Math.floor(depth);
  const f = depth - i;
  return phi[i] * (1 - f) + phi[i + 1] * f;
}

function computeDisplacementData(opts: DisplacementOptions) {
  const dpr = opts.dpr ?? 1;
  const gain = opts.gain ?? 1.65;
  const light = opts.light ?? { x: -0.55, y: -0.85 };
  const lightLen = Math.hypot(light.x, light.y) || 1;
  const lx = light.x / lightLen;
  const ly = light.y / lightLen;

  const W = Math.max(1, Math.round(opts.width * dpr));
  const H = Math.max(1, Math.round(opts.height * dpr));
  const halfW = W / 2;
  const halfH = H / 2;
  const r = Math.min(opts.radius * dpr, halfW, halfH);
  const bevel = Math.max(1, opts.bevelDepth * dpr);
  const phi = buildPhiTable(bevel);
  const flatVal = phi[phi.length - 1];

  const field = new Float32Array(W * H);
  const distField = new Float32Array(W * H);
  const safeInnerW = halfW - bevel - 2.5;
  const safeInnerH = halfH - bevel - 2.5;
  for (let y = 0; y < H; y++) {
    const py = y - halfH + 0.5;
    const inInnerY = Math.abs(py) < safeInnerH;
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      const px = x - halfW + 0.5;
      if (inInnerY && Math.abs(px) < safeInnerW) {
        distField[idx] = -bevel - 4;
        field[idx] = flatVal;
        continue;
      }
      const d = sdRoundedBox(px, py, halfW, halfH, r);
      distField[idx] = d;
      field[idx] = d > 0 ? 0 : d <= -bevel ? flatVal : samplePhi(phi, -d);
    }
  }

  const data = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    const py = y - halfH + 0.5;
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      const i = idx << 2;
      const d = distField[idx];

      if (d > 0) {
        data[i] = data[i + 1] = data[i + 2] = 128;
        data[i + 3] = 0;
        continue;
      }

      if (d < -bevel - 1.5) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 0;
        data[i + 3] = 255;
        continue;
      }

      const px = x - halfW + 0.5;
      const x0 = Math.max(0, x - 1);
      const x1 = Math.min(W - 1, x + 1);
      const y0 = Math.max(0, y - 1);
      const y1 = Math.min(H - 1, y + 1);
      const dPhiX = (field[y * W + x1] - field[y * W + x0]) / (x1 - x0 || 1);
      const dPhiY = (field[y1 * W + x] - field[y0 * W + x]) / (y1 - y0 || 1);

      const dx = Math.max(-1, Math.min(1, dPhiX * gain));
      const dy = Math.max(-1, Math.min(1, dPhiY * gain));

      let specular = 0;
      if (d >= -bevel) {
        const gx =
          sdRoundedBox(px + 1, py, halfW, halfH, r) -
          sdRoundedBox(px - 1, py, halfW, halfH, r);
        const gy =
          sdRoundedBox(px, py + 1, halfW, halfH, r) -
          sdRoundedBox(px, py - 1, halfW, halfH, r);
        const len = Math.hypot(gx, gy) || 1;
        const dot = (gx / len) * lx + (gy / len) * ly;
        const rim = 1 - Math.min(1, -d / bevel);
        specular = (Math.max(0, dot) + Math.max(0, -dot) * 0.35) * rim;
      }

      data[i] = 128 + dx * 127;
      data[i + 1] = 128 + dy * 127;
      data[i + 2] = Math.round(specular * 255);
      data[i + 3] = 255;
    }
  }

  return { data, width: W, height: H };
}

async function generateDisplacementBlobUrl(opts: DisplacementOptions) {
  const { data, width, height } = computeDisplacementData(opts);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Failed to encode displacement map");
  return URL.createObjectURL(blob);
}

/* ---------------------------------------------------------------------------
 * SVG filter
 * ------------------------------------------------------------------------- */

type FilterOptions = {
  id: string;
  mapUrl: string;
  width: number;
  height: number;
  scale: number;
  aberration: number;
  frost: number;
};

function buildFilterSvg({
  id,
  mapUrl,
  width,
  height,
  scale,
  aberration,
  frost,
}: FilterOptions) {
  const pad = Math.ceil(scale + aberration + 4);
  const px = (pad / Math.max(1, width)) * 100;
  const py = (pad / Math.max(1, height)) * 100;
  const region = `x="-${px.toFixed(3)}%" y="-${py.toFixed(3)}%" width="${(100 + 2 * px).toFixed(3)}%" height="${(100 + 2 * py).toFixed(3)}%"`;

  const map = `<feImage href="${mapUrl}" xlink:href="${mapUrl}" x="0" y="0" width="${width}" height="${height}" result="map" preserveAspectRatio="none"/>`;
  const displace = (s: number, result: string) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="${result}"/>`;

  const body =
    aberration <= 0
      ? `${displace(scale, "rgb")}`
      : `${displace(scale + aberration, "dispR")}
  <feColorMatrix in="dispR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
  ${displace(scale, "dispG")}
  <feColorMatrix in="dispG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"/>
  ${displace(Math.max(0, scale - aberration), "dispB")}
  <feColorMatrix in="dispB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"/>
  <feBlend in="red" in2="green" mode="screen" result="rg"/>
  <feBlend in="rg" in2="blue" mode="screen" result="rgb"/>`;

  const blurPass = frost > 0 ? `<feGaussianBlur in="rgb" stdDeviation="${frost}"/>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"><filter id="${id}" color-interpolation-filters="sRGB" ${region}>
  ${map}
  ${body}
  ${blurPass}
</filter></svg>`;
}
