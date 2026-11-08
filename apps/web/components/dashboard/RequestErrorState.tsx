'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRequestFailureKind, reportRequestFailure } from '@/lib/requestErrors';

export function ResponsiveRetryAction({
  onRetry,
  label = 'Retry',
  variant = 'subtle',
  tone = 'danger',
  className = '',
}: {
  onRetry: () => unknown;
  label?: string;
  variant?: 'subtle' | 'solid';
  tone?: 'danger' | 'neutral';
  className?: string;
}) {
  const [rotation, setRotation] = useState(0);

  const handleClick = () => {
    setRotation((prev) => prev + 360);
    try {
      void onRetry();
    } catch {
      // ignore synchronous errors
    }
  };

  const desktopStyle =
    variant === 'solid'
      ? 'sm:border sm:border-blue-700 sm:bg-blue-700 sm:text-white sm:hover:bg-blue-800'
      : 'sm:border sm:border-slate-200 sm:bg-white sm:text-slate-700 sm:hover:bg-slate-50 sm:hover:text-slate-900';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-md p-1.5 transition-colors sm:px-2.5 sm:py-1 sm:text-[11px] sm:font-semibold sm:shadow-2xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${tone === 'neutral' ? 'text-slate-600 hover:text-slate-900' : 'text-rose-700 hover:text-rose-900'} ${desktopStyle} ${className}`}
    >
      <span
        className="material-symbols-outlined leading-none"
        style={{
          fontSize: '18px',
          display: 'inline-block',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 550ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-hidden="true"
      >
        refresh
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function RequestErrorState({
  area,
  label,
  error,
  onRetry,
  compact = true,
}: {
  area: string;
  label: string;
  error: unknown;
  onRetry: () => void;
  /** @deprecated Support link was removed from the compact error UI; kept for call-site compatibility. */
  supportHref?: string;
  compact?: boolean;
}) {
  useEffect(() => {
    reportRequestFailure(area, error);
  }, [area, error]);

  const kind = getRequestFailureKind(error);
  const sectionLabel = label.toLowerCase();
  const content =
    kind === 'unauthenticated'
      ? {
          icon: 'lock',
          title: 'Session expired',
          message: `Sign in again to view ${sectionLabel}.`,
          action: (
            <Link href="/login" className="font-semibold text-blue-700 hover:underline">
              Sign in
            </Link>
          ),
        }
      : kind === 'onboarding_required'
        ? {
            icon: 'flag',
            title: 'Onboarding required',
            message: 'Complete setup to unlock assigned tasks.',
            action: (
              <Link href="/onboarding" className="font-semibold text-blue-700 hover:underline">
                Finish setup
              </Link>
            ),
          }
        : kind === 'forbidden'
          ? {
              icon: 'block',
              title: 'Access restricted',
              message: `No permission to view ${sectionLabel}.`,
              action: null,
            }
          : {
              icon: 'error_outline',
              title: `Couldn't load ${sectionLabel}`,
              message: 'Temporary connection issue.',
              action: null,
            };

  return (
    <div
      role="alert"
      className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-rose-200/80 bg-rose-50/40 [contain:inline-size] ${
        compact ? 'px-3 py-2' : 'px-3.5 py-2.5'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-rose-100/80 text-rose-700"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined leading-none" style={{ fontSize: '15px' }}>
            {content.icon}
          </span>
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900">{content.title}</p>
          <p className="truncate text-[11px] text-slate-600">
            {content.message}
            {content.action ? <> · {content.action}</> : null}
          </p>
        </div>
      </div>
      <ResponsiveRetryAction onRetry={onRetry} />
    </div>
  );
}
