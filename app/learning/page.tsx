'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { mockApi, LearningResource } from '@/lib/mockApi';
import { CountdownTimer } from '@/components/learning/CountdownTimer';
import { LearningCard } from '@/components/learning/LearningCard';
import { ProgressTracker } from '@/components/learning/ProgressTracker';

type CategoryFilter = 'all' | 'scenario' | 'knowledge' | 'skills';

export default function LearningPage() {
    const router = useRouter();
    const {
        role,
        quizResult,
        userName,
        retakeAvailableAt,
        performanceBreakdown
    } = useOnboardingStore();

    const [completedResources, setCompletedResources] = useState<Set<string>>(new Set());
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [canRetake, setCanRetake] = useState(false);

    // Fetch learning resources
    const { data: resources, isLoading } = useQuery({
        queryKey: ['learning-resources', role],
        queryFn: () => mockApi.getLearningResources(role!),
        enabled: !!role,
    });

    // Check if user can retake quiz
    useEffect(() => {
        if (!retakeAvailableAt) {
            setCanRetake(true);
            return;
        }

        const checkRetakeAvailability = () => {
            setCanRetake(Date.now() >= retakeAvailableAt);
        };

        checkRetakeAvailability();
        const interval = setInterval(checkRetakeAvailability, 1000);
        return () => clearInterval(interval);
    }, [retakeAvailableAt]);

    // Redirect if no quiz result or passed
    useEffect(() => {
        if (!quizResult || quizResult.score >= 50) {
            router.replace('/dashboard');
        }
    }, [quizResult, router]);

    const handleToggleComplete = (id: string) => {
        setCompletedResources(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleRetakeQuiz = () => {
        router.push('/onboarding');
    };

    if (isLoading || !resources) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary mb-4 mx-auto" />
                    <p className="text-slate-500 font-medium">Loading learning resources...</p>
                </div>
            </div>
        );
    }

    const filteredResources = categoryFilter === 'all'
        ? resources
        : resources.filter(r => r.category === categoryFilter);

    const completedCount = resources.filter(r => completedResources.has(r.id)).length;

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
                                    Previous Assessment: {quizResult.score}%
                                </h2>
                                <p className="text-text-secondary">
                                    You need 50% or higher to pass. Review the resources below to improve your score.
                                </p>
                            </div>
                            {performanceBreakdown && performanceBreakdown.length > 0 && (
                                <div className="flex gap-4">
                                    {performanceBreakdown.slice(0, 2).map((item, index) => (
                                        <div key={index} className="text-center">
                                            <div className={`text-2xl font-bold ${item.score < 50 ? 'text-red-500' : item.score < 70 ? 'text-orange-400' : 'text-primary'}`}>
                                                {item.score}%
                                            </div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                                {item.category}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Countdown Timer */}
                {retakeAvailableAt && !canRetake && (
                    <div className="mb-8">
                        <CountdownTimer
                            targetTimestamp={retakeAvailableAt}
                            onComplete={() => setCanRetake(true)}
                        />
                    </div>
                )}

                {/* Progress Tracker */}
                <div className="mb-8">
                    <ProgressTracker completed={completedCount} total={resources.length} />
                </div>

                {/* Category Filters */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-3">
                        {(['all', 'scenario', 'knowledge', 'skills'] as CategoryFilter[]).map(category => (
                            <button
                                key={category}
                                onClick={() => setCategoryFilter(category)}
                                className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${categoryFilter === category
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/50'
                                    }`}
                            >
                                {category === 'all' ? 'All Resources' : category}
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
                            isCompleted={completedResources.has(resource.id)}
                            onToggleComplete={handleToggleComplete}
                        />
                    ))}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
                        <p className="text-slate-400 font-medium">No resources found for this category.</p>
                    </div>
                )}

                {/* Retake Quiz Button */}
                <div className="sticky bottom-8 flex justify-center">
                    <button
                        onClick={handleRetakeQuiz}
                        disabled={!canRetake}
                        className={`px-12 py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-2xl transition-all flex items-center gap-3 ${canRetake
                                ? 'bg-primary text-white hover:brightness-110 active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined">quiz</span>
                        {canRetake ? 'Retake Assessment' : 'Assessment Locked'}
                    </button>
                </div>
            </div>
        </div>
    );
}
