'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/apiClient';

export function SsoLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const complete = async () => {
      const token = searchParams.get('token');
      if (!token) {
        router.push('/login?error=sso_missing_token');
        return;
      }

      try {
        const profile = await apiClient.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawRole = (profile.data?.role ?? 'agent') as string;
        const role = rawRole.toLowerCase().replace('_', '-');
        setAuth(
          {
            id: profile.data?.userId ?? '',
            email: profile.data?.email ?? '',
            name: profile.data?.email ?? '',
            role: rawRole as never,
            isOnboarded: profile.data?.isOnboarded,
          },
          token,
        );
        router.push(`/dashboard/${role}`);
      } catch {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = (payload.role || 'agent') as string;
          setAuth(
            {
              id: payload.sub ?? '',
              email: payload.email ?? '',
              name: payload.email ?? '',
              role: role as never,
              isOnboarded: payload.isOnboarded,
            },
            token,
          );
          router.push(`/dashboard/${role.replace('_', '-')}`);
        } catch {
          localStorage.setItem('auth_token', token);
          router.push('/dashboard/agent');
        }
      }
    };

    complete();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary font-medium">Completing sign in…</p>
      </div>
    </div>
  );
}
