"use client";

import Link from "next/link";
import AuthSidebar from "@/components/auth/AuthSidebar";
import AuthInput from "@/components/auth/AuthInput";

export default function LoginPage() {
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
                        <span className="text-2xl font-bold text-text-main tracking-tight font-display">Mcommall</span>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-text-main mb-3 leading-tight tracking-tight font-display">Welcome back</h1>
                        <p className="text-text-secondary font-medium">Enter your credentials to access your professional account.</p>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <AuthInput
                            id="email"
                            label="Email Address"
                            type="email"
                            placeholder="name@company.com"
                            icon="mail"
                            required
                        />

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-semibold text-text-main uppercase tracking-wider font-display" htmlFor="password">
                                    Password
                                </label>
                                <Link href="/forgot-password" size-sm className="text-xs font-bold text-primary hover:underline underline-offset-4 transition-all">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-xl">lock</span>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary bg-white text-text-main placeholder-gray-400 transition-all outline-none font-medium"
                                    required
                                />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main transition-colors">
                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="remember"
                                type="checkbox"
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 accent-primary"
                            />
                            <label htmlFor="remember" className="text-sm font-semibold text-text-secondary cursor-pointer">
                                Keep me logged in
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group active:scale-[0.98] tracking-widest font-display"
                        >
                            Sign In
                            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold font-display">
                            <span className="bg-white px-4 text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-text-main shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-text-main shadow-sm">
                            <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                            </svg>
                            Facebook
                        </button>
                    </div>

                    <p className="mt-10 text-center text-text-secondary text-sm font-medium">
                        Don't have an account?{" "}
                        <Link href="/role-selection" className="text-primary font-bold hover:underline underline-offset-4 decoration-2">
                            Create an account
                        </Link>
                    </p>

                    <p className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest font-display">
                        © 2026 mcommall professional marketplace
                    </p>
                </div>
            </div>
        </div>
    );
}
