'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useMcomWallet, type McomWalletTransaction } from '@/hooks/useMcomWallet';
import { useAuthStore } from '@/store/useAuthStore';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';

function formatCredits(amount: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(Number(amount || 0));
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function TransactionRow({
  transaction,
  taskHrefBase,
}: {
  transaction: McomWalletTransaction;
  taskHrefBase: string;
}) {
  const incoming = transaction.type === 'CREDIT';
  const label = transaction.description || transaction.category.replaceAll('_', ' ').toLowerCase();

  return (
    <li className="flex flex-col gap-3 border-b border-slate-100 px-3 py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            incoming ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[19px]">
            {incoming ? 'arrow_downward' : 'arrow_upward'}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold capitalize text-slate-900">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">{formatDate(transaction.createdAt)}</p>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {transaction.platformName || 'MCOM Central'}
            {transaction.reference ? ` · ${transaction.reference}` : ''}
          </p>
          {transaction.taskId && (
            <Link
              href={`${taskHrefBase}/${transaction.taskId}`}
              className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-100"
            >
              <span className="material-symbols-outlined shrink-0 text-[14px]">open_in_new</span>
              <span className="truncate">View task{transaction.taskTitle ? `: ${transaction.taskTitle}` : ''}</span>
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-baseline justify-between border-t border-slate-100 pt-2 sm:block sm:shrink-0 sm:border-0 sm:pt-0 sm:text-right">
        <p className={`text-sm font-bold tabular-nums sm:text-base ${incoming ? 'text-emerald-700' : 'text-slate-900'}`}>
          {incoming ? '+' : '−'}
          {formatCredits(transaction.amount)} MCOM
        </p>
        <p className="text-[11px] text-slate-400 tabular-nums sm:mt-0.5">
          bal. {formatCredits(transaction.balanceAfter)}
        </p>
      </div>
    </li>
  );
}

interface McomWalletPanelProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Shared MCOM wallet view for agents, consultants and account managers.
 * Balance and ledger come from Central Hub; 247GBS is display-only.
 */
export default function McomWalletPanel({
  eyebrow = 'Affiliate workspace',
  title = 'Earnings',
  subtitle = 'Central Hub MCOM wallet for task payouts, affiliate earnings and holds.',
}: McomWalletPanelProps = {}) {
  const [page, setPage] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuthStore();
  const { wallet, holds, transactions, totalPages, isLoading, isError, error, refetch } =
    useMcomWallet(page);

  const normalizedRole = (user?.role || '').replace(/_/g, '-');
  const dashboardBase =
    normalizedRole === 'account-manager'
      ? '/dashboard/account-manager'
      : normalizedRole === 'consultant'
        ? '/dashboard/consultant'
        : '/dashboard/agent';
  const taskHrefBase = `${dashboardBase}/tasks`;

  const currency = (wallet?.currency || 'MCOM').toUpperCase();
  const activeHoldsAmount = holds.reduce((sum, hold) => sum + Number(hold.amount || 0), 0);

  const cards = [
    {
      id: 'available-balance',
      label: 'Available Balance',
      value: formatCredits(wallet?.availableBalance ?? 0),
      currency,
      badge: null as string | null,
      description: 'Funds available to use',
      icon: 'account_balance_wallet',
      cardClass: 'border-slate-800 bg-[#202b42] text-white',
      labelClass: 'text-slate-300',
      currencyClass: 'text-blue-300',
      descClass: 'text-slate-300',
      iconClass: 'text-blue-300',
      badgeClass: 'text-slate-300',
    },
    {
      id: 'active-holds',
      label: 'Active Holds',
      value: formatCredits(activeHoldsAmount),
      currency,
      badge: `${holds.length} active hold${holds.length === 1 ? '' : 's'}`,
      description: 'Funds reserved for ongoing tasks',
      icon: 'lock',
      cardClass: 'border-amber-200/80 bg-amber-50 text-amber-950',
      labelClass: 'text-amber-800/80',
      currencyClass: 'text-amber-700',
      descClass: 'text-amber-800/80',
      iconClass: 'text-amber-700',
      badgeClass: 'text-amber-700',
    },
    {
      id: 'total-balance',
      label: 'Total Wallet Balance',
      value: formatCredits(wallet?.balance ?? 0),
      currency,
      badge: null as string | null,
      description: 'Your overall MCOM wallet balance',
      icon: 'account_balance',
      cardClass: 'border-emerald-200/80 bg-emerald-50 text-emerald-950',
      labelClass: 'text-emerald-800/80',
      currencyClass: 'text-emerald-700',
      descClass: 'text-emerald-800/80',
      iconClass: 'text-emerald-700',
      badgeClass: 'text-emerald-700',
    },
  ];

  const scrollToSlide = (index: number) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, index));
    setActiveSlide(clamped);
    const el = sliderRef.current;
    if (!el) return;
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) {
      const paddingLeft = parseFloat(window.getComputedStyle(el).paddingLeft || '0');
      el.scrollTo({
        left: Math.max(0, child.offsetLeft - paddingLeft),
        behavior: 'smooth',
      });
    }
  };

  const handleSliderScroll = () => {
    const el = sliderRef.current;
    if (!el || !el.clientWidth) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 4) {
      if (activeSlide !== 0) setActiveSlide(0);
      return;
    }
    if (el.scrollLeft >= maxScrollLeft - 12) {
      if (activeSlide !== cards.length - 1) setActiveSlide(cards.length - 1);
      return;
    }
    const paddingLeft = parseFloat(window.getComputedStyle(el).paddingLeft || '0');
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < el.children.length; i += 1) {
      const child = el.children[i] as HTMLElement;
      const distance = Math.abs(child.offsetLeft - paddingLeft - el.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }
    if (closestIndex !== activeSlide) {
      setActiveSlide(closestIndex);
    }
  };

  if (isLoading && !isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-500" role="status">
        <span className="size-5 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />
        Loading your MCOM wallet…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-3.5 px-3 pt-2 pb-5 sm:space-y-5 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <header className="space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{eyebrow}</p>
        <h1 className="text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">{title}</h1>
        <p className="max-w-2xl text-xs leading-snug text-slate-500 sm:text-sm">{subtitle}</p>
      </header>

      {isError ? (
        <RequestErrorState
          area="MCOM wallet"
          label="MCOM wallet"
          error={error}
          onRetry={() => void refetch()}
          supportHref={`${dashboardBase}/messages`}
          compact={false}
        />
      ) : (
        <>
          {/* Mobile: Compact horizontal swipe carousel with next-card preview & subtle pagination dots */}
          <section className="space-y-2 sm:hidden" aria-label="MCOM wallet summary">
            <div
              ref={sliderRef}
              onScroll={handleSliderScroll}
              className="-mx-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-3 px-3 pb-0.5 touch-pan-x no-scrollbar"
            >
              {cards.map((card) => (
                <article
                  key={card.id}
                  className={`w-[85%] max-w-[320px] shrink-0 snap-start rounded-xl border p-3.5 ${card.cardClass}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] leading-none ${card.labelClass}`}>
                      {card.label}
                    </span>
                    <span
                      className={`material-symbols-outlined text-[16px] leading-none ${card.iconClass}`}
                      aria-hidden="true"
                    >
                      {card.icon}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold leading-none tracking-tight tabular-nums">
                        {card.value}
                      </span>
                      <span className={`text-[11px] font-semibold uppercase tracking-wider leading-none ${card.currencyClass}`}>
                        {card.currency}
                      </span>
                    </div>
                    {card.badge && (
                      <span className={`text-[10px] font-semibold tabular-nums ${card.badgeClass}`}>
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <p className={`mt-1 text-[11px] leading-snug ${card.descClass}`}>{card.description}</p>
                </article>
              ))}
            </div>

            <div
              className="flex items-center justify-center gap-1.5 pt-0.5"
              role="tablist"
              aria-label="Wallet summary cards"
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  scrollToSlide(activeSlide + 1);
                } else if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  scrollToSlide(activeSlide - 1);
                }
              }}
            >
              {cards.map((card, index) => {
                const isActive = index === activeSlide;
                return (
                  <button
                    key={card.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={card.label}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => scrollToSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                      isActive ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                );
              })}
            </div>
          </section>

          {/* Tablet (2-col) & Desktop (3-col): Balanced horizontal grid */}
          <section
            className="hidden sm:grid sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3 lg:gap-4"
            aria-label="MCOM wallet summary"
          >
            {cards.map((card) => (
              <article
                key={card.id}
                className={`min-w-0 rounded-xl border p-4 lg:p-4.5 ${card.cardClass}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] leading-none ${card.labelClass}`}>
                    {card.label}
                  </span>
                  <span
                    className={`material-symbols-outlined text-[16px] leading-none ${card.iconClass}`}
                    aria-hidden="true"
                  >
                    {card.icon}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold leading-none tracking-tight tabular-nums lg:text-[26px]">
                      {card.value}
                    </span>
                    <span className={`text-[11px] font-semibold uppercase tracking-wider leading-none ${card.currencyClass}`}>
                      {card.currency}
                    </span>
                  </div>
                  {card.badge && (
                    <span className={`text-[10px] font-semibold tabular-nums ${card.badgeClass}`}>
                      {card.badge}
                    </span>
                  )}
                </div>

                <p className={`mt-1 text-xs leading-snug ${card.descClass}`}>{card.description}</p>
              </article>
            ))}
          </section>

          {holds.length > 0 && (
            <section className="border border-amber-200 bg-amber-50 p-4" aria-label="Escrow holds">
              <h2 className="text-sm font-semibold text-amber-900">Reserved for work in progress</h2>
              <ul className="mt-2 space-y-1 text-sm text-amber-900">
                {holds.map((hold) => (
                  <li key={hold.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="truncate">{hold.description || hold.reference || 'Task escrow'}</span>
                    <span className="font-semibold tabular-nums">{formatCredits(hold.amount)} MCOM</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="transactions-heading">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 id="transactions-heading" className="text-base font-semibold text-slate-950">
                  Money in and out
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Every entry below is written to the Central Hub ledger.
                </p>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="min-h-8 rounded-md border border-slate-200 px-2 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="min-h-8 rounded-md border border-slate-200 px-2 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {transactions.length ? (
              <ul className="border border-slate-200 bg-white">
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    taskHrefBase={taskHrefBase}
                  />
                ))}
              </ul>
            ) : (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">
                  account_balance_wallet
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-700">No transactions yet</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
