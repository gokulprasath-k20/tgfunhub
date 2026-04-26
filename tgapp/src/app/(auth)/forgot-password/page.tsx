'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(ForgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setError('root', { message: body.error });
        return;
      }
      setSent(true);
    } catch {
      setError('root', { message: 'Something went wrong.' });
    }
  };

  if (sent) {
    return (
      <Card>
        <div className="text-center py-4">
          <Mail className="w-12 h-12 text-[#525252] dark:text-[#a3a3a3] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#0a0a0a] dark:text-[#fafafa] mb-2">Check your email</h2>
          <p className="text-sm text-[#525252] dark:text-[#a3a3a3]">
            If <strong>{getValues('email')}</strong> is registered, you&apos;ll receive a reset link shortly.
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-[#525252] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">
            Back to sign in
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold tracking-tight text-[#0a0a0a] dark:text-[#fafafa] mb-1">Forgot password?</h2>
      <p className="text-sm text-[#a3a3a3] mb-6">Enter your email to receive a reset link</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="forgot-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        {errors.root && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg" role="alert">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Send reset link
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
