'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    
    // Simulate a slightly longer loading for smooth transition
    const timer = setTimeout(() => {
      fetch(`/api/auth/verify-email/${token}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            setStatus('error');
            setMessage(data.error);
          } else {
            setStatus('success');
            setMessage(data.message);
            setTimeout(() => router.push('/login'), 3000);
          }
        })
        .catch(() => {
          setStatus('error');
          setMessage('Something went wrong. Please try again.');
        });
    }, 800);

    return () => clearTimeout(timer);
  }, [token, router]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="relative overflow-hidden border-[#e5e5e5]/50 dark:border-[#2a2a2a]/50 backdrop-blur-xl bg-white/80 dark:bg-[#0a0a0a]/80 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#a3a3a3]/20 to-transparent" />
          
          <div className="text-center py-8 px-4">
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 blur-2xl bg-[#a3a3a3]/20 rounded-full" />
                  <Loader2 className="w-12 h-12 text-[#0a0a0a] dark:text-[#fafafa] relative animate-spin-slow" />
                </div>
                <h2 className="text-xl font-semibold text-[#0a0a0a] dark:text-[#fafafa] mb-2 tracking-tight">
                  Verifying Identity
                </h2>
                <p className="text-sm text-[#525252] dark:text-[#a3a3a3] max-w-[240px] mx-auto leading-relaxed">
                  We're confirming your credentials. This won't take long.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-6"
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-[#0a0a0a] dark:text-[#fafafa] mb-2 tracking-tight">
                  Email Verified
                </h2>
                <p className="text-sm text-[#525252] dark:text-[#a3a3a3] mb-8 max-w-[260px] mx-auto leading-relaxed">
                  {message || "Your account is now active and ready to use."}
                </p>
                
                <div className="w-full space-y-4">
                  <Link href="/login" className="block w-full">
                    <Button variant="primary" className="w-full group">
                      Continue to Login
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <p className="text-[10px] uppercase tracking-widest text-[#a3a3a3] font-medium">
                    Redirecting automatically...
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-6"
                >
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-[#0a0a0a] dark:text-[#fafafa] mb-2 tracking-tight">
                  Verification Failed
                </h2>
                <p className="text-sm text-[#525252] dark:text-[#a3a3a3] mb-8 max-w-[260px] mx-auto leading-relaxed">
                  {message || "The verification link is invalid or has expired."}
                </p>
                
                <div className="w-full grid grid-cols-1 gap-3">
                  <Link href="/login">
                    <Button variant="primary" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="secondary" className="w-full">
                      Resend Link
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

