'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, type RegisterInput } from '@/lib/validators/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setError('root', { message: body.error });
        return;
      }
      setEmail(data.email);
      setSuccess(true);
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  };

  if (success) {
    return (
      <Card>
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-[#525252] dark:text-[#a3a3a3] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#0a0a0a] dark:text-[#fafafa] mb-2">
            Check your inbox
          </h2>
          <p className="text-sm text-[#525252] dark:text-[#a3a3a3] mb-1">
            We&apos;ve sent a verification link to
          </p>
          <p className="text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa] mb-6">{email}</p>
          <p className="text-xs text-[#a3a3a3]">
            Didn&apos;t receive it? Check your spam folder.
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-[#525252] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">
            Back to sign in
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold tracking-tight text-[#0a0a0a] dark:text-[#fafafa] mb-1">
        Create account
      </h2>
      <p className="text-sm text-[#a3a3a3] mb-6">Join TG FUN HUB today</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="register-username"
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="yourhandle"
          hint="3–20 characters. Letters, numbers, and underscores only."
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          id="register-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="Min 8 characters, one uppercase, one number."
          error={errors.password?.message}
          {...register('password')}
        />

        {errors.root && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg" role="alert">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting} id="register-submit">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#a3a3a3]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#0a0a0a] dark:text-[#fafafa] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
