'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

interface ReferralPanelProps {
  referralCode?: string | null;
  referralLink?: string | null;
}

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Clipboard API can be blocked by permissions — fall back to selection.
    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(input);
    return copied;
  }
}

/**
 * Shows the signed-in affiliate's own Central Hub referral code and
 * shareable registration link. Populated from the SSO profile sync, so it
 * works for agents, consultants and account managers alike.
 */
export default function ReferralPanel({
  referralCode,
  referralLink,
}: ReferralPanelProps = {}) {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const code = referralCode ?? user?.referralCode ?? null;
  const link = referralLink ?? user?.referralLink ?? null;

  // Admins are excluded from the referral programme. Accounts without a code
  // yet also have nothing to share — hide the panel rather than show an
  // empty card.
  if ((user?.role || '').toLowerCase() === 'admin') return null;
  if (!code && !link) return null;

  const copy = async (kind: 'code' | 'link', value: string) => {
    if (!value) return;
    await copyText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const share = async () => {
    if (!link) return;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Join 247GBS Affiliates',
          text: 'Register using my referral link:',
          url: link,
        });
        return;
      } catch {
        // User dismissed the share sheet — fall through to copy.
      }
    }
    await copy('link', link);
  };

  return (
    <section
      aria-labelledby="referral-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
            Referral programme
          </p>
          <h2 id="referral-heading" className="mt-1 text-base font-semibold text-slate-950">
            Your referral code and link
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">
            Share your link with businesses and customers. Anyone who registers
            with it is attributed to you in Central Hub.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-3">
          {code && (
            <div>
              <p className="text-[11px] font-medium text-slate-500">Your code</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-bold tracking-wider text-slate-900">
                  {code}
                </code>
                <button
                  type="button"
                  onClick={() => void copy('code', code)}
                  className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-300"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied === 'code' ? 'check' : 'content_copy'}
                  </span>
                  {copied === 'code' ? 'Copied' : 'Copy code'}
                </button>
              </div>
            </div>
          )}

          {link && (
            <div>
              <p className="text-[11px] font-medium text-slate-500">Your referral link</p>
              <div className="mt-1 flex items-center gap-2">
                <input
                  readOnly
                  value={link}
                  aria-label="Your referral link"
                  className="min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => void copy('link', link)}
                  className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md bg-blue-700 px-3 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied === 'link' ? 'check' : 'link'}
                  </span>
                  {copied === 'link' ? 'Copied' : 'Copy link'}
                </button>
              </div>
            </div>
          )}
        </div>

        {link && (
          <button
            type="button"
            onClick={() => void share()}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 text-xs font-semibold text-blue-800 hover:border-blue-300 hover:bg-blue-100"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            Share referral link
          </button>
        )}
      </div>
    </section>
  );
}
