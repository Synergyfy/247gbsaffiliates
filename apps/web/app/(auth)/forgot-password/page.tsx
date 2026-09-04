"use client";

import Link from "next/link";
import AuthSidebar from "@/components/auth/AuthSidebar";
import AuthInput from "@/components/auth/AuthInput";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex bg-white font-display">
            <AuthSidebar
                title="Reclaim your professional workspace."
                description="Join thousands of businesses managing their services with our professional marketplace platform. We've got your back."
                imageSrc="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
            />

            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-md flex flex-col">
                    <div className="mb-12">
                        <Link className="inline-flex items-center text-primary text-sm font-bold hover:underline transition-all duration-200 tracking-widest gap-2 group font-display" href="/login">
                            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Back to Login
                        </Link>
                    </div>

                    <div className="mb-12">
                        <h1 className="text-text-main text-3xl font-bold tracking-tight mb-4 font-display">Forgot Password?</h1>
                        <p className="text-text-secondary text-lg font-medium leading-relaxed">
                            No worries, it happens. Enter your email address and we will send you a secure link to reset your access.
                        </p>
                    </div>

                    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                        <AuthInput
                            id="email"
                            label="Email Address"
                            type="email"
                            placeholder="e.g. alex@example.com"
                            icon="mail"
                            required
                        />

                        <button
                            className="w-full flex items-center justify-center bg-primary hover:bg-primary-hover text-white py-5 px-6 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/20 transition-all duration-200 transform active:scale-[0.98] tracking-widest group font-display"
                            type="submit"
                        >
                            <span>Send Reset Link</span>
                            <span className="material-symbols-outlined ml-3 text-2xl group-hover:translate-x-1 transition-transform">send</span>
                        </button>
                    </form>

                    <div className="mt-16 text-center">
                        <p className="text-base text-text-secondary font-medium">
                            Still having trouble?{" "}
                            <Link className="text-primary font-bold hover:underline underline-offset-4 decoration-2" href="/support">Contact Support</Link>
                        </p>
                    </div>

                    <div className="lg:hidden mt-auto pt-16 flex justify-center">
                        <div className="flex items-center gap-3 text-text-main">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-white text-2xl">rocket_launch</span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight font-display">Mcommall</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
