'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
 Play, 
 Pause, 
 Volume2, 
 VolumeX, 
 Maximize, 
 Minimize, 
 RotateCcw,
 Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoPlayerProps {
 url: string
 poster?: string
 className?: string
 autoPlay?: boolean
 muted?: boolean
 objectFit?: 'contain' | 'cover'
 onEnded?: () => void
}

export default function VideoPlayer({
 url,
 poster,
 className = '',
 autoPlay = false,
 muted = false,
 objectFit = 'contain',
 onEnded
}: VideoPlayerProps) {
 const [isPlaying, setIsPlaying] = useState(autoPlay)
 const [isMuted, setIsMuted] = useState(muted)
 const [progress, setProgress] = useState(0)
 const [duration, setDuration] = useState(0)
 const [volume, setVolume] = useState(1)
 const [isFullscreen, setIsFullscreen] = useState(false)
 const [isLoading, setIsLoading] = useState(true)
 const [showControls, setShowControls] = useState(true)
 
 const videoRef = useRef<HTMLVideoElement>(null)
 const containerRef = useRef<HTMLDivElement>(null)
 const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

 const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')

 useEffect(() => {
 // Volume synchronization
 if (videoRef.current) {
 videoRef.current.volume = volume
 videoRef.current.muted = isMuted
 }
 }, [volume, isMuted])

 const togglePlay = () => {
 if (isYouTube) return 
 if (videoRef.current) {
 if (isPlaying) {
 videoRef.current.pause()
 } else {
 videoRef.current.play()
 }
 setIsPlaying(!isPlaying)
 }
 }

 const toggleMute = () => {
 setIsMuted(!isMuted)
 }

 const handleTimeUpdate = () => {
 if (videoRef.current) {
 const current = videoRef.current.currentTime
 const total = videoRef.current.duration
 if (total > 0) {
 setProgress((current / total) * 100)
 }
 }
 }

 const handleLoadedMetadata = () => {
 if (videoRef.current) {
 setDuration(videoRef.current.duration)
 setIsLoading(false)
 }
 }

 const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (videoRef.current) {
 const time = (parseFloat(e.target.value) / 100) * duration
 videoRef.current.currentTime = time
 setProgress(parseFloat(e.target.value))
 }
 }

 const toggleFullscreen = () => {
 if (!containerRef.current) return
 
 if (!document.fullscreenElement) {
 containerRef.current.requestFullscreen().catch(err => {
 console.error(`Error attempting to enable full-screen mode: ${err.message}`)
 })
 setIsFullscreen(true)
 } else {
 if (document.exitFullscreen) {
 document.exitFullscreen()
 }
 setIsFullscreen(false)
 }
 }

 const handleMouseMove = () => {
 setShowControls(true)
 if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
 
 if (isPlaying) {
 controlsTimeoutRef.current = setTimeout(() => {
 setShowControls(false)
 }, 3000)
 }
 }

 const formatTime = (seconds: number) => {
 if (isNaN(seconds)) return '0:00'
 const mins = Math.floor(seconds / 60)
 const secs = Math.floor(seconds % 60)
 return `${mins}:${secs.toString().padStart(2, '0')}`
 }

 if (isYouTube) {
 const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop()
 return (
 <div className={`relative aspect-video rounded-xl overflow-hidden bg-black ${className}`}>
 <iframe
 src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}&modestbranding=1&rel=0&showinfo=0`}
 className="w-full h-full border-0"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 title="Tour Preview Video"
 />
 </div>
 )
 }

 return (
 <div 
 ref={containerRef}
 onMouseMove={handleMouseMove}
 className={`relative aspect-video rounded-xl overflow-hidden bg-black group shadow-2xl ${className}`}
 >
 <video
 ref={videoRef}
 src={url}
 poster={poster}
 className={`w-full h-full cursor-pointer ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
 onTimeUpdate={handleTimeUpdate}
 onLoadedMetadata={handleLoadedMetadata}
 onWaiting={() => setIsLoading(true)}
 onPlaying={() => setIsLoading(false)}
 onEnded={() => {
 setIsPlaying(false)
 if (onEnded) onEnded()
 }}
 onClick={togglePlay}
 playsInline
 autoPlay={autoPlay}
 muted={isMuted}
 />

 <AnimatePresence>
 {isLoading && (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 flex items-center justify-center bg-black/40 -[2px] z-10"
 >
 <Loader2 className="w-12 h-12 text-primary-light dark:text-primary-dark animate-spin" />
 </motion.div>
 )}
 </AnimatePresence>

 <AnimatePresence>
 {!isPlaying && !isLoading && (
 <motion.div
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 1.2, opacity: 0 }}
 className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
 >
 <div className="w-20 h-20 bg-primary-light/90 rounded-full flex items-center justify-center shadow-2xl ">
 <Play className="w-10 h-10 text-white fill-current translate-x-1" />
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <motion.div
 animate={{ opacity: showControls || !isPlaying ? 1 : 0, y: showControls || !isPlaying ? 0 : 20 }}
 className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 z-20 pointer-events-auto"
 >
 <div className="relative w-full h-1.5 surface-card rounded-full mb-4 group/progress cursor-pointer overflow-hidden">
 <div 
 className="absolute top-0 left-0 h-full bg-primary-light transition-all rounded-full z-[1]" 
 style={{ width: `${progress}%` }}
 />
 <input
 type="range"
 min="0"
 max="100"
 step="0.1"
 value={progress}
 onChange={handleSeek}
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-[2]"
 />
 </div>

 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button onClick={togglePlay} className="text-white hover:text-primary-light dark:text-primary-dark transition-colors">
 {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
 </button>

 <div className="flex items-center gap-2 group/volume">
 <button onClick={toggleMute} className="text-white hover:text-primary-light dark:text-primary-dark transition-colors">
 {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
 </button>
 <input
 type="range"
 min="0"
 max="1"
 step="0.1"
 value={isMuted ? 0 : volume}
 onChange={(e) => {
 const val = parseFloat(e.target.value)
 setVolume(val)
 setIsMuted(val === 0)
 }}
 className="w-0 group-hover/volume:w-20 transition-all duration-300 opacity-0 group-hover/volume:opacity-100 accent-blue-500 cursor-pointer"
 />
 </div>

 <div className="text-white text-xs font-medium tabular-nums">
 <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
 <span className="mx-1 text-white/50">/</span>
 <span className="text-white/70">{formatTime(duration)}</span>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <button 
 onClick={() => { if (videoRef.current) videoRef.current.currentTime = 0 }} 
 className="text-white/70 hover:text-primary-light dark:text-primary-dark transition-colors"
 title="Restart"
 >
 <RotateCcw className="w-5 h-5" />
 </button>

 <button onClick={toggleFullscreen} className="text-white hover:text-primary-light dark:text-primary-dark transition-colors">
 {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )
}
