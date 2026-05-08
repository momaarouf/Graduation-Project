"use client"

import { useState } from"react"
import { motion, AnimatePresence } from"framer-motion"
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
} from"lucide-react"

interface Step {
 title: string
 description: string
 icon: any
 details: string[]
 color: string
}

const travelerSteps: Step[] = [
 {
 title:"Find Your Perfect Tour",
 description:"Explore the best of the world. Filter by specific regions and verified Halal needs.",
 icon: Search,
 details: ["Region-based filtering","Halal Food & Prayer filters","Admin-vetted destinations"],
 color:"blue"
 },
 {
 title:"Secure Your Spot",
 description:"Use Instant Book with a 30-minute cart lock, or send a request. Join deterministic waitlists for popular dates.",
 icon: Calendar,
 details: ["30-minute payment lock","24h guide response window","Live waitlist promotions"],
 color:"orange"
 },
 {
 title:"The QR Handshake",
 description:"Meet your guide and scan their unique QR code. This digital handshake activates insurance and marks your tour 'In Progress'.",
 icon: QrCode,
 details: ["QR-Code verification","Automated safety activation","Real-time trip tracking"],
 color:"emerald"
 },
 {
 title:"Policy & Protection",
 description:"Benefit from our transparent refund policy: 100% back up to 48h, 50% for 24-48h. Earn loyalty for every review.",
 icon: Star,
 details: ["48h/24h refund windows","Verified review system","Community Impact Score"],
 color:"purple"
 }
]

const guideSteps: Step[] = [
 {
 title:"Elite Vetting Process",
 description:"We maintain high standards. Every guide undergoes a 1-on-1 identity audit and individual tour template review.",
 icon: ClipboardCheck,
 details: ["Manual 1-on-1 interview","Document authenticity check","Tour review by Admins"],
 color:"blue"
 },
 {
 title:"Master Your Schedule",
 description:"Create master Tour Templates once, then schedule multiple Occurrences with recurring patterns and custom pricing.",
 icon: UserPlus,
 details: ["Template vs Occurrence logic","Recurring schedule patterns","Dynamic pricing rules"],
 color:"orange"
 },
 {
 title:"Real-time Handshake",
 description:"Manage your group through the built-in QR scanner. Mark completions instantly to start the payout window.",
 icon: MessageCircle,
 details: ["Built-in QR scanner","Instant seat management","Direct traveler chat"],
 color:"emerald"
 },
 {
 title:"Escrow & Payouts",
 description:"Funds are released 48h after tour completion for traveler safety. Build your reputation and Impact Score.",
 icon: Wallet,
 details: ["48h secure payout freeze","Performance badges","Guide analytic tools"],
 color:"purple"
 }
]

export default function HowItWorksFlow() {
 const [role, setRole] = useState<"traveler" | "guide">("traveler")
 const steps = role === "traveler" ? travelerSteps : guideSteps

 return (
 <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
 {/* Role Switcher */}
 <div className="flex justify-center mb-24">
 <div className="relative p-1.5 surface-section rounded-[2rem] border border-theme flex gap-2 shadow-2xl">
 <button
 onClick={() => setRole("traveler")}
 className={`relative px-10 py-4 rounded-[1.5rem] text-sm font-bold tracking-widest transition-all duration-500 ${
 role === "traveler" ? "text-white" : "text-theme-secondary hover:text-theme-primary"
 }`}
 >
 {role === "traveler" && (
 <motion.div
 layoutId="activeRole"
 className="absolute inset-0 bg-primary-light rounded-[1.5rem] shadow-xl shadow-primary-light/30"
 transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
 />
 )}
 <span className="relative z-10 uppercase">For Travelers</span>
 </button>
 <button
 onClick={() => setRole("guide")}
 className={`relative px-10 py-4 rounded-[1.5rem] text-sm font-bold tracking-widest transition-all duration-500 ${
 role === "guide" ? "text-white" : "text-theme-secondary hover:text-theme-primary"
 }`}
 >
 {role === "guide" && (
 <motion.div
 layoutId="activeRole"
 className="absolute inset-0 bg-orange-600 rounded-[1.5rem] shadow-xl shadow-orange-500/30"
 transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
 />
 )}
 <span className="relative z-10 uppercase">For Guides</span>
 </button>
 </div>
 </div>

 {/* Grid of Steps with Enhanced Transitions */}
 <div className="relative min-h-[500px]">
 {/* Connection Line (Desktop) */}
 <motion.div 
 initial={{ scaleX: 0 }}
 whileInView={{ scaleX: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 1.5, delay: 0.5 }}
 className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-light/20 dark:via-primary-dark/20 to-transparent z-0 origin-left" 
 />
 
 <AnimatePresence mode="wait">
 <motion.div
 key={role}
 initial={{ opacity: 0, x: role === "traveler" ? -50 : 50, filter: "blur(10px)" }}
 animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
 exit={{ opacity: 0, x: role === "traveler" ? 50 : -50, filter: "blur(10px)" }}
 transition={{ type: "spring", duration: 0.8, bounce: 0.2 }}
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
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
 blue: "text-primary-light dark:text-primary-dark bg-blue-500/5 border-primary-light/20 glow-blue-500/20",
 orange: "text-orange-500 bg-orange-500/5 border-orange-500/20 glow-orange-500/20",
 emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20 glow-emerald-500/20",
 purple: "text-purple-500 bg-purple-500/5 border-purple-500/20 glow-purple-500/20",
 }
 
 const currentStyles = colorMap[step.color as keyof typeof colorMap]

 return (
 <motion.div
 initial={{ opacity: 0, y: 30, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ 
 delay: index * 0.12,
 type: "spring",
 stiffness: 100,
 damping: 15
 }}
 whileHover={{ y: -10 }}
 className="relative z-10 group"
 >
 <div className="surface-card border border-theme-strong rounded-[2.5rem] p-10 hover:shadow-3xl hover:shadow-primary-light/5 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
 {/* Glow Background (on hover) */}
 <div className={`absolute -inset-24 opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-700 ${
 step.color === 'blue' ? 'bg-primary-light' : 
 step.color === 'orange' ? 'bg-orange-500' : 
 step.color === 'emerald' ? 'bg-emerald-500' : 
 'bg-purple-500'
 }`} />

 {/* Step Number & Icon */}
 <div className="flex items-start justify-between mb-10 relative z-10">
 <motion.div 
 whileHover={{ rotate: 12, scale: 1.1 }}
 className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${currentStyles} shadow-xl`}
 >
 <Icon className="w-8 h-8" />
 </motion.div>
 <span className="text-5xl font-bold text-theme-muted opacity-10 group-hover:opacity-30 transition-opacity tabular-nums">
 {index + 1}
 </span>
 </div>

 <h3 className="text-2xl font-bold text-theme-primary mb-5 relative z-10">
 {step.title}
 </h3>
 
 <p className="text-theme-secondary text-base leading-relaxed mb-10 flex-grow relative z-10 font-medium opacity-80">
 {step.description}
 </p>

 {/* Detailed Points */}
 <ul className="space-y-4 relative z-10">
 {step.details.map((detail, dIndex) => (
 <motion.li 
 key={detail} 
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: (index * 0.1) + (dIndex * 0.1) + 0.5 }}
 className="flex items-center gap-3 text-sm font-bold text-theme-primary"
 >
 <div className={`w-1.5 h-1.5 rounded-full ${
 step.color === 'blue' ? 'bg-primary-light' : 
 step.color === 'orange' ? 'bg-orange-500' : 
 step.color === 'emerald' ? 'bg-emerald-500' : 
 'bg-purple-500'
 }`} />
 {detail}
 </motion.li>
 ))}
 </ul>
 </div>
 </motion.div>
 )
}
