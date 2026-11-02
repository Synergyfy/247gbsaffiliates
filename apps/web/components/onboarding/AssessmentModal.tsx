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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-sm rounded-t-xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

                {/* Top accent bar */}
                <div className={`h-1 w-full ${isSuccess ? 'bg-primary' : 'bg-red-500'}`} />

                {/* Score ring + status */}
                <div className="px-6 pt-7 pb-5 flex flex-col items-center text-center">
                    {/* Circular score display */}
                    <div className="relative mb-4">
                        <svg className="size-24" viewBox="0 0 100 100">
                            {/* Track */}
                            <circle
                                cx="50" cy="50" r="42"
                                fill="none"
                                strokeWidth="8"
                                stroke={isSuccess ? '#e8f0ff' : '#fee2e2'}
                            />
                            {/* Progress arc */}
                            <circle
                                cx="50" cy="50" r="42"
                                fill="none"
                                strokeWidth="8"
                                stroke={isSuccess ? 'var(--color-primary, #4f46e5)' : '#ef4444'}
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                            />
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-2xl font-bold font-display leading-none ${isSuccess ? 'text-primary' : 'text-red-500'}`}>
                                {score}%
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Score</span>
                        </div>
                    </div>

                    {/* Status icon + heading */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 ${
                        isSuccess ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'
                    }`}>
                        <span className="material-symbols-outlined text-sm">
                            {isSuccess ? 'check_circle' : 'cancel'}
                        </span>
                        {isSuccess ? 'Passed' : 'Not Passed'}
                    </div>

                    <h2 className="text-lg font-bold font-display text-text-main mb-1">
                        {isSuccess ? 'Great work!' : 'Keep going'}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[260px]">
                        {isSuccess
                            ? `You passed the ${role.replace('-', ' ')} assessment. You're cleared to proceed.`
                            : 'Review the learning materials and try again when you\'re ready. There\'s no rush.'
                        }
                    </p>
                </div>

                {/* Actions */}
                <div className="px-5 pb-6 flex flex-col gap-2.5">
                    {isSuccess ? (
                        <Link
                            href="/dashboard"
                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-md shadow-primary/20 transition-all text-center text-sm flex items-center justify-center gap-2"
                        >
                            <span>Go to Dashboard</span>
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                    ) : (
                        <Link
                            href="/learning"
                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all text-center text-sm flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">school</span>
                            <span>Go to Learning Dashboard</span>
                        </Link>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-slate-400 hover:text-slate-600 font-semibold transition-colors text-xs"
                    >
                        {isSuccess ? 'Stay here' : 'Dismiss'}
                    </button>
                </div>
            </div>
        </div>
    );
};
