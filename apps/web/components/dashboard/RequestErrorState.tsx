'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { getRequestFailureKind, reportRequestFailure } from '@/lib/requestErrors';

export function ResponsiveRetryAction({
  onRetry,
  label = 'Try again',
  variant = 'subtle',
  className = '',
}: {
  onRetry: () => void;
  label?: string;
  variant?: 'subtle' | 'solid';
  className?: string;
}) {
  const iconStyle = variant === 'solid'
    ? 'border border-white/30 bg-blue-700 text-white'
    : 'border border-current/20 bg-white text-current';

  return (
    <button
      type="button"
      onClick={onRetry}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${className}`}
    >
      <span className={`inline-flex size-9 items-center justify-center rounded-md sm:hidden ${iconStyle}`} aria-hidden="true">
        <span className="material-symbols-outlined text-lg">refresh</span>
      </span>
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only sm:hidden">{label}</span>
    </button>
  );
}

export function RequestErrorState({
  area,
  label,
  error,
  onRetry,
  supportHref = '/dashboard/account-manager/messages',
  compact = true,
}: {
  area: string;
  label: string;
  error: unknown;
  onRetry: () => void;
  supportHref?: string;
  compact?: boolean;
}) {
  useEffect(() => {
    reportRequestFailure(area, error);
  }, [area, error]);

  const kind = getRequestFailureKind(error);
  const sectionLabel = label.toLowerCase();
  const content = kind === 'unauthenticated'
    ? {
        title: 'Your session has expired',
        message: `Sign in again to load ${sectionLabel}. Your other dashboard sections remain available.`,
        action: <Link href="/login" className="font-semibold underline underline-offset-2">Sign in</Link>,
      }
    : kind === 'onboarding_required'
      ? {
          title: 'Finish onboarding to access delegated work',
          message: 'Complete the remaining setup steps, then return to your assigned tasks.',
          action: <Link href="/onboarding" className="font-semibold underline underline-offset-2">Continue onboarding</Link>,
        }
      : kind === 'forbidden'
      ? {
          title: 'You cannot access this section',
          message: `Your account does not currently have permission to view ${sectionLabel}.`,
          action: <Link href={supportHref} className="font-semibold underline underline-offset-2">Contact support</Link>,
        }
      : {
          title: `${label} could not be loaded`,
          message: 'Please try again in a moment. Other dashboard sections remain available.',
          action: null,
        };

  return (
    <div role="alert" className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-900 ${compact ? 'px-3 py-2 text-xs' : 'p-4 text-sm'}`}>
      <div className="min-w-0">
        <p className="font-semibold">{content.title}</p>
        <p className="mt-0.5 text-rose-800">{content.message}{content.action ? <> {' '}{content.action}</> : null}</p>
      </div>
      <ResponsiveRetryAction onRetry={onRetry} className="shrink-0 text-current sm:underline sm:underline-offset-2" />
    </div>
  );
}
