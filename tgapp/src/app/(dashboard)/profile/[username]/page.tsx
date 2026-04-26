'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Lock, 
  Grid, 
  Play, 
  UserCircle, 
  Settings, 
  MoreHorizontal,
  UserPlus,
  UserCheck,
  MessageCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePosts } from '@/hooks/usePosts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/shared/Loader';
import type { IPostWithMeta } from '@/types/post';
import type { IUserPublic } from '@/types/user';
import toast from 'react-hot-toast';

async function fetchProfile(username: string): Promise<IUserPublic> {
  const res = await fetch(`/api/users/${username}`);
  if (!res.ok) throw new Error('User not found');
  const data = await res.json();
  return data.user as IUserPublic;
}

async function fetchFollowStatus(username: string) {
  const res = await fetch(`/api/users/${username}/follow`);
  if (!res.ok) return { isFollowing: false, status: null };
  return res.json();
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const isOwner = currentUser?.username === username;
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'tagged'>('posts');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username),
  });

  const { data: followData } = useQuery({
    queryKey: ['followStatus', username],
    queryFn: () => fetchFollowStatus(username),
    enabled: !!username && !isOwner,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to update follow');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['followStatus', username] });
      if (data.status === 'pending') {
        toast.success('Follow request sent');
      } else {
        toast.success(data.status === 'unfollowed' ? 'Unfollowed' : 'Following!');
      }
    }
  });

  const handleMessage = async () => {
    if (!profile?._id || !currentUser) return;
    
    // Restriction: Cannot message private account unless followed
    if (profile.isPrivate && (!followData?.isFollowing || followData.status === 'pending')) {
      toast.error('Follow this private account to start messaging');
      return;
    }

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: profile._id }),
      });
      if (res.ok) {
        const { conversation } = await res.json();
        router.push(`/messages?id=${conversation._id}`);
      }
    } catch (err) {
      console.error('Failed to start conversation', err);
    }
  };

  const { data, isLoading: postsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts(username);

  const sentinelRef = useInfiniteScroll(
    () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); },
    !!hasNextPage,
    isFetchingNextPage
  );

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];
  const isPrivateAndNotFollowing = profile?.isPrivate && !isOwner && (!followData?.isFollowing || followData.status === 'pending');

  if (profileLoading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12 border-b border-[#e5e5e5] dark:border-[#262626] pb-12">
        <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
          <div className="w-full h-full rounded-full border-[3px] border-white dark:border-[#0a0a0a] overflow-hidden bg-[#e5e5e5] dark:bg-[#262626] flex items-center justify-center">
            {profile?.profileImage ? (
              <Image src={profile.profileImage} alt={profile.username} fill className="object-cover" />
            ) : (
              <span className="text-4xl md:text-5xl font-bold text-[#a3a3a3]">{profile?.username[0]?.toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4 pt-2">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <h1 className="text-xl font-medium">{profile?.username}</h1>
            <div className="flex items-center gap-2">
              {isOwner ? (
                <>
                  <Link href="/profile/edit"><Button variant="secondary" size="sm" className="h-8 font-semibold px-4">Edit Profile</Button></Link>
                  <Button variant="ghost" size="sm" className="p-0"><Settings className="w-5 h-5" /></Button>
                </>
              ) : (
                <>
                  <Button 
                    size="sm" 
                    className={`h-8 font-semibold px-6 border-none ${followData?.isFollowing ? 'bg-[#efefef] dark:bg-[#262626] text-black dark:text-white' : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'}`}
                    onClick={() => followMutation.mutate()}
                    isLoading={followMutation.isPending}
                  >
                    {followData?.status === 'pending' ? 'Requested' : followData?.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="secondary" size="sm" className="h-8 font-semibold px-4" onClick={handleMessage}>Message</Button>
                  <Button variant="ghost" size="sm" className="p-0"><MoreHorizontal className="w-5 h-5" /></Button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-8 md:gap-12">
            <div className="flex flex-col md:flex-row items-center gap-1">
              <span className="font-bold">{isPrivateAndNotFollowing ? '—' : posts.length}</span>
              <span className="text-sm text-[#737373]">posts</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-1 cursor-pointer">
              <span className="font-bold">128</span>
              <span className="text-sm text-[#737373]">followers</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-1 cursor-pointer">
              <span className="font-bold">245</span>
              <span className="text-sm text-[#737373]">following</span>
            </div>
          </div>

          <div className="max-w-[320px] md:max-w-none">
            <p className="font-semibold text-sm mb-1">{profile?.username}</p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{profile?.bio || 'No bio yet.'}</p>
            {profile?.isPrivate && <div className="flex items-center gap-1 text-[#a3a3a3] mt-2"><Lock className="w-3 h-3" /><span className="text-xs">Private Account</span></div>}
          </div>
        </div>
      </div>

      {isPrivateAndNotFollowing ? (
        <div className="flex flex-col items-center py-20 bg-[#f9f9f9] dark:bg-[#111111] rounded-2xl border border-dashed border-[#e5e5e5] dark:border-[#262626]">
          <div className="w-16 h-16 rounded-full border-2 border-[#0a0a0a] dark:border-[#fafafa] flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">This Account is Private</h2>
          <p className="text-sm text-[#737373]">Follow this account to see their photos and videos.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center border-t border-[#e5e5e5] dark:border-[#262626] -mt-12 mb-8">
            <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 py-4 px-8 border-t transition-colors ${activeTab === 'posts' ? 'border-[#0a0a0a] dark:border-[#fafafa] text-[#0a0a0a] dark:text-[#fafafa]' : 'border-transparent text-[#737373]'}`}><Grid className="w-3 h-3" /><span className="text-xs font-bold uppercase tracking-widest">Posts</span></button>
            <button onClick={() => setActiveTab('reels')} className={`flex items-center gap-2 py-4 px-8 border-t transition-colors ${activeTab === 'reels' ? 'border-[#0a0a0a] dark:border-[#fafafa] text-[#0a0a0a] dark:text-[#fafafa]' : 'border-transparent text-[#737373]'}`}><Play className="w-3 h-3" /><span className="text-xs font-bold uppercase tracking-widest">Reels</span></button>
            <button onClick={() => setActiveTab('tagged')} className={`flex items-center gap-2 py-4 px-8 border-t transition-colors ${activeTab === 'tagged' ? 'border-[#0a0a0a] dark:border-[#fafafa] text-[#0a0a0a] dark:text-[#fafafa]' : 'border-transparent text-[#737373]'}`}><UserCircle className="w-3 h-3" /><span className="text-xs font-bold uppercase tracking-widest">Tagged</span></button>
          </div>

          {postsLoading ? (
            <div className="grid grid-cols-3 gap-1 md:gap-8">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="aspect-square rounded-sm" />)}</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center"><div className="w-16 h-16 rounded-full border-2 border-[#0a0a0a] dark:border-[#fafafa] flex items-center justify-center mb-4"><Grid className="w-8 h-8" /></div><h2 className="text-2xl font-bold mb-2">No Posts Yet</h2><p className="text-sm text-[#737373]">When they share photos, they will appear here.</p></div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-8">
              {posts.map((post) => (
                <Link key={post._id} href={`/feed?postId=${post._id}`} className="relative aspect-square group overflow-hidden bg-[#e5e5e5] dark:bg-[#1a1a1a]">
                  <Image src={post.content.images?.[0] || '/placeholder-post.jpg'} alt="Post" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 33vw, 300px" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                    <div className="flex items-center gap-2"><span>❤️</span><span>{post.stats?.likes || 0}</span></div>
                    <div className="flex items-center gap-2"><span>💬</span><span>{post.stats?.comments || 0}</span></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div ref={sentinelRef} className="h-4" aria-hidden="true" />
          {isFetchingNextPage && <div className="flex justify-center py-8"><Loader size="md" /></div>}
        </>
      )}
    </div>
  );
}
