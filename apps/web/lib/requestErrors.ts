import axios from 'axios';

export type RequestFailureKind = 'unauthenticated' | 'forbidden' | 'onboarding_required' | 'unavailable';

export function getRequestFailureKind(error: unknown): RequestFailureKind {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) return 'unauthenticated';
    if (status === 403) {
      const message = error.response?.data?.message;
      if (typeof message === 'string' && message.toLowerCase().includes('complete onboarding')) {
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
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const code = axios.isAxiosError(error) ? error.code : undefined;
  console.error(`[${area}] Request failed`, { kind, status, code });
}

export function getActionFailureMessage(error: unknown, fallback: string) {
  const kind = getRequestFailureKind(error);
  if (kind === 'unauthenticated') return 'Your session has expired. Sign in again, then retry.';
  if (kind === 'forbidden') return 'You do not have access to perform this action. Contact support if you think this is a mistake.';
  if (kind === 'onboarding_required') return 'Complete your onboarding before opening delegated tasks.';
  return fallback;
}
