'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMcomWallet, type McomWalletTransaction } from '@/hooks/useMcomWallet';
import { useAuthStore } from '@/store/useAuthStore';

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
    <li className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-0 sm:px-5">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
          incoming ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }`}
        aria-hidden="true"
      >
        <span className="material-symbols-outlined text-[19px]">
          {incoming ? 'arrow_downward' : 'arrow_upward'}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium capitalize text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{formatDate(transaction.createdAt)}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {transaction.platformName || 'MCOM Central'}
          {transaction.reference ? ` · ${transaction.reference}` : ''}
        </p>
        {transaction.taskId && (
          <Link
            href={`${taskHrefBase}/${transaction.taskId}`}
            className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-100"
          >
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            View task{transaction.taskTitle ? `: ${transaction.taskTitle}` : ''}
          </Link>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-semibold tabular-nums ${incoming ? 'text-emerald-700' : 'text-slate-900'}`}>
          {incoming ? '+' : '−'}
          {formatCredits(transaction.amount)} MCOM
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400 tabular-nums">
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
  subtitle = 'Your Central Hub MCOM wallet. Task payments are credited here after the business approves the work; platform fees are deducted from the business charge, never from your payout.',
}: McomWalletPanelProps = {}) {
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const { wallet, holds, transactions, totalPages, isLoading, isError, error, refetch, isFetching } =
    useMcomWallet(page);

  const normalizedRole = (user?.role || '').replace(/_/g, '-');
  const taskHrefBase =
    normalizedRole === 'account-manager'
      ? '/dashboard/account-manager/tasks'
      : normalizedRole === 'consultant'
        ? '/dashboard/consultant/tasks'
        : '/dashboard/agent/tasks';

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-500" role="status">
        <span className="size-5 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />
        Loading your MCOM wallet…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4 py-5 sm:space-y-5 lg:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {isError ? (
        <section className="border-l-4 border-red-600 bg-red-50 p-4" role="alert">
          <h2 className="font-semibold text-red-900">MCOM wallet couldn’t be loaded</h2>
          <p className="mt-1 text-sm text-red-800">
            {error instanceof Error ? error.message : 'Check your connection and try again.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 min-h-9 rounded-md bg-red-800 px-4 text-sm font-semibold text-white hover:bg-red-900"
          >
            Try again
          </button>
        </section>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3" aria-label="MCOM wallet summary">
            <article className="border border-slate-200 bg-white p-4 sm:p-5">
              <p className="text-xs font-medium text-slate-500">MCOM balance</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">
                {formatCredits(wallet?.balance ?? 0)}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">MCOM</p>
            </article>
            <article className="border border-slate-200 bg-white p-4 sm:p-5">
              <p className="text-xs font-medium text-slate-500">Available to use</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">
                {formatCredits(wallet?.availableBalance ?? 0)}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                {holds.length ? `${holds.length} active hold${holds.length === 1 ? '' : 's'}` : 'No holds'}
              </p>
            </article>
            <article className="border border-slate-200 bg-white p-4 sm:p-5">
              <p className="text-xs font-medium text-slate-500">Wallet status</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 capitalize">
                {(wallet?.status || 'active').toLowerCase()}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                {wallet?.lastTransactionAt
                  ? `Last activity ${formatDate(wallet.lastTransactionAt)}`
                  : 'No activity yet'}
              </p>
            </article>
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
              <div className="border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300" aria-hidden="true">
                  account_balance_wallet
                </span>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">No transactions yet</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Task payments will appear here once a business approves your completed work.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
