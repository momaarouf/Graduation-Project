const fs = require('fs');
const file = 'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/app/dashboard/guide/reports/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update MonthlyTable
const monthlyTableCode = `
const MonthlyCard = ({ row }: { row: MonthlyEarnings }) => (
  <div className="p-4 surface-card border border-theme rounded-xl space-y-3 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Period</div>
        <div className="text-sm font-bold text-theme-primary">{row.month} {row.year}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Net Earnings</div>
        <div className="text-sm font-black text-success-green dark:text-emerald-400">$\{row.netEarnings\}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-theme/50">
      <div>
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Tours/Bookings</div>
        <div className="text-xs font-bold text-theme-secondary">{row.tours} tours / {row.bookings} bookings</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Revenue/Fees</div>
        <div className="text-xs font-bold text-theme-secondary">$\{row.revenue\} / <span className="text-danger-red">-\{row.fees\}</span></div>
      </div>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span className="text-xs font-bold text-theme-primary">{row.averageRating}</span>
      </div>
      <div className="text-xs font-medium text-theme-muted italic">Top: {row.topTour}</div>
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
                <td className="px-4 py-3 text-sm font-medium text-theme-primary">$\{row.revenue\}</td>
                <td className="px-4 py-3 text-sm text-danger-red dark:text-red-400">-$\{row.fees\}</td>
                <td className="px-4 py-3 text-sm font-bold text-success-green dark:text-emerald-400">$\{row.netEarnings\}</td>
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
`;

content = content.replace(/const MonthlyTable = \({ data }: { data: MonthlyEarnings\[] }\) => {[\s\S]*?}/, monthlyTableCode);

// 2. Update YearlyTable
const yearlyTableCode = `
const YearlyCard = ({ row }: { row: YearlySummary }) => (
  <div className="p-4 surface-card border border-theme rounded-xl space-y-3 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Year</div>
        <div className="text-sm font-bold text-theme-primary">{row.year}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Net Earnings</div>
        <div className="text-sm font-black text-success-green dark:text-emerald-400">$\{row.totalNetEarnings\}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-theme/50">
      <div>
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Tours/Bookings</div>
        <div className="text-xs font-bold text-theme-secondary">{row.totalTours} tours / {row.totalBookings} bookings</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Revenue/Fees</div>
        <div className="text-xs font-bold text-theme-secondary">$\{row.totalRevenue\} / <span className="text-danger-red">-\{row.totalFees\}</span></div>
      </div>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span className="text-xs font-bold text-theme-primary">{row.averageRating}</span>
      </div>
      <div className="text-xs font-medium text-theme-muted italic">Best: {row.bestMonth} ($\{row.bestMonthEarnings\})</div>
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
                <td className="px-4 py-3 text-sm font-medium text-theme-primary">$\{row.totalRevenue\}</td>
                <td className="px-4 py-3 text-sm text-danger-red dark:text-red-400">-$\{row.totalFees\}</td>
                <td className="px-4 py-3 text-sm font-bold text-success-green dark:text-emerald-400">$\{row.totalNetEarnings\}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {row.averageRating}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-theme-secondary ">
                  {row.bestMonth} ($\{row.bestMonthEarnings\})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
`;

content = content.replace(/const YearlyTable = \({ data }: { data: YearlySummary\[] }\) => {[\s\S]*?}/, yearlyTableCode);

// 3. Update TourBreakdownTable
const tourBreakdownTableCode = `
const TourCard = ({ row }: { row: EarningsByTour }) => (
  <div className="p-4 surface-card border border-theme rounded-xl space-y-3 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Tour Title</div>
        <div className="text-sm font-bold text-theme-primary truncate">{row.tourTitle}</div>
      </div>
      <div className="text-right ml-4">
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Net</div>
        <div className="text-sm font-black text-success-green dark:text-emerald-400">$\{row.netEarnings\}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-theme/50">
      <div>
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Bookings</div>
        <div className="text-xs font-bold text-theme-secondary">{row.bookings} bookings</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Revenue/Fees</div>
        <div className="text-xs font-bold text-theme-secondary">$\{row.revenue\} / <span className="text-danger-red">-\{row.fees\}</span></div>
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
                <td className="px-4 py-3 text-sm font-medium text-theme-primary">$\{row.revenue\}</td>
                <td className="px-4 py-3 text-sm text-danger-red dark:text-red-400">-$\{row.fees\}</td>
                <td className="px-4 py-3 text-sm font-bold text-success-green dark:text-emerald-400">$\{row.netEarnings\}</td>
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
`;

content = content.replace(/const TourBreakdownTable = \({ data }: { data: EarningsByTour\[] }\) => {[\s\S]*?}/, tourBreakdownTableCode);

fs.writeFileSync(file, content);
console.log('Reports page updated');
