// ============================================================================
// ABOUT PAGE - COMPANY STORY AND MISSION
// ============================================================================
// LOCATION: /frontend/src/app/about/page.tsx
// 
// PURPOSE: Tell the SafariHub story, mission, and team
// 
// FEATURES:
// - Company story and founding narrative
// - Mission and values
// - Team members
// - Stats and achievements
// - Timeline of milestones
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
 Heart,
 Shield,
 Users,
 Globe,
 Star,
 Award,
 Compass,
 MapPin,
 Calendar,
 TrendingUp,
 CheckCircle,
 ArrowRight,
 Sparkles
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

export const metadata: Metadata = {
 title: 'About Us | SafariHub',
 description: 'Learn about SafariHub\'s mission to connect travelers with verified local guides for authentic halal-friendly experiences.',
 openGraph: {
 title: 'About SafariHub',
 description: 'Our story, mission, and team',
 images: ['/images/og/about.jpg'],
 }
}

// ============================================================================
// STATISTICS
// ============================================================================

const STATISTICS = [
 { value: '15K+', label: 'Happy Travelers', icon: Users },
 { value: '1,200+', label: 'Verified Guides', icon: Award },
 { value: '4.8/5', label: 'Average Rating', icon: Star },
 { value: '2', label: 'Countries', icon: Globe },
 { value: '24', label: 'Cities', icon: MapPin },
 { value: '48h', label: 'Payout Protection', icon: Shield }
]

// ============================================================================
// VALUES
// ============================================================================

const VALUES = [
 {
 icon: Shield,
 title: 'Trust & Safety',
 description: 'Every guide is manually ID-verified. Your safety is our top priority.',
 color: 'blue'
 },
 {
 icon: Heart,
 title: 'Halal-Friendly',
 description: 'We respect Islamic values with prayer spaces and halal options.',
 color: 'emerald'
 },
 {
 icon: Users,
 title: 'Community First',
 description: 'We build connections between travelers and local guides.',
 color: 'amber'
 },
 {
 icon: Globe,
 title: 'Authentic Experiences',
 description: 'Go beyond tourism. Experience real local culture.',
 color: 'purple'
 }
]

// ============================================================================
// TIMELINE
// ============================================================================

const TIMELINE = [
 {
 year: '2023',
 title: 'The Idea',
 description: 'Founded in Beirut with a mission to connect travelers with authentic local experiences.'
 },
 {
 year: '2024',
 title: 'First Guides',
 description: 'Onboarded first 100 guides in Lebanon. Launched halal-friendly certification.'
 },
 {
 year: '2025',
 title: 'Expansion',
 description: 'Expanded to Turkey. Reached 500+ guides and 5,000+ happy travelers.'
 },
 {
 year: '2026',
 title: 'Today',
 description: '1,200+ guides, 15,000+ travelers, and growing across Lebanon and Turkey.'
 }
]

// ============================================================================
// TEAM MEMBERS
// ============================================================================

const TEAM = [
 {
 name: 'Ahmed Khalil',
 role: 'Founder & CEO',
 bio: 'Former tour guide with 10+ years experience. Passionate about halal tourism.',
 avatar: '/images/team/ahmed.jpg',
 social: {
 linkedin: 'https://linkedin.com/in/ahmedkhalil',
 twitter: 'https://twitter.com/ahmedkhalil'
 }
 },
 {
 name: 'Layla Hassan',
 role: 'Head of Operations',
 bio: 'Ex-hospitality manager. Ensures every tour meets our quality standards.',
 avatar: '/images/team/layla.jpg',
 social: {
 linkedin: 'https://linkedin.com/in/laylahassan'
 }
 },
 {
 name: 'Mehmet Yilmaz',
 role: 'Head of Guide Relations',
 bio: 'Istanbul native with 15 years guiding experience. Leads guide verification.',
 avatar: '/images/team/mehmet.jpg',
 social: {
 linkedin: 'https://linkedin.com/in/mehmetyilmaz'
 }
 },
 {
 name: 'Fatima Zahra',
 role: 'Community Manager',
 bio: 'Connects travelers with guides. Ensures everyone has the best experience.',
 avatar: '/images/team/fatima.jpg',
 social: {
 linkedin: 'https://linkedin.com/in/fatimazahra'
 }
 }
]

// ============================================================================
// STAT CARD
// ============================================================================

const StatCard = ({ stat }: { stat: typeof STATISTICS[0] }) => {
 const Icon = stat.icon
 return (
 <div className="p-6 surface-card border border-theme rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
 <div className="inline-flex p-3 rounded-xl bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark mb-4">
 <Icon className="w-6 h-6" />
 </div>
 <div className="text-3xl font-bold text-theme-primary mb-1">
 {stat.value}
 </div>
 <div className="text-sm text-theme-muted ">
 {stat.label}
 </div>
 </div>
 )
}

// ============================================================================
// VALUE CARD
// ============================================================================

const ValueCard = ({ value }: { value: typeof VALUES[0] }) => {
 const Icon = value.icon
 
 const colorClasses = {
 blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark border-blue-200 dark:border-blue-800',
 emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
 amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
 purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
 }

 return (
 <div className={`p-6 rounded-xl border-2 ${colorClasses[value.color as keyof typeof colorClasses]} hover:shadow-lg transition-all hover:-translate-y-1`}>
 <div className="inline-flex p-3 rounded-lg surface-card mb-4">
 <Icon className="w-6 h-6" />
 </div>
 <h3 className="text-xl font-bold text-theme-primary mb-2">
 {value.title}
 </h3>
 <p className="text-theme-secondary ">
 {value.description}
 </p>
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AboutPage() {
 return (
 <PageLayout>
 <div className="pt-14 sm:pt-16 surface-card">
 
 {/* Hero Section */}
 <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 text-white overflow-hidden">
 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
 
 <div className="container-safe mx-auto max-w-7xl py-20 sm:py-28 md:py-32 relative z-10">
 <div className="max-w-3xl mx-auto text-center">
 <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 surface-card  rounded-full">
 <Sparkles className="w-4 h-4" />
 <span className="text-sm font-medium">OUR STORY</span>
 </div>
 
 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
 Connecting Travelers with{' '}
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">
 Authentic Experiences
 </span>
 </h1>
 
 <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
 SafariHub was born from a simple idea: travel should be authentic, safe, and respectful of your values.
 </p>
 </div>
 </div>
 </section>

 {/* Story Section */}
 <section className="py-20 sm:py-24 surface-card">
 <div className="container-safe mx-auto max-w-4xl">
 <div className="prose prose-lg dark:prose-invert max-w-none text-center">
 <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-6">
 Our Story
 </h2>
 <p className="text-theme-secondary mb-4 leading-relaxed">
 SafariHub started in 2023 when our founder Ahmed, a former tour guide, realized that Muslim travelers 
 were struggling to find authentic experiences that respected their values. Tours either lacked prayer 
 spaces, had no halal food options, or simply didn't understand the needs of Muslim travelers.
 </p>
 <p className="text-theme-secondary mb-4 leading-relaxed">
 He gathered a team of passionate travelers and guides from Lebanon and Turkey, and together they built 
 a platform that would change how Muslims explore the world. Today, SafariHub connects thousands of 
 travelers with verified local guides who understand and respect Islamic values.
 </p>
 <p className="text-theme-secondary leading-relaxed">
 Every guide is manually ID-verified. Every tour can include prayer spaces and halal options. Every 
 booking is protected by our 48-hour safety freeze. Because your journey should be memorable for the 
 right reasons.
 </p>
 </div>
 </div>
 </section>

 {/* Statistics Grid */}
 <section className="py-20 sm:py-24 surface-section">
 <div className="container-safe mx-auto max-w-7xl">
 <div className="text-center max-w-2xl mx-auto mb-12">
 <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-4">
 SafariHub by the Numbers
 </h2>
 <p className="text-theme-secondary ">
 Our community is growing every day.
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
 {STATISTICS.map((stat, index) => (
 <StatCard key={index} stat={stat} />
 ))}
 </div>
 </div>
 </section>

 {/* Values Section */}
 <section className="py-20 sm:py-24 surface-card">
 <div className="container-safe mx-auto max-w-7xl">
 <div className="text-center max-w-2xl mx-auto mb-12">
 <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-4">
 Our Values
 </h2>
 <p className="text-theme-secondary ">
 What drives us every day.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {VALUES.map((value, index) => (
 <ValueCard key={index} value={value} />
 ))}
 </div>
 </div>
 </section>

 {/* Timeline Section */}
 <section className="py-20 sm:py-24 surface-section">
 <div className="container-safe mx-auto max-w-4xl">
 <div className="text-center max-w-2xl mx-auto mb-12">
 <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-4">
 Our Journey
 </h2>
 <p className="text-theme-secondary ">
 From idea to reality.
 </p>
 </div>

 <div className="space-y-8">
 {TIMELINE.map((item, index) => (
 <div key={index} className="relative flex gap-6">
 {index < TIMELINE.length - 1 && (
 <div className="absolute left-5 top-12 bottom-0 w-0.5 surface-section" />
 )}
 
 <div className="relative z-10">
 <div className="w-10 h-10 rounded-full bg-primary-light dark:bg-primary-light text-white font-bold flex items-center justify-center">
 {index + 1}
 </div>
 </div>

 <div className="flex-1 pb-8">
 <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full mb-2">
 {item.year}
 </div>
 <h3 className="text-xl font-bold text-theme-primary mb-2">
 {item.title}
 </h3>
 <p className="text-theme-secondary ">
 {item.description}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Team Section */}
 <section className="py-20 sm:py-24 surface-card">
 <div className="container-safe mx-auto max-w-7xl">
 <div className="text-center max-w-2xl mx-auto mb-12">
 <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-4">
 Meet the Team
 </h2>
 <p className="text-theme-secondary ">
 The people behind SafariHub.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {TEAM.map((member, index) => (
 <div key={index} className="group text-center">
 <div className="relative w-32 h-32 mx-auto mb-4">
 <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 p-1">
 <div className="w-full h-full rounded-full surface-card overflow-hidden">
 <Image src={member.avatar} alt={member.name} width={128} height={128} className="object-cover" />
 </div>
 </div>
 </div>
 <h3 className="font-bold text-theme-primary mb-1">
 {member.name}
 </h3>
 <p className="text-sm text-primary-light dark:text-primary-dark dark:text-primary-dark mb-2">
 {member.role}
 </p>
 <p className="text-xs text-theme-muted max-w-xs mx-auto">
 {member.bio}
 </p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* CTA Section */}
 <section className="py-20 sm:py-24 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
 <div className="container-safe mx-auto max-w-4xl text-center">
 <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
 Join Our Community
 </h2>
 <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
 Whether you're a traveler seeking authentic experiences or a guide ready to share your expertise, we'd love to have you.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link
 href="/tours"
 className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all"
 >
 Find a Tour
 <ArrowRight className="w-5 h-5" />
 </Link>
 <Link
 href="/guide/onboarding"
 className="inline-flex items-center gap-2 px-8 py-4 surface-card hover:surface-card  text-white font-semibold rounded-xl transition-all"
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
