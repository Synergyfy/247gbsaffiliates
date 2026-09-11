'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SsoLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const token = searchParams.get('token');

    if (token) {
      // The server already verified the JWT and set cookies during the redirect.
      // Store the local session token and redirect to dashboard.
      localStorage.setItem('auth_token', token);

      // Decode token to get role
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || 'agent';
        router.push(`/dashboard/${role.replace('_', '-')}`);
      } catch {
        router.push('/dashboard/agent');
      }
    } else {
      router.push('/login?error=sso_missing_token');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary font-medium">Completing SSO login...</p>
      </div>
    </div>
  );
}