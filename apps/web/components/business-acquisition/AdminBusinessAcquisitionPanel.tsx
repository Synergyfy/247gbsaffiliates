'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from '@/lib/apiClient';

type Prospect = {
  id: string;
  businessName: string;
  affiliateName?: string | null;
  affiliateEmail?: string | null;
  affiliateRole?: string | null;
  status: string;
  acquisitionStatus: string;
  centralBusinessId?: string | null;
  centralClaimId?: string | null;
  invitationSentAt?: string | null;
  createdAt: string;
};

type Settings = {
  targetCount: number;
  dueDate?: string | null;
  appliesToRoles?: string[] | null;
  requireVerification: boolean;
};

function label(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AdminBusinessAcquisitionPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<{
    targetCount: number;
    dueDate: string;
    appliesToRoles: string[];
    requireVerification: boolean;
  }>({
    targetCount: 20,
    dueDate: '',
    appliesToRoles: ['agent', 'account_manager', 'consultant'],
    requireVerification: true,
  });

  const prospectsQuery = useQuery({
    queryKey: ['business-acquisition-admin', search],
    queryFn: async () => {
      const response = await apiClient.get('/business-acquisition/admin/prospects', {
        params: { search: search || undefined },
      });
      return response.data?.data as { items: Prospect[]; settings: Settings };
    },
  });

  useEffect(() => {
    const settings = prospectsQuery.data?.settings;
    if (!settings) return;
    setForm({
      targetCount: settings.targetCount ?? 20,
      dueDate: settings.dueDate ? String(settings.dueDate).slice(0, 10) : '',
      appliesToRoles: settings.appliesToRoles ?? ['agent', 'account_manager', 'consultant'],
      requireVerification: settings.requireVerification ?? true,
    });
  }, [prospectsQuery.data?.settings]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['business-acquisition-admin'] });

  const saveSettings = useMutation({
    mutationFn: async () => {
      await apiClient.patch('/business-acquisition/admin/settings', {
        targetCount: Number(form.targetCount),
        dueDate: form.dueDate || undefined,
        appliesToRoles: form.appliesToRoles,
        requireVerification: form.requireVerification,
      });
    },
    onSuccess: () => {
      toast.success('Acquisition task settings saved.');
      refresh();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Could not save the settings.'),
  });

  const verify = useMutation({
    mutationFn: async (input: { id: string; decision: 'VERIFIED' | 'REJECTED' }) => {
      await apiClient.post(`/business-acquisition/admin/prospects/${input.id}/verify`, {
        decision: input.decision,
      });
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.decision === 'VERIFIED'
          ? 'Acquisition verified and written back to Central Hub.'
          : 'Acquisition rejected.',
      );
      refresh();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Could not review this acquisition.'),
  });

  const items = prospectsQuery.data?.items ?? [];

  return (
    <div className="p-5 font-display lg:p-8">
      <header className="mb-6 border-b border-slate-200 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
          Admin oversight
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Business acquisition review
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          Configure the local business onboarding task, review affiliate attribution and verify
          that a business genuinely joined CHS through the affiliate who recorded it.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-base font-semibold text-slate-950">Onboarding task settings</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          The outreach target is configurable and is not hard-coded per affiliate.
        </p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveSettings.mutate();
          }}
        >
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-slate-600">
              Target businesses
            </span>
            <input
              type="number"
              min={1}
              max={1000}
              value={form.targetCount}
              onChange={(event) => setForm({ ...form, targetCount: Number(event.target.value) })}
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-slate-600">
              Completion date
            </span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-slate-600">
              Verification required
            </span>
            <select
              value={form.requireVerification ? 'yes' : 'no'}
              onChange={(event) =>
                setForm({ ...form, requireVerification: event.target.value === 'yes' })
              }
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
            >
              <option value="yes">Yes — verified onboarding counts</option>
              <option value="no">No — completed onboarding counts</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saveSettings.isPending}
              className="min-h-10 w-full rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {saveSettings.isPending ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </form>
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            { key: 'agent', label: 'Agents' },
            { key: 'account_manager', label: 'Account managers' },
            { key: 'consultant', label: 'Consultants' },
          ].map((role) => (
            <label key={role.key} className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.appliesToRoles.includes(role.key)}
                onChange={(event) =>
                  setForm({
                    ...form,
                    appliesToRoles: event.target.checked
                      ? [...form.appliesToRoles, role.key]
                      : form.appliesToRoles.filter((value) => value !== role.key),
                  })
                }
                className="size-4 rounded border-slate-300"
              />
              {role.label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">All business prospects</h2>
            <p className="text-xs text-slate-500">
              {items.length} record{items.length === 1 ? '' : 's'}
            </p>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search business or affiliate"
            className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs outline-none focus:border-blue-400 sm:w-64"
          />
        </div>
        {prospectsQuery.isLoading ? (
          <div className="p-5 text-xs text-slate-500">Loading acquisition records…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No business prospects have been recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.1em] text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 font-semibold">Business</th>
                  <th className="px-4 py-3 font-semibold">Acquired by</th>
                  <th className="px-4 py-3 font-semibold">Outreach</th>
                  <th className="px-4 py-3 font-semibold">Acquisition</th>
                  <th className="px-4 py-3 font-semibold">CHS record</th>
                  <th className="px-4 py-3 text-right font-semibold">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((prospect) => (
                  <tr key={prospect.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{prospect.businessName}</p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(prospect.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <p className="font-medium text-slate-800">{prospect.affiliateName || '—'}</p>
                      <p>{prospect.affiliateEmail || '—'}</p>
                      <p className="capitalize text-slate-400">
                        {(prospect.affiliateRole || '').replaceAll('_', ' ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{label(prospect.status)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {label(prospect.acquisitionStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600">
                      {prospect.centralBusinessId ? (
                        <span className="font-mono">{prospect.centralBusinessId.slice(0, 12)}</span>
                      ) : (
                        <span className="text-slate-400">Not registered</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={(!prospect.centralBusinessId && !prospect.centralClaimId) || verify.isPending}
                          onClick={() => verify.mutate({ id: prospect.id, decision: 'VERIFIED' })}
                          className="min-h-8 rounded-md border border-emerald-200 px-2.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          disabled={(!prospect.centralBusinessId && !prospect.centralClaimId) || verify.isPending}
                          onClick={() => verify.mutate({ id: prospect.id, decision: 'REJECTED' })}
                          className="min-h-8 rounded-md border border-red-200 px-2.5 text-[11px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
