'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/signup', { email });
      toast.success('OTP sent to your email!');
      // Store email in localStorage to use in verify page
      localStorage.setItem('tempEmail', email);
      router.push('/verify');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-center mb-2">InstaAuth</h1>
      <p className="text-gray-500 text-center mb-8">Sign up to see photos and videos from your friends.</p>
      
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Sending OTP...' : 'Next'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm">
          Have an account?{' '}
          <Link href="/login" className="text-blue-500 font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
