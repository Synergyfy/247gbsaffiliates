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
  if (r === 'account_manager') return 'account_manager';
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

    const complete = async () => {
      const error = searchParams.get('error');
      if (error) {
        router.push(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      const token = searchParams.get('token');
      const roleParam = searchParams.get('role');

      // Backend (proper flow) redirects here with token+role.
      if (token) {
        try {
          // Hydrate the store so dashboard guards see an authenticated user.
          const profile = await apiClient.get('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const rawRole = roleParam ?? profile.data?.role;
          const role = sanitizeRole(rawRole);
          if (!role) {
            router.push('/login?error=sso_unauthorized_role');
            return;
          }
          setAuth(
            {
              id: profile.data?.userId ?? profile.data?.sub ?? '',
              email: profile.data?.email ?? '',
              name: profile.data?.email ?? '',
              role,
              isOnboarded: profile.data?.isOnboarded,
            },
            token,
          );
          router.push(`/dashboard/${role.replace('_', '-')}`);
        } catch {
          // Profile fetch failed (e.g. clock skew) — parse token payload
          let role = sanitizeRole(roleParam);
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            role = sanitizeRole(payload.role ?? role);
            if (!role) {
              router.push('/login?error=sso_unauthorized_role');
              return;
            }
            setAuth(
              {
                id: payload.sub ?? '',
                email: payload.email ?? '',
                name: payload.email ?? '',
                role,
                isOnboarded: payload.isOnboarded,
              },
              token,
            );
          } catch {
            if (!role) {
              router.push('/login?error=sso_unauthorized_role');
              return;
            }
            localStorage.setItem('auth_token', token);
          }
          router.push(`/dashboard/${role.replace('_', '-')}`);
        }
        return;
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
