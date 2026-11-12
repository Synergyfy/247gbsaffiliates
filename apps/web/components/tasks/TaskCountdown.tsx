'use client';

import { useEffect, useMemo, useState } from 'react';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const CLOSED_STATUSES = new Set([
    'completed',
    'approved',
    'cancelled',
    'declined',
]);

function pad(value: number) {
    return value < 10 ? `0${value}` : String(value);
}

function splitRemaining(milliseconds: number) {
    const total = Math.max(0, milliseconds);
    return {
        days: Math.floor(total / DAY),
        hours: Math.floor((total % DAY) / HOUR),
        minutes: Math.floor((total % HOUR) / MINUTE),
        seconds: Math.floor((total % MINUTE) / SECOND),
    };
}

export interface TaskCountdownProps {
    dueDate?: string | null;
    status?: string | null;
    className?: string;
    compact?: boolean;
}

/**
 * Live deadline countdown for an affiliate task. Ticks every second and stops
 * when the task is closed or the deadline has passed.
 */
export default function TaskCountdown({
    dueDate,
    status,
    className = '',
    compact = false,
}: TaskCountdownProps) {
    const deadlineMs = useMemo(() => {
        if (!dueDate) return null;
        const time = new Date(dueDate).getTime();
        return Number.isFinite(time) ? time : null;
    }, [dueDate]);

    const closed = status ? CLOSED_STATUSES.has(status.toLowerCase()) : false;
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (deadlineMs === null || closed) return;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [deadlineMs, closed]);

    if (deadlineMs === null || closed) return null;

    const remaining = deadlineMs - now;
    const overdue = remaining <= 0;
    const { days, hours, minutes, seconds } = splitRemaining(remaining);

    const tone = overdue
        ? 'text-rose-600 font-bold'
        : remaining <= DAY
            ? 'text-red-600 font-bold'
            : remaining <= 3 * DAY
                ? 'text-amber-600 font-semibold'
                : 'text-blue-600 font-semibold';

    const label = overdue
        ? `Overdue by ${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`
        : days > 0
            ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
            : `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

    return (
        <span
            className={`inline-flex items-center gap-1 text-[11px] leading-none ${tone} ${className}`}
            title={`Deadline: ${new Date(deadlineMs).toLocaleString()}`}
            aria-label={overdue ? `Task overdue. ${label}` : `Time remaining: ${label}`}
        >
            <span className="material-symbols-outlined !text-[13px] leading-none" aria-hidden="true">
                {overdue ? 'warning' : 'timer'}
            </span>
            <span className="tabular-nums whitespace-nowrap">
                {overdue ? label : `Due in ${label}`}
            </span>
        </span>
    );
}
