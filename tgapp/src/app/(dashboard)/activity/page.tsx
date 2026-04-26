'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, UserPlus, Check, X, Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader } from '@/components/shared/Loader';
import toast from 'react-hot-toast';

async function fetchRequests() {
  const res = await fetch('/api/users/follow-requests');
  if (!res.ok) throw new Error('Failed to fetch requests');
  return res.json();
}

export default function ActivityPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['followRequests'],
    queryFn: fetchRequests,
  });

  const requestsMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string, action: 'accept' | 'decline' }) => {
      const res = await fetch('/api/users/follow-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
      toast.success('Action completed');
    }
  });

  const requests = data?.requests || [];

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Activity</h1>
      </div>

      <div className="space-y-6">
        {requests.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-[#737373] uppercase tracking-wider mb-4">Follow Requests</h2>
            <div className="space-y-4">
              {requests.map((req: any) => (
                <div key={req._id} className="flex items-center justify-between gap-4 p-2">
                  <Link href={`/profile/${req.followerId.username}`} className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-[#e5e5e5] dark:bg-[#262626]">
                      {req.followerId.profileImage ? (
                        <Image src={req.followerId.profileImage} alt={req.followerId.username} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[#a3a3a3]">
                          {req.followerId.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="font-bold">{req.followerId.username}</span>
                      <span className="text-[#737373] ml-1">requested to follow you.</span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => requestsMutation.mutate({ requestId: req._id, action: 'accept' })}
                      className="p-2 bg-[#0095f6] hover:bg-[#1877f2] text-white rounded-lg transition-colors"
                      title="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => requestsMutation.mutate({ requestId: req._id, action: 'decline' })}
                      className="p-2 bg-[#efefef] dark:bg-[#262626] hover:bg-[#e5e5e5] rounded-lg transition-colors"
                      title="Decline"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader size="md" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-[#737373]">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No recent activity yet.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
