'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mockApi, QuizQuestion } from '@/lib/mockApi';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';

export const QuizStep: React.FC = () => {
    const { role, quizAnswers, setQuizAnswer, setQuizResult, setStep } = useOnboardingStore();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStep, setSubmissionStep] = useState(0);

    const submissionSteps = [
        "Analyzing your responses...",
        "Evaluating role competency...",
        "Matching with marketplace requirements...",
        "Generating professional profile...",
        "Finalizing assessment..."
    ];

    const { data: questions, isLoading } = useQuery({
        queryKey: ['questions', role],
        queryFn: () => mockApi.getQuestions(role!),
        enabled: !!role,
    });

    const router = useRouter();

    const submitMutation = useMutation({
        mutationFn: () => mockApi.submitQuiz(role!, quizAnswers),
        onSuccess: (data) => {
            setQuizResult(data);
            // Redirect to standalone Certification page
            router.push('/certification');
        },
    });

    useEffect(() => {
        if (isSubmitting && submissionStep < submissionSteps.length - 1) {
            const timer = setTimeout(() => setSubmissionStep(prev => prev + 1), 500);
            return () => clearTimeout(timer);
        }
    }, [isSubmitting, submissionStep]);

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitting) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isSubmitting) {
            handleNext();
        }
    }, [timeLeft, isSubmitting]);

    const handleNext = () => {
        if (!questions) return;
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setTimeLeft(30);
        } else {
            setIsSubmitting(true);
            submitMutation.mutate();
        }
    };

    if (isLoading || !questions) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary mb-6"></div>
                <p className="text-slate-500 font-display font-medium">Loading assessment questions...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto py-4 relative">
            {isSubmitting && (
                <div className="absolute inset-x-0 -top-4 -bottom-4 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8 rounded-[3rem]">
                    <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full border-t-primary animate-spin" />
                        <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-text-main mb-3">Submitting Assessment</h2>
                    <p className="text-slate-500 mb-8 max-w-sm">{submissionSteps[submissionStep]}</p>
                    <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                            style={{ width: `${((submissionStep + 1) / submissionSteps.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest font-display">
                        {currentQuestion.type === 'scenario' ? 'Scenario Analysis' : 'Competency Quiz'}
                    </span>
                    <h1 className="text-2xl font-bold text-text-main mt-3 font-display tracking-tight">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </h1>
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-500 font-medium">Progress</span>
                    <div className="w-32 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-4xl shadow-xl shadow-text-main/5 border border-slate-100 overflow-hidden relative">
                {/* Timer UI */}
                <div className="absolute top-6 right-6 flex flex-col items-center gap-1 z-10">
                    <div className="relative size-14">
                        <svg className="size-full -rotate-90">
                            <circle className="text-slate-50" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="4"></circle>
                            <circle
                                className={`${timeLeft <= 5 ? 'text-red-500' : 'text-primary'} transition-all duration-1000`}
                                cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="4"
                                strokeDasharray="150.8"
                                strokeDashoffset={150.8 - (150.8 * timeLeft) / 30}
                                strokeLinecap="round"
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-lg font-bold font-display ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-text-main'}`}>
                                {timeLeft}
                            </span>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Seconds</span>
                </div>

                <div className={`p-8 lg:p-12 ${currentQuestion.type === 'scenario' ? 'bg-text-main' : ''}`}>
                    <p className={`text-xl lg:text-2xl font-medium leading-relaxed font-display ${currentQuestion.type === 'scenario' ? 'text-white' : 'text-text-main'}`}>
                        "{currentQuestion.text}"
                    </p>
                </div>

                <div className="p-8 lg:px-12 space-y-4">
                    {currentQuestion.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setQuizAnswer(currentQuestion.id, option.id)}
                            className={`w-full group flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all font-display ${quizAnswers[currentQuestion.id] === option.id
                                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                : 'border-slate-50 hover:border-primary/50'
                                }`}
                        >
                            <div className={`size-6 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 transition-colors ${quizAnswers[currentQuestion.id] === option.id
                                ? 'border-primary bg-primary'
                                : 'border-slate-300 group-hover:border-primary'
                                }`}>
                                <div className={`size-2 rounded-full bg-white transition-transform ${quizAnswers[currentQuestion.id] === option.id ? 'scale-100' : 'scale-0'
                                    }`} />
                            </div>
                            <span className={`font-bold text-sm lg:text-base ${quizAnswers[currentQuestion.id] === option.id ? 'text-text-main' : 'text-slate-500'
                                }`}>
                                {option.text}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="px-8 lg:px-12 pb-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-50 pt-8 mt-4">
                    <button className="text-slate-400 font-bold hover:text-text-main flex items-center gap-2 transition-colors font-display tracking-widest text-[10px] uppercase">
                        <span className="material-symbols-outlined text-lg">flag</span>
                        Report Issue
                    </button>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={handleNext}
                            className="px-8 h-12 border-2 border-slate-100 text-slate-400 font-bold rounded-xl hover:bg-slate-50 transition-all font-display uppercase tracking-widest text-[10px]"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!quizAnswers[currentQuestion.id]}
                            className={`flex-1 sm:flex-none px-12 h-12 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-display uppercase tracking-widest text-[10px] ${quizAnswers[currentQuestion.id]
                                ? 'bg-primary shadow-primary/30 hover:opacity-90 active:scale-[0.98]'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
