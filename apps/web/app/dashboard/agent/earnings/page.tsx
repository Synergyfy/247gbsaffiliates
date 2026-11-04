'use client';

import { useWallet, type Transaction } from '@/hooks/useWallet';

function formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount));
}

function formatTransactionDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? 'Date unavailable'
        : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function TransactionRow({ transaction, currency }: { transaction: Transaction; currency: string }) {
    const incoming = ['deposit', 'payment', 'transfer_in'].includes(transaction.type);
    const label = transaction.description || transaction.type.replaceAll('_', ' ');

    return (
        <li className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-0 sm:px-5">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${incoming ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`} aria-hidden="true">
                <span className="material-symbols-outlined text-[19px]">{incoming ? 'arrow_downward' : 'arrow_upward'}</span>
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium capitalize text-slate-900">{label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{formatTransactionDate(transaction.createdAt)}</p>
                {transaction.status && <p className="mt-0.5 text-[11px] capitalize text-slate-500">{transaction.status.replaceAll('_', ' ')}</p>}
            </div>
            <p className={`shrink-0 text-sm font-semibold tabular-nums ${incoming ? 'text-emerald-700' : 'text-slate-900'}`}>
                {incoming ? '+' : '−'}{formatAmount(transaction.amount, currency)}
            </p>
        </li>
    );
}

export default function AgentEarningsPage() {
    const { wallet, transactions, isLoading, isError, error, refetch } = useWallet();

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-500" role="status">
                <span className="size-5 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />
                Loading your earnings…
            </div>
        );
    }

    const currency = wallet?.currency || 'USD';

    return (
        <div className="mx-auto w-full max-w-[1500px] space-y-4 py-5 sm:space-y-5 lg:py-8">
            <header>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Affiliate workspace</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950">Earnings</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">View your wallet balance and transaction history.</p>
            </header>

            {isError ? (
                <section className="border-l-4 border-red-600 bg-red-50 p-4" role="alert">
                    <h2 className="font-semibold text-red-900">Earnings couldn’t be loaded</h2>
                    <p className="mt-1 text-sm text-red-800">{error instanceof Error ? error.message : 'Check your connection and try again.'}</p>
                    <button type="button" onClick={() => void refetch()} className="mt-3 min-h-9 rounded-md bg-red-800 px-4 text-sm font-semibold text-white hover:bg-red-900">Try again</button>
                </section>
            ) : (
                <>
                    <section className="grid gap-3 sm:grid-cols-2" aria-label="Wallet summary">
                        <article className="border border-slate-200 bg-white p-4 sm:p-5">
                            <p className="text-xs font-medium text-slate-500">Available balance</p>
                            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">{formatAmount(Number(wallet?.balance || 0), currency)}</p>
                        </article>
                        <article className="border border-slate-200 bg-white p-4 sm:p-5">
                            <p className="text-xs font-medium text-slate-500">Recorded transactions</p>
                            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">{transactions?.length || 0}</p>
                        </article>
                    </section>

                    <section aria-labelledby="transactions-heading">
                        <div className="mb-3 flex items-end justify-between gap-3">
                            <div>
                                <h2 id="transactions-heading" className="text-base font-semibold text-slate-950">Transaction history</h2>
                                <p className="mt-0.5 text-xs text-slate-500">Wallet activity recorded for your account.</p>
                            </div>
                        </div>

                        {transactions?.length ? (
                            <ul className="border border-slate-200 bg-white">
                                {transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} currency={currency} />)}
                            </ul>
                        ) : (
                            <div className="border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                                <span className="material-symbols-outlined text-3xl text-slate-300" aria-hidden="true">account_balance_wallet</span>
                                <h3 className="mt-2 text-sm font-semibold text-slate-900">No transactions yet</h3>
                                <p className="mt-1 text-sm text-slate-600">Wallet activity will appear here when transactions are recorded.</p>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
