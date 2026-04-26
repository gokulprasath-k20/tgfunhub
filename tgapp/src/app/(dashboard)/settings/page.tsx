'use client';

import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ChangePasswordSchema, type ChangePasswordInput } from '@/lib/validators/auth';
import toast from 'react-hot-toast';
import type { IUser } from '@/types/user';

async function fetchMyProfile(): Promise<IUser> {
  const res = await fetch('/api/users/profile');
  if (!res.ok) throw new Error('Failed to load');
  const data = await res.json();
  return data.user as IUser;
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-[#0a0a0a] dark:text-[#fafafa]">{title}</h2>
      {description && (
        <p className="text-sm text-[#a3a3a3] dark:text-[#525252] mt-0.5">{description}</p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { data: profile } = useQuery({ queryKey: ['my-profile'], queryFn: fetchMyProfile });

  const {
    register: registerPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: isPwdSubmitting },
    setError: setPwdError,
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(ChangePasswordSchema) });

  const changePassword = async (data: ChangePasswordInput) => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setPwdError('root', { message: body.error });
        return;
      }
      resetPwd();
      toast.success('Password changed successfully');
    } catch {
      setPwdError('root', { message: 'Something went wrong' });
    }
  };

  const toggleEmailNotifications = async (checked: boolean) => {
    await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: { emailNotifications: checked } }),
    });
    if (user) setUser({ ...user });
    toast.success(checked ? 'Email notifications enabled' : 'Email notifications disabled');
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <h1 className="text-xl font-bold text-[#0a0a0a] dark:text-[#fafafa] tracking-tight">Settings</h1>

      {/* Appearance */}
      <section aria-labelledby="appearance-heading">
        <Card>
          <SectionHeader
            title="Appearance"
            description="Choose your preferred color theme"
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa]">Theme</p>
              <p className="text-xs text-[#a3a3a3] mt-0.5">Light, dark, or follow system</p>
            </div>
            <ThemeToggle />
          </div>
        </Card>
      </section>

      {/* Notifications */}
      <section aria-labelledby="notifications-heading">
        <Card>
          <SectionHeader title="Notifications" description="Control how you receive updates" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa]">Email notifications</p>
              <p className="text-xs text-[#a3a3a3] mt-0.5">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked={profile?.preferences?.emailNotifications ?? true}
                onChange={(e) => toggleEmailNotifications(e.target.checked)}
              />
              <div className="w-9 h-5 bg-[#e5e5e5] dark:bg-[#2a2a2a] peer-checked:bg-[#0a0a0a] dark:peer-checked:bg-[#fafafa] rounded-full transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:dark:bg-[#0a0a0a] after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
            </label>
          </div>
        </Card>
      </section>

      {/* Security / Change password */}
      <section aria-labelledby="security-heading">
        <Card>
          <SectionHeader title="Security" description="Manage your account password" />
          <form onSubmit={handlePwd(changePassword)} className="space-y-4" noValidate>
            <Input
              id="settings-current-password"
              label="Current password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={pwdErrors.currentPassword?.message}
              {...registerPwd('currentPassword')}
            />
            <Input
              id="settings-new-password"
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              hint="Min 8 characters, one uppercase, one number."
              error={pwdErrors.newPassword?.message}
              {...registerPwd('newPassword')}
            />
            <Input
              id="settings-confirm-password"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={pwdErrors.confirmPassword?.message}
              {...registerPwd('confirmPassword')}
            />
            {pwdErrors.root && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg" role="alert">
                {pwdErrors.root.message}
              </p>
            )}
            <Button type="submit" isLoading={isPwdSubmitting}>
              Change password
            </Button>
          </form>
        </Card>
      </section>

      {/* Account info */}
      <section>
        <Card>
          <SectionHeader title="Account" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-[#525252] dark:text-[#a3a3a3]">Email</span>
              <span className="text-[#0a0a0a] dark:text-[#fafafa] font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#525252] dark:text-[#a3a3a3]">Username</span>
              <span className="text-[#0a0a0a] dark:text-[#fafafa] font-medium">@{user?.username}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#525252] dark:text-[#a3a3a3]">Email verified</span>
              <span className={user?.emailVerified ? 'text-[#525252] dark:text-[#a3a3a3] text-xs' : 'text-red-500 text-xs'}>
                {user?.emailVerified ? '✓ Verified' : 'Not verified'}
              </span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
