
import './Skeleton.css';

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
    <div className={`skeleton-shimmer rounded ${className}`} />
);

export const SkeletonProductCard = () => (
    <div className="group relative w-full">
        <div className="aspect-3/4 w-full">
            <Skeleton className="w-full h-full rounded-sm" />
        </div>
        <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
        </div>
    </div>
);

export const SkeletonCircle = ({ size = '10' }: { size?: string }) => (
    <Skeleton className={`w-${size} h-${size} rounded-full`} />
);

export const SkeletonCampaignHero = () => (
    <div className="w-full aspect-[21/9] relative overflow-hidden mb-12">
        <Skeleton className="w-full h-full" />
    </div>
);

export const SkeletonCategoryItem = () => (
    <div className="relative group overflow-hidden">
        <div className="aspect-4/5 bg-gray-100 rounded-sm">
            <Skeleton className="w-full h-full" />
        </div>
        <div className="mt-4 flex flex-col items-center space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
        </div>
    </div>
);
