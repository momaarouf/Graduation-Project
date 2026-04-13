"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Calendar, 
  ShieldCheck, 
  QrCode, 
  Star, 
  UserPlus, 
  ClipboardCheck, 
  MessageCircle, 
  Wallet,
  ArrowRight,
  CheckCircle2
} from "lucide-react"

interface Step {
  title: string
  description: string
  icon: any
  details: string[]
  color: string
}

const travelerSteps: Step[] = [
  {
    title: "Find Your Perfect Tour",
    description: "Explore the best of Lebanon and Turkey. Filter by specific regions like Bekaa or North Lebanon and verified Halal needs.",
    icon: Search,
    details: ["Region-based filtering", "Halal Food & Prayer filters", "Admin-vetted destinations"],
    color: "blue"
  },
  {
    title: "Secure Your Spot",
    description: "Use Instant Book with a 30-minute cart lock, or send a request. Join deterministic waitlists for popular dates.",
    icon: Calendar,
    details: ["30-minute payment lock", "24h guide response window", "Live waitlist promotions"],
    color: "orange"
  },
  {
    title: "The QR Handshake",
    description: "Meet your guide and scan their unique QR code. This digital handshake activates insurance and marks your tour 'In Progress'.",
    icon: QrCode,
    details: ["QR-Code verification", "Automated safety activation", "Real-time trip tracking"],
    color: "emerald"
  },
  {
    title: "Policy & Protection",
    description: "Benefit from our transparent refund policy: 100% back up to 48h, 50% for 24-48h. Earn loyalty for every review.",
    icon: Star,
    details: ["48h/24h refund windows", "Verified review system", "Community Impact Score"],
    color: "purple"
  }
]

const guideSteps: Step[] = [
  {
    title: "Elite Vetting Process",
    description: "We maintain high standards. Every guide undergoes a 1-on-1 identity audit and individual tour template review.",
    icon: ClipboardCheck,
    details: ["Manual 1-on-1 interview", "Document authenticity check", "Tour review by Admins"],
    color: "blue"
  },
  {
    title: "Master Your Schedule",
    description: "Create master Tour Templates once, then schedule multiple Occurrences with recurring patterns and custom pricing.",
    icon: UserPlus,
    details: ["Template vs Occurrence logic", "Recurring schedule patterns", "Dynamic pricing rules"],
    color: "orange"
  },
  {
    title: "Real-time Handshake",
    description: "Manage your group through the built-in QR scanner. Mark completions instantly to start the payout window.",
    icon: MessageCircle,
    details: ["Built-in QR scanner", "Instant seat management", "Direct traveler chat"],
    color: "emerald"
  },
  {
    title: "Escrow & Payouts",
    description: "Funds are released 48h after tour completion for traveler safety. Build your reputation and Impact Score.",
    icon: Wallet,
    details: ["48h secure payout freeze", "Performance badges", "Guide analytic tools"],
    color: "purple"
  }
]

export default function HowItWorksFlow() {
  const [role, setRole] = useState<"traveler" | "guide">("traveler")
  const steps = role === "traveler" ? travelerSteps : guideSteps

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Role Switcher */}
      <div className="flex justify-center mb-16">
        <div className="relative p-1 bg-bg-light-secondary dark:bg-bg-dark-secondary/50 backdrop-blur-md rounded-2xl border border-border-light-default dark:border-border-dark-default flex gap-1">
          <button
            onClick={() => setRole("traveler")}
            className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              role === "traveler" ? "text-white" : "text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary"
            }`}
          >
            {role === "traveler" && (
              <motion.div
                layoutId="activeRole"
                className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">FOR TRAVELERS</span>
          </button>
          <button
            onClick={() => setRole("guide")}
            className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              role === "guide" ? "text-white" : "text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary"
            }`}
          >
            {role === "guide" && (
              <motion.div
                layoutId="activeRole"
                className="absolute inset-0 bg-orange-600 rounded-xl shadow-lg shadow-orange-500/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">FOR GUIDES</span>
          </button>
        </div>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {/* Connection Line (Desktop) */}
        <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border-light-default dark:via-border-dark-default to-transparent z-0" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon
  const colorMap = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50 glow-blue-500/20",
    orange: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/50 glow-orange-500/20",
    emerald: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50 glow-emerald-500/20",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800/50 glow-purple-500/20",
  }
  
  const currentStyles = colorMap[step.color as keyof typeof colorMap]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="relative z-10 group"
    >
      <div className="bg-bg-light-primary/70 dark:bg-bg-dark-primary/70 backdrop-blur-xl border border-border-light-default dark:border-border-dark-default rounded-3xl p-8 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-500 h-full flex flex-col">
        {/* Step Number Badge */}
        <div className="flex items-center justify-between mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${currentStyles} transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500 shadow-xl`}>
            <Icon className="w-7 h-7" />
          </div>
          <span className="text-4xl font-black text-border-light-strong dark:text-border-dark-strong/50 tabular-nums">
            0{index + 1}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-text-light-primary dark:text-text-dark-primary mb-4">
          {step.title}
        </h3>
        
        <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm leading-relaxed mb-8 flex-grow">
          {step.description}
        </p>

        {/* Detailed Points */}
        <ul className="space-y-3">
          {step.details.map((detail) => (
            <li key={detail} className="flex items-center gap-2 text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary">
              <CheckCircle2 className={`w-4 h-4 ${
                step.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 
                step.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 
                step.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 
                'text-purple-600 dark:text-purple-400'
              }`} />
              {detail}
            </li>
          ))}
        </ul>

        {/* Decorative corner pulse */}
        <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${step.color === 'blue' ? 'bg-blue-500' : step.color === 'orange' ? 'bg-orange-500' : step.color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
      </div>
    </motion.div>
  )
}
