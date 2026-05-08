const fs = require('fs');
const file = 'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/src/components/tour-detail/BookingCard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state
content = content.replace(
  /const \[waiverSigned, setWaiverSigned\] = useState\(false\)/,
  'const [waiverSigned, setWaiverSigned] = useState(false)\n  const [isMobileExpanded, setIsMobileExpanded] = useState(false)'
);

// 2. Add an overlay and toggle button logic
const renderTarget = /return \(\n\s*<div className=\"surface-section border border-primary-light\/10 dark:border-primary-dark\/10 rounded-xl overflow-hidden sticky top-24\">/;

const newRender = `return (
  <>
    {/* Mobile Backdrop Overlay */}
    {isMobileExpanded && (
      <div 
        className=\"fixed inset-0 bg-black/60 z-[60] lg:hidden animate-in fade-in\"
        onClick={() => setIsMobileExpanded(false)}
      />
    )}

    <div className={\`
      fixed bottom-[64px] md:bottom-0 left-0 right-0 z-[60] surface-card border-t border-theme shadow-[0_-8px_30px_rgb(0,0,0,0.12)]
      transition-transform duration-300 ease-in-out lg:transform-none lg:transition-none
      lg:static lg:z-auto lg:surface-section lg:border lg:border-primary-light/10 lg:dark:border-primary-dark/10 lg:rounded-xl lg:overflow-hidden lg:sticky lg:top-24 lg:shadow-none
      \${isMobileExpanded ? 'translate-y-0 rounded-t-3xl bottom-0' : 'translate-y-0'}
    \`}>
      {/* Mobile Handle for dragging/closing */}
      {isMobileExpanded && (
        <div className=\"w-full flex justify-center py-3 lg:hidden\" onClick={() => setIsMobileExpanded(false)}>
          <div className=\"w-12 h-1.5 bg-theme-muted rounded-full opacity-50\" />
        </div>
      )}

      {/* 
        On mobile, if NOT expanded, we only show a mini action bar.
        If expanded, we show the full form inside a scrollable container.
      */}
      <div className={\`\${!isMobileExpanded ? 'hidden lg:block' : 'max-h-[85vh] overflow-y-auto lg:max-h-none lg:overflow-visible pb-safe'}\`}>`;

content = content.replace(renderTarget, newRender);

// 3. Add the mini action bar for mobile (when not expanded) at the very bottom
const finalClosingTags = /<\/div>\n\s*<\/div>\n\s*\)$/;
const miniBar = `</div>
      
      {/* Mobile Mini Action Bar (Visible when NOT expanded) */}
      {!isMobileExpanded && (
        <div className=\"p-4 lg:hidden flex items-center justify-between pb-safe\">
          <div>
            <div className=\"text-xl font-black text-theme-primary\">
              {currency === 'USD' && '$'}
              {currency === 'TRY' && '₺'}
              {currency === 'LBP' && 'ل.ل '}
              {price.pricePerPerson}
            </div>
            <div className=\"text-[10px] uppercase tracking-wider font-bold text-theme-muted\">
              / person
            </div>
          </div>
          <button
            onClick={() => setIsMobileExpanded(true)}
            className=\"px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white font-black rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all\"
          >
            {activeBookingId ? 'Manage' : 'Book Now'}
          </button>
        </div>
      )}
    </div>
  </>
  )`;

content = content.replace(finalClosingTags, miniBar);

fs.writeFileSync(file, content);
console.log('BookingCard updated for mobile drawer');
