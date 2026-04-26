'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, UserPlus, UserCheck, UserX, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';

async function searchUsers(query: string) {
  if (query.length < 2) return { users: [] };
  const res = await fetch(`/api/users/search?q=${query}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 2,
  });

  const users = data?.users || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
        <input
          type="text"
          placeholder="Search people..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#f0f0f0] dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-[#0a0a0a] dark:focus:ring-[#fafafa] outline-none transition-all text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-2">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))
        ) : query.length < 2 ? (
          <div className="text-center py-20 text-[#737373]">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Search for friends and creators</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-[#737373]">
            <p>No people found matching &quot;{query}&quot;</p>
          </div>
        ) : (
          users.map((user: any) => (
            <div key={user._id} className="flex items-center justify-between p-2 hover:bg-[#f9f9f9] dark:hover:bg-[#111111] rounded-xl transition-colors group">
              <Link href={`/profile/${user.username}`} className="flex items-center gap-4 flex-1">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#e5e5e5] dark:bg-[#262626]">
                  {user.profileImage ? (
                    <Image src={user.profileImage} alt={user.username} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#a3a3a3]">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm">{user.username}</p>
                  <p className="text-xs text-[#737373] line-clamp-1">{user.bio || 'Social Explorer'}</p>
                </div>
              </Link>
              
              <Link href={`/profile/${user.username}`} className="px-4 py-2 bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-bold rounded-lg transition-colors">
                View Profile
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
