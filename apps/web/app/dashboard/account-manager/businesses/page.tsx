'use client';

import { useAssignedBusinesses } from '@/hooks/useAssignedBusinesses';
import { QueryMessage } from '@/components/dashboard/RoleOverview';

export default function AssignedBusinessesPage() {
    const query = useAssignedBusinesses();
    const businesses = query.data?.businesses || [];
    const upstreamUnavailable = Boolean(query.data?.error);
    return <div className="mx-auto w-full max-w-[1500px] space-y-4 px-3 py-4 sm:px-5 lg:px-7"><header><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">Account Manager work</p><h1 className="mt-0.5 text-xl font-semibold text-slate-950 sm:text-2xl">Assigned businesses</h1><p className="mt-1 text-xs text-slate-600 sm:text-sm">Businesses matched to your account through Central Hub.</p></header>{upstreamUnavailable ? <div role="alert" className="bg-rose-50 px-3 py-2 text-xs text-rose-800">Central Hub business assignments are unavailable for this account. Check that the Central Hub account is linked, then retry. <button type="button" onClick={() => void query.refetch()} className="font-semibold underline">Try again</button></div> : <section className="divide-y divide-slate-100 border-y border-slate-200 bg-white"><QueryMessage loading={query.isLoading} error={query.isError} empty={businesses.length === 0} onRetry={() => void query.refetch()}>{businesses.map((business) => <article key={business.id} className="grid gap-1 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.6fr)] sm:items-center sm:px-4"><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-slate-900">{business.businessName || 'Business name unavailable'}</h2><p className="mt-0.5 truncate text-xs text-slate-500">{[business.city?.name,business.city?.region,business.postcode].filter(Boolean).join(', ') || business.address || 'Location not provided'}</p></div><p className="text-xs text-slate-600">{business.membershipPlanName || business.membershipLevel || 'Membership not listed'}{business.membershipStatus ? ` · ${business.membershipStatus}` : ''}</p></article>)}</QueryMessage></section>}</div>;
}
