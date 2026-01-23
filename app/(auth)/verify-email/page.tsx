"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function VerifyEmailPage() {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (value.length === 1 && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white font-display">
            <div className="mb-12 flex items-center gap-3">
                <div className="text-primary size-8">
                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                    </svg>
                </div>
                <span className="text-2xl font-bold tracking-tight text-text-main font-display">Mcommall</span>
            </div>

            <div className="w-full max-w-md bg-white p-10 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-primary/5 text-center transition-all hover:shadow-primary/10">
                <div className="mb-10 flex justify-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group">
                        <span className="material-symbols-outlined text-primary text-5xl transition-transform group-hover:scale-110 group-hover:rotate-12">mark_email_unread</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-text-main mb-4 tracking-tight font-display">Check your inbox</h1>
                <p className="text-text-secondary font-medium mb-10 leading-relaxed">
                    We've sent a 6-digit verification code to <span className="text-text-main font-bold">alex@example.com</span>. <br />
                    <span className="text-primary text-xs font-bold uppercase tracking-widest mt-2 block">Demo Code: 1 2 3 4 5 6</span>
                </p>

                <form className="space-y-10">
                    <div className="flex justify-between gap-3 md:gap-4">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <input
                                key={i}
                                ref={(el) => { inputsRef.current[i] = el; }}
                                className="w-full h-16 md:h-20 text-center text-3xl font-bold border border-slate-100 rounded-2xl bg-slate-50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-display text-primary"
                                maxLength={1}
                                type="text"
                                onChange={(e) => handleInput(e, i)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                                placeholder="-"
                            />
                        ))}
                    </div>

                    <button
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-2xl shadow-primary/30 tracking-widest active:scale-[0.98] font-display"
                        type="button"
                    >
                        Verify Account
                    </button>
                </form>

                <div className="mt-10">
                    <p className="text-text-secondary font-medium text-sm">
                        Didn't receive the email?{" "}
                        <button className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all" type="button">
                            Resend code
                        </button>
                    </p>
                </div>
            </div>

            <div className="mt-16 text-center">
                <div className="flex items-center justify-center gap-8 mb-10 text-xs font-bold text-slate-400 uppercase tracking-widest font-display">
                    <Link className="hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
                    <Link className="hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
                    <Link className="hover:text-primary transition-colors" href="/contact">Support</Link>
                </div>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest font-display">
                    © 2026 mcommall professional marketplace
                </p>
            </div>
        </div>
    );
}
