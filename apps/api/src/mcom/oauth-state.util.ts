import type { Request, Response } from 'express';

const STATE_COOKIE = 'mcom_oauth_state';
const RETURN_COOKIE = 'mcom_oauth_return';
const MAX_AGE = 10 * 60 * 1000; // 10 minutes

function cookieOpts(maxAge = MAX_AGE): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  };
}

export function setOAuthStateCookie(res: Response, state: string): void {
  res.cookie(STATE_COOKIE, state, cookieOpts());
}

export function getOAuthStateCookie(req: Request): string | undefined {
  const value = (req.cookies as Record<string, unknown> | undefined)?.[
    STATE_COOKIE
  ];
  return typeof value === 'string' ? value : undefined;
}

export function clearOAuthStateCookie(res: Response): void {
  res.clearCookie(STATE_COOKIE, { path: '/' });
}

export function setReturnCookie(
  res: Response,
  data: { card: string; business: string; redirect: string },
): void {
  res.cookie(RETURN_COOKIE, JSON.stringify(data), cookieOpts());
}

export function getReturnCookie(
  req: Request,
): { card: string; business: string; redirect: string } | null {
  const raw = (req.cookies as Record<string, unknown> | undefined)?.[
    RETURN_COOKIE
  ];
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      card: typeof parsed.card === 'string' ? parsed.card : '',
      business: typeof parsed.business === 'string' ? parsed.business : '',
      redirect: typeof parsed.redirect === 'string' ? parsed.redirect : '',
    };
  } catch {
    return null;
  }
}

export function clearReturnCookie(res: Response): void {
  res.clearCookie(RETURN_COOKIE, { path: '/' });
}
