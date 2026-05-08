const fs = require('fs');
const file = 'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/app/dashboard/guide/wallet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add PayoutCard component
const cardComponent = `
// ==================== MOBILE CARD ====================
function PayoutCard({ p }: { p: PaymentResponse }) {
  const isPaid = p.payoutStatus === 'Transferred';
  const isPending = p.payoutStatus === 'Pending';
  
  return (
    <div className="surface-card rounded-2xl border border-theme p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">Date</div>
          <div className="text-sm font-bold text-theme-primary">
            {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
          </div>
          <div className="text-[10px] text-theme-muted font-medium">
            {new Date(p.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">Amount</div>
          <div className="text-lg font-black text-theme-primary">
            {p.currency} {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-theme">
        <div>
          <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-0.5">Origin</div>
          <div className="text-xs font-bold text-theme-primary">Booking #{p.bookingId}</div>
        </div>
        <div className="text-right">
          {isPaid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-success-green/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg border border-success-green/20">
              <CheckCircle2 className="w-3 h-3" /> PAID
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-light/10 text-blue-600 dark:text-primary-dark text-[10px] font-black rounded-lg border border-primary-light/20">
              <Clock className="w-3 h-3" /> ESCROW
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-danger-red/10 text-red-600 dark:text-red-400 text-[10px] font-black rounded-lg border border-danger-red/20">
              <AlertCircle className="w-3 h-3" /> FAILED
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
`;

content = content.replace('export default function GuideWalletPage()', cardComponent + '\nexport default function GuideWalletPage()');

// 2. Replace the table section with responsive switch
const tableSearch = /<div className=\"flex-1 overflow-x-auto\">\n\s*{payouts\.length > 0 \? \(\n\s*<table className=\"w-full text-left\">\n\s*<thead>\n\s*<tr className=\"surface-section\">\n\s*<th className=\"px-8 py-4 text-\[10px\] font-black text-theme-muted uppercase tracking-widest\">Date<\/th>\n\s*<th className=\"px-8 py-4 text-\[10px\] font-black text-theme-muted uppercase tracking-widest\">Origin Booking<\/th>\n\s*<th className=\"px-8 py-4 text-\[10px\] font-black text-theme-muted uppercase tracking-widest\">Amount \(Net\)<\/th>\n\s*<th className=\"px-8 py-4 text-\[10px\] font-black text-theme-muted uppercase tracking-widest text-right\">Status<\/th>\n\s*<\/tr>\n\s*<\/thead>\n\s*<tbody className=\"divide-y divide-gray-100 dark:divide-gray-800\">\n\s*{payouts\.map\(\(p, idx\) => \(\n\s*<tr key=\{idx\} className=\"group hover:surface-section dark:hover:surface-card transition-colors\">\n\s*<td className=\"px-8 py-6\">\n\s*<div className=\"text-sm font-bold text-theme-primary\">\n\s*{new Date\(p\.createdAt\)\.toLocaleDateString\('en-US', \{ month: 'short', day: '2-digit', year: 'numeric' \}\)}\n\s*<\/div>\n\s*<div className=\"text-\[10px\] text-theme-muted font-medium\">\n\s*{new Date\(p\.createdAt\)\.toLocaleTimeString\('en-US', \{ hour: '2-digit', minute: '2-digit', hour12: false \}\)} UTC\n\s*<\/div>\n\s*<\/td>\n\s*<td className=\"px-8 py-6\">\n\s*<div className=\"text-sm font-bold text-theme-primary\">#{p\.bookingId}<\/div>\n\s*<div className=\"text-\[10px\] text-theme-muted font-bold uppercase tracking-wider\">Tour Settlement<\/div>\n\s*<\/td>\n\s*<td className=\"px-8 py-6\">\n\s*<div className=\"text-sm font-black text-theme-primary\">\n\s*{p\.currency} {p\.amount\.toLocaleString\(undefined, \{ minimumFractionDigits: 2 \}\)}\n\s*<\/div>\n\s*<\/td>\n\s*<td className=\"px-8 py-6 text-right\">\n\s*{p\.payoutStatus === 'Transferred' \? \(\n\s*<span className=\"inline-flex items-center gap-1\.5 px-3 py-1 bg-success-green\/20 dark:bg-emerald-900\/30 text-emerald-700 dark:text-emerald-400 text-xs font-black rounded-lg\">\n\s*<CheckCircle2 className=\"w-3\.5 h-3\.5\" \/> Already Paid\n\s*<\/span>\n\s*\) : p\.payoutStatus === 'Pending' \? \(\n\s*<span className=\"inline-flex items-center gap-1\.5 px-3 py-1 bg-primary-light\/20 dark:bg-primary-dark\/20 text-blue-700 dark:text-primary-dark text-xs font-black rounded-lg\">\n\s*<Clock className=\"w-3\.5 h-3\.5\" \/> In Escrow\n\s*<\/span>\n\s*\) : \(\n\s*<span className=\"inline-flex items-center gap-1\.5 px-3 py-1 bg-danger-red\/20 dark:bg-red-900\/30 text-red-700 dark:text-red-400 text-xs font-black rounded-lg\">\n\s*<AlertCircle className=\"w-3\.5 h-3\.5\" \/> Failed\n\s*<\/span>\n\s*\)}\n\s*<\/td>\n\s*<\/tr>\n\s*\)\)}\n\s*<\/tbody>\n\s*<\/table>\n\s*\) :/;

const replacement = `<div className="flex-1">
  {payouts.length > 0 ? (
    <>
      {/* Mobile: Cards */}
      <div className="md:hidden space-y-4 p-4">
        {payouts.map((p, idx) => (
          <PayoutCard key={idx} p={p} />
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="surface-section">
              <th className="px-8 py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest">Date</th>
              <th className="px-8 py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest">Origin Booking</th>
              <th className="px-8 py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest">Amount (Net)</th>
              <th className="px-8 py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {payouts.map((p, idx) => (
              <tr key={idx} className="group hover:surface-section dark:hover:surface-card transition-colors">
                <td className="px-8 py-6">
                  <div className="text-sm font-bold text-theme-primary">
                    {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-theme-muted font-medium">
                    {new Date(p.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm font-bold text-theme-primary">#{p.bookingId}</div>
                  <div className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Tour Settlement</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm font-black text-theme-primary">
                    {p.currency} {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  {p.payoutStatus === 'Transferred' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-green/20 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Already Paid
                    </span>
                  ) : p.payoutStatus === 'Pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light/20 dark:bg-primary-dark/20 text-blue-700 dark:text-primary-dark text-xs font-black rounded-lg">
                      <Clock className="w-3.5 h-3.5" /> In Escrow
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger-red/20 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-black rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5" /> Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) :`;

content = content.replace(tableSearch, replacement);

fs.writeFileSync(file, content);
console.log('Wallet page updated');
