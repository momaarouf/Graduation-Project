'use client'

import React, { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation } from 'lucide-react'
import { renderToString } from 'react-dom/server'
import { TourMapPointResponse } from '@/src/lib/types/tour.types'

/**
 * CUSTOM LEAFLET ICON - PIN
 * Uses Lucide MapPin icon with our themed colors
 */
const createCustomIcon = (color: string) => {
 return L.divIcon({
 html: renderToString(
 <div className="relative -top-6 -left-3 animate-bounce-slow">
 <MapPin className="w-8 h-8 drop-shadow-lg" style={{ color }} fill="white" />
 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/20 rounded-lg blur-[2px]" />
 </div>
 ),
 className: 'custom-map-pin',
 iconSize: [32, 32],
 iconAnchor: [16, 32]
 })
}

/**
 * SMALL DOT ICON - ROUTE STOP
 */
const createStopIcon = (color: string) => {
 return L.divIcon({
 html: renderToString(
 <div className="w-3 h-3 rounded-lg border-2 border-primary-light/10 dark:border-primary-dark/10 shadow-sm" style={{ backgroundColor: color }} />
 ),
 className: 'custom-map-stop',
 iconSize: [12, 12],
 iconAnchor: [6, 6]
 })
}

/**
 * AUTO-FIT CONTROLLER
 * Ensures the map always zooms to show both the meeting point AND the trail
 */
function MapBoundsController({ center, waypoints }: { center?: [number, number], waypoints: TourMapPointResponse[] }) {
 const map = useMap()

 useEffect(() => {
 if (!center && waypoints.length === 0) return

 const bounds = L.latLngBounds([])
 
 // Add meeting point if we have it
 if (center && typeof center[0] === 'number' && typeof center[1] === 'number') {
 bounds.extend(center)
 }
 
 // Add waypoints
 waypoints.forEach(wp => {
 if (typeof wp.latitude === 'number' && typeof wp.longitude === 'number') {
 bounds.extend([wp.latitude, wp.longitude])
 }
 })

 if (!bounds.isValid()) return

 // Add a little padding so markers aren't on the edge
 map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
 }, [center, waypoints, map])

 return null
}

interface TourMapProps {
  meetingPoint?: {
  lat: number
  lng: number
  name: string
  address?: string
  }
 route?: TourMapPointResponse[]
 height?: string
 className?: string
}

export default function TourMap({
 meetingPoint = {} as any,
 route = [],
 height = '300px',
 className = ''
}: TourMapProps) {
 // Memoize icons to avoid re-rendering
 const pinIcon = useMemo(() => createCustomIcon('#2563eb'), []) // Blue-600
 const stopIcon = useMemo(() => createStopIcon('#4f46e5'), []) // Indigo-600
 
 // Robust Validation: Handle old tours with missing coordinates
 const isValidMeetingPoint = meetingPoint && typeof meetingPoint.lat === 'number' && typeof meetingPoint.lng === 'number' && !isNaN(meetingPoint.lat) && !isNaN(meetingPoint.lng);
 
 const validRoute = useMemo(() => 
 (route || []).filter(wp => typeof wp.latitude === 'number' && typeof wp.longitude === 'number' && !isNaN(wp.latitude) && !isNaN(wp.longitude)),
 [route]
 );

 // If NO valid coordinates exist at all, show a fallback UI
 if (!isValidMeetingPoint && validRoute.length === 0) {
 return (
 <div 
 className={`relative overflow-hidden rounded-xl border-2 border-dashed border-primary-light/10 dark:border-primary-dark/10 surface-section flex flex-col items-center justify-center gap-4 transition-all duration-500 animate-in fade-in zoom-in-95 ${className}`} 
 style={{ height }}
 >
 <div className="w-12 h-12 rounded-lg surface-section flex items-center justify-center text-theme-muted group-hover:scale-110 transition-transform">
 <MapPin className="w-6 h-6 animate-pulse" />
 </div>
 <div className="text-center">
 <p className="text-[10px] font-bold text-theme-muted capitalize tracking-[0.2em] mb-1">
 Map View Unavailable
 </p>
 <p className="text-[11px] font-medium text-theme-muted max-w-[200px] mx-auto leading-relaxed">
 Location details are not yet mapped for this tour.
 </p>
 </div>
 </div>
 )
 }

 // Determine the map's master center (fallback to first route point if meeting point missing)
 const masterCenter: [number, number] = isValidMeetingPoint 
 ? [meetingPoint.lat, meetingPoint.lng] 
 : (validRoute.length > 0 ? [validRoute[0].latitude, validRoute[0].longitude] : [0, 0]);

 // Polyline positions (trail)
 const trailPositions = validRoute.map(p => [p.latitude, p.longitude] as [number, number]);

 return (
 <div className={`relative overflow-hidden rounded-xl border border-primary-light/10 dark:border-primary-dark/10 shadow-inner group ${className}`} style={{ height }}>
 {/* MAP CONTAINER */}
 <MapContainer 
 center={masterCenter} 
 zoom={13} 
 scrollWheelZoom={false}
 className="w-full h-full z-0"
 >
 {/* TILE LAYER - CARTO LIGHT/DARK THEME */}
 <TileLayer
 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
 url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
 />

 {/* ========================================
 TRAIL (ROUTE)
 ======================================== */}
 {trailPositions.length > 0 && (
 <>
 <Polyline 
 positions={trailPositions} 
 pathOptions={{
 color: '#4f46e5',
 weight: 5,
 opacity: 0.6,
 dashArray: '10, 10',
 lineJoin: 'round'
 }} 
 />
 
 {/* Stops along the way */}
 {route.map((wp, idx) => (
 <Marker key={wp.id} position={[wp.latitude, wp.longitude]} icon={stopIcon}>
 <Popup className="custom-popup">
 <div className="p-1">
 <span className="text-[10px] font-bold text-indigo-600 capitalize tracking-normal block mb-0.5">
 Stop {idx + 1}
 </span>
 <p className="font-bold text-theme-primary m-0 leading-tight">
 {wp.pointName || `Waypoint ${idx + 1}`}
 </p>
 </div>
 </Popup>
 </Marker>
 ))}
 </>
 )}

 {/* ========================================
 MEETING POINT (Main Pin)
 ======================================== */}
 {isValidMeetingPoint && (
 <Marker position={[meetingPoint.lat, meetingPoint.lng]} icon={pinIcon}>
 <Popup className="custom-popup">
 <div className="p-1 min-w-[150px]">
 <span className="text-[10px] font-bold text-primary-light dark:text-primary-dark capitalize tracking-normal block mb-0.5">
 Meeting Point
 </span>
 <p className="font-bold text-theme-primary m-0 leading-tight">
 {meetingPoint.name}
 </p>
 {meetingPoint.address && (
 <p className="text-[10px] text-theme-muted mt-1 m-0">
 {meetingPoint.address}
 </p>
 )}
 </div>
 </Popup>
 </Marker>
 )}

 {/* Fit the trail automagically */}
 <MapBoundsController center={isValidMeetingPoint ? [meetingPoint.lat, meetingPoint.lng] : undefined} waypoints={validRoute} />
 </MapContainer>

 {/* OVERLAYS - Map Context */}
 <div className="absolute bottom-4 left-4 z-[1] p-3 surface-card  rounded-xl border border-primary-light/10 dark:border-primary-dark/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-white">
 <Navigation className="w-4 h-4" />
 </div>
 <div>
 <p className="text-[10px] font-bold text-theme-primary capitalize tracking-normal leading-none mb-1">
 Live Trail View
 </p>
 <p className="text-[9px] text-theme-muted font-medium">
 {route.length > 0 ? `${route.length + 1} points mapped` : 'Location verified'}
 </p>
 </div>
 </div>
 </div>
 
 {/* Leaflet CSS fixes for Tailwind */}
 <style jsx global>{`
 .leaflet-container {
 background-color: #f8fafc;
 }
 .dark .leaflet-container {
 filter: brightness(0.8) contrast(1.1);
 }
 .custom-popup .leaflet-popup-content-wrapper {
 border-radius: 12px;
 padding: 0;
 box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
 }
 .custom-popup .leaflet-popup-content {
 margin: 12px;
 }
 .leaflet-div-icon {
 background: transparent;
 border: none;
 }
 `}</style>
 </div>
 )
}
