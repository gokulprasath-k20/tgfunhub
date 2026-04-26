'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProfileSchema, type UpdateProfileInput } from '@/lib/validators/user';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import type { IUser } from '@/types/user';

async function fetchMyProfile(): Promise<IUser> {
  const res = await fetch('/api/users/profile');
  if (!res.ok) throw new Error('Failed to fetch profile');
  const data = await res.json();
  return data.user as IUser;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: fetchMyProfile,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileInput>({ resolver: zodResolver(UpdateProfileSchema) });

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username,
        bio: profile.bio,
        isPrivate: profile.isPrivate,
      });
    }
  }, [profile, reset]);

  const bioValue = watch('bio') ?? '';

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['my-profile'] });
      qc.invalidateQueries({ queryKey: ['profile', data.user.username] });
      if (user) {
        setUser({ ...user, username: data.user.username, profileImage: data.user.profileImage });
      }
      toast.success('Profile updated!');
      router.push(`/profile/${data.user.username}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleAvatarUpload = async (url: string) => {
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileImage: url }),
    });
    if (res.ok && user) {
      setUser({ ...user, profileImage: url });
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold text-[#0a0a0a] dark:text-[#fafafa] tracking-tight">Edit Profile</h1>

      {/* Avatar */}
      <Card>
        <div className="flex items-center gap-4">
          <ImageUpload
            currentImage={profile?.profileImage}
            onUpload={handleAvatarUpload}
            size={72}
          />
          <div>
            <p className="text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa]">Profile photo</p>
            <p className="text-xs text-[#a3a3a3] mt-0.5">JPEG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
      </Card>

      {/* Profile form */}
      <Card>
        <form onSubmit={handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
          <Input
            id="edit-username"
            label="Username"
            hint="3–20 characters, letters/numbers/underscores only"
            error={errors.username?.message}
            {...register('username')}
          />
          <Textarea
            id="edit-bio"
            label="Bio"
            value={bioValue}
            showCount
            maxLength={160}
            error={errors.bio?.message}
            placeholder="Tell people about yourself…"
            {...register('bio')}
          />

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa]">Private account</p>
              <p className="text-xs text-[#a3a3a3] mt-0.5">Only you can see your posts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register('isPrivate')}
              />
              <div className="w-9 h-5 bg-[#e5e5e5] dark:bg-[#2a2a2a] peer-checked:bg-[#0a0a0a] dark:peer-checked:bg-[#fafafa] rounded-full transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:dark:bg-[#0a0a0a] after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || updateProfile.isPending}
              disabled={!isDirty && !updateProfile.isPending}
            >
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
