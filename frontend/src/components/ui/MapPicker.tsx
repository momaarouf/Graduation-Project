'use client'

import React, { useEffect, useMemo, useState, useId } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react'
import { renderToString } from 'react-dom/server'

/**
 * CUSTOM LEAFLET ICON - PIN
 */
const createCustomIcon = (color: string, label?: string) => {
  if (typeof window === 'undefined') return undefined;
  return L.divIcon({
    html: renderToString(
      <div className="relative -top-6 -left-3 animate-bounce-slow">
        {label ? (
          <div className="absolute -top-3 -right-3 w-5 h-5 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md z-[10]">
            {label}
          </div>
        ) : null}
        <MapPin className="w-8 h-8 drop-shadow-lg" style={{ color }} fill="white" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/20 rounded-full blur-[2px]" />
      </div>
    ),
    className: 'custom-map-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  })
}

/**
 * MAP CLICK HANDLER
 */
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface MapPickerProps {
  lat?: number
  lng?: number
  onChange: (lat: number, lng: number, address?: string, name?: string) => void
  height?: string
  className?: string
  defaultCenter?: [number, number]
  trail?: { lat: number; lng: number; label?: string }[]
  zoom?: number
  mapId?: string
}

export default function MapPicker({
  lat,
  lng,
  onChange,
  height = '300px',
  className = '',
  defaultCenter = [33.8938, 35.5018],
  trail = [],
  zoom = 13,
  mapId
}: MapPickerProps) {
  const pinIcon = useMemo(() => createCustomIcon('#2563eb'), [])
  const generatedId = useId()
  const finalMapId = mapId || `map-${generatedId}`
  const [isGeocoding, setIsGeocoding] = useState(false)

  // Robust validation
  const hasCoords = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);

  // Initial center based on lat/lng or default (Beirut)
  const center: [number, number] = hasCoords ? [lat as number, lng as number] : defaultCenter

  const handleLocationSelect = async (newLat: number, newLng: number) => {
    setIsGeocoding(true)
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&addressdetails=1`)
      const data = await resp.json()
      
      const address = data.display_name || ''
      const name = data.address?.amenity || data.address?.landmark || data.address?.road || data.address?.city || data.address?.town || 'Point on Map'
      
      onChange(newLat, newLng, address, name)
    } finally {
      setIsGeocoding(false)
    }
  }

  // Pre-process trail for Polyline
  const trailPath = useMemo(() => {
    const points = trail?.filter(t => t.lat && t.lng).map(t => [t.lat, t.lng] as [number, number]) || []
    // If current marker exists, append it to show how it fits in the trail
    if (hasCoords) {
      points.push([lat as number, lng as number])
    }
    return points
  }, [trail, lat, lng, hasCoords])

  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner group ${className}`} style={{ height }}>
      {/* MAP CONTAINER */}
      <MapContainer 
        id={finalMapId}
        key={`${finalMapId}-${lat}-${lng}`}
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* CLICK HANDLER */}
        <MapClickHandler onClick={handleLocationSelect} />

        {/* TRAIL RENDERING */}
        {trailPath.length > 1 && (
          <Polyline positions={trailPath} pathOptions={{ color: '#6366f1', weight: 4, dashArray: '5, 10' }} />
        )}

        {/* TRAIL MARKERS (Other stops) */}
        {trail?.map((t, idx) => {
          const icon = createCustomIcon('#94a3b8', t.label || String(idx + 1))
          if (!icon) return null
          return (
            <Marker key={`trail-${idx}`} position={[t.lat, t.lng]} icon={icon} opacity={0.6} />
          )
        })}

        {/* CURRENT MARKER */}
        {hasCoords && pinIcon && (
          <Marker position={[lat as number, lng as number]} icon={pinIcon} draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target
                const position = marker.getLatLng()
                handleLocationSelect(position.lat, position.lng)
              }
            }}
          />
        )}
      </MapContainer>

      {/* OVERLAY - Instructions */}
      <div className="absolute top-4 left-4 z-[1] flex items-center gap-2 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300">
        <div className={`w-2 h-2 rounded-full ${isGeocoding ? 'bg-amber-500' : 'bg-blue-500'} animate-pulse`} />
        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none">
          {isGeocoding ? 'Fetching Address...' : (hasCoords ? 'Location Selected' : 'Click to Pick Location')}
        </span>
      </div>

      {/* OVERLAY - Coordinates */}
      {lat && lng && (
        <div className="absolute bottom-4 right-4 z-[1] flex items-center gap-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="text-[9px] font-mono text-gray-500 space-y-0.5">
            <p className="flex justify-between gap-4"><span className="font-bold text-gray-900 dark:text-white uppercase">Lat:</span> {lat.toFixed(6)}</p>
            <p className="flex justify-between gap-4"><span className="font-bold text-gray-900 dark:text-white uppercase">Lng:</span> {lng.toFixed(6)}</p>
          </div>
          <button 
            type="button" 
            onClick={() => onChange(0,0)} 
            className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {/* Leaflet Custom Filters & Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container {
          background-color: #f8fafc;
        }
        .dark .leaflet-container {
          filter: brightness(0.8) contrast(1.1);
        }
        .leaflet-div-icon {
          background: transparent;
          border: none;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}} />
    </div>
  )
}
