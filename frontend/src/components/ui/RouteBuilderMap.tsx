import React, { useEffect, useMemo, useState, useId, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, Trash2, GripVertical, Plus, Search } from 'lucide-react'
import { renderToString } from 'react-dom/server'
import { toast } from 'react-hot-toast'

/**
 * COMPONENT TO UPDATE MAP VIEW SAFELY
 */
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  const prevCenter = useRef<[number, number]>(center)

  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0 && (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1])) {
      const timer = setTimeout(() => {
        try {
          if (map) {
            map.invalidateSize()
            map.setView(center)
            prevCenter.current = center
          }
        } catch (e) {
          console.warn('Route map update deferred:', e)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [center, map])
  return null
}

/**
 * CUSTOM LEAFLET ICON - NUMBERED PIN
 */
const createNumberedIcon = (number: number, color: string = '#2563eb') => {
  if (typeof window === 'undefined') return null;
  try {
    return L.divIcon({
      html: renderToString(
        <div className="relative -top-6 -left-3 transition-transform hover:scale-110 active:scale-95 duration-200">
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-primary-light border-2 border-theme rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-2xl z-[10] ring-4 ring-primary-light dark:ring-primary-dark/20">
            {number}
          </div>
          <MapPin className="w-8 h-8 drop-shadow-lg" style={{ color }} fill="white" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/20 rounded-full blur-[2px]" />
        </div>
      ),
      className: 'custom-route-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    })
  } catch (e) {
    return null
  }
}

/**
 * MAP CLICK HANDLER FOR ROUTE BUILDER
 */
function RouteClickHandler({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface RouteBuilderProps {
  stops: { id: string; order: number; title: string; location?: { name: string; lat?: number; lng?: number } }[]
  onAddStop: (lat: number, lng: number, address?: string, name?: string) => void
  onUpdateStop: (index: number, lat: number, lng: number, address?: string, name?: string) => void
  onRemoveStop: (index: number) => void
  height?: string
  className?: string
  defaultCenter?: [number, number]
}

export default function RouteBuilderMap({
  stops,
  onAddStop,
  onUpdateStop,
  onRemoveStop,
  height = '500px',
  className = '',
  defaultCenter = [33.8938, 35.5018]
}: RouteBuilderProps) {
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [map, setMap] = useState<L.Map | null>(null)

  // Reverse Geocoding helper
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
      const data = await resp.json()
      return {
        address: data.display_name || '',
        name: data.address?.amenity || data.address?.landmark || data.address?.road || data.address?.city || data.address?.town || 'Saved Location'
      }
    } catch (e) {
      return { address: '', name: '' }
    }
  }

  // Forward Geocoding for Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !map) return
    
    setIsGeocoding(true)
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
      const data = await resp.json()
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0]
        const nLat = parseFloat(lat)
        const nLng = parseFloat(lon)
        map.setView([nLat, nLng], 14)
        toast.success(`Found: ${display_name.split(',')[0]}`, { id: 'map-search' })
      } else {
        toast.error('Location not found')
      }
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleAdd = async (lat: number, lng: number) => {
    setIsGeocoding(true)
    const { address, name } = await reverseGeocode(lat, lng)
    onAddStop(lat, lng, address, name)
    setIsGeocoding(false)
  }

  const handleDragEnd = async (index: number, lat: number, lng: number) => {
    setIsGeocoding(true)
    const { address, name } = await reverseGeocode(lat, lng)
    onUpdateStop(index, lat, lng, address, name)
    setIsGeocoding(false)
  }

  // Path for Polyline
  const path = useMemo(() => {
    return stops
      .filter(s => s.location?.lat && s.location?.lng)
      .map(s => [s.location!.lat!, s.location!.lng!] as [number, number])
  }, [stops])

  const centerPoint = useMemo<[number, number]>(() => {
    return path.length > 0 ? path[0] : defaultCenter
  }, [path, defaultCenter])

  return (
    <div className={`relative overflow-hidden rounded-3xl border-2 border-theme shadow-2xl group ${className}`} style={{ height }}>
      {/* SEARCH OVERLAY */}
      <div className="absolute top-20 left-6 z-[10] transition-transform duration-300 pointer-events-none group-hover:translate-y-1">
        <form onSubmit={handleSearch} className="pointer-events-auto flex items-center gap-2 surface-card p-1.5 pl-4 rounded-2xl border border-theme shadow-2xl w-72">
          <input 
            type="text" 
            placeholder="Search city, street or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-xs text-theme-primary flex-1 placeholder:text-theme-muted font-medium"
          />
          <button type="submit" className="bg-primary-light hover:bg-primary-light-hover text-white p-2 rounded-xl transition-all shadow-lg active:scale-95">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <MapContainer 
        center={centerPoint} 
        zoom={12} 
        className="w-full h-full z-0"
        ref={setMap}
      >
        <MapUpdater center={centerPoint} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <RouteClickHandler onAdd={handleAdd} />

        {path.length > 1 && (
          <Polyline positions={path} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.8, dashArray: '10, 15' }} />
        )}

        {stops.map((stop, idx) => {
          if (!stop.location?.lat || !stop.location?.lng) return null
          const icon = createNumberedIcon(idx + 1)
          if (!icon) return null
          
          return (
            <Marker 
              key={stop.id} 
              position={[stop.location.lat, stop.location.lng]} 
              icon={icon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target
                  const pos = marker.getLatLng()
                  handleDragEnd(idx, pos.lat, pos.lng)
                }
              }}
            >
              <Popup>
                <div className="p-2.5 min-w-[150px]">
                  <p className="font-bold text-[10px] text-primary-light dark:text-primary-dark capitalize tracking-[0.1em] mb-1.5">STOP {idx + 1}</p>
                  <p className="font-semibold text-theme-primary m-0 leading-tight">{stop.title || 'Untitled Stop'}</p>
                  <p className="text-[10px] text-theme-muted mt-1.5 line-clamp-2 leading-relaxed">{stop.location?.name}</p>
                  <button 
                    onClick={() => onRemoveStop(idx)}
                    className="mt-4 w-full py-2 bg-red-50 hover:bg-red-100 text-[10px] font-bold text-red-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> REMOVE STOP
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* FLOATING CONTROL PANEL */}
      <div className="absolute top-6 left-6 right-6 z-[1] flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto">
          <div className="surface-card px-5 py-3 rounded-2xl border border-theme shadow-2xl">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${isGeocoding ? 'bg-amber-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-theme-primary capitalize tracking-normal leading-none mb-1">
                  {isGeocoding ? 'Capturing Point...' : 'Route Builder Active'}
                </span>
                <span className="text-[10px] text-theme-muted font-medium">
                  {path.length} stops mapped • Click map to build trail
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary-light text-white px-3 py-1.5 rounded-xl shadow-xl border border-primary-light dark:border-primary-dark/50 flex items-center gap-2 pointer-events-auto translate-y-1">
          <Navigation className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold capitalize tracking-normal">Live Trail</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dark .leaflet-container {
          filter: grayscale(1) invert(0.9) hue-rotate(180deg) brightness(1.1);
        }
        .leaflet-div-icon { background: none; border: none; }
        .animate-bounce-slow { animation: bounce 2s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}} />
    </div>
  )
}

