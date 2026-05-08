// ============================================================================
// SKELETON COMPONENT - LOADING STATE PLACEHOLDER
// ============================================================================
// Simple skeleton loader for displaying placeholder content while data loads
// ============================================================================

interface SkeletonProps {
 className?: string
 count?: number
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
 const skeletons = Array.from({ length: count }, (_, i) => (
 <div
 key={i}
 className={`animate-pulse surface-section rounded ${className}`}
 />
 ))

 return count === 1 ? skeletons[0] : <div className="space-y-2">{skeletons}</div>
}
