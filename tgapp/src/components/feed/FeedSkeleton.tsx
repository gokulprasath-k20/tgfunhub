import { Skeleton, SkeletonAvatar, SkeletonText } from '@/components/ui/Skeleton';

function PostSkeleton() {
  return (
    <div className="card p-4 border-b border-[#e5e5e5] dark:border-[#2a2a2a] rounded-none">
      <div className="flex gap-3 mb-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <SkeletonText lines={3} className="mb-3" />
      <Skeleton className="h-3 w-24 mt-4" />
    </div>
  );
}

export function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
