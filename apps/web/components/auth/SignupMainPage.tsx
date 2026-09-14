'use client'
import Link from "next/link";
import { useState } from "react";
import AuthSidebar from "@/components/auth/AuthSidebar";
import { mcomService } from "@/services/mcom";

export default function SignupPage() {
    const [formError, setFormError] = useState<string | null>(null);

    return (
        <div className="min-h-screen flex bg-white font-display">
            <AuthSidebar
                title="Scale your professional services with confidence."
                imageSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026&auto=format&fit=crop"
                description=""
                features={[
                    "Access to a network of high-value corporate clients.",
                    "Advanced project management & analytics dashboard.",
                    "Secure payment automation and contract tracking."
                ]}
            />

            <div className="w-full lg:w-1/2 flex flex-col items-center p-8 md:p-16 lg:p-24 bg-white overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="text-primary size-8">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-text-main font-display">247gbs affiliate</span>
                    </div>

                    <div className="mb-8">
                        <Link className="inline-flex items-center text-primary text-sm font-bold hover:underline transition-all duration-200 tracking-widest gap-2 group font-display" href="/">
                            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Back to Home
                        </Link>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-3xl font-bold tracking-tight text-text-main mb-3 font-display">Create an account</h1>
                        <p className="text-text-secondary font-medium">Sign up with your Central Hub Solutions account to get started.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {formError && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                                {formError}
                            </div>
                        )}
                        <button
                            onClick={async () => {
                                setFormError(null);
                                try {
                                    await mcomService.startLogin();
                                } catch (err: unknown) {
                                    setFormError(err instanceof Error ? err.message : 'Failed to connect to Central Hub Solutions. Please try again.');
                                }
                            }}
                            className="flex items-center justify-center gap-3 w-full py-4 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-text-main shadow-sm text-lg"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                            </svg>
                            Sign in with Central Hub Solutions
                        </button>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-text-secondary font-medium">
                            Already have an account?{" "}
                            <Link className="text-primary font-bold hover:underline underline-offset-4 decoration-2" href="/login">Sign in here</Link>
                        </p>
                    </div>

                    <p className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest font-display">
                        &copy; {new Date().getFullYear()} 247gbs affiliate professional marketplace
                    </p>
                </div>
            </div>
        </div>
    );
}
