'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginInput } from '@/lib/validators/auth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import type { Metadata } from 'next';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      router.push('/feed');
      toast.success('Welcome back!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError('root', { message });
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold tracking-tight text-[#0a0a0a] dark:text-[#fafafa] mb-1">
        Sign in
      </h2>
      <p className="text-sm text-[#a3a3a3] mb-6">Enter your email and password to continue</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div>
          <Input
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-[#525252] dark:text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {errors.root && (
          <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg" role="alert">
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          id="login-submit"
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#a3a3a3]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#0a0a0a] dark:text-[#fafafa] font-medium hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}
