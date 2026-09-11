'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/apiClient';

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const error = searchParams.get('error');

    // Error from server
    if (error) {
      router.push(`/login?error=${error}`);
      return;
    }

    // Direct Handshake flow — API already verified JWT and issued local token
    if (token && role) {
      localStorage.setItem('auth_token', token);
      router.push(`/dashboard/${role.replace('_', '-')}`);
      return;
    }

    // OAuth flow — redirect browser to backend callback (cookie-based state validation)
    if (code && state) {
      const backendUrl = apiClient.defaults.baseURL;
      window.location.href = `${backendUrl}/auth/sso/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
      return;
    }

    // No params — redirect to login
    router.push('/login');
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}