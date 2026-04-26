'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Lock, Calendar, Edit } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePosts } from '@/hooks/usePosts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { PostCard } from '@/components/feed/PostCard';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { Skeleton, SkeletonAvatar } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/shared/Loader';
import type { IPostWithMeta } from '@/types/post';
import type { IUserPublic } from '@/types/user';

async function fetchProfile(username: string): Promise<IUserPublic> {
  const res = await fetch(`/api/users/${username}`);
  if (!res.ok) throw new Error('User not found');
  const data = await res.json();
  return data.user as IUserPublic;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const isOwner = currentUser?.username === username;

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username),
  });

  const { data, isLoading: postsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts(username);

  const sentinelRef = useInfiniteScroll(
    () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); },
    !!hasNextPage,
    isFetchingNextPage
  );

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="card p-6">
        {profileLoading ? (
          <div className="flex items-start gap-4">
            <SkeletonAvatar size="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ) : profile ? (
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#e5e5e5] dark:bg-[#2a2a2a] flex-shrink-0 flex items-center justify-center">
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={profile.username}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="text-2xl font-bold text-[#525252] dark:text-[#a3a3a3]">
                  {profile.username[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-[#0a0a0a] dark:text-[#fafafa] tracking-tight">
                  {profile.username}
                </h1>
                {profile.isPrivate && (
                  <Lock className="w-3.5 h-3.5 text-[#a3a3a3]" aria-label="Private account" />
                )}
              </div>

              {profile.bio && (
                <p className="text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-2 text-xs text-[#a3a3a3]">
                <Calendar className="w-3 h-3" />
                <span>Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}</span>
              </div>
            </div>

            {isOwner && (
              <Link href="/profile/edit">
                <Button variant="secondary" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                  Edit
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#a3a3a3]">User not found.</p>
        )}
      </div>

      {/* Posts */}
      {postsLoading && <FeedSkeleton count={3} />}

      {!postsLoading && posts.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-sm text-[#a3a3a3] dark:text-[#525252]">
            {isOwner ? 'You haven\'t posted anything yet.' : 'No posts yet.'}
          </p>
          {isOwner && (
            <Link href="/feed" className="mt-3 inline-block">
              <Button size="sm" variant="secondary">Create your first post</Button>
            </Link>
          )}
        </div>
      )}

      {!postsLoading && posts.length > 0 && (
        <div className="border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg overflow-hidden divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a]">
          {posts.map((post: IPostWithMeta) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" aria-hidden="true" />
      {isFetchingNextPage && <div className="flex justify-center py-4"><Loader size="sm" /></div>}
    </div>
  );
}
