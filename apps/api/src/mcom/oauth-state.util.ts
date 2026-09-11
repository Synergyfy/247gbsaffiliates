import { Response } from 'express';

const STATE_COOKIE = 'mcom_oauth_state';
const RETURN_COOKIE = 'mcom_oauth_return';
const MAX_AGE = 10 * 60 * 1000; // 10 minutes

function cookieOpts(maxAge = MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  };
}

export function setOAuthStateCookie(res: Response, state: string) {
  res.cookie(STATE_COOKIE, state, cookieOpts());
}

export function getOAuthStateCookie(req: any): string | undefined {
  return req.cookies?.[STATE_COOKIE];
}

export function clearOAuthStateCookie(res: Response) {
  res.clearCookie(STATE_COOKIE, { path: '/' });
}

export function setReturnCookie(res: Response, data: Record<string, string>) {
  res.cookie(RETURN_COOKIE, JSON.stringify(data), cookieOpts());
}

export function getReturnCookie(req: any): Record<string, string> | null {
  const raw = req.cookies?.[RETURN_COOKIE];
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearReturnCookie(res: Response) {
  res.clearCookie(RETURN_COOKIE, { path: '/' });
}
