'use client';

import React from 'react';
import { LearningHubResource, LearningProgressStatus } from '@/hooks/useLearningResources';

interface LearningCardProps {
    resource: LearningHubResource;
    status: LearningProgressStatus;
    isUpdating: boolean;
    onStart: (id: string) => void;
    onComplete: (id: string) => void;
}

export const LearningCard: React.FC<LearningCardProps> = ({ resource, status, isUpdating, onStart, onComplete }) => {
    const link = resource.articleUrl || resource.videoUrl;
    const label = status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In progress' : 'Not started';

    return (
        <article className={`group overflow-hidden rounded-2xl border bg-white transition-all ${status === 'completed' ? 'border-emerald-200' : 'border-slate-100 hover:border-primary/40 hover:shadow-lg'}`}>
            {resource.thumbnailUrl && <img src={resource.thumbnailUrl} alt="" className="h-40 w-full object-cover" />}
            <div className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    {resource.category?.name && <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{resource.category.name}</span>}
                    <span className={`text-xs font-semibold ${status === 'completed' ? 'text-emerald-700' : status === 'in_progress' ? 'text-blue-700' : 'text-slate-500'}`}>{label}</span>
                </div>
                <h2 className="text-lg font-bold text-text-main">{resource.title}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{resource.description}</p>
                {resource.tags?.length ? <div className="mt-3 flex flex-wrap gap-1.5">{resource.tags.map((tag) => <span key={tag} className="rounded bg-slate-50 px-2 py-1 text-[10px] text-slate-500">{tag}</span>)}</div> : null}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                    {link && <a href={link} target="_blank" rel="noopener noreferrer" onClick={() => onStart(resource.id)} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline">Open resource <span aria-hidden>↗</span></a>}
                    {status !== 'completed' && <button disabled={isUpdating} onClick={() => onComplete(resource.id)} className="rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{isUpdating ? 'Saving…' : 'Mark complete'}</button>}
                    {!link && <span className="text-xs text-slate-500">No article or video link has been added yet.</span>}
                </div>
            </div>
        </article>
    );
};
