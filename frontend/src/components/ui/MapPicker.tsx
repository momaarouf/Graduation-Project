import React, { useEffect, useMemo, useState, useId, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react'
import { renderToString } from 'react-dom/server'

/**
 * COMPONENT TO UPDATE MAP VIEW SAFELY
 */
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  const prevCenter = useRef<[number, number]>(center)

  useEffect(() => {
    // Only update if coords actually changed to avoid infinite loops or jitter
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      // Use requestAnimationFrame to ensure the container is ready and has dimensions
      const timer = setTimeout(() => {
        try {
          if (map) {
            map.invalidateSize()
            map.setView(center, zoom, { animate: true })
            prevCenter.current = center
          }
        } catch (e) {
          console.warn('Map view update deferred:', e)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [center, zoom, map])

  return null
}

/**
 * CUSTOM LEAFLET ICON - PIN
 *
 * Uses inline styles (not Tailwind) so renderToString produces correct
 * positioning without depending on a running Tailwind stylesheet.
 * iconAnchor: [16, 44] → tip of the 32px pin sits exactly on the coordinate.
 */
const createCustomIcon = (color: string, label?: string) => {
  if (typeof window === 'undefined') return null;
  try {
    return L.divIcon({
      html: renderToString(
        <div style={{ position: 'relative', width: '44px', height: '44px' }}>
          {label && (
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: '20px', height: '20px',
              background: color,
              border: '2px solid white',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 'bold', color: 'white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              zIndex: 10
            }}>
              {label}
            </div>
          )}
          <div style={{ position: 'absolute', top: '12px', left: '0px' }}>
            <MapPin
              style={{ width: '32px', height: '32px', color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              fill="white"
            />
          </div>
        </div>
      ),
      className: 'custom-map-pin',
      iconSize: [44, 44],
      iconAnchor: [16, 44]  // tip of the 32px pin: left(0)+16=16, top(12)+32=44
    })
  } catch (e) {
    return null
  }
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
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchedLocation, setSearchedLocation] = useState<{ lat: number; lng: number; name: string; address: string } | null>(null)
  const pinIcon = useMemo(() => createCustomIcon('#2563eb'), [])

  // Generate a unique key for the MapContainer to prevent Leaflet "Map container is being reused" errors
  // during React strict-mode remounts or component toggles.
  const [mapKey] = useState(() => `${mapId || 'map'}-${Math.random().toString(36).substr(2, 9)}`)

  // Robust validation
  const hasCoords = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

  // Initial center based on lat/lng or default (Beirut)
  const center: [number, number] = useMemo(() => 
    hasCoords ? [lat as number, lng as number] : defaultCenter, 
  [hasCoords, lat, lng, defaultCenter])

  const handleLocationSelect = async (newLat: number, newLng: number) => {
    setIsGeocoding(true)
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&addressdetails=1`)
      const data = await resp.json()
      
      const address = data.display_name || ''
      const name = data.address?.amenity || data.address?.landmark || data.address?.road || data.address?.city || data.address?.town || 'Point on Map'
      
      onChange(newLat, newLng, address, name)
    } catch (error) {
      console.error('Geocoding error:', error)
      onChange(newLat, newLng, '', 'Point on Map')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setIsGeocoding(true)
    setSearchedLocation(null)
    try {
      // 1. Check if input is a coordinate pair like "34.1194, 35.6461"
      const coordsMatch = searchQuery.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/)
      if (coordsMatch) {
        const newLat = parseFloat(coordsMatch[1])
        const newLng = parseFloat(coordsMatch[3])
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&addressdetails=1`)
        const data = await resp.json()
        const address = data.display_name || ''
        const name = data.address?.amenity || data.address?.road || data.address?.city || 'Custom Coordinates'
        setSearchedLocation({ lat: newLat, lng: newLng, name, address })
        setIsGeocoding(false)
        return
      }

      // 2. Standard name/address search
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
      const data = await resp.json()
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat)
        const newLng = parseFloat(data[0].lon)
        const address = data[0].display_name || ''
        const name = data[0].name || address.split(',')[0] || 'Searched Location'
        setSearchedLocation({ lat: newLat, lng: newLng, name, address })
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleConfirmLocation = () => {
    if (searchedLocation) {
      onChange(searchedLocation.lat, searchedLocation.lng, searchedLocation.address, searchedLocation.name)
      setSearchedLocation(null)
      setSearchQuery('')
    }
  }

  // Pre-process trail for Polyline
  const trailPath = useMemo(() => {
    const points = trail?.filter(t => t.lat && t.lng).map(t => [t.lat, t.lng] as [number, number]) || []
    if (hasCoords) {
      points.push([lat as number, lng as number])
    }
    return points
  }, [trail, lat, lng, hasCoords])

  return (
    <div className={`relative overflow-hidden rounded-xl border border-theme shadow-inner group ${className}`} style={{ height }}>
      {/* We remove the ID to let React-Leaflet manage the container lifecycle more reliably */}
      <MapContainer 
        key={mapKey}
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <ZoomControl position="bottomleft" />
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler onClick={handleLocationSelect} />

        {trailPath.length > 1 && (
          <Polyline positions={trailPath} pathOptions={{ color: '#6366f1', weight: 4, dashArray: '5, 10' }} />
        )}

        {trail?.map((t, idx) => {
          const icon = createCustomIcon('#94a3b8', t.label || String(idx + 1))
          if (!icon || !t.lat || !t.lng) return null
          return (
            <Marker key={`trail-${idx}-${t.lat}-${t.lng}`} position={[t.lat, t.lng]} icon={icon} opacity={0.6} />
          )
        })}

        {hasCoords && pinIcon && (
          <Marker 
            position={[lat as number, lng as number]} 
            icon={pinIcon} 
            draggable={true}
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

      {/* OVERLAYS */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 surface-card px-3 py-1.5 rounded-full border border-theme shadow-sm">
        <div className={`w-2 h-2 rounded-full ${isGeocoding ? 'bg-orange-500 animate-pulse' : 'bg-primary-light'}`} />
        <span className="text-[10px] font-bold text-theme-primary capitalize tracking-normal leading-none">
          {isGeocoding ? 'Fetching...' : (hasCoords ? 'Location Selected' : 'Click to Pick Location')}
        </span>
      </div>

      {/* SEARCH BAR */}
      <div className="absolute top-4 right-4 z-[1000] w-[200px] sm:w-[260px] flex flex-col gap-2">
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-white dark:bg-[#1a2333] rounded-xl border border-theme shadow-md overflow-hidden">
          <input 
            type="text" 
            placeholder="Name or Lat, Lng..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (searchedLocation) setSearchedLocation(null)
            }}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
          />
          <button type="submit" disabled={isGeocoding} className="p-2 text-gray-500 hover:text-primary-light transition-colors">
            {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>

        {searchedLocation && (
          <div className="bg-white dark:bg-[#1a2333] rounded-xl border border-theme shadow-xl p-3 flex flex-col gap-2">
            <p className="text-[11px] font-bold text-gray-800 dark:text-gray-100 leading-tight">{searchedLocation.name}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{searchedLocation.address}</p>
            <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-gray-400">
              <span>Lat: {searchedLocation.lat.toFixed(5)}</span>
              <span>Lng: {searchedLocation.lng.toFixed(5)}</span>
            </div>
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="mt-1 w-full py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              ✓ CONFIRM THIS LOCATION
            </button>
          </div>
        )}
      </div>

      {hasCoords && (
        <div className="absolute bottom-4 right-4 z-[1] flex items-center gap-3 surface-card px-3 py-2 rounded-2xl border border-theme shadow-lg">
          <div className="text-[9px] font-mono text-theme-muted space-y-0.5">
            <p className="flex justify-between gap-4"><span className="font-bold text-theme-primary capitalize">Lat:</span> {lat?.toFixed(6)}</p>
            <p className="flex justify-between gap-4"><span className="font-bold text-theme-primary capitalize">Lng:</span> {lng?.toFixed(6)}</p>
          </div>
          <button 
            type="button" 
            onClick={() => onChange(0,0)} 
            className="p-1.5 surface-section rounded-lg hover:bg-primary-light/10 dark:hover:surface-base text-theme-muted hover:text-primary-light dark:text-primary-dark transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { background-color: #f8fafc; }
        .leaflet-div-icon { background: transparent; border: none; }
        .animate-bounce-slow { animation: bounce-slow 2s infinite; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}} />
    </div>
  )
}

