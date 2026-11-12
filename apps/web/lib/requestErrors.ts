import axios from 'axios';

export type RequestFailureKind = 'unauthenticated' | 'forbidden' | 'onboarding_required' | 'unavailable';

export function getRequestFailureKind(error: unknown): RequestFailureKind {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) return 'unauthenticated';
    if (status === 403) {
      const data = error.response?.data as { code?: string; message?: string } | undefined;
      const code = data?.code;
      const message = typeof data?.message === 'string' ? data.message.toLowerCase() : '';
      if (
        code === 'ONBOARDING_REQUIRED' ||
        code === 'VERIFICATION_PENDING' ||
        code === 'AFFILIATE_QUALIFICATION_REQUIRED' ||
        code === 'AFFILIATE_NOT_VERIFIED' ||
        code === 'ONBOARDING_INCOMPLETE' ||
        message.includes('onboarding') ||
        message.includes('verification')
      ) {
        return 'onboarding_required';
      }
      return 'forbidden';
    }
  }
  if (error && typeof error === 'object') {
    const record = error as { status?: number; code?: string; message?: string; payload?: { code?: string } };
    if (record.status === 401) return 'unauthenticated';
    if (record.status === 403) {
      const code = record.code || record.payload?.code;
      const message = typeof record.message === 'string' ? record.message.toLowerCase() : '';
      if (
        code === 'ONBOARDING_REQUIRED' ||
        code === 'VERIFICATION_PENDING' ||
        code === 'AFFILIATE_QUALIFICATION_REQUIRED' ||
        code === 'AFFILIATE_NOT_VERIFIED' ||
        code === 'ONBOARDING_INCOMPLETE' ||
        message.includes('onboarding') ||
        message.includes('verification')
      ) {
        return 'onboarding_required';
      }
      return 'forbidden';
    }
  }
  return 'unavailable';
}

/** Log only safe diagnostics. Never include response bodies, URLs, tokens, or user data. */
export function reportRequestFailure(area: string, error: unknown) {
  const kind = getRequestFailureKind(error);
  const status = axios.isAxiosError(error)
    ? error.response?.status
    : (error as { status?: number } | null)?.status;
  const code = axios.isAxiosError(error)
    ? error.code
    : (error as { code?: string } | null)?.code;
  console.warn(`[${area}] Request failed`, { kind, status, code });
}

export function getActionFailureMessage(error: unknown, fallback: string) {
  const kind = getRequestFailureKind(error);
  if (kind === 'unauthenticated') return 'Your session has expired. Sign in again, then retry.';
  if (kind === 'forbidden') return 'You do not have access to perform this action. Contact support if you think this is a mistake.';
  if (kind === 'onboarding_required') return 'Complete your onboarding before opening delegated tasks.';
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 400 || status === 404 || status === 409 || status === 422) {
      const data = error.response?.data as
        | { message?: string | string[]; error?: { message?: string | string[] } }
        | undefined;
      const rawMessage = data?.message ?? data?.error?.message;
      if (Array.isArray(rawMessage) && rawMessage.length > 0) {
        return rawMessage.join(' ');
      }
      if (typeof rawMessage === 'string' && rawMessage.trim()) {
        return rawMessage.trim();
      }
    }
  }
  return fallback;
}

/**
 * Prevents React Query v5 from flipping `isError -> false` and `isLoading -> true`
 * when `refetch()` is called on a query whose initial load failed (`data === undefined`).
 * Keeping `isError: true` during the retry prevents `<RequestErrorState>` from unmounting
 * and flashing the page.
 */
export function stabilizeErrorRetry<
  T extends {
    data: unknown;
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
    errorUpdateCount: number;
    error: unknown;
    failureReason: unknown;
  },
>(query: T): T {
  const hasFailedPreviously = query.errorUpdateCount > 0 && query.data === undefined;
  return {
    ...query,
    isLoading: query.isLoading && !hasFailedPreviously,
    isError: query.isError || (query.isFetching && hasFailedPreviously),
    error: (query.error ?? query.failureReason) as T['error'],
  };
}
