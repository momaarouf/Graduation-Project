import { Skeleton } from '@/src/components/ui/Skeleton';

export default function EmailVerificationLoading() {
 return (
 <div className="space-y-6">
 <Skeleton className="h-10 w-3/4" />
 <Skeleton className="h-4 w-full" />
 <div className="space-y-4">
 <Skeleton className="h-4 w-1/4" />
 <Skeleton className="h-10 w-full" />
 </div>
 <Skeleton className="h-12 w-full" />
 </div>
 );
}
