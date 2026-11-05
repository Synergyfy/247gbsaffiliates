import { Suspense } from 'react';
import { SsoLoginClient } from './SsoLoginClient';

export default function SsoLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary font-medium">Completing SSO login...</p>
        </div>
      </div>
    }>
      <SsoLoginClient />
    </Suspense>
  );
}