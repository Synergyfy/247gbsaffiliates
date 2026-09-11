import { Suspense } from 'react';
import { LoginClient } from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex bg-white font-display">
        <div className="w-full lg:w-1/2 flex flex-col items-center p-8 md:p-16 lg:p-24 overflow-y-auto">
          <div className="w-full max-w-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary font-medium">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}