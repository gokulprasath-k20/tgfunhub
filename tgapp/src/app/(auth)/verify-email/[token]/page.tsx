'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
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
  }, [token, router]);

  return (
    <Card>
      <div className="text-center py-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-[#a3a3a3] mx-auto mb-4 animate-spin" />
            <p className="text-sm text-[#525252] dark:text-[#a3a3a3]">Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-[#525252] dark:text-[#a3a3a3] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#0a0a0a] dark:text-[#fafafa] mb-2">
              Email verified!
            </h2>
            <p className="text-sm text-[#525252] dark:text-[#a3a3a3] mb-4">{message}</p>
            <p className="text-xs text-[#a3a3a3]">Redirecting to login…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#0a0a0a] dark:text-[#fafafa] mb-2">
              Verification failed
            </h2>
            <p className="text-sm text-[#525252] dark:text-[#a3a3a3] mb-6">{message}</p>
            <Link href="/login">
              <Button variant="secondary" className="w-full">Back to login</Button>
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}
