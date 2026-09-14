'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AuthSidebar from "@/components/auth/AuthSidebar";
import { mcomService } from "@/services/mcom";

const ERROR_MESSAGES: Record<string, string> = {
  no_access: "Your account doesn't have an active subscription for this platform. Please purchase a package to continue.",
  sso_callback_failed: "SSO login failed. Please try again.",
  sso_no_token: "Authentication completed but no token was received. Please try again.",
  sso_missing_token: "SSO login failed. Please try again.",
  sso_state_mismatch: "SSO login failed due to security mismatch. Please try again.",
  sso_exchange_failed: "SSO login failed during token exchange. Please try again.",
};

export function LoginClient() {
    const searchParams = useSearchParams();
    const [mcomError, setMcomError] = useState<string | null>(null);

    useEffect(() => {
      const error = searchParams.get('error');
      if (error && ERROR_MESSAGES[error]) {
        setMcomError(ERROR_MESSAGES[error]);
      }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex bg-white font-display">
            <AuthSidebar
                title="Elevate your professional presence in the marketplace."
                description="Join thousands of specialists who trust Mcommall for their business operations and community growth."
                imageSrc="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
            />

            <div className="w-full lg:w-1/2 flex flex-col items-center p-8 md:p-16 lg:p-24 overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-10 flex items-center gap-3">
                        <div className="text-primary size-8">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-text-main tracking-tight font-display">247gbs affiliate</span>
                    </div>

                    <div className="mb-8">
                        <Link className="inline-flex items-center text-primary text-sm font-bold hover:underline transition-all duration-200 tracking-widest gap-2 group font-display" href="/">
                            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Back to Home
                        </Link>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-text-main mb-3 leading-tight tracking-tight font-display">Welcome back</h1>
                        <p className="text-text-secondary font-medium">Sign in with your MCOM Solutions account to continue.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {mcomError && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                                {mcomError}
                            </div>
                        )}
                        <button
                            onClick={async () => {
                                setMcomError(null);
                                try {
                                    await mcomService.startLogin();
                                } catch (err: any) {
                                    setMcomError(err.message || 'Failed to connect to MCOM Solutions. Please try again.');
                                }
                            }}
                            className="flex items-center justify-center gap-3 w-full py-4 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-text-main shadow-sm text-lg"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                            </svg>
                            Sign in with MCOM Solutions
                        </button>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-text-secondary text-sm font-medium">
                            Don&apos;t have an account?{" "}
                            <a href="https://centralhubsolution.com/register/affiliate" className="text-primary font-bold hover:underline underline-offset-4 decoration-2">
                                Create an account
                            </a>
                        </p>
                    </div>

                    <p className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest font-display">
                        &copy; 2026 247gbs affiliate professional marketplace
                    </p>
                </div>
            </div>
        </div>
    );
}
