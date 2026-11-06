'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

export type OverviewStage = {
    title: string;
    detail: string;
    state: 'complete' | 'active' | 'pending' | 'blocked' | 'unknown';
    href: string;
};

const stateText: Record<OverviewStage['state'], string> = {
    complete: 'Complete', active: 'In progress', pending: 'Pending review', blocked: 'Needs attention', unknown: 'Not recorded',
};
const stateColor: Record<OverviewStage['state'], string> = {
    complete: 'bg-emerald-600', active: 'bg-blue-600', pending: 'bg-amber-500', blocked: 'bg-rose-600', unknown: 'bg-slate-300',
};

export function RoleOverview({
    name, description, stages, nextStep, profileHref, children,
}: {
    name: string;
    description: string;
    stages: OverviewStage[];
    nextStep: { title: string; detail: string; href: string; action: string };
    profileHref: string;
    children: React.ReactNode;
}) {
    const progressSliderRef = useRef<HTMLDivElement>(null);
    const [activeStage, setActiveStage] = useState(1);

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-3 px-3 py-2 sm:space-y-5 sm:px-5 sm:py-5 xl:px-7">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-950 sm:text-3xl">Welcome back, {name}</h1>
                    <p className="mt-0.5 max-w-2xl text-xs leading-snug text-slate-600 sm:text-sm">{description}</p>
                </div>
            </header>

            <section aria-labelledby="progress-heading">
                <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
                    <div>
                        <h2 id="progress-heading" className="text-sm font-semibold text-slate-950">Your progress</h2>
                        <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">Personal setup and development status</p>
                    </div>
                    <Link href={profileHref} className="text-xs font-semibold text-blue-700 hover:underline">View profile</Link>
                </div>
                <div
                    ref={progressSliderRef}
                    role="region"
                    aria-label="Personal progress stages"
                    tabIndex={0}
                    onScroll={(event) => {
                        const slider = event.currentTarget;
                        if (window.matchMedia('(min-width: 640px)').matches) return;
                        const inset = Number.parseFloat(window.getComputedStyle(slider).scrollPaddingLeft) || 24;
                        const snapLine = slider.getBoundingClientRect().left + slider.clientLeft + inset;
                        const slides = slider.querySelectorAll<HTMLElement>('[data-progress-slide]');
                        let nearestIndex = 0;
                        let nearestDistance = Number.POSITIVE_INFINITY;
                        slides.forEach((slide, index) => {
                            const distance = Math.abs(slide.getBoundingClientRect().left - snapLine);
                            if (distance < nearestDistance) {
                                nearestDistance = distance;
                                nearestIndex = index;
                            }
                        });
                        setActiveStage(nearestIndex + 1);
                    }}
                    className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-6 px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:scroll-px-0 sm:px-0 sm:pb-0 sm:snap-none md:grid-cols-3 2xl:grid-cols-6"
                >
                    {stages.map((stage, index) => (
                        <Link key={stage.title} href={stage.href} data-progress-slide={index} className="group min-h-[100px] w-[min(50vw,200px)] shrink-0 snap-start rounded-md border border-slate-200 bg-white p-2 transition-colors hover:border-blue-300 hover:bg-blue-50/30 sm:min-h-[120px] sm:w-auto sm:shrink sm:p-3">
                            <span className="flex items-center justify-between gap-2">
                                <span className={`flex size-6 items-center justify-center rounded-full ${stage.state === 'complete' ? 'bg-emerald-700 text-white' : stage.state === 'blocked' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                    <span className="material-symbols-outlined text-sm">{stage.state === 'complete' ? 'check' : stage.state === 'blocked' ? 'priority_high' : 'arrow_forward'}</span>
                                </span>
                                <span aria-label={stateText[stage.state]} title={stateText[stage.state]} className={`size-2 rounded-full ${stateColor[stage.state]}`} />
                            </span>
                            <span className="mt-1 block truncate text-xs font-semibold text-slate-950 sm:mt-2">{index + 1}. {stage.title}</span>
                            <span className="mt-0.5 block text-[10px] font-medium text-slate-500">{stateText[stage.state]}</span>
                            {stage.detail && <span className="mt-0.5 block line-clamp-2 text-[10px] leading-tight text-slate-600 sm:text-[11px] sm:leading-snug">{stage.detail}</span>}
                        </Link>
                    ))}
                </div>
                <div className="mt-2 flex sm:hidden" role="group" aria-label="Progress slider controls">
                    <span className="sr-only" aria-live="polite">Stage {activeStage} of {stages.length}</span>
                    <div className="flex w-full items-center gap-1.5">
                        {stages.map((stage, index) => (
                            <button key={stage.title} type="button" aria-label={`Show ${stage.title} stage, ${index + 1} of ${stages.length}`} aria-current={activeStage === index + 1 ? 'step' : undefined} onClick={() => {
                                const slider = progressSliderRef.current;
                                const slide = slider?.querySelector<HTMLElement>(`[data-progress-slide="${index}"]`);
                                if (!slider || !slide) return;
                                const inset = Number.parseFloat(window.getComputedStyle(slider).scrollPaddingLeft) || 24;
                                const snapLine = slider.getBoundingClientRect().left + slider.clientLeft + inset;
                                slider.scrollBy({ left: slide.getBoundingClientRect().left - snapLine, behavior: 'smooth' });
                            }} className={`h-1.5 flex-1 rounded-full transition-colors ${index === activeStage - 1 ? 'bg-blue-700' : 'bg-slate-200'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="flex flex-col gap-3 rounded-lg bg-slate-900 p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="max-w-3xl">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">Next recommended action</p>
                    <h2 className="mt-1 text-lg font-semibold">{nextStep.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-300">{nextStep.detail}</p>
                </div>
                <Link href={nextStep.href} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                    {nextStep.action}<span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
            </section>

            {children}
        </div>
    );
}

export function SummaryCard({ title, value, detail, href, action, state }: { title: string; value: string; detail: string; href: string; action: string; state?: string }) {
    return (
        <article className="flex min-h-0 flex-col rounded-md border border-slate-200 bg-white p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
                {state && <span className="text-[11px] font-medium text-slate-500">{state}</span>}
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 flex-1 text-[11px] leading-relaxed text-slate-600">{detail}</p>
            <Link href={href} className="mt-2 inline-flex min-h-8 items-center gap-1 self-start text-xs font-semibold text-blue-700 hover:underline">{action}<span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
        </article>
    );
}

export function QueryMessage({ loading, error, empty, onRetry, children }: { loading: boolean; error: boolean; empty: boolean; onRetry: () => void; children: React.ReactNode }) {
    if (loading) return <p className="px-1 py-3 text-xs text-slate-500">Loading…</p>;
    if (error) return <div role="alert" className="bg-rose-50 px-3 py-2 text-xs text-rose-800">This information could not be loaded. <button type="button" onClick={onRetry} className="font-semibold underline">Try again</button></div>;
    if (empty) return <p className="px-1 py-3 text-xs text-slate-500">No records available yet.</p>;
    return <>{children}</>;
}
