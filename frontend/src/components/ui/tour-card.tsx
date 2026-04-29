import * as React from"react";
import { cn } from"@/src/lib/utils";
import { Button } from"@/src/components/ui/button";
import { Heart, ArrowRight, MapPin, Star, Calendar } from"lucide-react";
import { motion, AnimatePresence } from"framer-motion";

export interface TourCardProps extends React.HTMLAttributes<HTMLDivElement> {
 /** The URL for the background image of the card. */
 imageUrl: string;
 /** The category or region text displayed above the main title. */
 category: string;
 /** The main title of the tour. */
 title: string;
 /** The location details. */
 location: string;
 /** The average rating of the tour. */
 rating: number;
 /** The total number of reviews. */
 reviewCount: number;
 /** The next available date for the tour. */
 nextDate: string;
 /** The price of the tour. */
 price: string | number;
 /** The period for the price. */
 pricePeriod: string;
 /** A callback function to be invoked when the like button is clicked. */
 onLike: () => void;
 /** A callback function to be invoked when the book now button is clicked. */
 onBookNow: () => void;
 /** Determines if the destination is marked as liked. */
 isLiked?: boolean;
 /** Primary theme color in HSL format (e.g.,"150 50% 25%") */
 themeColor?: string;
 /** Whether to show the discovery hint (shake/overlay) immediately. */
 showHint?: boolean;
}

// Anatomically Realistic Hand SVG (Silhouette style with finger details)
const TouchHandIcon = ({ className }: { className?: string }) => (
 <svg 
 viewBox="0 0 24 24" 
 fill="currentColor" 
 className={className}
 style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7))' }}
 >
 <path d="M18.5,13a3.5,3.5,0,0,0-3.13-3.48L13.5,9.32V4.5a3.5,3.5,0,0,0-7,0v11.1L4.6,14.2a2.91,2.91,0,0,0-4.1,4.1l4.4,4.4c2.1,2.1,4.9,2.3,6.7,2.3h3.9c3.1,0,5.5-2.4,5.5-5.5V14.13A3.5,3.5,0,0,0,18.5,13Z" />
 {/* Anatomical Line/Crease */}
 <path d="M9,18c2,0,4-1,5-3" fill="none" stroke="black" strokeWidth="0.5" strokeOpacity="0.2" />
 </svg>
);

const TourCard = React.forwardRef<HTMLDivElement, TourCardProps>(
 (
 {
 className,
 imageUrl,
 category,
 title,
 location,
 rating,
 reviewCount,
 nextDate,
 price,
 pricePeriod,
 onLike,
 onBookNow,
 isLiked = false,
 themeColor ="221 83% 53%", // Trust Blue
 showHint = false,
 ...props
 },
 ref
 ) => {
 const [isRevealed, setIsRevealed] = React.useState(false);
 const [isHintActive, setIsHintActive] = React.useState(showHint);

 // Logic: Hint is active only if showHint was passed on mount, 
 // and stays active until the user reveals the card.
 React.useEffect(() => {
 if (isRevealed) {
 setIsHintActive(false);
 }
 }, [isRevealed]);

 // Variants for animation control
 const variants = {
 image: {
 initial: { scale: 1, filter:"blur(0px)" },
 revealed: { scale: 1.1, filter:"blur(3px)" },
 },
 contentContainer: {
 initial: { y: 0 },
 revealed: { y: -74 },
 },
 revealableInfo: {
 initial: { opacity: 0, height: 0, marginTop: 0 },
 revealed: { opacity: 1, height:"auto", marginTop: 8 },
 },
 footer: {
 initial: { y: 100, opacity: 0 },
 revealed: { y: 0, opacity: 1 },
 },
 glow: {
 initial: { opacity: 0.6 },
 revealed: { opacity: 1 },
 }
 };

 const { onDrag, onDragStart, onDragEnd, onAnimationStart, ...otherProps } = props;

 return (
 <motion.div
 ref={ref}
 initial="initial"
 animate={isRevealed ?"revealed" :"initial"}
 onHoverStart={() => setIsRevealed(true)}
 onHoverEnd={() => setIsRevealed(false)}
 onClick={() => {
   if (window.innerWidth < 768) {
     setIsRevealed(!isRevealed);
   }
 }}
 style={{
"--theme-color": themeColor,
 } as React.CSSProperties}
 className={cn(
"group relative aspect-[1/1.35] min-h-[430px] w-full overflow-hidden rounded-3xl bg-black/20",
"transition-shadow duration-300 ease-in-out hover:shadow-2xl cursor-pointer touch-pan-y",
 className
 )}
 {...otherProps}
 >
 {/* Realistic Swipe Hint (Hand + Synced Line) */}
 <AnimatePresence>
 {isHintActive && !isRevealed && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute top-4 left-4 z-50 pointer-events-none md:hidden"
 >
 <div className="relative">
 {/* Visual Path Line */}
 <svg className="absolute top-4 right-0 w-24 h-4 overflow-visible">
 <motion.path
 d="M 68 4 L 0 4"
 fill="transparent"
 stroke="white"
 strokeWidth="1.5"
 strokeDasharray="4 4"
 strokeLinecap="round"
 animate={{ 
 pathLength: [0, 1, 0],
 opacity: [0, 0.4, 0]
 }}
 transition={{ 
 duration: 2.2, 
 repeat: Infinity,
 ease:"easeInOut"
 }}
 />
 </svg>

 {/* Realistic Hand Gesture */}
 <motion.div
 animate={{ 
 x: [68, 0],
 opacity: [0, 1, 0.8, 0],
 scale: [1, 0.95, 1, 1],
 }}
 transition={{ 
 duration: 2.2, 
 repeat: Infinity,
 ease:"easeInOut"
 }}
 className="relative"
 >
 {/* Subtle initial pulse ripple at start of gesture */}
 <motion.div
 animate={{ scale: [1, 1.4, 1], opacity: [0, 0.3, 0] }}
 transition={{ duration: 1.5, repeat: Infinity }}
 className="absolute top-0 right-0 w-10 h-10 -mr-1 -mt-1 rounded-full surface-card"
 />
 <TouchHandIcon className="w-10 h-10 text-white fill-white" />
 </motion.div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Background Image with Framer Motion */}
 <motion.img
 variants={variants.image}
 transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
 src={imageUrl}
 alt={title}
 className="absolute inset-0 h-full w-full object-cover"
 />

 {/* Black Gradient for Readability */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/99 via-black/40 to-transparent" />
 
 {/* Linear Themed Gradient behind title area */}
 <motion.div 
 variants={variants.glow}
 className="absolute inset-x-0 bottom-0 h-1/2 transition-opacity duration-500"
 style={{
 background: `linear-gradient(to top, hsl(var(--theme-color) / 0.6) 0%, transparent 100%)`,
 }}
 />
 <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-black transition-opacity duration-500" />

 {/* Like Button (Top Right) */}
 <button
 aria-label={isLiked ?"Unlike destination" :"Like destination"}
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 onLike();
 }}
 className={cn(
"absolute top-4 right-4 z-30 rounded-full bg-black/20 p-2.5  border border-white/10 transition-all duration-300 hover:bg-white/20 active:scale-90",
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:ring-primary-dark"
 )}
 >
 <Heart
 className={cn(
"h-5 w-5 transition-colors duration-300",
 isLiked ? "fill-red-500 text-red-500" : "text-white"
 )}
 />
 </button>

 {/* Content Area */}
 <div className="relative z-20 flex h-full flex-col justify-end text-white pointer-events-none">
 
 {/* Main Info Block */}
 <motion.div 
 variants={variants.contentContainer}
 transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
 className="p-4 sm:p-6 space-y-2 sm:space-y-3"
 >
 {/* Category: Dashed Style */}
 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-light dark:text-primary-dark">
 - {category} -
 </p>

 {/* Title & Location */}
 <div>
 <h2 className="text-lg sm:text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
 {title}
 </h2>
 <div className="mt-1 flex items-center gap-1.5 text-white/80">
 <MapPin className="h-3.5 w-3.5 text-primary-light dark:text-primary-dark" />
 <span className="text-xs font-medium">{location}</span>
 </div>
 </div>

 {/* Ratings & Next Date: Revealed Info */}
 <motion.div 
 variants={variants.revealableInfo}
 className="overflow-hidden"
 >
 <div className="flex items-center gap-2 sm:gap-4 pt-1 sm:pt-2 flex-wrap">
 <div className="flex items-center gap-1">
 <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
 <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
 <span className="text-[9px] font-medium text-white/50 whitespace-nowrap">({reviewCount})</span>
 </div>
 <div className="h-3 w-px surface-card hidden sm:block" />
 <div className="flex items-center gap-1">
 <Calendar className="h-3.5 w-3.5 text-primary-light dark:text-primary-dark flex-shrink-0" />
 <span className="text-[10px] sm:text-xs font-semibold text-white/90 whitespace-nowrap">{nextDate}</span>
 </div>
 </div>
 </motion.div>
 </motion.div>

 {/* Bottom Section: Footer */}
 <motion.div 
 variants={variants.footer}
 transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
 className="absolute bottom-0 left-0 w-full p-4 sm:p-6"
 >
 <div className="flex items-center justify-between border-t border-theme-strong pt-2 pointer-events-auto gap-2 flex-wrap">
 <div className="min-w-0 flex-shrink-0">
 <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-0.5">EST. PRICE</p>
 <div className="flex items-baseline gap-1">
 <span className="text-2xl font-bold text-white leading-none">{price}</span>
 <span className="text-[9px] font-medium text-white/60 leading-none">{pricePeriod}</span>
 </div>
 </div>
 
 <Button 
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 onBookNow();
 }}
 style={{
 backgroundColor: `hsl(var(--theme-color) / 0.8)`,
 }}
 className="text-white hover:brightness-110 rounded-xl px-4 py-2 h-auto border border-theme-strong shadow-lg transition-all flex-shrink-0"
 >
 <span className="font-bold text-xs whitespace-nowrap">Book Tour</span>
 <ArrowRight className="ml-1.5 h-3.5 w-3.5 flex-shrink-0" />
 </Button>
 </div>
 </motion.div>

 </div>
 </motion.div>
 );
 }
);

TourCard.displayName ="TourCard";

export { TourCard };
