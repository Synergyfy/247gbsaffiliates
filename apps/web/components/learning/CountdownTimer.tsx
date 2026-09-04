'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetTimestamp: number;
    onComplete?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTimestamp, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now();
            const difference = targetTimestamp - now;
            return Math.max(0, difference);
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining === 0 && onComplete) {
                onComplete();
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetTimestamp, onComplete]);

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const progress = targetTimestamp > 0
        ? ((24 * 60 * 60 * 1000 - timeLeft) / (24 * 60 * 60 * 1000)) * 100
        : 100;

    return (
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-text-main/5 border border-slate-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Circular Progress */}
                <div className="relative size-32 shrink-0">
                    <svg className="size-full -rotate-90">
                        <circle
                            className="text-slate-100"
                            cx="64"
                            cy="64"
                            fill="transparent"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                        />
                        <circle
                            className="text-primary transition-all duration-1000"
                            cx="64"
                            cy="64"
                            fill="transparent"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray="351.86"
                            strokeDashoffset={351.86 - (351.86 * progress) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-text-main font-display">
                                {hours}:{minutes.toString().padStart(2, '0')}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Remaining
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-text-main mb-2 font-display">
                        Quiz Retake Available In
                    </h3>
                    <p className="text-text-secondary mb-4">
                        Use this time to strengthen your skills with our curated learning resources below.
                    </p>
                    <div className="flex items-center gap-6 justify-center md:justify-start">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary font-display">{hours}</div>
                            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hours</div>
                        </div>
                        <div className="text-2xl text-slate-300">:</div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary font-display">{minutes}</div>
                            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Minutes</div>
                        </div>
                        <div className="text-2xl text-slate-300">:</div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary font-display">{seconds}</div>
                            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Seconds</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
