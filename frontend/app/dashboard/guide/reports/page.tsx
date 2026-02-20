// ============================================================================
// GUIDE EARNINGS REPORTS
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/reports/page.tsx
// 
// PURPOSE: View detailed earnings reports by month/year
// 
// FEATURES:
// - Monthly earnings breakdown
// - Yearly summaries
// - Compare periods
// - Download reports (CSV/PDF)
// - Tax preparation data
// - Earnings by tour
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Users,
  Star,
  Clock,
  Award,
  Sparkles,
  CreditCard,
  Wallet
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type ReportPeriod = 'monthly' | 'yearly'
type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec'

interface MonthlyEarnings {
  month: Month
  year: number
  tours: number
  bookings: number
  revenue: number
  fees: number
  netEarnings: number
  averageRating: number
  topTour: string
}

interface YearlySummary {
  year: number
  totalTours: number
  totalBookings: number
  totalRevenue: number
  totalFees: number
  totalNetEarnings: number
  averageRating: number
  bestMonth: Month
  bestMonthEarnings: number
}

interface EarningsByTour {
  tourId: string
  tourTitle: string
  bookings: number
  revenue: number
  fees: number
  netEarnings: number
  averageRating: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_MONTHLY_EARNINGS: MonthlyEarnings[] = [
  { month: 'Jan', year: 2026, tours: 12, bookings: 28, revenue: 2450, fees: 367.50, netEarnings: 2082.50, averageRating: 4.8, topTour: 'Ottoman Heritage' },
  { month: 'Feb', year: 2026, tours: 14, bookings: 32, revenue: 2890, fees: 433.50, netEarnings: 2456.50, averageRating: 4.9, topTour: 'Bosphorus Cruise' },
  { month: 'Mar', year: 2026, tours: 18, bookings: 45, revenue: 4120, fees: 618.00, netEarnings: 3502.00, averageRating: 4.9, topTour: 'Cappadocia Balloon' },
  { month: 'Apr', year: 2026, tours: 20, bookings: 52, revenue: 4780, fees: 717.00, netEarnings: 4063.00, averageRating: 5.0, topTour: 'Ottoman Heritage' },
  { month: 'May', year: 2026, tours: 22, bookings: 58, revenue: 5340, fees: 801.00, netEarnings: 4539.00, averageRating: 4.9, topTour: 'Bosphorus Cruise' },
  { month: 'Jun', year: 2026, tours: 25, bookings: 67, revenue: 6230, fees: 934.50, netEarnings: 5295.50, averageRating: 4.8, topTour: 'Cappadocia Balloon' }
]

const MOCK_YEARLY_SUMMARIES: YearlySummary[] = [
  {
    year: 2026,
    totalTours: 111,
    totalBookings: 282,
    totalRevenue: 25810,
    totalFees: 3871.50,
    totalNetEarnings: 21938.50,
    averageRating: 4.9,
    bestMonth: 'Jun',
    bestMonthEarnings: 6230
  },
  {
    year: 2025,
    totalTours: 89,
    totalBookings: 215,
    totalRevenue: 19250,
    totalFees: 2887.50,
    totalNetEarnings: 16362.50,
    averageRating: 4.8,
    bestMonth: 'Aug',
    bestMonthEarnings: 5120
  }
]

const MOCK_EARNINGS_BY_TOUR: EarningsByTour[] = [
  { tourId: '1', tourTitle: 'Ottoman Heritage Tour', bookings: 87, revenue: 7743, fees: 1161.45, netEarnings: 6581.55, averageRating: 4.9 },
  { tourId: '2', tourTitle: 'Bosphorus Sunset Cruise', bookings: 64, revenue: 8256, fees: 1238.40, netEarnings: 7017.60, averageRating: 4.8 },
  { tourId: '3', tourTitle: 'Cappadocia Balloon Ride', bookings: 42, revenue: 8358, fees: 1253.70, netEarnings: 7104.30, averageRating: 5.0 },
  { tourId: '4', tourTitle: 'Beirut Food Walk', bookings: 89, revenue: 4005, fees: 600.75, netEarnings: 3404.25, averageRating: 4.7 }
]

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

type Color = 'blue' | 'emerald' | 'amber' | 'purple'

interface StatCardProps {
  icon: any
  label: string
  value: string | number
  change?: number
  color: Color
}

const StatCard = ({ icon: Icon, label, value, change, color }: StatCardProps) => {
  const colorClasses: Record<Color, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
  }

  return (
    <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`text-xs font-medium ${change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MONTHLY TABLE COMPONENT
// ============================================================================

const MonthlyTable = ({ data }: { data: MonthlyEarnings[] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Month</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Tours</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Bookings</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Revenue</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Fees</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Net</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Rating</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Top Tour</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                {row.month} {row.year}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.tours}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.bookings}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${row.revenue}</td>
              <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">-${row.fees}</td>
              <td className="px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">${row.netEarnings}</td>
              <td className="px-4 py-3 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {row.averageRating}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.topTour}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// YEARLY TABLE COMPONENT
// ============================================================================

const YearlyTable = ({ data }: { data: YearlySummary[] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Year</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Tours</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Bookings</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Revenue</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Fees</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Net</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Rating</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Best Month</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{row.year}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.totalTours}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.totalBookings}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${row.totalRevenue}</td>
              <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">-${row.totalFees}</td>
              <td className="px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">${row.totalNetEarnings}</td>
              <td className="px-4 py-3 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {row.averageRating}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {row.bestMonth} (${row.bestMonthEarnings})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// TOUR BREAKDOWN TABLE
// ============================================================================

const TourBreakdownTable = ({ data }: { data: EarningsByTour[] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Tour</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Bookings</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Revenue</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Fees</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Net</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Rating</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{row.tourTitle}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.bookings}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${row.revenue}</td>
              <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">-${row.fees}</td>
              <td className="px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">${row.netEarnings}</td>
              <td className="px-4 py-3 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {row.averageRating}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('monthly')
  const [selectedYear, setSelectedYear] = useState(2026)

  const totalRevenue = MOCK_MONTHLY_EARNINGS.reduce((sum, m) => sum + m.revenue, 0)
  const totalFees = MOCK_MONTHLY_EARNINGS.reduce((sum, m) => sum + m.fees, 0)
  const totalNet = MOCK_MONTHLY_EARNINGS.reduce((sum, m) => sum + m.netEarnings, 0)

  const handleDownloadCSV = () => {
    const data = period === 'monthly' ? MOCK_MONTHLY_EARNINGS : MOCK_YEARLY_SUMMARIES
    
    const headers = period === 'monthly'
      ? ['Month', 'Year', 'Tours', 'Bookings', 'Revenue', 'Fees', 'Net', 'Rating']
      : ['Year', 'Tours', 'Bookings', 'Revenue', 'Fees', 'Net', 'Rating', 'Best Month']

    const rows = data.map(item => {
      if (period === 'monthly') {
        const m = item as MonthlyEarnings
        return [m.month, m.year, m.tours, m.bookings, m.revenue, m.fees, m.netEarnings, m.averageRating]
      } else {
        const y = item as YearlySummary
        return [y.year, y.totalTours, y.totalBookings, y.totalRevenue, y.totalFees, y.totalNetEarnings, y.averageRating, y.bestMonth]
      }
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `earnings-report-${period}-${selectedYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded')
  }

  const handleDownloadPDF = () => {
    const report = `
SAFARIHUB - EARNINGS REPORT
===========================
Period: ${period === 'monthly' ? 'Monthly' : 'Yearly'}
Year: ${selectedYear}
Generated: ${new Date().toLocaleDateString()}

SUMMARY
-------
Total Revenue: $${totalRevenue}
Total Fees: $${totalFees}
Total Net Earnings: $${totalNet}
Average Monthly: $${(totalNet / MOCK_MONTHLY_EARNINGS.length).toFixed(2)}

MONTHLY BREAKDOWN
-----------------
${MOCK_MONTHLY_EARNINGS.map(m => `${m.month} ${m.year}: ${m.bookings} bookings, $${m.revenue} revenue, $${m.netEarnings} net`).join('\n')}

EARNINGS BY TOUR
----------------
${MOCK_EARNINGS_BY_TOUR.map(t => `${t.tourTitle}: ${t.bookings} bookings, $${t.netEarnings} net`).join('\n')}

Report generated by SafariHub
    `

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `earnings-report-${period}-${selectedYear}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded (PDF coming in Phase 2)')
  }

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/dashboard/guide/wallet"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  ← Back to Wallet
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Earnings Reports
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and download detailed earnings reports
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${totalRevenue}`}
              change={12}
              color="blue"
            />
            <StatCard
              icon={TrendingDown}
              label="Platform Fees"
              value={`$${totalFees}`}
              color="amber"
            />
            <StatCard
              icon={Wallet}
              label="Net Earnings"
              value={`$${totalNet}`}
              change={8}
              color="emerald"
            />
            <StatCard
              icon={Calendar}
              label="Total Bookings"
              value={MOCK_MONTHLY_EARNINGS.reduce((sum, m) => sum + m.bookings, 0)}
              color="purple"
            />
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  period === 'monthly'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriod('yearly')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  period === 'yearly'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Yearly
              </button>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          {/* Main Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden mb-8">
            {period === 'monthly' ? (
              <MonthlyTable data={MOCK_MONTHLY_EARNINGS} />
            ) : (
              <YearlyTable data={MOCK_YEARLY_SUMMARIES} />
            )}
          </div>

          {/* Earnings by Tour */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Earnings by Tour
          </h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <TourBreakdownTable data={MOCK_EARNINGS_BY_TOUR} />
          </div>

          {/* Tax Info */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Tax Preparation
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  These reports include all earnings and fees for the selected period. 
                  Use them for your tax filings and financial planning.
                </p>
                <Link
                  href="/faq/taxes"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Learn more about taxes for guides
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}