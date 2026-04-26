'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function Verify() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem('tempEmail');
    if (!savedEmail) {
      router.push('/signup');
    } else {
      setEmail(savedEmail);
    }
  }, [router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/verify', { email, otp, username, password });
      toast.success(res.data.message);
      localStorage.setItem('token', res.data.token);
      localStorage.removeItem('tempEmail');
      router.push('/dashboard'); // or wherever
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-center mb-2">Verify & Create Account</h1>
      <p className="text-gray-500 text-center mb-8 text-sm">Enter the code sent to {email}</p>
      
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          placeholder="6-digit OTP"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating Account...' : 'Complete Sign Up'}
        </button>
      </form>
    </div>
  );
}
