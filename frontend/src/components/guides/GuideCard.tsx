'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  UserCheck, 
  MapPin, 
  Star, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export interface GuideCardProps {
  guide: {
    id: number | string
    name: string
    tagline?: string
    avatarUrl?: string
    coverImageUrl?: string
    city?: string
    country?: string
    expertise?: string[]
    verified?: boolean
    tourCount?: number
    totalGuidedTrips?: number
    averageRating?: number
  }
}

export default function GuideCard({ guide }: GuideCardProps) {
  const defaultCover = "https://images.unsplash.com/photo-1547448415-38933c10156d?w=800&q=80"
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name)}&background=0D8ABC&color=fff`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group relative h-full bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col font-sans"
    >
      {/* Cover Image Header */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image 
          src={guide.coverImageUrl || defaultCover}
          alt={`${guide.name} cover`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
        
        {/* Verification Badge */}
        {guide.verified && (
          <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500 text-white shadow-lg backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
          </div>
        )}

        {/* City Badge */}
        {guide.city && (
          <div className="absolute bottom-4 left-6 flex items-center gap-1.5 text-white/90">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-bold tracking-tight">{guide.city}</span>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="relative px-8 pt-10 pb-8 flex-1 flex flex-col">
        {/* Floating Avatar */}
        <div className="absolute -top-12 left-8 p-1 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-white/10">
          <div className="relative h-20 w-20 rounded-xl overflow-hidden">
            <Image 
              src={guide.avatarUrl || defaultAvatar}
              alt={guide.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 mt-2">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {guide.name}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-[0.1em] mb-3">
            Local Heritage Expert
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed italic">
            "{guide.tagline || `Sharing the authentic secrets of ${guide.city || 'the region'} with fellow explorers.`}"
          </p>
        </div>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(guide.expertise && guide.expertise.length > 0 ? guide.expertise : ['Historical', 'Cultural', 'Local Secret']).slice(0, 3).map((tag, i) => (
            <span 
              key={i}
              className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-100 dark:border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom Bar: Stats & Link */}
        <div className="mt-auto pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-black text-gray-900 dark:text-white leading-none mb-1">
                {guide.tourCount || 0}
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-tighter">
                Tours
              </div>
            </div>
            <div className="w-px h-6 bg-gray-100 dark:bg-white/10" />
            <div className="text-center">
              <div className="text-lg font-black text-gray-900 dark:text-white leading-none mb-1">
                {guide.totalGuidedTrips || 0}
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-tighter">
                Trips
              </div>
            </div>
          </div>

          <Link 
            href={`/guides/${guide.id}`}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white dark:hover:text-white transition-all shadow-lg group/btn"
          >
            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
