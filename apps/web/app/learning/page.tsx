'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLearningProgress, useLearningResources, useUpdateLearningProgress } from '@/hooks/useLearningResources';
import { CountdownTimer } from '@/components/learning/CountdownTimer';
import { LearningCard } from '@/components/learning/LearningCard';
import { ProgressTracker } from '@/components/learning/ProgressTracker';

export default function LearningPage() {
    const router = useRouter();
    const {
        role,
        quizResult,
        userName,
        retakeAvailableAt
    } = useOnboardingStore();
    const { user } = useAuthStore();
    const selectedRole = role || user?.role || null;
    const activeRole = selectedRole === 'account-manager' ? 'account_manager' : selectedRole;
    const hasPassedAssessment = Boolean(user?.isQuizPassed)
        || ['pass', 'partial'].includes(quizResult?.band.toLowerCase() || '');

    const [categoryFilter, setCategoryFilter] = useState('all');
    const [now, setNow] = useState(0);

    // Fetch learning resources
    const { data: resources, isLoading, isError, refetch } = useLearningResources(activeRole);
    const { data: progress = [], isLoading: isProgressLoading, isError: isProgressError, refetch: refetchProgress } = useLearningProgress(Boolean(activeRole));
    const updateProgress = useUpdateLearningProgress();
    const progressByResource = new Map(progress.map((item) => [item.resourceId, item.status]));

    // Keep the retake countdown current without storing a second copy of its state.
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);
    const canRetake = !retakeAvailableAt || now >= retakeAvailableAt;

    const handleStartResource = (resourceId: string) => {
        if (!progressByResource.has(resourceId)) updateProgress.mutate({ resourceId, status: 'in_progress' });
    };

    const handleCompleteResource = (resourceId: string) => {
        updateProgress.mutate({ resourceId, status: 'completed' });
    };

    const handleRetakeQuiz = () => {
        router.push('/onboarding?retake=1');
    };

    if (isLoading || isProgressLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary mb-4 mx-auto" />
                    <p className="text-slate-500 font-medium">Loading learning resources...</p>
                </div>
            </div>
        );
    }

    if (isError || isProgressError) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-xl font-bold text-text-main">Learning resources unavailable</h1>
                    <p className="mt-2 text-sm text-text-secondary">We couldn’t load your Learning Hub materials. Try again in a moment.</p>
                    <button onClick={() => { void refetch(); void refetchProgress(); }} className="mt-5 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white">Try again</button>
                </div>
            </div>
        );
    }

    const learningResources = resources || [];
    const categories = Array.from(new Map(learningResources.filter((resource) => resource.category).map((resource) => [resource.category!.id, resource.category!])).values());
    const filteredResources = categoryFilter === 'all'
        ? learningResources
        : learningResources.filter(resource => resource.category?.id === categoryFilter);

    const completedCount = learningResources.filter(resource => progressByResource.get(resource.id) === 'completed').length;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-display">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-primary hover:text-primary-hover flex items-center gap-2 font-bold text-sm uppercase tracking-wider transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back to Dashboard
                        </button>
                    </div>
                    <h1 className="text-4xl font-bold text-text-main mb-3 tracking-tight">
                        Learning Hub
                    </h1>
                    <p className="text-lg text-text-secondary">
                        {userName ? `Welcome back, ${userName}! ` : ''}
                        Strengthen your skills and prepare for your next assessment.
                    </p>
                </div>

                {/* Quiz Result Summary */}
                {quizResult && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-text-main/5 border border-slate-100 mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-text-main mb-2">
                                    Previous Assessment: {quizResult.percentage}%
                                </h2>
                                <p className="text-text-secondary">
                                    Status: <span className={`font-bold ${quizResult.band === 'Pass' ? 'text-primary' : quizResult.band === 'Partial' ? 'text-orange-400' : 'text-red-500'}`}>{quizResult.band}</span>. You need 50% or higher to pass. Review the resources below to improve your score.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {quizResult.score} / {quizResult.maxScore}
                                    </div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                        Raw Score
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Countdown Timer */}
                {retakeAvailableAt && !canRetake && (
                    <div className="mb-8">
                        <CountdownTimer
                            targetTimestamp={retakeAvailableAt}
                        />
                    </div>
                )}

                {/* Progress Tracker */}
                <div className="mb-8">
                    <ProgressTracker completed={completedCount} total={learningResources.length} />
                </div>

                {/* Category Filters */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-3">
                        {[{ id: 'all', name: 'All Resources' }, ...categories].map(category => (
                            <button
                                key={category.id}
                                onClick={() => setCategoryFilter(category.id)}
                                className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${categoryFilter === category.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/50'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Learning Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredResources.map(resource => (
                        <LearningCard
                            key={resource.id}
                            resource={resource}
                            status={progressByResource.get(resource.id) || 'not_started'}
                            isUpdating={updateProgress.isPending}
                            onStart={handleStartResource}
                            onComplete={handleCompleteResource}
                        />
                    ))}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
                        <p className="text-slate-400 font-medium">No published learning resources are available for your role{categoryFilter !== 'all' ? ' in this category' : ''}.</p>
                    </div>
                )}

                {/* Retake Quiz Button */}
                <div className="sticky bottom-8 flex justify-center">
                    <button
                        onClick={handleRetakeQuiz}
                        disabled={!canRetake || hasPassedAssessment}
                        className={`px-12 py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-2xl transition-all flex items-center gap-3 ${canRetake && !hasPassedAssessment
                                ? 'bg-primary text-white hover:brightness-110 active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined">quiz</span>
                        {hasPassedAssessment ? 'Assessment Passed' : canRetake ? 'Retake Assessment' : 'Assessment Locked'}
                    </button>
                </div>
            </div>
        </div>
    );
}
