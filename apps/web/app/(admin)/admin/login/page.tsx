'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      // Backend enforces admin-only; 403 otherwise.
      const token: string = data.access_token;
      // Hydrate the store with the full profile (JWT validate drops fields).
      try {
        const profile = await apiClient.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = {
          id: profile.data.userId ?? profile.data.sub ?? '',
          email: profile.data.email ?? email,
          name: profile.data.email ?? email,
          role: 'admin' as const,
          isOnboarded: true,
        };
        setAuth(user, token);
      } catch {
        setAuth(
          { id: '', email, name: email, role: 'admin' as const, isOnboarded: true },
          token,
        );
      }
      router.push('/dashboard/admin');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        setError(
          status === 403
            ? 'Local login is restricted to admins. Please sign in with Central Hub Solutions.'
            : (err.response?.data?.message as string) ||
                'Invalid email or password.',
        );
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
      <div className="bg-surface-light border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <div className="absolute top-4 left-4">
          <Link
            className="inline-flex items-center text-text-secondary hover:text-primary text-xs font-bold transition-all gap-1"
            href="/"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Home
          </Link>
        </div>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-text-main tracking-tight mb-2">
            Admin Portal
          </h1>
          <p className="text-text-secondary">
            Admin local sign in — everyone else uses Central Hub Solutions
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-text-main mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background-light border-transparent focus:bg-surface-light focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-text-main mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background-light border-transparent focus:bg-surface-light focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-text-secondary font-medium">
            Protected area. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
