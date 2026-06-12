import React, { useEffect, useMemo, useState, useId, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, Popup, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, Trash2, GripVertical, Plus, Search } from 'lucide-react'
import { renderToString } from 'react-dom/server'
import { toast } from 'react-hot-toast'

/**
 * AUTO-FIT BOUNDS: zooms map to show all stops, or pans to single stop.
 * Replaces the old MapUpdater which only tracked the first point.
 */
function FitBoundsController({ path, defaultCenter }: { path: [number, number][], defaultCenter: [number, number] }) {
  const map = useMap()
  const prevLengthRef = useRef(0)

  useEffect(() => {
    if (path.length >= 2) {
      const bounds = L.latLngBounds(path)
      setTimeout(() => {
        try {
          map.invalidateSize()
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true })
          prevLengthRef.current = path.length
        } catch (e) {}
      }, 120)
    } else if (path.length === 1 && path.length !== prevLengthRef.current) {
      setTimeout(() => {
        try {
          map.invalidateSize()
          map.setView(path[0], 14, { animate: true })
          prevLengthRef.current = 1
        } catch (e) {}
      }, 120)
    }
  }, [path, map])

  return null
}

/**
 * CUSTOM LEAFLET ICON - NUMBERED PIN
 * 
 * Layout (no CSS offset tricks — pure Leaflet anchor math):
 *  - Badge circle: 28x28, hangs 12px above and 12px right of the pin
 *  - MapPin SVG: 32x32, tip at bottom-center
 *  - Total container: 44px wide, 44px tall
 *  - Pin starts at x=0, y=12 inside the container
 *  - Pin tip is at x=16, y=44 → iconAnchor: [16, 44]
 */
const createNumberedIcon = (number: number, color: string = '#2563eb') => {
  if (typeof window === 'undefined') return null;
  try {
    return L.divIcon({
      html: renderToString(
        <div style={{ position: 'relative', width: '44px', height: '44px' }}>
          {/* Number badge — positioned top-right, overlapping pin top */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '22px', height: '22px',
            background: color,
            border: '2px solid white',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 'bold', color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 10
          }}>
            {number}
          </div>
          {/* Pin icon — sits below badge, tip at very bottom */}
          <div style={{ position: 'absolute', top: '12px', left: '0px' }}>
            <MapPin style={{ width: '32px', height: '32px', color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} fill="white" />
          </div>
        </div>
      ),
      className: 'custom-route-pin',
      iconSize: [44, 44],
      iconAnchor: [16, 44]  // bottom-center of the 32px pin (left=0+16, top=12+32)
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
  const [searchedLocation, setSearchedLocation] = useState<{lat: number, lng: number, name: string, address: string} | null>(null)

  // Generate a unique key for the MapContainer to prevent Leaflet "Map container is being reused" errors
  const [mapKey] = useState(() => `route-builder-${Math.random().toString(36).substr(2, 9)}`)

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
    setSearchedLocation(null)
    try {
      // 1. Check if it's a coordinate pair (e.g. "34.1194, 35.6461")
      const coordsMatch = searchQuery.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
      if (coordsMatch) {
        const nLat = parseFloat(coordsMatch[1]);
        const nLng = parseFloat(coordsMatch[3]);
        const { address, name } = await reverseGeocode(nLat, nLng)
        map.setView([nLat, nLng], 14)
        setSearchedLocation({ lat: nLat, lng: nLng, name: name || 'Custom Coordinates', address })
        toast.success(`Coordinates found`, { id: 'map-search' })
        setIsGeocoding(false)
        return;
      }

      // 2. Standard Name Search
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
      const data = await resp.json()
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0]
        const nLat = parseFloat(lat)
        const nLng = parseFloat(lon)
        map.setView([nLat, nLng], 14)
        setSearchedLocation({ 
          lat: nLat, 
          lng: nLng, 
          name: data[0].name || display_name.split(',')[0], 
          address: display_name 
        })
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

  const handleAddSearched = () => {
    if (searchedLocation) {
      onAddStop(searchedLocation.lat, searchedLocation.lng, searchedLocation.address, searchedLocation.name)
      setSearchedLocation(null)
      setSearchQuery('')
      toast.success('Stop added!')
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
            placeholder="Search city, street or Lat, Lng..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (searchedLocation) setSearchedLocation(null)
            }}
            className="bg-transparent border-none focus:ring-0 text-xs text-theme-primary flex-1 placeholder:text-theme-muted font-medium"
          />
          <button type="submit" className="bg-primary-light hover:bg-primary-light-hover text-white p-2 rounded-xl transition-all shadow-lg active:scale-95">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
        
        {searchedLocation && (
          <div className="pointer-events-auto mt-2 p-3 surface-card rounded-2xl border border-theme shadow-xl w-72 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-semibold text-theme-primary">{searchedLocation.name}</p>
            <p className="text-[10px] text-theme-muted line-clamp-2">{searchedLocation.address}</p>
            <button 
              type="button"
              onClick={handleAddSearched}
              className="mt-1 flex items-center justify-center gap-2 w-full py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" /> ADD THIS LOCATION
            </button>
          </div>
        )}
      </div>

      <MapContainer 
        key={mapKey}
        center={centerPoint} 
        zoom={12} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
        ref={setMap}
      >
        <ZoomControl position="bottomleft" />
        <FitBoundsController path={path} defaultCenter={centerPoint} />
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

