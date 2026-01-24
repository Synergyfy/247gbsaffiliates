'use client';

import React from 'react';
import Link from 'next/link';

interface AssessmentModalProps {
    isOpen: boolean;
    type: 'success' | 'failure';
    score: number;
    role: string;
    onClose: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({ isOpen, type, score, role, onClose }) => {
    if (!isOpen) return null;

    const isSuccess = type === 'success';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 border border-white/20">
                <div className={`p-6 text-center ${isSuccess ? 'bg-primary/5' : 'bg-red-50'}`}>
                    <div className={`mx-auto size-16 rounded-full flex items-center justify-center mb-4 ${isSuccess ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-500'}`}>
                        <span className="material-symbols-outlined text-3xl">
                            {isSuccess ? 'verified' : 'warning'}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold font-display text-text-main mb-2">
                        {isSuccess ? 'Assessment Passed' : 'Assessment Failed'}
                    </h2>
                    <p className="text-sm text-text-secondary font-medium px-4">
                        {isSuccess
                            ? `Congratulations! You scored ${score}% and are eligible for the ${role} role.`
                            : `You scored ${score}%. We recommend reviewing our training materials before retaking.`
                        }
                    </p>
                </div>

                <div className="p-6 bg-white border-t border-gray-50 flex flex-col gap-3">
                    {isSuccess ? (
                        <Link
                            href="/dashboard"
                            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all text-center uppercase tracking-widest text-xs"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/learning"
                            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-all text-center uppercase tracking-widest text-xs"
                        >
                            Go to Learning Dashboard
                        </Link>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs uppercase tracking-widest"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
