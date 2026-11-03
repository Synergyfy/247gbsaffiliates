'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';
import { CertificationModal } from './CertificationModal';
import { useAuthStore } from '@/store/useAuthStore';

export const QuizStep: React.FC<{ isRetake?: boolean }> = ({ isRetake = false }) => {
    const {
        quizAnswers,
        setQuizAnswer,
        setQuizResult,
        setStep,
        setRetakeAvailableAt,
    } = useOnboardingStore();
    const { updateUser } = useAuthStore();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStep, setSubmissionStep] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const getAudioContext = () => {
        if (typeof window === 'undefined') return null;
        try {
            if (!audioCtxRef.current) {
                const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                if (AudioCtx) {
                    audioCtxRef.current = new AudioCtx();
                }
            }
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume().catch(() => {});
            }
            return audioCtxRef.current;
        } catch {
            return null;
        }
    };

    const playTick = () => {
        if (isMuted) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        } catch {
            // Audio policy or unsupported
        }
    };

    const playUrgent = () => {
        if (isMuted) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(950, ctx.currentTime);
            gain.gain.setValueAtTime(0.55, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch {
            // Audio policy or unsupported
        }
    };

    const playTimesUp = () => {
        if (isMuted) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(450, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.7, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch {
            // Audio policy or unsupported
        }
    };

    const submissionSteps = [
        "Analyzing your responses...",
        "Evaluating role competency...",
        "Matching with marketplace requirements...",
        "Generating professional profile...",
        "Finalizing assessment..."
    ];

    const { data: questions, isLoading } = useQuery({
        queryKey: ['questions'],
        queryFn: async () => {
            const response = await apiClient.get('/assessment/quiz');
            return response.data as { id: string; text: string; options: string[]; type: string }[];
        },
    });

    const router = useRouter();

    const submitMutation = useMutation({
        mutationFn: async () => {
            const formattedAnswers = Object.entries(quizAnswers).map(([questionId, optionId]) => ({
                questionId,
                selectedOptionIndex: parseInt(optionId, 10)
            }));
            const response = await apiClient.post('/assessment/submit', { answers: formattedAnswers });
            return response.data;
        },
        onSuccess: async (data) => {
            setQuizResult({
                score: data.score,
                maxScore: data.maxScore,
                percentage: data.percentage,
                band: data.band
            });

            if (data.band === 'Fail') {
                const retakeTime = Date.now() + (24 * 60 * 60 * 1000);
                setRetakeAvailableAt(retakeTime);
                if (isRetake) {
                    setStep('quiz');
                    try {
                        const profileResponse = await apiClient.get('/auth/profile');
                        updateUser({ isOnboarded: Boolean(profileResponse.data.isOnboarded), isQuizPassed: Boolean(profileResponse.data.isQuizPassed) });
                    } catch (err) {
                        console.warn('Could not refresh profile after assessment:', err);
                    }
                    router.replace('/dashboard/agent/assessment');
                    return;
                }
                setStep('outcome');
            } else {
                if (isRetake) {
                    setRetakeAvailableAt(null);
                    setStep('quiz');
                    try {
                        const profileResponse = await apiClient.get('/auth/profile');
                        const profile = profileResponse.data;
                        updateUser({
                            isOnboarded: Boolean(profile.isOnboarded),
                            isQuizPassed: Boolean(profile.isQuizPassed),
                            skills: profile.skills,
                            score: profile.score,
                        });
                    } catch (err) {
                        // The assessment result is persisted by /assessment/submit;
                        // the status page reloads the authoritative profile on return.
                        console.warn('Could not refresh profile after assessment:', err);
                    }
                    router.replace('/dashboard/agent/assessment');
                    return;
                }
                try {
                    const profileResponse = await apiClient.get('/auth/profile');
                    const profile = profileResponse.data;
                    updateUser({
                        isOnboarded: Boolean(profile.isOnboarded),
                        isQuizPassed: Boolean(profile.isQuizPassed),
                        verificationStatus: profile.verificationStatus,
                        verificationNotes: profile.verificationNotes,
                        verificationSubmission: profile.verificationSubmission,
                        score: data.score,
                    });
                } catch (err) {
                    console.warn('Could not refresh profile after assessment:', err);
                    updateUser({ isQuizPassed: true, score: data.score });
                }
                setStep('outcome');
            }
        },
    });

    function handleNext() {
        if (!questions) return;
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setTimeLeft(30);
        } else {
            setIsSubmitting(true);
            submitMutation.mutate();
        }
    }

    useEffect(() => {
        if (isSubmitting && submissionStep < submissionSteps.length - 1) {
            const timer = setTimeout(() => setSubmissionStep(prev => prev + 1), 500);
            return () => clearTimeout(timer);
        }
    }, [isSubmitting, submissionStep]);

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitting) {
            if (timeLeft <= 5) {
                playUrgent();
            } else {
                playTick();
            }
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isSubmitting) {
            playTimesUp();
            const timer = setTimeout(handleNext, 0);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, isSubmitting, isMuted]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-primary/20 border-b-primary mb-4 md:mb-6"></div>
                <p className="text-slate-500 font-display font-medium text-xs md:text-sm">Loading assessment questions...</p>
            </div>
        );
    }

    if (!questions || questions.length === 0) {
        return (
            <div className="max-w-xl mx-auto py-8 md:py-16 text-center bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="size-12 md:size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-primary">
                    <span className="material-symbols-outlined text-2xl md:text-3xl">verified</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold font-display text-text-main mb-2">
                    {isRetake ? 'No Assessment Questions Available' : 'No Assessment Required'}
                </h2>
                <p className="text-slate-500 mb-6 text-xs md:text-sm">
                    {isRetake
                        ? 'There are no questions available to retake right now. Your qualification status has not been changed.'
                        : 'No preliminary assessment questions are required for your selected track at this time. You can complete your onboarding to access the dashboard.'}
                </p>
                {isRetake ? (
                    <button onClick={() => router.replace('/dashboard/agent/assessment')} className="px-6 md:px-8 h-10 md:h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:opacity-90 transition-all font-display uppercase tracking-widest text-[10px]">
                        Return to assessment status
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setIsSubmitting(true);
                            submitMutation.mutate();
                        }}
                        disabled={isSubmitting}
                        className="px-6 md:px-8 h-10 md:h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:opacity-90 transition-all font-display uppercase tracking-widest text-[10px]"
                    >
                        {isSubmitting ? 'Finalizing...' : 'Complete Onboarding'}
                    </button>
                )}
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex] || questions[0];
    if (!currentQuestion) return null;

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto py-2 md:py-4 relative w-full px-1 sm:px-0">
            {isSubmitting && (
                <div className="absolute inset-x-0 -top-4 -bottom-4 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 md:p-8 rounded-2xl md:rounded-[3rem]">
                    <div className="size-14 md:size-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-8 relative">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full border-t-primary animate-spin" />
                        <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">analytics</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-display font-bold text-text-main mb-2 md:mb-3">Submitting Assessment</h2>
                    <p className="text-slate-500 mb-6 md:mb-8 max-w-sm text-xs md:text-sm">{submissionSteps[submissionStep]}</p>
                    <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                            style={{ width: `${((submissionStep + 1) / submissionSteps.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Header: Progress, Category & Audio Toggle */}
            <div className="mb-3 md:mb-8 flex items-center justify-between gap-2">
                <div>
                    <span className="px-2.5 py-0.5 md:px-3 md:py-1 bg-primary/10 text-primary text-[9px] md:text-[10px] font-bold rounded-full uppercase tracking-widest font-display">
                        {currentQuestion?.type === 'scenario' ? 'Scenario Analysis' : 'Competency Quiz'}
                    </span>
                    <h1 className="text-base sm:text-xl md:text-2xl font-bold text-text-main mt-1 md:mt-3 font-display tracking-tight">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </h1>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Audio feedback mute toggle */}
                    <button
                        type="button"
                        onClick={() => setIsMuted(prev => !prev)}
                        title={isMuted ? "Unmute timer countdown sounds" : "Mute timer countdown sounds"}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/40 transition-colors flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-base md:text-lg">
                            {isMuted ? "volume_off" : "volume_up"}
                        </span>
                    </button>

                    <div className="text-right">
                        <span className="hidden sm:inline text-xs text-gray-500 font-medium">Progress</span>
                        <div className="w-16 sm:w-24 md:w-32 h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                            <div
                                className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Question Card */}
            <div className="bg-white rounded-2xl md:rounded-4xl shadow-md md:shadow-xl shadow-text-main/5 border border-slate-100 overflow-hidden relative">
                {/* Compact Timer */}
                <div className="absolute top-3 right-3 md:top-6 md:right-6 flex flex-col items-center gap-0.5 md:gap-1 z-10">
                    <div className="relative size-10 md:size-14 bg-white rounded-full shadow-sm">
                        <svg className="size-full -rotate-90">
                            <circle className="text-slate-100" cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeWidth="4"></circle>
                            <circle
                                className={`${timeLeft <= 5 ? 'text-red-500' : 'text-primary'} transition-all duration-1000`}
                                cx="50%" cy="50%" fill="transparent" r="40%" stroke="currentColor" strokeWidth="4"
                                strokeDasharray="100"
                                strokeDashoffset={100 - (100 * timeLeft) / 30}
                                strokeLinecap="round"
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xs md:text-lg font-bold font-display ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-text-main'}`}>
                                {timeLeft}
                            </span>
                        </div>
                    </div>
                    <span className="hidden md:block text-[9px] font-bold uppercase tracking-widest text-gray-400">Seconds</span>
                </div>

                {/* Question Prompt */}
                <div className={`p-4 sm:p-6 md:p-8 lg:p-12 pr-14 md:pr-20`}>
                    <p className={`text-xs sm:text-base md:text-xl lg:text-2xl font-medium leading-relaxed font-display text-text-main`}>
                        &quot;{currentQuestion.text}&quot;
                    </p>
                </div>

                {/* Options List */}
                <div className="p-3.5 sm:p-6 md:p-8 lg:px-12 space-y-2 md:space-y-4">
                    {(currentQuestion.options || []).map((optionText, index) => {
                        const optionId = index.toString();
                        const isSelected = quizAnswers[currentQuestion.id] === optionId;
                        return (
                            <button
                                key={optionId}
                                onClick={() => {
                                    getAudioContext();
                                    setQuizAnswer(currentQuestion.id, optionId);
                                }}
                                className={`w-full group flex items-start gap-2.5 md:gap-4 p-3 md:p-5 rounded-xl md:rounded-2xl border-2 text-left transition-all font-display ${isSelected
                                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                    : 'border-slate-100 hover:border-primary/50'
                                    }`}
                            >
                                <div className={`size-4 md:size-6 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 transition-colors ${isSelected
                                    ? 'border-primary bg-primary'
                                    : 'border-slate-300 group-hover:border-primary'
                                    }`}>
                                    <div className={`size-1.5 md:size-2 rounded-full bg-white transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`} />
                                </div>
                                <span className={`font-semibold md:font-bold text-xs md:text-sm lg:text-base leading-snug ${isSelected ? 'text-text-main' : 'text-slate-600'}`}>
                                    {optionText}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Bottom Actions */}
                <div className="px-3.5 py-3 md:px-8 lg:px-12 md:pb-10 flex items-center justify-between gap-2 border-t border-slate-50 pt-3 md:pt-8 mt-2 md:mt-4">
                    <button className="text-slate-400 font-bold hover:text-text-main flex items-center gap-1 transition-colors font-display tracking-widest text-[9px] md:text-[10px] uppercase shrink-0">
                        <span className="material-symbols-outlined text-base md:text-lg">flag</span>
                        <span className="hidden sm:inline">Report Issue</span>
                    </button>
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={handleNext}
                            className="h-10 sm:h-11 md:h-12 px-3 md:px-6 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all font-display uppercase tracking-wider text-[10px] md:text-xs"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!quizAnswers[currentQuestion.id]}
                            className={`h-10 sm:h-11 md:h-12 px-4 md:px-10 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 font-display text-xs md:text-sm ${quizAnswers[currentQuestion.id]
                                ? 'bg-primary shadow-primary/25 hover:bg-primary-dark active:scale-[0.99]'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            <span>{currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}</span>
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Certification Modal */}
            <CertificationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
};
