'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export type BusinessAcquisitionStreamEvent = {
  id: string;
  affiliateId: string;
  prospectId: string | null;
  centralBusinessId: string | null;
  type: string;
  businessName: string | null;
  status: string | null;
  message: string | null;
  conversionType: string | null;
  planName: string | null;
  amount: number | null;
  currency: string | null;
  provider: string | null;
  occurredAt: string | null;
  createdAt: string;
};

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7088/api/v1'
).replace(/\/+$/, '');

function conversionLabel(value?: string | null): string {
  switch ((value ?? '').toLowerCase()) {
    case 'membership':
      return 'a membership';
    case 'access_pass':
      return 'an access pass';
    case 'trial':
      return 'a trial';
    default:
      return 'a paid plan';
  }
}

function toastMessage(event: BusinessAcquisitionStreamEvent): string {
  const business = event.businessName || 'A business';
  if (event.message) return event.message;
  switch (event.type) {
    case 'registration':
      return `${business} completed signup on Central Hub.`;
    case 'conversion':
      return `${business} paid for ${conversionLabel(event.conversionType)}.`;
    case 'verified':
      return `${business} acquisition was verified.`;
    case 'rejected':
      return `${business} acquisition was rejected.`;
    default:
      return `${business} updated their acquisition status.`;
  }
}

/**
 * Subscribes to the authenticated SSE stream for business acquisition events.
 * Auth uses the HttpOnly cookie, so no token is ever placed in the URL.
 *
 * Every event invalidates the acquisition and activity queries used by the
 * agent and admin dashboards, then raises a toast for meaningful milestones.
 */
export function useBusinessAcquisitionStream(options: {
  enabled?: boolean;
  onEvent?: (event: BusinessAcquisitionStreamEvent) => void;
} = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const onEventRef = useRef(options.onEvent);
  onEventRef.current = options.onEvent;

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    const seen = new Set<string>();
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: ['business-acquisition'] });
      void queryClient.invalidateQueries({ queryKey: ['business-acquisition-admin'] });
      void queryClient.invalidateQueries({ queryKey: ['business-acquisition-events'] });
      void queryClient.invalidateQueries({ queryKey: ['business-acquisition-admin-events'] });
      void queryClient.invalidateQueries({ queryKey: ['business-acquisition-overview'] });
    };

    const source = new EventSource(
      `${API_BASE}/business-acquisition/events/stream`,
      { withCredentials: true },
    );

    // On (re)connect, refresh persisted history to catch anything that
    // happened while the stream was disconnected.
    source.onopen = () => invalidate();

    source.onmessage = (message) => {
      let event: BusinessAcquisitionStreamEvent | { type: string } | null = null;
      try {
        event = JSON.parse(message.data);
      } catch {
        return;
      }
      if (!event || (event as BusinessAcquisitionStreamEvent).type === 'heartbeat') return;

      const acquisitionEvent = event as BusinessAcquisitionStreamEvent;
      if (acquisitionEvent.id) {
        if (seen.has(acquisitionEvent.id)) return;
        seen.add(acquisitionEvent.id);
        if (seen.size > 250) {
          const oldest = seen.values().next().value;
          if (oldest) seen.delete(oldest);
        }
      }

      void queryClient.invalidateQueries({ queryKey: ['business-acquisition'] });
      void queryClient.invalidateQueries({ queryKey: ['business-acquisition-admin'] });
      void queryClient.invalidateQueries({ queryKey: ['business-acquisition-events'] });
      void queryClient.invalidateQueries({ queryKey: ['business-acquisition-admin-events'] });
      void queryClient.invalidateQueries({ queryKey: ['business-acquisition-overview'] });

      invalidate();

      const text = toastMessage(acquisitionEvent);
      switch (acquisitionEvent.type) {
        case 'registration':
        case 'conversion':
        case 'verified':
          toast.success(text);
          break;
        case 'rejected':
          toast.error(text);
          break;
        case 'onboarding_completed':
          toast.info(text);
          break;
        default:
          break;
      }

      onEventRef.current?.(acquisitionEvent);
    };

    // The browser reconnects EventSource automatically. Keep the connection
    // open on transient network errors rather than tearing it down.
    source.onerror = () => undefined;

    return () => source.close();
  }, [enabled, queryClient]);
}
