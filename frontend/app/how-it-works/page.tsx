"use client"

import { Metadata } from "next"
import Link from "next/link"
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
} from "lucide-react"
import { motion } from "framer-motion"
import PageLayout from "@/src/components/layout/PageLayout"
import HowItWorksFlow from "@/src/components/how-it-works/HowItWorksFlow"
import CinematicBackground from "@/src/components/layout/CinematicBackground"

// Since this is a client component, we use a separate SEO wrapper or define it here
// Note: Next.js 16/15 handles metadata differently in client components, 
// usually you define it in a parent layout.tsx or a separate server metadata file.


const safetyFeatures = [
  {
    title: "Identity Verification",
    description: "Every guide undergoes a mandatory 1-on-1 ID and document verification process.",
    icon: ShieldCheck,
    color: "blue"
  },
  {
    title: "Secure Escrow",
    description: "Payments are held safely and only released 48h after the tour is completed successfully.",
    icon: CreditCard,
    color: "orange"
  },
  {
    title: "Real-time Tracking",
    description: "Digital handshake through QR codes ensures traveler and guide meet at the right spot.",
    icon: MapPin,
    color: "emerald"
  },
  {
    title: "Safe Communication",
    description: "Built-in chat with automated content filtering to protect your privacy and safety.",
    icon: MessageCircle,
    color: "purple"
  }
]

const halalValues = [
  {
    title: "Prayer-First Travel",
    description: "Tours in cities like Beirut and Istanbul are scheduled around local prayer times with pre-vetted accessible prayer spaces.",
    icon: BellDot,
    color: "blue"
  },
  {
    title: "Verified Halal Food",
    description: "Every dining stop is vetted against our strict certification standards, ensuring zero alcohol and 100% halal-only menus.",
    icon: ChefHat,
    color: "emerald"
  },
  {
    title: "Cultural Modesty",
    description: "We provide gender-sensitive guide options and clear modesty dress-code guidelines to respect local and traveler values.",
    icon: Globe2,
    color: "purple"
  }
]

const guideVerificationSteps = [
  {
    step: "01",
    title: "1-on-1 Account Audit",
    icon: UserCheck2,
    description: "Beyond basic ID check (National ID back image required), our team conducts a manual audit of every guide's professional background."
  },
  {
    step: "02",
    title: "Manual Tour Review",
    icon: FileSearch,
    description: "No tour goes live without scrutiny. Every master Tour Template is manually reviewed by an Admin for safety, pricing, and cultural alignment."
  },
  {
    step: "03",
    title: "QR Handshake Seal",
    icon: ShieldCheck,
    description: "The digital handshake triggers 48h payout protection. Payouts are only released after a safe, successful tour completion."
  }
]

const ecosystemFeatures = [
  {
    title: "Real-time Chat",
    description: "Connect instantly with guides via our WebSocket-powered messenger for pre-trip questions or on-tour coordination.",
    icon: MessageSquare,
    color: "blue"
  },
  {
    title: "Smart Notifications",
    description: "Instant alerts for booking confirmations, message replies, and secure payout updates across all your devices.",
    icon: Bell,
    color: "amber"
  },
  {
    title: "Premium Reviews",
    description: "Post-tour only reviews with multi-dimensional ratings (Guide, Tour, Value) and guide-verified response threads.",
    icon: Star,
    color: "purple"
  },
  {
    title: "Flexible Booking",
    description: "Easily edit your traveler count or switch to a different tour date up to 48 hours before the start without penalty.",
    icon: FileEdit,
    color: "emerald"
  },
  {
    title: "Waitlist System",
    description: "Automatic FIFO (First-In-First-Out) promotion logic ensuring you hit the top of the list the moment a spot opens.",
    icon: Users,
    color: "indigo"
  },
  {
    title: "Automatic Sync",
    description: "Platform-wide sync for cancellations and no-shows, keeping tour availability accurate and fair for everyone.",
    icon: RefreshCw,
    color: "rose"
  }
]

const faqs = [
  {
    question: "What is the 15-minute cart lock?",
    answer: "For Instant Book tours, we lock your selected seats for 15 minutes. This gives you time to complete your secure payment without losing your spot."
  },
  {
    question: "How do refunds and cancellations work?",
    answer: "We follow a tiered policy: 100% refund for cancellations >48h before start, 50% for 24-48h, and 0% for cancellations within 24 hours."
  },
  {
    question: "What happens if a tour doesn't reach minimum capacity?",
    answer: "If a tour has a minimum traveler requirement and it isn't met 48 hours before the start, the system automatically cancels the occurrence and issues a full refund."
  },
  {
    question: "How does the waitlist promotion work?",
    answer: "If a tour is full, you can join a deterministic waitlist. If a confirmed traveler cancels, the next traveler in line is automatically promoted and notified."
  },
  {
    question: "Can I edit my booking after it's confirmed?",
    answer: "Yes. You can edit your traveler count or switch tour dates through your dashboard. If the new date is full, you'll have the option to join the waitlist."
  },
  {
    question: "How does the QR handshake work?",
    answer: "When you meet your guide, they scan your booking QR code. This marks the tour as 'InProgress', activates insurance, and begins the 48h payout freeze window."
  }
]

export default function HowItWorksPage() {
  return (
    <PageLayout>
      <div className="flex flex-col w-full relative overflow-hidden transition-colors duration-500 bg-bg-light-primary dark:bg-bg-dark-primary">
        
        {/* --- HERO SECTION (Original Content with New Background) --- */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
          <CinematicBackground intensity="high">
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 text-center">
              {/* Pre-header badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-full text-xs sm:text-sm font-bold border border-black/10 dark:border-white/10 text-text-light-primary dark:text-text-dark-primary"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="tracking-widest">YOUR JOURNEY STARTS HERE</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-text-light-primary dark:text-text-dark-primary leading-[0.95] tracking-tight mb-8">
                  How <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                    SafariHub
                  </span> Works.
                </h1>
                <p className="text-lg sm:text-xl text-text-light-secondary dark:text-text-dark-secondary font-medium tracking-wide mb-12 max-w-2xl mx-auto">
                  Explore Lebanon and Turkey through our admin-vetted master templates. 
                  Whether you're discoverying gems or guiding them, SafariHub ensures 100% vetted security and cultural alignment.
                </p>
              </motion.div>


              {/* Scroll indicator */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 8, 0] }}
                transition={{ delay: 1, duration: 2, repeat: Infinity }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
              >
                <ChevronDown className="w-6 h-6 text-gray-400 dark:text-white/20" />
              </motion.div>
            </div>
          </CinematicBackground>
        </section>

        {/* --- FLOW SECTION (Role Switcher) --- */}
        <section className="py-24 relative">
          <div className="container-safe mx-auto">
            <div className="text-center mb-16 px-4">
              <h2 className="text-3xl sm:text-5xl font-black text-text-light-primary dark:text-text-dark-primary mb-6">How It Works.</h2>
              <p className="text-text-light-secondary dark:text-text-dark-secondary max-w-xl mx-auto font-medium">
                Choose your role to see the journey. We've simplified the process so you can focus on the experience.
              </p>
            </div>
            <HowItWorksFlow />
          </div>
        </section>

        {/* --- TRUST & SAFETY SECTION --- */}
        <section className="py-24 px-4 bg-bg-light-secondary/50 dark:bg-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl sm:text-6xl font-black text-text-light-primary dark:text-text-dark-primary mb-8 leading-tight tracking-tight">
                  Your Safety is Our <br />
                  <span className="text-emerald-600 dark:text-emerald-400">Protocol.</span>
                </h2>
                <div className="space-y-8">
                  {safetyFeatures.map((f, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500 ${
                         f.color === 'blue' ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' : 
                         f.color === 'orange' ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' : 
                         f.color === 'emerald' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 
                         'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        <f.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                        <p className="text-gray-500 dark:text-white/40 leading-relaxed font-medium">
                          {f.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Trust Badge Grid */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-white dark:bg-white/5 backdrop-blur-3xl p-8 rounded-[3rem] border dark:border-white/10 shadow-2xl translate-y-8">
                    <Target className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                    <h4 className="font-black text-gray-900 dark:text-white text-lg">99.9% Reliable</h4>
                    <p className="text-gray-500 dark:text-white/40 text-sm mt-2">Uptime on all booking processes.</p>
                  </div>
                  <div className="bg-white dark:bg-white/5 backdrop-blur-3xl p-8 rounded-[3rem] border dark:border-white/10 shadow-2xl">
                    <TrendingUp className="w-12 h-12 text-orange-600 dark:text-orange-400 mb-4" />
                    <h4 className="font-black text-gray-900 dark:text-white text-lg">Impact Score</h4>
                    <p className="text-gray-500 dark:text-white/40 text-sm mt-2">Every review builds the community.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- HALAL-FIRST VALUES --- */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-6xl font-black text-text-light-primary dark:text-text-dark-primary mb-6 tracking-tight">
                Our <span className="text-emerald-600 dark:text-emerald-400">Halal-First</span> Values.
              </h2>
              <p className="text-text-light-secondary dark:text-text-dark-secondary font-medium max-w-xl mx-auto uppercase tracking-widest text-sm">
                Travel without compromising your faith.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {halalValues.map((v, i) => (
                <div key={i} className="bg-bg-light-primary/50 dark:bg-white/5 backdrop-blur-xl border border-border-light-default dark:border-border-dark-default p-10 rounded-[3rem] hover:shadow-2xl transition-all duration-500 group">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500 ${
                    v.color === 'blue' ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' : 
                    v.color === 'emerald' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 
                    'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    <v.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-text-light-primary dark:text-text-dark-primary mb-4">{v.title}</h3>
                  <p className="text-text-light-secondary dark:text-text-dark-secondary leading-relaxed font-medium">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- GUIDE STANDARDS (Manual Verification) --- */}
        <section className="py-24 px-4 bg-bg-light-secondary/50 dark:bg-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-1 gap-4">
                  {guideVerificationSteps.map((s, i) => (
                    <div key={i} className="flex gap-6 items-center bg-bg-light-primary dark:bg-bg-dark-primary/50 p-6 rounded-3xl border border-border-light-default dark:border-white/5 shadow-sm">
                      <div className="text-3xl font-black text-text-light-muted dark:text-text-dark-muted/30">{s.step}</div>
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                        <s.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-text-light-primary dark:text-text-dark-primary">{s.title}</h4>
                        <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl sm:text-6xl font-black text-text-light-primary dark:text-text-dark-primary mb-8 leading-tight tracking-tight">
                  Vetted for your <br />
                  <span className="text-blue-600 dark:text-blue-400">Peace of Mind.</span>
                </h2>
                <p className="text-lg text-text-light-secondary dark:text-text-dark-secondary leading-relaxed font-medium mb-8">
                  We don't just verify identities. Every guide undergoes a manual 1-on-1 audit, and every individual tour is reviewed for quality, safety, and cultural compliance.
                </p>
                <div className="flex items-center gap-4 text-sm font-bold text-text-light-primary dark:text-text-dark-primary">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Only the top 15% of tour templates pass our audit.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PLATFORM ECOSYSTEM SECTION --- */}
        <section className="py-24 px-4 bg-bg-light-secondary/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-black text-text-light-primary dark:text-text-dark-primary mb-6">
                The Multi-Layered <br className="sm:hidden" />
                <span className="text-blue-600 dark:text-blue-400">Platform Ecosystem.</span>
              </h2>
              <p className="text-lg text-text-light-secondary dark:text-text-dark-secondary max-w-2xl mx-auto font-medium">
                Our technical backbone handles the complexity so you can focus on the experience.
                Every interaction is powered by real-time logic and secure protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ecosystemFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-bg-light-primary dark:bg-white/5 rounded-[2.5rem] border border-border-light-default dark:border-white/10 shadow-xl shadow-black/[0.02] hover:shadow-blue-500/10 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary mb-3">{feature.title}</h3>
                  <p className="text-text-light-secondary dark:text-text-dark-secondary leading-relaxed text-sm font-medium">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <HelpCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-5xl font-black text-text-light-primary dark:text-text-dark-primary mb-4">Common Questions.</h2>
              <p className="text-text-light-secondary dark:text-text-dark-secondary font-medium">Everything you need to know about the platform.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-8 bg-bg-light-secondary/50 dark:bg-white/5 rounded-3xl border border-border-light-default dark:border-white/10 group hover:border-blue-500/40 transition-all">
                  <h4 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary mb-2 flex items-center justify-between">
                    {faq.question}
                    <ChevronRight className="w-5 h-5 text-text-light-muted group-hover:text-blue-500 transition-colors" />
                  </h4>
                  <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FINAL CTA (Original Vibrancy) --- */}
        <section className="relative py-32 px-4 overflow-hidden">
          {/* Re-introducing the vibrant background the user missed */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-950" />
          
          {/* Animated Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/20 rounded-full blur-[120px] animate-pulse" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
              Ready to <br />
              <span className="text-amber-400">Discover?</span>
            </h2>
            <p className="text-xl text-white/70 mb-12 max-w-xl mx-auto font-medium">
              Join thousands of travelers and local experts on SafariHub. 
              The most authentic way to explore Lebanon and Turkey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/tours"
                className="group px-12 py-5 bg-white text-blue-600 hover:bg-white/90 transition-all rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-black/20"
              >
                Find a Tour
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/auth/signup"
                className="group px-12 py-5 bg-white/10 backdrop-blur-md text-white border-2 border-white/20 hover:bg-white/20 transition-all rounded-[2rem] font-black text-xl flex items-center justify-center gap-3"
              >
                Become a Guide
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}