'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';

export default function ConsultantEarningsPage() {
    const { wallet, transactions, isLoading, requestWithdrawal, isWithdrawing } = useWallet();

    const handleWithdraw = async () => {
        const amount = prompt('Enter tactical disbursement amount:');
        if (amount && !isNaN(Number(amount))) {
            try {
                await requestWithdrawal(Number(amount));
                alert('Disbursement request logged in the registry.');
            } catch (error) {
                alert('Tactical disbursement failed.');
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
            <header className="mb-10">
                <h1 className="text-3xl font-black text-text-main uppercase tracking-tighter italic">Fiscal Yield</h1>
                <p className="text-text-secondary text-sm font-medium italic">Monitor and manage your elite consulting revenue streams.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="md:col-span-2 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] mb-4">Total Retained Capital</p>
                            <h2 className="text-6xl font-black italic tracking-tighter">
                                £{(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                        <div className="mt-12 flex gap-4">
                            <button 
                                onClick={handleWithdraw}
                                disabled={isWithdrawing}
                                className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                {isWithdrawing ? 'Processing Tactical Transfer...' : 'Initiate Tactical Disbursement'}
                            </button>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[10rem]">account_balance_wallet</span>
                    </div>
                </div>

                <div className="bg-surface-light p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center text-center">
                    <div className="size-16 rounded-3xl bg-green-50 flex items-center justify-center text-green-600 mb-6 mx-auto shadow-inner">
                        <span className="material-symbols-outlined text-3xl">moving</span>
                    </div>
                    <h3 className="text-3xl font-black text-text-main mb-2 italic">+14.2%</h3>
                    <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] italic">Quarterly Yield Slope</p>
                </div>
            </div>

            <div className="bg-surface-light rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-sm font-black text-text-main uppercase tracking-widest italic">Ledger Entries</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {transactions && transactions.length > 0 ? (
                        transactions.map((txn) => (
                            <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-white transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className={`size-12 rounded-2xl flex items-center justify-center ${
                                        txn.type === 'deposit' || txn.type === 'payment' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                        <span className="material-symbols-outlined">
                                            {txn.type === 'deposit' || txn.type === 'payment' ? 'layers' : 'logout'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-text-main uppercase tracking-tighter">Strategic {txn.type}</p>
                                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest italic opacity-60">REF-{txn.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`block text-lg font-black italic ${
                                        txn.type === 'deposit' || txn.type === 'payment' ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                        {txn.type === 'deposit' || txn.type === 'payment' ? '+' : '-'}£{txn.amount.toLocaleString()}
                                    </span>
                                    <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">
                                        {new Date(txn.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-[0.3em] text-[10px] italic opacity-50">
                            No recorded fiscal movements in this sector.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
