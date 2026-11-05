'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';

export default function AdminUsersPage() {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('');
    const [qualification, setQualification] = useState('');
    const [onboarded, setOnboarded] = useState('');
    const [assessment, setAssessment] = useState('');
    const [accountStatus, setAccountStatus] = useState('');
    const [actionError, setActionError] = useState('');
    const [actionNotice, setActionNotice] = useState('');
    const [page, setPage] = useState(1);
    const { users = [], meta, isLoading, isError, refetch, updateStatus, isUpdating } = useAdminUsers({
        page,
        limit: 25,
        search: search.trim() || undefined,
        role: role || undefined,
        verificationStatus: verificationStatus || undefined,
        qualification: (qualification || undefined) as 'qualified' | 'incomplete' | undefined,
        isOnboarded: onboarded === '' ? undefined : onboarded === 'true',
        isQuizPassed: assessment === '' ? undefined : assessment === 'passed',
        status: accountStatus || undefined,
    });

    const suspendOrActivate = async (id: string, status: string) => {
        setActionError(''); setActionNotice('');
        try {
            await updateStatus({ userId: id, status: status === 'active' ? 'suspended' : 'active' });
            setActionNotice('Affiliate account status updated.');
        } catch {
            setActionError('Affiliate account status could not be updated.');
        }
    };

    return (
        <div className="mx-auto max-w-[1500px] font-display">
            <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Affiliate lifecycle</p>
                    <h1 className="mt-1 text-2xl font-black text-text-main">Affiliate Management</h1>
                    <p className="mt-1 text-sm text-text-secondary">Review verification, onboarding, assessment and qualification progress.</p>
                </div>
                {meta && <span className="text-sm text-slate-500">{meta.total.toLocaleString()} affiliates</span>}
            </header>

            <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
                <input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search name or email" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
                <select aria-label="Filter by role" value={role} onChange={(event) => { setPage(1); setRole(event.target.value); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All affiliate roles</option><option value="agent">Agent</option><option value="account_manager">Account manager</option><option value="consultant">Consultant</option></select>
                <select aria-label="Filter by verification" value={verificationStatus} onChange={(event) => { setPage(1); setVerificationStatus(event.target.value); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All verification statuses</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option><option value="unverified">Unverified</option></select>
                <select aria-label="Filter by qualification" value={qualification} onChange={(event) => { setPage(1); setQualification(event.target.value); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All qualification progress</option><option value="qualified">Qualified</option><option value="incomplete">Incomplete</option></select>
                <select aria-label="Filter by onboarding" value={onboarded} onChange={(event) => { setPage(1); setOnboarded(event.target.value); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All onboarding statuses</option><option value="true">Onboarding complete</option><option value="false">Onboarding incomplete</option></select>
                <select aria-label="Filter by assessment" value={assessment} onChange={(event) => { setPage(1); setAssessment(event.target.value); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All assessment results</option><option value="passed">Passed</option><option value="failed">Not passed</option></select>
                <select aria-label="Filter by account status" value={accountStatus} onChange={(event) => { setPage(1); setAccountStatus(event.target.value); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All account statuses</option><option value="active">Active</option><option value="pending">Pending</option><option value="suspended">Suspended</option></select>
            </div>

            {actionError && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{actionError}</p>}
            {actionNotice && <p role="status" className="mb-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{actionNotice}</p>}

            {isError ? <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Affiliate records could not be loaded. <button onClick={() => void refetch()} className="font-bold underline">Retry</button></section> : isLoading ? <div className="flex min-h-48 items-center justify-center"><span className="size-8 animate-spin rounded-full border-4 border-primary/20 border-b-primary" /></div> : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[1120px] text-left">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr>
                            <th className="px-4 py-3">Affiliate</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Verification</th><th className="px-4 py-3">Assessment</th><th className="px-4 py-3">Onboarding</th><th className="px-4 py-3">Qualification</th><th className="px-4 py-3">Learning</th><th className="px-4 py-3">Account</th><th className="px-4 py-3">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((affiliate) => <tr key={affiliate.id} className="align-top hover:bg-slate-50/70">
                                <td className="px-4 py-3"><Link href={`/dashboard/admin/users/${affiliate.id}`} className="font-semibold text-slate-900 hover:text-primary hover:underline">{affiliate.name}</Link><span className="mt-0.5 block text-xs text-slate-500">{affiliate.email}</span></td>
                                <td className="px-4 py-3 text-xs capitalize text-slate-700">{affiliate.role.replaceAll('_', ' ')}</td>
                                <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-700">{affiliate.verificationStatus}</span></td>
                                <td className="px-4 py-3 text-xs text-slate-700">{affiliate.isQuizPassed ? 'Passed' : 'Not passed'}</td>
                                <td className="px-4 py-3 text-xs text-slate-700">{affiliate.isOnboarded ? 'Complete' : 'Incomplete'}</td>
                                <td className="px-4 py-3 text-xs font-semibold capitalize text-slate-700">{affiliate.qualificationStatus}</td>
                                <td className="px-4 py-3 text-xs capitalize text-slate-700">{affiliate.learningStatus.replaceAll('_', ' ')}{affiliate.learningResourceCount > 0 && <span className="mt-1 block text-[10px] text-slate-500">{affiliate.learningCompletedCount}/{affiliate.learningResourceCount} resources</span>}</td>
                                <td className="px-4 py-3 text-xs capitalize text-slate-700">{affiliate.status}</td>
                                <td className="px-4 py-3"><div className="flex items-center gap-2"><Link href={`/dashboard/admin/users/${affiliate.id}`} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Profile</Link><button disabled={isUpdating} onClick={() => void suspendOrActivate(affiliate.id, affiliate.status)} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50">{affiliate.status === 'active' ? 'Suspend' : 'Activate'}</button></div></td>
                            </tr>)}
                            {!users.length && <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-500">No affiliates match these filters.</td></tr>}
                        </tbody>
                    </table>
                    <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                        <span>Page {meta?.page ?? page} of {meta?.lastPage ?? 1}</span>
                        <div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={!meta || page >= meta.lastPage} onClick={() => setPage(value => value + 1)} className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button></div>
                    </footer>
                </div>
            )}
        </div>
    );
}
