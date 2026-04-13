"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"
import { useTheme } from "next-themes"

interface PolaroidMarker {
  id: string
  location: [number, number]
  image: string
  caption: string
  rotate: number
}

interface GlobePolaoridsProps {
  markers?: PolaroidMarker[]
  className?: string
  speed?: number
}

const defaultMarkers: PolaroidMarker[] = [
  { id: "world-istanbul", location: [41.0082, 28.9784], image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=400&fit=crop", caption: "Istanbul Gates", rotate: -5 },
  { id: "world-tokyo", location: [35.6762, 139.6503], image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop", caption: "Tokyo Neon", rotate: 4 },
  { id: "world-marrakesh", location: [31.6295, -7.9811], image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400&h=400&fit=crop", caption: "Marrakesh Souks", rotate: -3 },
  { id: "world-rio", location: [-22.9068, -43.1729], image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=400&fit=crop", caption: "Rio Carnival", rotate: 6 },
  { id: "world-reykjavik", location: [64.1466, -21.9426], image: "https://images.unsplash.com/photo-1521024221340-efe7d7fa239b?w=400&h=400&fit=crop", caption: "Icelandic Peaks", rotate: -4 },
  { id: "world-sydney", location: [-33.8688, 151.2093], image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=400&fit=crop", caption: "Sydney Opera", rotate: 3 },
  { id: "world-capetown", location: [-33.9249, 18.4241], image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&h=400&fit=crop", caption: "Cape Town Coast", rotate: -5 },
  { id: "world-vancouver", location: [49.2827, -123.1207], image: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=400&h=400&fit=crop", caption: "Vancouver Pine", rotate: 2 },
]

export function GlobePolaroids({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobePolaoridsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current || !mounted) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    const isDark = resolvedTheme === "dark"

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: isDark ? 1 : 0,
        diffuse: isDark ? 1.2 : 1.5,
        mapSamples: 16000,
        mapBrightness: isDark ? 11 : 9,
        baseColor: isDark ? [0.1, 0.1, 0.15] : [1, 1, 1],
        markerColor: isDark ? [0.2, 0.6, 1] : [0.4, 0.6, 0.9],
        glowColor: isDark ? [0.1, 0.1, 0.2] : [0.94, 0.93, 0.91],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.02, id: m.id })),
        arcs: [],
        opacity: isDark ? 0.85 : 0.7,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        if (globe) {
          globe.update({
            phi: phi + phiOffsetRef.current + dragOffset.current.phi,
            theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
          })
        }
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed, resolvedTheme, mounted])

  if (!mounted) return <div className={`aspect-square ${className}`} />

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          className="bg-white dark:bg-gray-800 border border-black/5 dark:border-white/10"
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 8,
            padding: "6px 6px 24px",
            boxShadow: resolvedTheme === 'dark' 
              ? "0 4px 12px rgba(0,0,0,0.5)" 
              : "0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)",
            transform: `rotate(${m.rotate}deg)`,
            pointerEvents: "none" as const,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.3s, filter 0.3s",
          }}
        >
          <img
            src={m.image}
            alt={m.caption}
            style={{ display: "block", width: 60, height: 60, objectFit: "cover" }}
          />
          <span className="text-gray-900 dark:text-gray-100" style={{
            position: "absolute", bottom: 5, left: 0, right: 0,
            textAlign: "center", fontFamily: "system-ui, sans-serif",
            fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.02em",
          }}>{m.caption}</span>
        </div>
      ))}
    </div>
  )
}
