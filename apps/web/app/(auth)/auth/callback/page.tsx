'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { mcomService } from '@/services/mcom';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const error = searchParams.get('error');

    // Direct Handshake flow (token from Central dashboard)
    if (token && role) {
      try {
        const response = mcomService.completeHandshake(token);
        // The server redirects, but if we get here store the token
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
        router.push(`/dashboard/${role.replace('_', '-')}`);
        return;
      } catch (err) {
        console.error('SSO handshake failed', err);
        router.push('/login?error=sso_failed');
        return;
      }
    }

    // OAuth flow
    if (code && state) {
      mcomService
        .completeLogin(code, state)
        .then((data) => {
          if (data.token && data.user) {
            setAuth(data.user, data.token);
            if (data.return_to) {
              router.push(data.return_to);
            } else if (data.user.role) {
              router.push(
                `/dashboard/${data.user.role.toLowerCase().replace('_', '-')}`,
              );
            } else {
              router.push('/dashboard/agent');
            }
          } else {
            router.push('/login?error=sso_no_token');
          }
        })
        .catch((err) => {
          console.error('SSO callback failed', err);
          router.push('/login?error=sso_callback_failed');
        });
      return;
    }

    // Error from server
    if (error) {
      router.push(`/login?error=${error}`);
      return;
    }

    // No params — redirect to login
    router.push('/login');
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}
