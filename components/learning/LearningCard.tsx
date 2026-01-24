'use client';

import React from 'react';
import { LearningResource } from '@/lib/mockApi';

interface LearningCardProps {
    resource: LearningResource;
    isCompleted: boolean;
    onToggleComplete: (id: string) => void;
}

export const LearningCard: React.FC<LearningCardProps> = ({ resource, isCompleted, onToggleComplete }) => {
    const categoryColors = {
        scenario: 'bg-purple-100 text-purple-700 border-purple-200',
        knowledge: 'bg-blue-100 text-blue-700 border-blue-200',
        skills: 'bg-green-100 text-green-700 border-green-200',
        general: 'bg-slate-100 text-slate-700 border-slate-200'
    };

    const difficultyColors = {
        beginner: 'text-green-600',
        intermediate: 'text-orange-600',
        advanced: 'text-red-600'
    };

    return (
        <div className={`group bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${isCompleted ? 'border-primary/30 bg-primary/5' : 'border-slate-100 hover:border-primary/50 hover:shadow-lg'
            }`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${categoryColors[resource.category]}`}>
                                {resource.category}
                            </span>
                            <span className={`text-xs font-bold capitalize ${difficultyColors[resource.difficulty]}`}>
                                {resource.difficulty}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors font-display">
                            {resource.title}
                        </h3>
                    </div>

                    {/* Completion Checkbox */}
                    <button
                        onClick={() => onToggleComplete(resource.id)}
                        className={`shrink-0 size-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted
                                ? 'bg-primary border-primary'
                                : 'border-slate-300 hover:border-primary'
                            }`}
                    >
                        {isCompleted && (
                            <span className="material-symbols-outlined text-white text-sm">check</span>
                        )}
                    </button>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                    {resource.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">schedule</span>
                            <span className="font-semibold">{resource.duration}</span>
                        </div>
                    </div>

                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                        Start Learning
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                </div>
            </div>

            {/* Completed Overlay */}
            {isCompleted && (
                <div className="bg-primary/5 px-6 py-3 border-t border-primary/20">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                    </div>
                </div>
            )}
        </div>
    );
};
