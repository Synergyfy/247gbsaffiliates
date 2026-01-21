'use client'

import Link from "next/link";
import { useState } from "react";

const TRANSACTIONS = [
    { id: 1, type: 'credit', title: 'Job: Kitchen Sink Repair', subtitle: 'Service Fee Collected', amount: 240.00, date: 'Oct 24, 2023', status: 'Completed' },
    { id: 2, type: 'debit', title: 'Payout to Bank Account', subtitle: 'Chase •••• 8821', amount: -1500.00, date: 'Oct 22, 2023', status: 'Completed' },
    { id: 3, type: 'credit', title: 'Job: Full House Rewiring', subtitle: 'Milestone Payment', amount: 850.00, date: 'Oct 21, 2023', status: 'Pending' },
    { id: 4, type: 'credit', title: 'Emergency Drain Unclog', subtitle: 'Service Fee Collected', amount: 125.00, date: 'Oct 20, 2023', status: 'Completed' },
    { id: 5, type: 'failed', title: 'Payout to Bank Account', subtitle: 'Chase •••• 1109', amount: -400.00, date: 'Oct 18, 2023', status: 'Failed' },
];

export default function FinancePage() {
    const [withdrawAmount, setWithdrawAmount] = useState("");

    return (
        <div className="min-h-screen bg-white text-text-main transition-colors duration-300">
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* Main Content Area */}
                <main className="flex-1 lg:ml-64 p-6 md:p-10">
                    <header className="mb-10">
                        <h1 className="text-4xl font-black tracking-tight text-text-main mb-2">Finance & Wallet</h1>
                        <p className="text-text-secondary font-medium">Manage your earnings, check payout status, and transfer funds.</p>
                    </header>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Left Column: Balances & Withdrawal */}
                        <div className="xl:col-span-12 lg:col-span-5 flex flex-col gap-8">
                            {/* Balance Card Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Available Balance */}
                                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-primary/5 border border-primary/5 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <p className="text-text-secondary font-black uppercase tracking-widest text-[10px] mb-2">Available Balance</p>
                                        <h2 className="text-5xl font-black text-primary tracking-tight">₦4,850.25</h2>
                                        <div className="flex gap-4 mt-6">
                                            <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                                                <p className="text-[9px] uppercase tracking-widest text-text-secondary font-black mb-1">Pending</p>
                                                <p className="font-black text-sm">₦1,200.0</p>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                                                <p className="text-[9px] uppercase tracking-widest text-text-secondary font-black mb-1">Monthly</p>
                                                <p className="font-black text-sm">₦8,432.1</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -top-10 -right-10 size-48 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                                </div>

                                {/* Withdrawal Control */}
                                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl shadow-primary/5 border border-primary/5">
                                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">payments</span>
                                        Withdraw Funds
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary">Amount to Withdraw</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary font-black text-xl">₦</span>
                                                    <input
                                                        className="w-full pl-10 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-2xl font-black transition-all"
                                                        placeholder="0.00"
                                                        type="number"
                                                        value={withdrawAmount}
                                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-text-secondary font-bold pl-1">Max available: ₦4,850.25</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary">Destination Account</label>
                                            <div className="flex flex-col gap-3">
                                                <label className="relative flex items-center p-4 rounded-2xl border-2 border-primary bg-primary/5 cursor-pointer group">
                                                    <input checked className="hidden" name="bank" type="radio" readOnly />
                                                    <div className="size-10 bg-white rounded-xl flex items-center justify-center mr-4 border border-primary/20 shadow-sm">
                                                        <span className="material-symbols-outlined text-primary">account_balance</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-black">Chase Business Checking</p>
                                                        <p className="text-[10px] text-text-secondary font-bold">Ending in •••• 8821</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                                </label>
                                                <Link
                                                    href="/dashboard/artisan/finance/link-bank"
                                                    className="relative flex items-center p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                                                >
                                                    <div className="size-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary/10 transition-colors">
                                                        <span className="material-symbols-outlined text-text-secondary group-hover:text-primary">add</span>
                                                    </div>
                                                    <p className="text-xs font-black text-text-secondary group-hover:text-primary">Add new bank account</p>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <button className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 text-lg">
                                            <span className="material-symbols-outlined">rocket_launch</span>
                                            Initiate Instant Cashout
                                        </button>
                                        <p className="text-center text-[10px] text-text-secondary font-bold mt-4">Transfers usually arrive in 30 minutes. 0.5% convenience fee applies.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Transactions List */}
                        <div className="xl:col-span-12">
                            <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 border border-primary/5 overflow-hidden flex flex-col">
                                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-text-main">Recent Transactions</h3>
                                        <p className="text-xs text-text-secondary font-medium mt-0.5">Your financial activity for the last 30 days.</p>
                                    </div>
                                    <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Filter By Date</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-text-secondary uppercase text-[10px] tracking-[0.2em] font-black border-b border-gray-50">
                                                <th className="px-8 py-5">Transaction Details</th>
                                                <th className="px-8 py-5">Date</th>
                                                <th className="px-8 py-5 text-right">Amount</th>
                                                <th className="px-8 py-5 text-center">Status</th>
                                                <th className="px-8 py-5"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {TRANSACTIONS.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`size-11 rounded-xl flex items-center justify-center border ${tx.type === 'credit' ? 'bg-primary/5 border-primary/10 text-primary' :
                                                                tx.type === 'debit' ? 'bg-gray-100 border-gray-200 text-text-secondary' :
                                                                    'bg-red-50 border-red-100 text-red-500'
                                                                }`}>
                                                                <span className="material-symbols-outlined text-xl">
                                                                    {tx.type === 'credit' ? 'call_made' : tx.type === 'debit' ? 'call_received' : 'error'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-sm text-text-main">{tx.title}</p>
                                                                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{tx.subtitle}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-bold text-text-secondary">{tx.date}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <p className={`text-base font-black ${tx.amount > 0 ? 'text-primary' : tx.type === 'failed' ? 'text-red-500' : 'text-text-main'
                                                            }`}>
                                                            {tx.amount > 0 ? `+₦${tx.amount.toFixed(2)}` : `-₦${Math.abs(tx.amount).toFixed(2)}`}
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.status === 'Completed' ? 'bg-primary/10 text-primary' :
                                                            tx.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                                                'bg-red-100 text-red-600'
                                                            }`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button className="material-symbols-outlined text-gray-300 hover:text-primary transition-colors cursor-pointer">more_vert</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-8 bg-white text-center border-t border-gray-100">
                                    <button className="text-[10px] font-black text-text-secondary hover:text-primary transition-all flex items-center justify-center gap-3 mx-auto uppercase tracking-[0.2em] border border-gray-200 px-6 py-3 rounded-xl hover:bg-white">
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Download Financial Statement (PDF/CSV)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
