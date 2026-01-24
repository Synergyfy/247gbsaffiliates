'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';

interface CertificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CertificationModal: React.FC<CertificationModalProps> = ({ isOpen, onClose }) => {
    const {
        quizResult,
        role,
        resetOnboarding,
        isPaidVisibilityRequested
    } = useOnboardingStore();
    const router = useRouter();

    if (!isOpen || !quizResult) return null;

    const isPendingVerification = role === 'consultant' || isPaidVisibilityRequested;
    // We only show this modal on success (>=50%), failed attempts redirect to learning dashboard
    const score = quizResult.score;

    const handleNavigate = () => {
        resetOnboarding();
        router.push('/dashboard');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-white/90 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl flex flex-col items-center text-center p-6 animate-in zoom-in-95 duration-500">
                {/* Confetti Background Elements */}
                <div className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden opacity-100">
                    <div className="absolute size-4 bg-primary rounded-full top-[10%] left-[20%] animate-bounce delay-100"></div>
                    <div className="absolute w-6 h-3 bg-teal-400 rotate-45 top-[15%] left-[30%] animate-pulse"></div>
                    <div className="absolute size-3 bg-primary/60 rounded-sm rotate-12 top-[30%] left-[15%]"></div>
                    <div className="absolute w-2 h-6 bg-teal-400 rotate-120 top-[5%] left-[40%]"></div>
                    <div className="absolute size-5 border-2 border-primary rotate-12 top-[40%] left-[25%] rounded-full animate-spin duration-[3s]"></div>
                    <div className="absolute size-4 bg-teal-400 rounded-full top-[12%] right-[22%] animate-bounce"></div>
                    <div className="absolute w-6 h-3 bg-primary -rotate-45 top-[18%] right-[32%]"></div>
                    <div className="absolute size-3 bg-teal-400/60 rounded-sm -rotate-12 top-[28%] right-[12%]"></div>
                    <div className="absolute w-2 h-6 bg-primary rotate-60 top-[8%] right-[38%]"></div>
                    <div className="absolute size-5 border-2 border-teal-400 -rotate-12 top-[45%] right-[20%] rounded-full animate-spin duration-[4s]"></div>
                </div>

                <div className="relative mb-10 z-10 group cursor-default">
                    <div className="size-40 rounded-full shadow-[0_20px_60px_-15px_rgba(0,191,165,0.6),0_0_0_8px_rgba(255,255,255,0.8)] flex items-center justify-center relative border-[6px] border-white/30 transition-transform duration-700 hover:scale-105 bg-linear-to-br from-teal-400 to-teal-600">
                        <div className="absolute inset-0 rounded-full bg-linear-to-tr from-transparent to-white/20"></div>
                        <span className="material-symbols-outlined text-white text-[90px] drop-shadow-md">verified</span>
                    </div>
                    <div className="absolute inset-0 -z-10 bg-teal-400/20 rounded-full scale-125 blur-xl"></div>
                </div>

                <h1 className="relative z-10 text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-[-0.03em] drop-shadow-sm font-display">
                    Certification Achieved!
                </h1>

                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div className="relative size-32">
                        <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(0,191,165,0.5)]"></div>
                        <svg className="size-full -rotate-90 drop-shadow-lg" viewBox="0 0 36 36">
                            <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="white" stroke="#e2e8f0" strokeWidth="2.5"></path>
                            <path
                                className="text-teal-500 transition-all duration-1000 ease-out"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray={`${score}, 100`}
                                strokeLinecap="round"
                                strokeWidth="2.5"
                            ></path>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-900 font-display">{score}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Score</span>
                        </div>
                    </div>
                </div>

                <p className="relative z-10 text-xl text-slate-500 font-medium max-w-[500px] mx-auto mb-10 leading-relaxed font-body">
                    You've mastered the skills and are now officially a <span className="font-bold bg-teal-50 px-2 py-0.5 rounded text-teal-600">Verified {role?.replace('-', ' ')}</span> on Listeo.
                </p>

                <button
                    onClick={handleNavigate}
                    className="relative z-10 bg-teal-500 hover:bg-teal-600 text-white text-lg font-bold py-4 px-12 rounded-full shadow-[0_10px_30px_-10px_rgba(0,191,165,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_-10px_rgba(0,191,165,0.6)] flex items-center gap-2 font-display"
                >
                    Access Your Dashboard
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};
