'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema, type ResetPasswordInput } from '@/lib/validators/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(ResetPasswordSchema) });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      const res = await fetch(`/api/auth/reset-password?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setError('root', { message: body.error });
        return;
      }
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      setError('root', { message: 'Something went wrong.' });
    }
  };

  if (done) {
    return (
      <Card>
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-[#525252] dark:text-[#a3a3a3] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#0a0a0a] dark:text-[#fafafa] mb-2">Password reset!</h2>
          <p className="text-sm text-[#525252] dark:text-[#a3a3a3]">Redirecting to sign in…</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold tracking-tight text-[#0a0a0a] dark:text-[#fafafa] mb-1">Reset password</h2>
      <p className="text-sm text-[#a3a3a3] mb-6">Choose a strong new password</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="reset-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="Min 8 characters, one uppercase, one number."
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          id="reset-confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        {errors.root && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg" role="alert">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#a3a3a3]">
        <Link href="/login" className="text-[#0a0a0a] dark:text-[#fafafa] font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
