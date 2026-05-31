// ============================================================================
// TOUR ANALYTICS - PERFORMANCE METRICS FOR A TOUR
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/tours/[id]/analytics/page.tsx
// 
// PURPOSE: Display detailed analytics for a specific tour
// 
// FEATURES:
// - Key metrics (bookings, revenue, rating, conversion)
// - Booking trends over time (chart)
// - Revenue breakdown
// - Customer demographics
// - Performance by date/time
// - Review sentiment analysis
// - Export reports
// ============================================================================

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
 TrendingUp,
 TrendingDown,
 Users,
 DollarSign,
 Star,
 Calendar,
 Clock,
 MapPin,
 Download,
 ChevronLeft,
 ChevronRight,
 Eye,
 MessageSquare,
 ThumbsUp,
 ThumbsDown,
 BarChart3,
 PieChart,
 LineChart,
 Download as ExportIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

interface AnalyticsSummary {
 totalBookings: number
 totalRevenue: number
 averageRating: number
 totalReviews: number
 conversionRate: number
 averageGroupSize: number
 cancellationRate: number
 noShowRate: number
 repeatCustomers: number
 waitlistConversions: number
}

interface MonthlyPerformance {
 month: string
 bookings: number
 revenue: number
 rating: number
}

interface BookingTrend {
 date: string
 bookings: number
 revenue: number
}

interface RatingDistribution {
 stars: number
 count: number
 percentage: number
}

interface CustomerDemographic {
 country: string
 flag: string
 count: number
 percentage: number
}

interface TimeSlotPerformance {
 time: string
 bookings: number
 revenue: number
 fillRate: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TOUR = {
 id: '1',
 title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
 location: 'Istanbul, Turkey',
 price: 89,
 currency: 'USD',
 duration: '4 hours'
}

const MOCK_SUMMARY: AnalyticsSummary = {
 totalBookings: 87,
 totalRevenue: 7890,
 averageRating: 4.8,
 totalReviews: 64,
 conversionRate: 68,
 averageGroupSize: 2.4,
 cancellationRate: 3.5,
 noShowRate: 1.2,
 repeatCustomers: 23,
 waitlistConversions: 12
}

const MOCK_MONTHLY_PERFORMANCE: MonthlyPerformance[] = [
 { month: 'Jan', bookings: 8, revenue: 712, rating: 4.7 },
 { month: 'Feb', bookings: 10, revenue: 890, rating: 4.8 },
 { month: 'Mar', bookings: 12, revenue: 1068, rating: 4.9 },
 { month: 'Apr', bookings: 15, revenue: 1335, rating: 4.9 },
 { month: 'May', bookings: 18, revenue: 1602, rating: 5.0 },
 { month: 'Jun', bookings: 24, revenue: 2136, rating: 4.8 }
]

const MOCK_RATING_DISTRIBUTION: RatingDistribution[] = [
 { stars: 5, count: 42, percentage: 66 },
 { stars: 4, count: 15, percentage: 23 },
 { stars: 3, count: 5, percentage: 8 },
 { stars: 2, count: 1, percentage: 2 },
 { stars: 1, count: 1, percentage: 1 }
]

const MOCK_CUSTOMER_DEMOGRAPHICS: CustomerDemographic[] = [
 { country: 'United States', flag: '🇺🇸', count: 24, percentage: 28 },
 { country: 'United Kingdom', flag: '🇬🇧', count: 18, percentage: 21 },
 { country: 'Germany', flag: '🇩🇪', count: 12, percentage: 14 },
 { country: 'France', flag: '🇫🇷', count: 10, percentage: 11 },
 { country: 'Canada', flag: '🇨🇦', count: 8, percentage: 9 },
 { country: 'Australia', flag: '🇦🇺', count: 6, percentage: 7 },
 { country: 'Other', flag: '🌍', count: 9, percentage: 10 }
]

const MOCK_TIME_SLOTS: TimeSlotPerformance[] = [
 { time: '09:00', bookings: 42, revenue: 3738, fillRate: 85 },
 { time: '14:00', bookings: 28, revenue: 2492, fillRate: 70 },
 { time: '18:00', bookings: 17, revenue: 1513, fillRate: 55 }
]

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
 icon: React.ElementType
 label: string
 value: string | number
 change?: number
 subtext?: string
 color: 'blue' | 'emerald' | 'amber' | 'purple' | 'red'
 trend?: 'up' | 'down'
}

const StatCard = ({ icon: Icon, label, value, change, subtext, color, trend }: StatCardProps) => {
 const colorClasses = {
 blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark ',
 emerald: 'bg-success-green/10 dark:bg-emerald-950/30 text-success-green dark:text-emerald-400',
 amber: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/30 text-accent-light dark:text-accent-dark dark:text-amber-400',
 purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
 red: 'bg-danger-red/10 dark:bg-red-950/30 text-danger-red dark:text-red-400'
 }

 return (
 <div className="p-5 surface-card border border-theme rounded-xl hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-3">
 <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
 <Icon className="w-5 h-5" />
 </div>
 {change !== undefined && (
 <div className={`flex items-center gap-1 text-xs font-medium ${
 trend === 'up' ? 'text-success-green' : 'text-danger-red'
 }`}>
 {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
 <span>{Math.abs(change)}%</span>
 </div>
 )}
 </div>
 <div className="space-y-1">
 <div className="text-2xl font-bold text-theme-primary">
 {value}
 </div>
 <div className="text-xs text-theme-muted ">
 {label}
 </div>
 {subtext && (
 <div className="text-xs text-theme-muted ">
 {subtext}
 </div>
 )}
 </div>
 </div>
 )
}

// ============================================================================
// SIMPLE CHART COMPONENT (Bar)
// ============================================================================

const BarChart = ({ data, type }: { data: MonthlyPerformance[]; type: 'bookings' | 'revenue' | 'rating' }) => {
 const maxValue = Math.max(...data.map(d => type === 'bookings' ? d.bookings : type === 'revenue' ? d.revenue : d.rating))
 
 return (
 <div className="flex items-end justify-between gap-2 h-40 mt-4">
 {data.map((item, index) => {
 const value = type === 'bookings' ? item.bookings : type === 'revenue' ? item.revenue / 100 : item.rating
 const height = (value / maxValue) * 100
 return (
 <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
 <div className="relative w-full">
 <div
 className={`w-full rounded-t-lg transition-all ${
 type === 'bookings' ? 'bg-primary-light' : type === 'revenue' ? 'bg-emerald-600' : 'bg-accent-light/10 dark:bg-accent-dark'
 }`}
 style={{ height: `${height}%` }}
 />
 <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 surface-base text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
 {type === 'bookings' && `${item.bookings} bookings`}
 {type === 'revenue' && `$${item.revenue}`}
 {type === 'rating' && `${item.rating}★`}
 </div>
 </div>
 <span className="text-xs text-theme-muted ">
 {item.month}
 </span>
 </div>
 )
 })}
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TourAnalyticsPage() {
 const params = useParams()
 const router = useRouter()
 const tourId = params.id as string
 const [timeRange, setTimeRange] = useState<TimeRange>('month')

 const handleExport = () => {
 toast.success('Analytics report downloaded')
 }
 const handleExportCSV = () => {
 // Create CSV content
 const headers = ['Month', 'Bookings', 'Revenue', 'Rating']
 const rows = MOCK_MONTHLY_PERFORMANCE.map(m => [m.month, m.bookings, m.revenue, m.rating])
 
 const csvContent = [
 headers.join(','),
 ...rows.map(row => row.join(','))
 ].join('\n')
 
 const blob = new Blob([csvContent], { type: 'text/csv' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `tour-analytics-${tourId}-${new Date().toISOString().split('T')[0]}.csv`
 a.click()
 URL.revokeObjectURL(url)
 
 toast.success('CSV report downloaded')
}

const handleExportPDF = () => {
 // For Phase 1: Create a simple text report
 // Phase 2: Replace with actual PDF generation
 
 const report = `
TOUR ANALYTICS REPORT
=====================
Tour: ${MOCK_TOUR.title}
Date: ${new Date().toLocaleDateString()}

KEY METRICS
-----------
Total Bookings: ${MOCK_SUMMARY.totalBookings}
Total Revenue: $${MOCK_SUMMARY.totalRevenue}
Average Rating: ${MOCK_SUMMARY.averageRating} (${MOCK_SUMMARY.totalReviews} reviews)
Conversion Rate: ${MOCK_SUMMARY.conversionRate}%
Avg. Group Size: ${MOCK_SUMMARY.averageGroupSize}
Cancellation Rate: ${MOCK_SUMMARY.cancellationRate}%
Repeat Customers: ${MOCK_SUMMARY.repeatCustomers}
Waitlist Conversions: ${MOCK_SUMMARY.waitlistConversions}

MONTHLY PERFORMANCE
-------------------
${MOCK_MONTHLY_PERFORMANCE.map(m => `${m.month}: ${m.bookings} bookings, $${m.revenue}, ${m.rating}★`).join('\n')}

RATING DISTRIBUTION
-------------------
${MOCK_RATING_DISTRIBUTION.map(r => `${r.stars}★: ${r.count} reviews (${r.percentage}%)`).join('\n')}

TOP NATIONALITIES
-----------------
${MOCK_CUSTOMER_DEMOGRAPHICS.map(d => `${d.country}: ${d.count} travelers (${d.percentage}%)`).join('\n')}

TIME SLOT PERFORMANCE
---------------------
${MOCK_TIME_SLOTS.map(s => `${s.time}: ${s.bookings} bookings, $${s.revenue}, ${s.fillRate}% fill rate`).join('\n')}

Report generated by SafariHub
 `
 
 const blob = new Blob([report], { type: 'text/plain' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `tour-analytics-${tourId}-${new Date().toISOString().split('T')[0]}.txt`
 a.click()
 URL.revokeObjectURL(url)
 
 toast.success('Report downloaded (PDF coming in Phase 2)')
}

 return (
 <>
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">
 <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <Link
 href={`/dashboard/guide/tours/${tourId}`}
 className="text-sm text-theme-muted hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors"
 >
 ← Back to Tour
 </Link>
 </div>
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1">
 Tour Analytics
 </h1>
 <p className="text-sm text-theme-secondary ">
 {MOCK_TOUR.title} • {MOCK_TOUR.location}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <select
 value={timeRange}
 onChange={(e) => setTimeRange(e.target.value as TimeRange)}
 className="px-3 py-2 surface-card border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 >
 <option value="week">Last 7 Days</option>
 <option value="month">This Month</option>
 <option value="quarter">This Quarter</option>
 <option value="year">This Year</option>
 <option value="all">All Time</option>
 </select>
 <button
 onClick={handleExport}
 className="p-2 surface-card border border-theme rounded-lg text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 hover:surface-section dark:hover:surface-card"
 >
 <ExportIcon className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Key Metrics Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
 <StatCard
 icon={Users}
 label="Total Bookings"
 value={MOCK_SUMMARY.totalBookings}
 change={12}
 trend="up"
 color="blue"
 />
 <StatCard
 icon={DollarSign}
 label="Total Revenue"
 value={`$${MOCK_SUMMARY.totalRevenue}`}
 change={8}
 trend="up"
 color="emerald"
 />
 <StatCard
 icon={Star}
 label="Average Rating"
 value={MOCK_SUMMARY.averageRating}
 subtext={`${MOCK_SUMMARY.totalReviews} reviews`}
 color="amber"
 />
 <StatCard
 icon={TrendingUp}
 label="Conversion Rate"
 value={`${MOCK_SUMMARY.conversionRate}%`}
 change={5}
 trend="up"
 color="purple"
 />
 </div>

 {/* Second Row Metrics */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
 <StatCard
 icon={Users}
 label="Avg. Group Size"
 value={MOCK_SUMMARY.averageGroupSize}
 color="blue"
 />
 <StatCard
 icon={TrendingDown}
 label="Cancellation Rate"
 value={`${MOCK_SUMMARY.cancellationRate}%`}
 trend="down"
 color="red"
 />
 <StatCard
 icon={ThumbsUp}
 label="Repeat Customers"
 value={MOCK_SUMMARY.repeatCustomers}
 subtext={`${Math.round(MOCK_SUMMARY.repeatCustomers / MOCK_SUMMARY.totalBookings * 100)}% of total`}
 color="emerald"
 />
 <StatCard
 icon={Clock}
 label="Waitlist Conv."
 value={MOCK_SUMMARY.waitlistConversions}
 color="amber"
 />
 </div>

 {/* Charts Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
 
 {/* Bookings Trend */}
 <div className="surface-card border border-theme rounded-xl p-6">
 <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
 <LineChart className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 Bookings Trend
 </h3>
 <BarChart data={MOCK_MONTHLY_PERFORMANCE} type="bookings" />
 <div className="mt-4 pt-4 border-t border-[#c8d8f8] dark:border-[#1a3566]">
 <div className="flex items-center justify-between text-sm">
 <span className="text-theme-muted ">Total bookings</span>
 <span className="font-semibold text-theme-primary">
 {MOCK_MONTHLY_PERFORMANCE.reduce((sum, m) => sum + m.bookings, 0)}
 </span>
 </div>
 </div>
 </div>

 {/* Revenue Trend */}
 <div className="surface-card border border-theme rounded-xl p-6">
 <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
 <BarChart3 className="w-4 h-4 text-success-green dark:text-emerald-400" />
 Revenue Trend
 </h3>
 <BarChart data={MOCK_MONTHLY_PERFORMANCE} type="revenue" />
 <div className="mt-4 pt-4 border-t border-[#c8d8f8] dark:border-[#1a3566]">
 <div className="flex items-center justify-between text-sm">
 <span className="text-theme-muted ">Total revenue</span>
 <span className="font-semibold text-success-green dark:text-emerald-400">
 ${MOCK_MONTHLY_PERFORMANCE.reduce((sum, m) => sum + m.revenue, 0)}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Bottom Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Rating Distribution */}
 <div className="surface-card border border-theme rounded-xl p-6">
 <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
 <Star className="w-4 h-4 text-accent-light dark:text-accent-dark dark:text-amber-400" />
 Rating Distribution
 </h3>
 <div className="space-y-3">
 {MOCK_RATING_DISTRIBUTION.map((rating) => (
 <div key={rating.stars} className="space-y-1">
 <div className="flex items-center justify-between text-sm">
 <span className="flex items-center gap-1">
 {rating.stars}★
 </span>
 <span className="text-theme-secondary ">
 {rating.count} ({rating.percentage}%)
 </span>
 </div>
 <div className="w-full h-2 surface-section rounded-full overflow-hidden">
 <div
 className="h-full bg-accent-light/10 dark:bg-accent-dark rounded-full"
 style={{ width: `${rating.percentage}%` }}
 />
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Customer Demographics */}
 <div className="surface-card border border-theme rounded-xl p-6">
 <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
 <PieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
 Top Nationalities
 </h3>
 <div className="space-y-3">
 {MOCK_CUSTOMER_DEMOGRAPHICS.map((demo, index) => (
 <div key={index} className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-base">{demo.flag}</span>
 <span className="text-sm text-theme-secondary">
 {demo.country}
 </span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-theme-primary">
 {demo.count}
 </span>
 <span className="text-xs text-theme-muted ">
 ({demo.percentage}%)
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Time Slot Performance */}
 <div className="surface-card border border-theme rounded-xl p-6">
 <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
 <Clock className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 Time Slot Performance
 </h3>
 <div className="space-y-4">
 {MOCK_TIME_SLOTS.map((slot, index) => (
 <div key={index}>
 <div className="flex items-center justify-between mb-1">
 <span className="text-sm font-medium text-theme-primary">
 {slot.time}
 </span>
 <span className="text-sm text-theme-secondary ">
 {slot.bookings} bookings · ${slot.revenue}
 </span>
 </div>
 <div className="w-full h-2 surface-section rounded-full overflow-hidden">
 <div
 className="h-full bg-primary-light rounded-full"
 style={{ width: `${slot.fillRate}%` }}
 />
 </div>
 <div className="flex justify-end mt-1">
 <span className="text-xs text-theme-muted ">
 {slot.fillRate}% fill rate
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Export Options */}
 <div className="mt-8 flex justify-end gap-2">
 <button onClick={handleExportCSV} className="px-4 py-2 surface-card border border-theme rounded-lg text-sm text-theme-secondary hover:surface-section dark:hover:surface-card transition-colors flex items-center gap-2">
 <Download className="w-4 h-4" />
 Export as CSV
 </button>
 <button onClick={handleExportPDF} className="px-4 py-2 surface-card border border-theme rounded-lg text-sm text-theme-secondary hover:surface-section dark:hover:surface-card transition-colors flex items-center gap-2">
 <Download className="w-4 h-4" />
 Export as PDF
 </button>
 </div>
 </div>
 </div>
 </>
 )
}
