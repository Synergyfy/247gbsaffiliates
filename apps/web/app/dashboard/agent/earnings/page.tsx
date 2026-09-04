'use client';

import React from 'react';
import { useWallet, Transaction } from '@/hooks/useWallet';

export default function AgentEarningsPage() {
    const { wallet, transactions, isLoading, requestWithdrawal, isWithdrawing } = useWallet();

    const handleWithdraw = async () => {
        const amount = prompt('Enter amount to withdraw:');
        if (amount && !isNaN(Number(amount))) {
            try {
                await requestWithdrawal(Number(amount));
                alert('Withdrawal request submitted!');
            } catch (error) {
                alert('Failed to submit withdrawal request.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-10 max-w-7xl mx-auto w-full font-display">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-text-main">Earnings Wallet</h1>
                <p className="text-text-secondary text-sm font-medium italic">Manage your balance and withdrawals.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-primary text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mb-2">Available Balance</p>
                        <h2 className="text-5xl font-black mb-6 italic">
                            £{(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h2>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleWithdraw}
                                disabled={isWithdrawing}
                                className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {isWithdrawing ? 'Processing...' : 'Withdraw Funds'}
                            </button>
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 size-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-surface-light p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-text-main mb-6">Performance Overview</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Tasks Reliability</span>
                                <span className="text-sm font-bold text-text-main">92%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Target Earnings</span>
                                <span className="text-sm font-bold text-text-main">£{(wallet?.balance || 0) > 1000 ? '100%' : '75%'}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: (wallet?.balance || 0) > 1000 ? '100%' : '75%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-black text-text-main mb-6 uppercase tracking-tighter">Recent Transactions</h3>
            <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {transactions && transactions.length > 0 ? (
                        transactions.map((txn: Transaction) => (
                            <div key={txn.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-full flex items-center justify-center ${
                                        txn.type === 'deposit' || txn.type === 'payment' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        <span className="material-symbols-outlined">
                                            {txn.type === 'deposit' || txn.type === 'payment' ? 'arrow_downward' : 'arrow_upward'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-main capitalize">{txn.type}</p>
                                        <p className="text-[10px] text-text-secondary font-medium uppercase tracking-tighter">Ref: #{txn.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`block text-sm font-black italic ${
                                        txn.type === 'deposit' || txn.type === 'payment' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {txn.type === 'deposit' || txn.type === 'payment' ? '+' : '-'}£{txn.amount.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] font-bold text-text-secondary uppercase">
                                        {new Date(txn.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">
                            No transactions found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
