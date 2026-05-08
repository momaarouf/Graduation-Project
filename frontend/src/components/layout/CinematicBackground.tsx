'use client'

import React, { ReactNode, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'

interface CinematicBackgroundProps {
 children: ReactNode
 className?: string
 intensity?: 'low' | 'medium' | 'high'
}

/**
 * Reusable Cinematic Background with Mouse-Tracking Aura
 * Centralizes the atmospheric voids and the interactive radial light effect.
 */
export default function CinematicBackground({ 
 children, 
 className = '',
 intensity = 'medium'
}: CinematicBackgroundProps) {
 const mouseX = useMotionValue(0)
 const mouseY = useMotionValue(0)

 // Spring configuration for smooth tracking
 const springConfig = { damping: 50, stiffness: 200 }
 const auraX = useSpring(mouseX, springConfig)
 const auraY = useSpring(mouseY, springConfig)

 // Dynamic radial gradient template
 const auraTemplate = useMotionTemplate`
 radial-gradient(
 1400px circle at ${auraX}px ${auraY}px,
 rgba(249, 115, 22, ${intensity === 'high' ? '0.2' : '0.15'}),
 rgba(37, 99, 235, ${intensity === 'high' ? '0.1' : '0.08'}) 50%,
 transparent 80%
 )
 `

 const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
 // Viewport-relative coordinates for fixed background
 mouseX.set(e.clientX)
 mouseY.set(e.clientY)
 }

 // Handle touch events for mobile
 const handleTouchMove = (e: React.TouchEvent) => {
 if (e.touches[0]) {
 mouseX.set(e.touches[0].clientX)
 mouseY.set(e.touches[0].clientY)
 }
 }

 return (
 <div 
 onMouseMove={handleMouseMove}
 onTouchMove={handleTouchMove}
 className={`relative w-full transition-colors duration-500 ${className}`}
 >
 {/* Cinematic Backdrop Container */}
 <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
 {/* Modern Dot Matrix / Grid */}
 <div 
 className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
 style={{ backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`, backgroundSize: '60px 60px' }} 
 />
 
 {/* Global Lighting Aura (Overlays everything in the background layer) */}
 <motion.div 
 className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-70"
 style={{ background: auraTemplate }}
 />

 {/* Ambient Floating Voids */}
 <motion.div 
 animate={{ x: [0, 100, 0], y: [0, -50, 0], opacity: [0.1, 0.2, 0.1] }}
 transition={{ duration: 20, repeat: Infinity, ease:"linear" }}
 className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vh] bg-primary-light/20 rounded-full blur-[180px]"
 />
 <motion.div 
 animate={{ x: [0, -100, 0], y: [0, 80, 0], opacity: [0.08, 0.15, 0.08] }}
 transition={{ duration: 25, repeat: Infinity, ease:"linear" }}
 className="absolute bottom-[-20%] right-[-10%] w-[90vw] h-[90vh] bg-orange-600/20 rounded-full blur-[200px]"
 />
 </div>

 {/* Main Content Layer */}
 <div className="relative z-10 w-full">
 {children}
 </div>
 </div>
 )
}
