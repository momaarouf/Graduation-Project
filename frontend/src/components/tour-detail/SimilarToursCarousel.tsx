'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import PublicTourCard from '@/src/components/tours/PublicTourCard'
import type { PublicTourCardResponse } from '@/src/lib/types/tour.types'

interface CarouselProps {
  tours: PublicTourCardResponse[]
}

export default function SimilarToursCarousel({ tours }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [constraints, setConstraints] = useState({ left: 0, right: 0 })

  useEffect(() => {
    if (containerRef.current) {
      const scrollWidth = containerRef.current.scrollWidth
      const offsetWidth = containerRef.current.offsetWidth
      setConstraints({ left: -(scrollWidth - offsetWidth), right: 0 })
    }
  }, [tours])

  return (
    <div className="relative w-full overflow-hidden sm:overflow-visible">
      <motion.div
        ref={containerRef}
        drag="x"
        dragConstraints={constraints}
        dragElastic={0.15}
        dragTransition={{ power: 0.1, timeConstant: 200 }}
        className="
          flex flex-row gap-6 pb-6 
          -mx-4 px-4 sm:mx-0 sm:px-0 
          sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8 sm:pb-0
          cursor-grab active:cursor-grabbing
          touch-pan-y
        "
      >
        {tours.map((tour, index) => (
          <motion.div 
            key={tour.id} 
            className="flex-shrink-0 w-[85%] sm:w-auto"
            whileTap={{ scale: 0.98 }}
          >
            <PublicTourCard tour={tour} showHint={index === 0} />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Visual Indicator (Mobile Only) */}
      <div className="flex justify-center gap-1.5 sm:hidden -mt-2 mb-6">
        {tours.map((_, i) => (
          <div 
            key={i} 
            className="w-1.5 h-1.5 rounded-full bg-theme-muted/20" 
          />
        ))}
      </div>
    </div>
  )
}
