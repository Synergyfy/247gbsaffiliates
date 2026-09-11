'use client'
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthSidebar from "@/components/auth/AuthSidebar";
import AuthInput from "@/components/auth/AuthInput";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { mcomService } from "@/services/mcom";

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signup, isSigningUp } = useAuth();
    const [role, setRole] = useState<UserRole>('agent');
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        const roleParam = searchParams.get("role");
        if (roleParam) {
            const mappedRole = roleParam === 'account-manager' ? 'account_manager' : roleParam;
            if (['agent', 'account_manager', 'consultant'].includes(mappedRole)) {
                setRole(mappedRole as UserRole);
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);
        const formData = new FormData(e.currentTarget);
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await signup({ email, password, firstName, lastName, role });
        } catch (error: any) {
            console.error("Signup failed", error);
            if (error.response?.status === 409) {
                setFormError("This email is already registered. Please sign in or use a different email.");
            } else if (!error.response) {
                setFormError("Cannot connect to server. Please make sure the backend is running on port 3012.");
            } else {
                setFormError(error.response?.data?.message || `Signup failed (${error.response?.status}). Please try again.`);
            }
        }
    };

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
                        <p className="text-text-secondary font-medium">Join thousands of professionals on the leading commerce marketplace.</p>
                    </div>

                    <div className="flex flex-col gap-4 mb-8">
                        <button
                            onClick={async () => {
                                setFormError(null);
                                try {
                                    await mcomService.startLogin();
                                } catch (err: any) {
                                    setFormError(err.message || 'Failed to connect to MCOM Solutions. Please try again.');
                                }
                            }}
                            className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-text-main shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                            </svg>
                            Sign up with MCOM Solutions
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs tracking-widest font-bold uppercase">
                            <span className="px-4 bg-white text-slate-400 font-display">Or continue with email</span>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {formError && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                                {formError}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <AuthInput
                                id="firstName"
                                name="firstName"
                                label="First Name"
                                type="text"
                                placeholder="John"
                                required
                            />
                            <AuthInput
                                id="lastName"
                                name="lastName"
                                label="Last Name"
                                type="text"
                                placeholder="Doe"
                                required
                            />
                        </div>

                        <AuthInput
                            id="email"
                            name="email"
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            icon="mail"
                            required
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-xl">lock</span>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary bg-white text-text-main placeholder-gray-400 transition-all outline-none font-medium"
                                    placeholder="••••••••"
                                    type="password"
                                    required
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main" type="button">
                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider ml-1 font-display">Must be at least 8 characters with one special symbol.</p>
                        </div>

                        <div className="flex items-start gap-3 py-2">
                            <input
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                                id="terms"
                                type="checkbox"
                                required
                            />
                            <label className="text-sm text-text-secondary font-medium leading-relaxed" htmlFor="terms">
                                I agree to the <Link className="text-text-main font-bold hover:text-primary underline decoration-primary/20" href="#">Terms of Service</Link> and <Link className="text-text-main font-bold hover:text-primary underline decoration-primary/20" href="#">Privacy Policy</Link>.
                            </label>
                        </div>

                        <button
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-2xl shadow-primary/20 transition-all duration-300 transform active:scale-[0.98] tracking-widest font-display disabled:opacity-50"
                            type="submit"
                            disabled={isSigningUp}
                        >
                            {isSigningUp ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-text-secondary font-medium">
                            Already have an account?{" "}
                            <Link className="text-primary font-bold hover:underline underline-offset-4 decoration-2" href="/login">Sign in here</Link>
                        </p>
                    </div>

                    <p className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest font-display">
                        © {new Date().getFullYear()} 247gbs affiliate professional marketplace
                    </p>
                </div>
            </div>
        </div>
    );
}
