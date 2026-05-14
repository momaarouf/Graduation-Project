import * as React from"react";
import { cn } from"@/src/lib/utils";
import { Button } from"@/src/components/ui/button";
import { Heart, ArrowRight, MapPin, Star, Calendar, Pointer } from"lucide-react";
import { motion, AnimatePresence } from"framer-motion";

export interface TourCardProps extends React.HTMLAttributes<HTMLDivElement> {
 imageUrl: string;
 category: string;
 title: string;
 location: string;
 rating: number;
 reviewCount: number;
 nextDate: string;
 price: string | number;
 pricePeriod: string;
 onLike: () => void;
 onBookNow: () => void;
 isLiked?: boolean;
 themeColor?: string;
 showHint?: boolean;
}

// Tap Icon for Mobile Interaction
const TapIcon = ({ className }: { className?: string }) => (
  <motion.div 
    className={cn("relative flex items-center justify-center", className)}
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  >
    {/* Ripple rings */}
    <motion.div 
      className="absolute inset-0 rounded-full bg-white/40"
      animate={{ scale: [1, 2], opacity: [0.5, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
    />
    <motion.div 
      className="absolute inset-0 rounded-full bg-white/20"
      animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
    />
    <Pointer className="w-8 h-8 text-white fill-white relative z-10 drop-shadow-xl" />
  </motion.div>
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
 themeColor ="221 83% 53%", 
 showHint = false,
 ...props
 },
 ref
 ) => {
 const [isRevealed, setIsRevealed] = React.useState(false);
 const [isHintActive, setIsHintActive] = React.useState(showHint);
 const [mounted, setMounted] = React.useState(false);
 const revealTimerRef = React.useRef<NodeJS.Timeout | null>(null);

 React.useEffect(() => {
  setMounted(true);
  return () => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
  };
 }, []);

 React.useEffect(() => {
  if (isRevealed) {
    setIsHintActive(false);
    
    // Auto-hide after 15s on mobile to keep the UI clean
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      revealTimerRef.current = setTimeout(() => {
        setIsRevealed(false);
      }, 15000); // 15 seconds
    }
  } else {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
  }
 }, [isRevealed]);

 // Variants for stable animation
 const variants = {
  image: {
    initial: { scale: 1, filter: "blur(0px)" },
    revealed: { scale: 1.1, filter: "blur(3px)" },
  },
  contentContainer: {
    initial: { y: 0 },
    revealed: { y: -74 },
  },
  revealableInfo: {
    initial: { opacity: 0, height: 0, marginTop: 0 },
    revealed: { opacity: 1, height: "auto", marginTop: 8 },
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

 if (!mounted) return (
  <div className={cn("aspect-[1/1.35] min-h-[430px] w-full rounded-3xl bg-black/20 animate-pulse", className)} />
 );

 return (
 <motion.div
 ref={ref}
 initial="initial"
 animate={isRevealed ? "revealed" : "initial"}
 onViewportLeave={() => {
   if (window.innerWidth < 768) {
     setIsRevealed(false);
   }
 }}
 viewport={{ amount: 0.3 }}
 onHoverStart={() => setIsRevealed(true)}
 onHoverEnd={() => setIsRevealed(false)}
 onPanEnd={(_, info) => {
   // Still support swipe as a premium feature
   if (info.offset.y < -20) setIsRevealed(true);
   if (info.offset.y > 20) setIsRevealed(false);
 }}
 onClick={(e) => {
   // TWO-TAP LOGIC:
   // 1. If not revealed -> reveal and block navigation
   // 2. If revealed -> allow Link to handle navigation
   if (typeof window !== 'undefined' && window.innerWidth < 768) {
     if (!isRevealed) {
       e.preventDefault();
       e.stopPropagation();
       setIsRevealed(true);
     }
     // If already revealed, do nothing (Link will trigger)
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
 <AnimatePresence>
 {isHintActive && !isRevealed && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 1.1 }}
 className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none md:hidden bg-black/20 backdrop-blur-[1px]"
 >
 <TapIcon className="mb-4" />
 <motion.p 
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-white text-xs font-bold tracking-[0.2em] capitalize drop-shadow-lg"
 >
   Tap for details
 </motion.p>
 </motion.div>
 )}
 </AnimatePresence>

 <motion.img
 variants={variants.image}
 transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
 src={imageUrl}
 alt={title}
 className="absolute inset-0 h-full w-full object-cover"
 />

 <div className="absolute inset-0 bg-gradient-to-t from-black/99 via-black/40 to-transparent" />
 
 <motion.div 
 variants={variants.glow}
 style={{
   background: `linear-gradient(to top, hsl(var(--theme-color) / 0.6) 0%, transparent 100%)`,
 }}
 className="absolute inset-x-0 bottom-0 h-1/2 transition-opacity duration-500"
 />
 <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-black transition-opacity duration-500" />

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

 <div className="relative z-20 flex h-full flex-col justify-end text-white pointer-events-none">
 
 <motion.div 
 variants={variants.contentContainer}
 transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
 className="p-4 sm:p-6 space-y-2 sm:space-y-3"
 >
 <p className="text-[10px] font-bold capitalize tracking-[0.2em] text-primary-light dark:text-primary-dark">
 - {category} -
 </p>

 <div>
 <h2 className="text-lg sm:text-xl font-bold leading-tight tracking-tight text-white md:text-2xl capitalize">
 {title}
 </h2>
 <div className="mt-1 flex items-center gap-1.5 text-white/80">
 <MapPin className="h-3.5 w-3.5 text-primary-light dark:text-primary-dark" />
 <span className="text-xs font-medium">{location}</span>
 </div>
 </div>

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
 <div className="h-3 w-px bg-white/20 hidden sm:block" />
 <div className="flex items-center gap-1">
 <Calendar className="h-3.5 w-3.5 text-primary-light dark:text-primary-dark flex-shrink-0" />
 <span className="text-[10px] sm:text-xs font-semibold text-white/90 whitespace-nowrap">{nextDate}</span>
 </div>
 </div>
 </motion.div>
 </motion.div>

 <motion.div 
 variants={variants.footer}
 transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
 className="absolute bottom-0 left-0 w-full p-4 sm:p-6"
 >
 <div className="flex items-center justify-between border-t border-white/10 pt-2 pointer-events-auto gap-2 flex-wrap">
 <div className="min-w-0 flex-shrink-0">
 <p className="text-[10px] font-bold capitalize tracking-normal text-white/50 mb-0.5">EST. PRICE</p>
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
 className="text-white hover:brightness-110 rounded-xl px-4 py-2 h-auto border border-white/20 shadow-lg transition-all flex-shrink-0"
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
