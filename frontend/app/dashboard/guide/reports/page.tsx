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
 blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark ',
 emerald: 'bg-success-green/10 dark:bg-emerald-950/30 text-success-green dark:text-emerald-400',
 amber: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/30 text-accent-light dark:text-accent-dark dark:text-amber-400',
 purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
 }

 return (
 <div className="p-5 surface-card border border-theme rounded-xl hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-3">
 <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
 <Icon className="w-5 h-5" />
 </div>
 {change && (
 <span className={`text-xs font-medium ${change > 0 ? 'text-success-green' : 'text-danger-red'}`}>
 {change > 0 ? '+' : ''}{change}%
 </span>
 )}
 </div>
 <div className="space-y-1">
 <div className="text-2xl font-bold text-theme-primary">
 {value}
 </div>
 <div className="text-xs text-theme-muted ">
 {label}
 </div>
 </div>
 </div>
 )
}

// ============================================================================
// MONTHLY TABLE COMPONENT
// ============================================================================


const MonthlyCard = ({ row }: { row: MonthlyEarnings }) => (
  <div className="p-4 surface-card border border-theme rounded-xl space-y-3 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Period</div>
        <div className="text-sm font-bold text-theme-primary">{row.month} {row.year}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Net Earnings</div>
        <div className="text-sm font-bold text-success-green dark:text-emerald-400">${row.netEarnings}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-theme">
      <div>
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Tours/Bookings</div>
        <div className="text-xs font-bold text-theme-secondary">{row.tours} tours / {row.bookings} bookings</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Revenue/Fees</div>
        <div className="text-xs font-bold text-theme-secondary">${row.revenue} / <span className="text-danger-red">-{row.fees}</span></div>
      </div>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span className="text-xs font-bold text-theme-primary">{row.averageRating}</span>
      </div>
      <div className="text-xs font-medium text-theme-muted">Top: {row.topTour}</div>
    </div>
  </div>
);

const MonthlyTable = ({ data }: { data: MonthlyEarnings[] }) => {
  return (
    <div className="w-full">
      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 p-4">
        {data.map((row, index) => (
          <MonthlyCard key={index} row={row} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="surface-section border-b border-theme">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Month</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Tours</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Bookings</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Fees</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Net</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Top Tour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((row, index) => (
              <tr key={index} className="hover:surface-section dark:hover:surface-card transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-theme-primary">
                  {row.month} {row.year}
                </td>
                <td className="px-4 py-3 text-sm text-theme-secondary ">{row.tours}</td>
                <td className="px-4 py-3 text-sm text-theme-secondary ">{row.bookings}</td>
                <td className="px-4 py-3 text-sm font-medium text-theme-primary">${row.revenue}</td>
                <td className="px-4 py-3 text-sm text-danger-red dark:text-red-400">-${row.fees}</td>
                <td className="px-4 py-3 text-sm font-bold text-success-green dark:text-emerald-400">${row.netEarnings}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {row.averageRating}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-theme-secondary ">{row.topTour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// YEARLY TABLE COMPONENT
// ============================================================================


const YearlyCard = ({ row }: { row: YearlySummary }) => (
  <div className="p-4 surface-card border border-theme rounded-xl space-y-3 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Year</div>
        <div className="text-sm font-bold text-theme-primary">{row.year}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Net Earnings</div>
        <div className="text-sm font-bold text-success-green dark:text-emerald-400">${row.totalNetEarnings}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-theme">
      <div>
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Tours/Bookings</div>
        <div className="text-xs font-bold text-theme-secondary">{row.totalTours} tours / {row.totalBookings} bookings</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Revenue/Fees</div>
        <div className="text-xs font-bold text-theme-secondary">${row.totalRevenue} / <span className="text-danger-red">-{row.totalFees}</span></div>
      </div>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span className="text-xs font-bold text-theme-primary">{row.averageRating}</span>
      </div>
      <div className="text-xs font-medium text-theme-muted">Best: {row.bestMonth} (${row.bestMonthEarnings})</div>
    </div>
  </div>
);

const YearlyTable = ({ data }: { data: YearlySummary[] }) => {
  return (
    <div className="w-full">
      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 p-4">
        {data.map((row, index) => (
          <YearlyCard key={index} row={row} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="surface-section border-b border-theme">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Year</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Tours</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Bookings</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Fees</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Net</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Best Month</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((row, index) => (
              <tr key={index} className="hover:surface-section dark:hover:surface-card transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-theme-primary">{row.year}</td>
                <td className="px-4 py-3 text-sm text-theme-secondary ">{row.totalTours}</td>
                <td className="px-4 py-3 text-sm text-theme-secondary ">{row.totalBookings}</td>
                <td className="px-4 py-3 text-sm font-medium text-theme-primary">${row.totalRevenue}</td>
                <td className="px-4 py-3 text-sm text-danger-red dark:text-red-400">-${row.totalFees}</td>
                <td className="px-4 py-3 text-sm font-bold text-success-green dark:text-emerald-400">${row.totalNetEarnings}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {row.averageRating}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-theme-secondary ">
                  {row.bestMonth} (${row.bestMonthEarnings})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// TOUR BREAKDOWN TABLE
// ============================================================================


const TourCard = ({ row }: { row: EarningsByTour }) => (
  <div className="p-4 surface-card border border-theme rounded-xl space-y-3 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Tour Title</div>
        <div className="text-sm font-bold text-theme-primary truncate">{row.tourTitle}</div>
      </div>
      <div className="text-right ml-4">
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Net</div>
        <div className="text-sm font-bold text-success-green dark:text-emerald-400">${row.netEarnings}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-theme/50">
      <div>
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Bookings</div>
        <div className="text-xs font-bold text-theme-secondary">{row.bookings} bookings</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-0.5">Revenue/Fees</div>
        <div className="text-xs font-bold text-theme-secondary">${row.revenue} / <span className="text-danger-red">-{row.fees}</span></div>
      </div>
    </div>
    <div className="flex items-center gap-1.5">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs font-bold text-theme-primary">{row.averageRating}</span>
    </div>
  </div>
);

const TourBreakdownTable = ({ data }: { data: EarningsByTour[] }) => {
  return (
    <div className="w-full">
      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 p-4">
        {data.map((row, index) => (
          <TourCard key={index} row={row} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="surface-section border-b border-theme">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Tour</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Bookings</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Fees</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Net</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-theme-muted ">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((row, index) => (
              <tr key={index} className="hover:surface-section dark:hover:surface-card transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-theme-primary">{row.tourTitle}</td>
                <td className="px-4 py-3 text-sm text-theme-secondary ">{row.bookings}</td>
                <td className="px-4 py-3 text-sm font-medium text-theme-primary">${row.revenue}</td>
                <td className="px-4 py-3 text-sm text-danger-red dark:text-red-400">-${row.fees}</td>
                <td className="px-4 py-3 text-sm font-bold text-success-green dark:text-emerald-400">${row.netEarnings}</td>
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
 <>
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">
 <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <Link
 href="/dashboard/guide/wallet"
 className="text-sm text-theme-muted hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors"
 >
 ← Back to Wallet
 </Link>
 </div>
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1">
 Earnings Reports
 </h1>
 <p className="text-sm text-theme-secondary ">
 View and download detailed earnings reports
 </p>
 </div>

 <div className="flex gap-2">
 <button
 onClick={handleDownloadCSV}
 className="px-4 py-2 surface-card border border-theme text-theme-secondary rounded-lg hover:surface-section dark:hover:surface-card transition-colors flex items-center gap-2"
 >
 <Download className="w-4 h-4" />
 CSV
 </button>
 <button
 onClick={handleDownloadPDF}
 className="px-4 py-2 surface-card border border-theme text-theme-secondary rounded-lg hover:surface-section dark:hover:surface-card transition-colors flex items-center gap-2"
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
 <div className="flex surface-section rounded-lg p-1">
 <button
 onClick={() => setPeriod('monthly')}
 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
 period === 'monthly'
 ? 'surface-card text-primary-light dark:text-primary-dark dark:text-primary-dark shadow-sm'
 : 'text-theme-secondary hover:text-theme-primary dark:hover:text-white'
 }`}
 >
 Monthly
 </button>
 <button
 onClick={() => setPeriod('yearly')}
 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
 period === 'yearly'
 ? 'surface-card text-primary-light dark:text-primary-dark dark:text-primary-dark shadow-sm'
 : 'text-theme-secondary hover:text-theme-primary dark:hover:text-white'
 }`}
 >
 Yearly
 </button>
 </div>

 <select
 value={selectedYear}
 onChange={(e) => setSelectedYear(Number(e.target.value))}
 className="px-4 py-2 surface-card border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 >
 <option value={2026}>2026</option>
 <option value={2025}>2025</option>
 </select>
 </div>

 {/* Main Table */}
 <div className="surface-card border border-theme rounded-xl overflow-hidden mb-8">
 {period === 'monthly' ? (
 <MonthlyTable data={MOCK_MONTHLY_EARNINGS} />
 ) : (
 <YearlyTable data={MOCK_YEARLY_SUMMARIES} />
 )}
 </div>

 {/* Earnings by Tour */}
 <h2 className="text-lg font-semibold text-theme-primary mb-4">
 Earnings by Tour
 </h2>
 <div className="surface-card border border-theme rounded-xl overflow-hidden">
 <TourBreakdownTable data={MOCK_EARNINGS_BY_TOUR} />
 </div>

 {/* Tax Info */}
 <div className="mt-8 p-4 bg-primary-light/10 rounded-xl">
 <div className="flex items-start gap-3">
 <FileText className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark flex-shrink-0 mt-0.5" />
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
 className="text-sm text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline inline-flex items-center gap-1"
 >
 Learn more about taxes for guides
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 </>
 )
}
