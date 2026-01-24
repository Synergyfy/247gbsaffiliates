'use client';

import React from 'react';

interface ProgressTrackerProps {
    completed: number;
    total: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completed, total }) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const getMessage = () => {
        if (percentage === 0) return "Let's get started!";
        if (percentage < 25) return "Great start! Keep going!";
        if (percentage < 50) return "You're making progress!";
        if (percentage < 75) return "Halfway there! Keep it up!";
        if (percentage < 100) return "Almost done! You've got this!";
        return "Excellent work! All resources completed!";
    };

    return (
        <div className="bg-linear-to-br from-primary/10 to-purple-50 rounded-3xl p-8 border border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Circular Progress */}
                <div className="relative size-32 shrink-0">
                    <svg className="size-full -rotate-90">
                        <circle
                            className="text-white/50"
                            cx="64"
                            cy="64"
                            fill="transparent"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                        />
                        <circle
                            className="text-primary transition-all duration-500"
                            cx="64"
                            cy="64"
                            fill="transparent"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray="351.86"
                            strokeDashoffset={351.86 - (351.86 * percentage) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary font-display">
                                {percentage}%
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Complete
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-text-main mb-2 font-display">
                        Learning Progress
                    </h3>
                    <p className="text-text-secondary mb-4">
                        {getMessage()}
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white/50 rounded-full h-3 overflow-hidden border border-white">
                            <div
                                className="h-full bg-primary transition-all duration-500 shadow-lg shadow-primary/30"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-text-main font-display whitespace-nowrap">
                            {completed} / {total}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
