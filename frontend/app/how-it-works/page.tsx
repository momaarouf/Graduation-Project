"use client"

import { Metadata } from"next"
import Link from"next/link"
import { 
 ShieldCheck, 
 Globe, 
 MapPin, 
 MessageCircle, 
 CheckCircle2,
 ChevronRight,
 TrendingUp,
 CreditCard,
 Target,
 ArrowRight,
 Sparkles,
 ChevronDown,
 Coffee,
 Moon,
 Shield,
 Search,
 FileText,
 Video,
 Clock,
 Heart,
 HelpCircle,
 BellDot,
 ChefHat,
 Globe2,
 UserCheck2,
 FileSearch,
 MessageSquare,
 Bell,
 Star,
 Users,
 RefreshCw,
 FileEdit
} from"lucide-react"
import { motion, Variants } from"framer-motion"
import PageLayout from"@/src/components/layout/PageLayout"
import HowItWorksFlow from"@/src/components/how-it-works/HowItWorksFlow"
import CinematicBackground from"@/src/components/layout/CinematicBackground"

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

const itemFade: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.1
    }
  }
}

const floatingAnim: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Since this is a client component, we use a separate SEO wrapper or define it here
// Note: Next.js 16/15 handles metadata differently in client components, 
// usually you define it in a parent layout.tsx or a separate server metadata file.


const safetyFeatures = [
 {
 title:"Identity Verification",
 description:"Every guide undergoes a mandatory 1-on-1 ID and document verification process.",
 icon: ShieldCheck,
 color:"blue"
 },
 {
 title:"Secure Escrow",
 description:"Payments are held safely and only released 48h after the tour is completed successfully.",
 icon: CreditCard,
 color:"orange"
 },
 {
 title:"Real-time Tracking",
 description:"Digital handshake through QR codes ensures traveler and guide meet at the right spot.",
 icon: MapPin,
 color:"emerald"
 },
 {
 title:"Safe Communication",
 description:"Built-in chat with automated content filtering to protect your privacy and safety.",
 icon: MessageCircle,
 color:"purple"
 }
]

const halalValues = [
 {
 title:"Prayer-First Travel",
 description:"Tours in cities like Beirut and Istanbul are scheduled around local prayer times with pre-vetted accessible prayer spaces.",
 icon: BellDot,
 color:"blue"
 },
 {
 title:"Verified Halal Food",
 description:"Every dining stop is vetted against our strict certification standards, ensuring zero alcohol and 100% halal-only menus.",
 icon: ChefHat,
 color:"emerald"
 },
 {
 title:"Cultural Modesty",
 description:"We provide gender-sensitive guide options and clear modesty dress-code guidelines to respect local and traveler values.",
 icon: Globe2,
 color:"purple"
 }
]

const guideVerificationSteps = [
 {
 step:"01",
 title:"1-on-1 Account Audit",
 icon: UserCheck2,
 description:"Beyond basic ID check (National ID back image required), our team conducts a manual audit of every guide's professional background."
 },
 {
 step:"02",
 title:"Manual Tour Review",
 icon: FileSearch,
 description:"No tour goes live without scrutiny. Every master Tour Template is manually reviewed by an Admin for safety, pricing, and cultural alignment."
 },
 {
 step:"03",
 title:"QR Handshake Seal",
 icon: ShieldCheck,
 description:"The digital handshake triggers 48h payout protection. Payouts are only released after a safe, successful tour completion."
 }
]

const ecosystemFeatures = [
 {
 title:"Real-time Chat",
 description:"Connect instantly with guides via our WebSocket-powered messenger for pre-trip questions or on-tour coordination.",
 icon: MessageSquare,
 color:"blue"
 },
 {
 title:"Smart Notifications",
 description:"Instant alerts for booking confirmations, message replies, and secure payout updates across all your devices.",
 icon: Bell,
 color:"amber"
 },
 {
 title:"Premium Reviews",
 description:"Post-tour only reviews with multi-dimensional ratings (Guide, Tour, Value) and guide-verified response threads.",
 icon: Star,
 color:"purple"
 },
 {
 title:"Flexible Booking",
 description:"Easily edit your traveler count or switch to a different tour date up to 48 hours before the start without penalty.",
 icon: FileEdit,
 color:"emerald"
 },
 {
 title:"Waitlist System",
 description:"Automatic FIFO (First-In-First-Out) promotion logic ensuring you hit the top of the list the moment a spot opens.",
 icon: Users,
 color:"indigo"
 },
 {
 title:"Automatic Sync",
 description:"Platform-wide sync for cancellations and no-shows, keeping tour availability accurate and fair for everyone.",
 icon: RefreshCw,
 color:"rose"
 }
]

const faqs = [
 {
 question:"What is the 15-minute cart lock?",
 answer:"For Instant Book tours, we lock your selected seats for 15 minutes. This gives you time to complete your secure payment without losing your spot."
 },
 {
 question:"How do refunds and cancellations work?",
 answer:"We follow a tiered policy: 100% refund for cancellations >48h before start, 50% for 24-48h, and 0% for cancellations within 24 hours."
 },
 {
 question:"What happens if a tour doesn't reach minimum capacity?",
 answer:"If a tour has a minimum traveler requirement and it isn't met 48 hours before the start, the system automatically cancels the occurrence and issues a full refund."
 },
 {
 question:"How does the waitlist promotion work?",
 answer:"If a tour is full, you can join a deterministic waitlist. If a confirmed traveler cancels, the next traveler in line is automatically promoted and notified."
 },
 {
 question:"Can I edit my booking after it's confirmed?",
 answer:"Yes. You can edit your traveler count or switch tour dates through your dashboard. If the new date is full, you'll have the option to join the waitlist."
 },
 {
 question:"How does the QR handshake work?",
 answer:"When you meet your guide, they scan your booking QR code. This marks the tour as 'InProgress', activates insurance, and begins the 48h payout freeze window."
 }
]

export default function HowItWorksPage() {
 return (
 <PageLayout>
 <div className="flex flex-col w-full relative overflow-hidden transition-colors duration-500 surface-card ">
 
 {/* --- HERO SECTION (Original Content with New Background) --- */}
 <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
 
 <div className="relative z-10 w-full max-w-7xl mx-auto px-4 text-center">
 {/* Pre-header badge */}
 <motion.div 
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5 }}
 className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-black/5 rounded-full text-xs sm:text-sm font-bold border border-black/10 dark:border-theme-strong text-theme-primary"
 >
 <Sparkles className="w-4 h-4 text-amber-500" />
 <span className="tracking-normal capitalize">Your journey starts here</span>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
 >
 <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-theme-primary leading-[0.95] tracking-tight mb-8">
 How <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
 SafariHub
 </span> Works.
 </h1>
 <motion.p 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.5, duration: 1 }}
 className="text-lg sm:text-xl text-theme-secondary font-medium tracking-wide mb-12 max-w-2xl mx-auto"
 >
 Explore global destinations through our admin-vetted master templates. 
 Whether you're discovering gems or guiding them, SafariHub ensures 100% vetted security and cultural alignment.
 </motion.p>
 </motion.div>


 {/* Scroll indicator */}
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1, y: [0, 8, 0] }}
 transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
 className="absolute bottom-2 left-1/2 -translate-x-1/2"
 >
 <ChevronDown className="w-6 h-6 text-theme-muted/40" />
 </motion.div>
 </div>
 
 </section>

  {/* --- FLOW SECTION --- */}
  <section className="py-24 relative">
  <motion.div 
  initial="hidden"
  whileInView="show"
  viewport={{ once: false, amount: 0.2 }}
  variants={itemFade}
  className="container-safe mx-auto"
  >
  <div className="text-center mb-16 px-4">
  <h2 className="text-3xl sm:text-5xl font-bold text-theme-primary mb-6">Explore the Process.</h2>
  <p className="text-theme-secondary max-w-xl mx-auto font-medium">
  Choose your role to see the journey. We've simplified the process so you can focus on the experience.
  </p>
  </div>
  <HowItWorksFlow />
  </motion.div>
  </section>

 {/* --- TRUST & SAFETY SECTION --- */}
 <section className="py-32 px-4 surface-section">
 <div className="max-w-7xl mx-auto">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
  <motion.div
  initial="hidden"
  whileInView="show"
  viewport={{ once: false, amount: 0.2 }}
  variants={staggerContainer}
  >
 <motion.h2 
 variants={itemFade}
 className="text-4xl sm:text-6xl font-bold text-theme-primary mb-10 leading-tight tracking-tight"
 >
 Your Safety is Our <br />
 <span className="text-emerald-600 dark:text-emerald-400">Protocol.</span>
 </motion.h2>
 <div className="space-y-8">
 {safetyFeatures.map((f, i) => (
 <motion.div 
 key={i} 
 variants={itemFade}
 whileHover={{ x: 10 }}
 className="flex gap-6 group cursor-default"
 >
 <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 shadow-lg shadow-black/5 ${
 f.color === 'blue' ? 'text-primary-light dark:text-primary-dark bg-blue-100' : 
 f.color === 'orange' ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' : 
 f.color === 'emerald' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 
 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
 }`}>
 <f.icon className="w-6 h-6" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-theme-primary mb-2 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">{f.title}</h3>
 <p className="text-theme-secondary leading-relaxed font-medium">
 {f.description}
 </p>
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>

 <div className="relative">
  <motion.div 
  initial={{ opacity: 0, scale: 0.5 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: false }}
  className="absolute inset-0 bg-primary-light/10 dark:bg-primary-light/5 blur-[120px] rounded-full" 
  />
 <div className="grid grid-cols-2 gap-6 relative z-10">
 <motion.div 
 variants={floatingAnim}
 initial="initial"
 animate="animate"
 className="surface-card p-10 rounded-[3.5rem] border dark:border-theme-strong shadow-2xl translate-y-12"
 >
 <Target className="w-12 h-12 text-primary-light dark:text-primary-dark mb-6" />
 <h4 className="font-bold text-theme-primary text-xl">99.9% Reliable</h4>
 <p className="text-theme-secondary text-sm mt-3 leading-relaxed">Uptime on all booking processes and payments.</p>
 </motion.div>
 <motion.div 
 variants={floatingAnim}
 initial="initial"
 animate="animate"
 transition={{ delay: 1 }}
 className="surface-card p-10 rounded-[3.5rem] border dark:border-theme-strong shadow-2xl"
 >
 <TrendingUp className="w-12 h-12 text-orange-600 dark:text-orange-400 mb-6" />
 <h4 className="font-bold text-theme-primary text-xl">Impact Score</h4>
 <p className="text-theme-secondary text-sm mt-3 leading-relaxed">Every vetted review builds the community trust.</p>
 </motion.div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* --- HALAL-FIRST VALUES --- */}
 <section className="py-32 px-4 relative overflow-hidden">
 <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
 <div className="max-w-7xl mx-auto relative z-10">
  <motion.div 
  initial="hidden"
  whileInView="show"
  viewport={{ once: false, amount: 0.2 }}
  variants={itemFade}
  className="text-center mb-20"
  >
 <h2 className="text-4xl sm:text-6xl font-bold text-theme-primary mb-6 tracking-tight">
 Our <span className="text-emerald-600 dark:text-emerald-400">Halal-First</span> Values.
 </h2>
 <p className="text-theme-secondary font-bold max-w-xl mx-auto capitalize tracking-[0.2em] text-xs opacity-70">
 Travel without compromising your faith.
 </p>
 </motion.div>

  <motion.div 
  initial="hidden"
  whileInView="show"
  viewport={{ once: false, amount: 0.1 }}
  variants={staggerContainer}
  className="grid grid-cols-1 md:grid-cols-3 gap-8"
  >
 {halalValues.map((v, i) => (
 <motion.div 
 key={i} 
 variants={itemFade}
 whileHover={{ y: -10, scale: 1.02 }}
 className="surface-card border border-theme p-12 rounded-[3.5rem] shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 group relative overflow-hidden"
 >
 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all group-hover:rotate-6 shadow-lg ${
 v.color === 'blue' ? 'text-primary-light dark:text-primary-dark bg-blue-100' : 
 v.color === 'emerald' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 
 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
 }`}>
 <v.icon className="w-8 h-8" />
 </div>
 <h3 className="text-2xl font-bold text-theme-primary mb-4">{v.title}</h3>
 <p className="text-theme-secondary leading-relaxed font-medium">
 {v.description}
 </p>
 {/* Decorative glow */}
 <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${
 v.color === 'blue' ? 'bg-primary-light' : 
 v.color === 'emerald' ? 'bg-emerald-500' : 
 'bg-purple-500'
 }`} />
 </motion.div>
 ))}
 </motion.div>
 </div>
 </section>

 {/* --- GUIDE STANDARDS --- */}
 <section className="py-32 px-4 surface-section">
 <div className="max-w-7xl mx-auto">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
  <motion.div 
  initial="hidden"
  whileInView="show"
  viewport={{ once: false, amount: 0.1 }}
  variants={staggerContainer}
  className="order-2 lg:order-1"
  >
 <div className="grid grid-cols-1 gap-6">
 {guideVerificationSteps.map((s, i) => (
 <motion.div 
 key={i} 
 variants={itemFade}
 whileHover={{ x: 15 }}
 className="flex gap-6 items-center surface-card p-8 rounded-[2.5rem] border border-theme dark:border-white/5 shadow-xl transition-all group"
 >
 <div className="text-4xl font-bold text-theme-muted opacity-20 group-hover:opacity-40 transition-opacity">{s.step}</div>
 <div className="w-14 h-14 bg-primary-light/10 text-primary-light dark:text-primary-dark rounded-2xl flex items-center justify-center shadow-inner">
 <s.icon className="w-7 h-7" />
 </div>
 <div>
 <h4 className="text-lg font-bold text-theme-primary mb-1">{s.title}</h4>
 <p className="text-sm text-theme-secondary leading-snug">{s.description}</p>
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>
  <motion.div 
  initial={{ opacity: 0, x: 40 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: false }}
  transition={{ duration: 0.8 }}
  className="order-1 lg:order-2"
  >
 <h2 className="text-4xl sm:text-6xl font-bold text-theme-primary mb-8 leading-tight tracking-tight">
 Vetted for your <br />
 <span className="text-primary-light dark:text-primary-dark">Peace of Mind.</span>
 </h2>
 <p className="text-xl text-theme-secondary leading-relaxed font-medium mb-10">
 We don't just verify identities. Every guide undergoes a manual 1-on-1 audit, and every individual tour is reviewed for quality, safety, and cultural compliance across all regions.
 </p>
 <div className="inline-flex items-center gap-4 p-5 surface-card border border-theme-strong rounded-2xl shadow-lg">
 <div className="p-3 bg-emerald-500/10 rounded-xl">
 <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
 </div>
 <span className="text-base font-bold text-theme-primary">Only the top 15% of tour templates pass our manual audit.</span>
 </div>
 </motion.div>
 </div>
 </div>
 </section>

 {/* --- PLATFORM ECOSYSTEM --- */}
 <section className="py-32 px-4 relative overflow-hidden">
 <div className="absolute inset-0 bg-primary-light/[0.02] dark:bg-primary-light/[0.01]" />
 <div className="max-w-7xl mx-auto relative z-10">
  <motion.div 
  initial="hidden"
  whileInView="show"
  viewport={{ once: false, amount: 0.2 }}
  variants={itemFade}
  className="text-center mb-20"
  >
 <h2 className="text-4xl sm:text-6xl font-bold text-theme-primary mb-6">
 Technical <span className="text-primary-light dark:text-primary-dark">Ecosystem.</span>
 </h2>
 <p className="text-xl text-theme-secondary max-w-2xl mx-auto font-medium">
 Our technical backbone handles the complexity so you can focus on the experience.
 Every interaction is powered by real-time logic and secure protocols.
 </p>
 </motion.div>

  <motion.div 
  initial="hidden"
  whileInView="show"
  viewport={{ once: false, amount: 0.1 }}
  variants={staggerContainer}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
  >
 {ecosystemFeatures.map((feature, i) => (
 <motion.div
 key={i}
 variants={itemFade}
 whileHover={{ y: -10, scale: 1.02 }}
 className="p-10 surface-card rounded-[3rem] border border-theme dark:border-theme-strong shadow-2xl shadow-black/[0.02] hover:shadow-primary-light/10 transition-all group"
 >
 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:rotate-6 transition-transform ${
 feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
 feature.color === 'amber' ? 'bg-amber-100 text-amber-600' :
 feature.color === 'purple' ? 'bg-purple-100 text-purple-600' :
 feature.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
 feature.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
 'bg-rose-100 text-rose-600'
 }`}>
 <feature.icon className="w-8 h-8" />
 </div>
 <h3 className="text-2xl font-bold text-theme-primary mb-4">{feature.title}</h3>
 <p className="text-theme-secondary leading-relaxed text-base font-medium">
 {feature.description}
 </p>
 </motion.div>
 ))}
 </motion.div>
 </div>
 </section>

 {/* --- FAQ SECTION --- */}
 <section className="py-32 px-4">
 <div className="max-w-4xl mx-auto">
  <motion.div 
  initial="hidden"
  whileInView="show"
  viewport={{ once: false, amount: 0.2 }}
  variants={itemFade}
  className="text-center mb-20"
  >
 <div className="w-20 h-20 surface-card border border-theme-strong rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
 <HelpCircle className="w-10 h-10 text-primary-light dark:text-primary-dark" />
 </div>
 <h2 className="text-3xl sm:text-5xl font-bold text-theme-primary mb-4">Common Questions.</h2>
 <p className="text-theme-secondary font-bold capitalize tracking-normal text-xs opacity-60">Everything you need to know about the platform.</p>
 </motion.div>

  <motion.div 
  initial="hidden"
  whileInView="show"
  viewport={{ once: false }}
  variants={staggerContainer}
  className="space-y-6"
  >
 {faqs.map((faq, i) => (
 <motion.div 
 key={i} 
 variants={itemFade}
 whileHover={{ scale: 1.01 }}
 className="p-10 surface-section rounded-[2.5rem] border border-theme dark:border-theme-strong group hover:border-primary-light dark:hover:border-primary-dark transition-all shadow-sm hover:shadow-xl cursor-default"
 >
 <h4 className="text-xl font-extrabold text-theme-primary mb-4 flex items-center justify-between">
 {faq.question}
 <div className="w-8 h-8 rounded-full bg-theme-strong flex items-center justify-center group-hover:bg-primary-light/10 transition-colors">
 <ChevronRight className="w-5 h-5 text-theme-muted group-hover:text-primary-light dark:text-primary-dark transition-colors" />
 </div>
 </h4>
 <p className="text-theme-secondary text-base leading-relaxed font-medium">
 {faq.answer}
 </p>
 </motion.div>
 ))}
 </motion.div>
 </div>
 </section>

 {/* --- FINAL CTA --- */}
 <section className="relative py-40 px-4 overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-950 dark:to-purple-900" />
 <motion.div 
 animate={{ 
 scale: [1, 1.2, 1],
 rotate: [0, 5, 0]
 }}
 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-amber-500/20 rounded-full blur-[150px]" 
 />
 
 <div className="relative z-10 max-w-5xl mx-auto text-center">
  <motion.div
  initial="hidden"
  whileInView="show"
  viewport={{ once: false, amount: 0.2 }}
  variants={itemFade}
  >
 <h2 className="text-5xl sm:text-8xl font-bold text-white mb-10 tracking-tight leading-tight">
 Ready to <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">Discover?</span>
 </h2>
 <p className="text-2xl text-white/80 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
 Join thousands of travelers and local experts on SafariHub. 
 The most authentic way to explore the globe.
 </p>
 
 <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
 <Link 
 href="/tours"
 className="group relative px-16 py-6 bg-white text-blue-600 hover:scale-105 transition-all rounded-[2.5rem] font-bold text-2xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
 >
 Find a Tour
 <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
 </Link>
 <Link 
 href="/auth/signup"
 className="group px-16 py-6 border-4 border-white/20 text-white hover:bg-white/10 transition-all rounded-[2.5rem] font-bold text-2xl flex items-center justify-center gap-4"
 >
 Become a Guide
 </Link>
 </div>
 </motion.div>
 </div>
 </section>
 </div>
 </PageLayout>
 )
}
