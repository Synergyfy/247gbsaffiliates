'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import {
  useBusinessAcquisitionStream,
  type BusinessAcquisitionStreamEvent,
} from '@/hooks/useBusinessAcquisitionStream';

function eventIcon(type: string): string {
  switch (type) {
    case 'invitation_opened':
      return 'mark_email_read';
    case 'registration':
      return 'how_to_reg';
    case 'conversion':
      return 'payments';
    case 'onboarding_completed':
      return 'checklist';
    case 'verified':
      return 'verified';
    case 'rejected':
      return 'block';
    default:
      return 'notifications';
  }
}

function eventTone(type: string): string {
  switch (type) {
    case 'conversion':
    case 'verified':
      return 'bg-emerald-50 text-emerald-700';
    case 'registration':
      return 'bg-blue-50 text-blue-700';
    case 'onboarding_completed':
      return 'bg-amber-50 text-amber-800';
    case 'rejected':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function conversionLabel(value?: string | null): string {
  switch ((value ?? '').toLowerCase()) {
    case 'membership':
      return 'Membership';
    case 'access_pass':
      return 'Access pass';
    case 'trial':
      return 'Trial';
    default:
      return 'Payment';
  }
}

function timeAgo(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (Number.isNaN(diff)) return '';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

/**
 * Live feed of Central Hub acquisition milestones. The component owns one SSE
 * connection per mounted dashboard page and reads persisted history so the
 * feed survives reloads.
 */
export function AcquisitionActivityFeed({
  admin = false,
  limit = 10,
  compact = false,
}: {
  admin?: boolean;
  limit?: number;
  compact?: boolean;
}) {
  const endpoint = admin
    ? '/business-acquisition/admin/events'
    : '/business-acquisition/events';
  const queryKey = admin
    ? ['business-acquisition-admin-events', limit]
    : ['business-acquisition-events', limit];

  const eventsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get(endpoint, { params: { limit } });
      return (response.data?.data ?? []) as BusinessAcquisitionStreamEvent[];
    },
  });

  useBusinessAcquisitionStream();

  const items = eventsQuery.data ?? [];

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-950">
              {admin ? 'Network activity' : 'Live acquisition activity'}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {admin
              ? 'Signups and payments across every affiliate, streamed from Central Hub.'
              : 'Signups and payments from businesses you invited, streamed from Central Hub.'}
          </p>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          {items.length} recent event{items.length === 1 ? '' : 's'}
        </span>
      </div>

      {eventsQuery.isLoading ? (
        <div className="flex min-h-24 items-center justify-center gap-2 text-xs text-slate-500">
          <span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />
          Loading activity…
        </div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500">
          No acquisition activity yet. Invite a business to see signups and payments here.
        </div>
      ) : (
        <ul className={`divide-y divide-slate-100 ${compact ? 'max-h-80 overflow-y-auto' : ''}`}>
          {items.map((event) => (
            <li key={event.id} className="flex items-start gap-3 p-4">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${eventTone(
                  event.type,
                )}`}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {eventIcon(event.type)}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-slate-800">
                  {event.message || `${event.businessName || 'A business'} updated their acquisition.`}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                  <span>{timeAgo(event.occurredAt || event.createdAt)}</span>
                  {event.type === 'conversion' && (
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">
                      {conversionLabel(event.conversionType)}
                      {event.amount != null && Number(event.amount) > 0
                        ? ` · £${Number(event.amount).toFixed(2)}`
                        : ''}
                    </span>
                  )}
                  {admin && event.affiliateId && (
                    <span className="font-mono text-[10px] text-slate-400">
                      affiliate {event.affiliateId.slice(0, 8)}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
