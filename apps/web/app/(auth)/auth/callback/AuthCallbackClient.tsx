'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/apiClient';
import type { UserRole } from '@/types/auth';

function sanitizeRole(role: string | null): UserRole | null {
  if (!role) return null;
  const r = role.toLowerCase().replace(/[\s-]+/g, '_');
  if (r === 'admin') return 'admin';
  if (r === 'account_manager' || r === 'accountmanager') return 'account_manager';
  if (r === 'consultant') return 'consultant';
  if (r === 'agent') return 'agent';
  return null;
}

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const firedRef = useRef(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    // Immediately scrub any legacy auth token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }

    const complete = async () => {
      const error = searchParams.get('error');
      if (error) {
        router.push(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      const roleParam = searchParams.get('role');
      const token = searchParams.get('token');

      // The backend sets the HttpOnly auth_token cookie and redirects here.
      // We fetch /auth/profile via apiClient (which sends the HttpOnly cookie via withCredentials: true).
      try {
        const profile = await apiClient.get('/auth/profile', token ? {
          headers: { Authorization: `Bearer ${token}` },
        } : undefined);

        const rawRole = roleParam ?? profile.data?.role;
        const role = sanitizeRole(rawRole);
        if (!role) {
          router.push('/login?error=sso_unauthorized_role');
          return;
        }

        const isOnboarded = Boolean(profile.data?.isOnboarded);
        setAuth({
          id: profile.data?.id ?? profile.data?.userId ?? profile.data?.sub ?? '',
          email: profile.data?.email ?? '',
          name: profile.data?.name ?? profile.data?.email ?? '',
          role,
          isOnboarded,
        });

        if (role !== 'admin' && !isOnboarded) {
          router.push('/onboarding');
        } else {
          router.push(`/dashboard/${role.replace('_', '-')}`);
        }
        return;
      } catch {
        // Fallback: If profile request failed but token param exists in URL
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = sanitizeRole(payload.role ?? roleParam);
            if (!role) {
              router.push('/login?error=sso_unauthorized_role');
              return;
            }
            const isOnboarded = Boolean(payload.isOnboarded);
            setAuth({
              id: payload.sub ?? '',
              email: payload.email ?? '',
              name: payload.email ?? '',
              role,
              isOnboarded,
            });
            if (role !== 'admin' && !isOnboarded) {
              router.push('/onboarding');
            } else {
              router.push(`/dashboard/${role.replace('_', '-')}`);
            }
            return;
          } catch {
            // ignore token parse error
          }
        }
      }

      // Legacy flow: Central redirected to the web app with code+state.
      // Forward to the API callback (state cookie is httpOnly, so the
      // browser must navigate there directly).
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      if (code && state) {
        const backendUrl = apiClient.defaults.baseURL;
        window.location.href = `${backendUrl}/auth/sso/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
        return;
      }

      router.push('/login');
    };

    complete().catch(() => {
      setStatusError('Completing sign in failed. Please try again.');
      router.push('/login?error=sso_callback_failed');
    });
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary font-medium">
          {statusError ?? 'Completing sign in…'}
        </p>
      </div>
    </div>
  );
}
