'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      router.push('/login');
    } else {
      setToken(savedToken);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!token) return null;

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6" />
          Welcome to Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
      
      <div className="p-12 border-2 border-dashed border-gray-100 rounded-3xl text-center">
        <p className="text-gray-400">Your secure content goes here.</p>
      </div>
    </div>
  );
}
