const fs = require('fs');
const file = 'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/src/components/tour-detail/TourHero.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. We replace the main image area with two versions: 
// A) Desktop (hidden on mobile) - Current logic
// B) Mobile (hidden on desktop) - Swipeable CSS carousel

// To do this reliably, we'll locate the main content area and the thumbnail strip, and wrap them.

const mainContentRegex = /{\/\* Main content area \*\/}\n\s*<div className=\"relative aspect-\[16\/9\] w-full overflow-hidden\">([\s\S]*?){\/\* Navigation arrows \(desktop\) - OUTSIDE clickable lightbox div \*\/}/;

// Wait, the main content area has lightbox trigger inside it.

// Let's replace the whole MAIN IMAGE GALLERY section up to "TITLE & QUICK STATS".

// This is complex. Let's just use JS touch events on the main container. It is much easier to inject and works very well if combined with Framer Motion or just simple touch events. Since Framer motion is already imported...

content = content.replace(
  /const \[zoomScale, setZoomScale\] = useState\(1\)/,
  \`const [zoomScale, setZoomScale] = useState(1)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)\`
);

// Add handlers
content = content.replace(
  /const handleWheel = \(e: React.WheelEvent\) => \{/,
  \`const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    if (isLeftSwipe) handleNext()
    if (isRightSwipe) handlePrev()
    setTouchStart(0)
    setTouchEnd(0)
  }

  const handleWheel = (e: React.WheelEvent) => {\`
);

// Attach to the main container
content = content.replace(
  /<div className=\"relative aspect-\[16\/9\] w-full overflow-hidden\">/,
  \`<div 
    className="relative aspect-square sm:aspect-[16/9] w-full overflow-hidden"
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >\`
);

// Hide thumbnails on mobile
content = content.replace(
  /className=\"\n\s*flex gap-2 p-2\n\s*overflow-x-auto\n\s*scrollbar-hide\n\s*surface-section\n\"/,
  \`className="
  hidden sm:flex gap-2 p-2
  overflow-x-auto
  scrollbar-hide
  surface-section
"\`
);

// Show dots on mobile
content = content.replace(
  /{\/\* Thumbnail strip \*\/}/,
  \`{/* Mobile Pagination Dots */}
  <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
    {fullGallery.map((_, idx) => (
      <div 
        key={idx}
        className={\\\`w-1.5 h-1.5 rounded-full transition-all \${idx === activeMediaIndex ? 'bg-white w-3' : 'bg-white/50'}\\\`}
      />
    ))}
  </div>

  {/* Thumbnail strip */}\`
);

fs.writeFileSync(file, content);
console.log('TourHero updated with mobile swipe logic');
