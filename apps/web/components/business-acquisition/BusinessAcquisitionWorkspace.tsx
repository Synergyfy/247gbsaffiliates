'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from '@/lib/apiClient';
import { AcquisitionActivityFeed } from './AcquisitionActivityFeed';

type Prospect = {
  id: string;
  businessName: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  postcode?: string | null;
  address?: string | null;
  category?: string | null;
  contactDate?: string | null;
  status: string;
  notes?: string | null;
  invitationToken?: string | null;
  invitationUrl?: string | null;
  invitationSentAt?: string | null;
  centralBusinessId?: string | null;
  acquisitionStatus: string;
  claimEvidence?: string | null;
  verifiedAt?: string | null;
  convertedAt?: string | null;
  conversionType?: string | null;
  conversionProvider?: string | null;
  conversionAmount?: string | number | null;
  createdAt: string;
};

type Summary = {
  totalProspects: number;
  approached: number;
  interested: number;
  invitationsSent: number;
  registered: number;
  onboardingCompleted: number;
  converted: number;
  verified: number;
  pendingVerification: number;
  inactive: number;
};

type Settings = {
  targetCount: number;
  dueDate?: string | null;
  appliesToRoles?: string[] | null;
  requireVerification: boolean;
};

type CentralBusiness = {
  id: string;
  businessName: string;
  acquisitionStatus?: string | null;
  acquiredByAffiliateName?: string | null;
  accountManagerName?: string | null;
  acquisitionAttributedAt?: string | null;
  membershipStatus?: string | null;
};

const STATUS_OPTIONS = [
  'identified',
  'approached',
  'interested',
  'invitation_sent',
  'registration_started',
  'registered',
  'onboarding_completed',
  'verified',
  'active',
  'inactive',
];

const ACQUISITION_LABEL: Record<string, string> = {
  unverified: 'Attribution pending',
  pending_verification: 'Verification pending',
  verified: 'Verified acquisition',
  rejected: 'Rejected',
};

function badgeClass(value: string) {
  if (value === 'verified' || value === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (value === 'rejected' || value === 'inactive') return 'bg-red-50 text-red-700 border-red-100';
  if (value === 'pending_verification' || value === 'onboarding_completed') {
    return 'bg-amber-50 text-amber-800 border-amber-100';
  }
  return 'bg-blue-50 text-blue-700 border-blue-100';
}

function label(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function BusinessAcquisitionWorkspace({
  title = 'Business acquisition',
  description = 'Record local businesses, invite them to Central Hub Solution and keep the acquisition permanently attributed to you.',
}: {
  title?: string;
  description?: string;
}) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<Prospect | null>(null);
  const [confirmForm, setConfirmForm] = useState({
    businessEmail: '',
    centralBusinessId: '',
    evidence: '',
  });
  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    phone: '',
    email: '',
    postcode: '',
    address: '',
    category: '',
    contactDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const prospectsQuery = useQuery({
    queryKey: ['business-acquisition', statusFilter, search],
    queryFn: async () => {
      const response = await apiClient.get('/business-acquisition/prospects', {
        params: { status: statusFilter || undefined, search: search || undefined },
      });
      return response.data?.data as {
        items: Prospect[];
        summary: Summary;
        settings: Settings;
      };
    },
  });

  const acquiredQuery = useQuery({
    queryKey: ['business-acquisition', 'central'],
    queryFn: async () => {
      const response = await apiClient.get('/business-acquisition/acquired');
      return response.data?.data as { total: number; businesses: CentralBusiness[]; message?: string };
    },
  });

  const summary = useMemo<Summary>(
    () =>
      prospectsQuery.data?.summary ?? {
        totalProspects: 0,
        approached: 0,
        interested: 0,
        invitationsSent: 0,
        registered: 0,
        onboardingCompleted: 0,
        converted: 0,
        verified: 0,
        pendingVerification: 0,
        inactive: 0,
      },
    [prospectsQuery.data],
  );
  const settings = prospectsQuery.data?.settings;
  const items = prospectsQuery.data?.items ?? [];

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['business-acquisition'] });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/business-acquisition/prospects', {
        ...form,
        contactDate: form.contactDate || undefined,
      });
      return response.data?.data as { duplicate: boolean; message?: string; prospect: Prospect };
    },
    onSuccess: (data) => {
      if (data?.duplicate) {
        toast.info(data.message || 'This business is already in your prospects.');
      } else {
        toast.success('Business prospect recorded.');
      }
      setShowForm(false);
      setForm({
        businessName: '',
        contactName: '',
        phone: '',
        email: '',
        postcode: '',
        address: '',
        category: '',
        contactDate: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Could not record this business.');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/business-acquisition/prospects/${id}/invitation`);
      return response.data?.data as { invitationUrl: string; token: string };
    },
    onSuccess: async (data) => {
      try {
        await navigator.clipboard.writeText(data.invitationUrl);
        toast.success('Invitation link created and copied.');
      } catch {
        toast.success('Invitation link created.');
      }
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Could not create the invitation.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: { id: string; status: string }) => {
      await apiClient.patch(`/business-acquisition/prospects/${input.id}`, {
        status: input.status,
      });
    },
    onSuccess: () => {
      toast.success('Outreach status updated.');
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Could not update this prospect.');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!confirmTarget) return;
      const response = await apiClient.post(
        `/business-acquisition/prospects/${confirmTarget.id}/confirm`,
        {
          businessEmail: confirmForm.businessEmail || undefined,
          centralBusinessId: confirmForm.centralBusinessId || undefined,
          evidence: confirmForm.evidence || undefined,
        },
      );
      return response.data?.data;
    },
    onSuccess: () => {
      toast.success('Association submitted for Central Hub verification.');
      setConfirmTarget(null);
      setConfirmForm({ businessEmail: '', centralBusinessId: '', evidence: '' });
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Could not submit the association.');
    },
  });

  const copyLink = async (prospect: Prospect) => {
    if (prospect.invitationUrl) {
      try {
        await navigator.clipboard.writeText(prospect.invitationUrl);
        toast.success('Invitation link copied.');
      } catch {
        toast.info(prospect.invitationUrl);
      }
      return;
    }
    inviteMutation.mutate(prospect.id);
  };

  return (
    <div className="p-5 font-display lg:p-8">
      <header className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
            Business acquisition
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((open) => !open)}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <span className="material-symbols-outlined text-[18px]">add_business</span>
          {showForm ? 'Close form' : 'Add business prospect'}
        </button>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Outreach target"
          value={settings?.targetCount ?? 20}
          hint={settings?.dueDate ? `Due ${new Date(settings.dueDate).toLocaleDateString()}` : 'Set by admin'}
          icon="flag"
          tone="dark"
        />
        <StatCard label="Approached" value={summary.approached} hint="Businesses spoken to" icon="groups" />
        <StatCard label="Registered on CHS" value={summary.registered} hint="Accounts created" icon="how_to_reg" />
        <StatCard
          label="Paid conversions"
          value={summary.converted}
          hint="Membership, pass or trial"
          icon="payments"
          tone="green"
        />
        <StatCard
          label="Verified onboardings"
          value={summary.verified}
          hint={`${summary.onboardingCompleted} completed onboarding`}
          icon="verified"
          tone="green"
        />
        <StatCard
          label="Awaiting verification"
          value={summary.pendingVerification}
          hint={`${summary.invitationsSent} invitations sent`}
          icon="hourglass_top"
          tone="amber"
        />
      </section>

      <div className="mb-6">
        <AcquisitionActivityFeed limit={10} />
      </div>

      {showForm && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">New business prospect</h2>
              <p className="text-xs text-slate-500">
                Recording a prospect does not count as a completed onboarding. The business must
                register and be verified on CHS first.
              </p>
            </div>
          </div>
          <form
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!form.businessName.trim()) {
                toast.error('A business name is required.');
                return;
              }
              createMutation.mutate();
            }}
          >
            <Field label="Business name *">
              <input
                required
                value={form.businessName}
                onChange={(event) => setForm({ ...form, businessName: event.target.value })}
                className={inputClass}
                placeholder="ABC Local Store"
              />
            </Field>
            <Field label="Owner / contact name">
              <input
                value={form.contactName}
                onChange={(event) => setForm({ ...form, contactName: event.target.value })}
                className={inputClass}
                placeholder="Jane Smith"
              />
            </Field>
            <Field label="Telephone">
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className={inputClass}
                placeholder="020 7946 0000"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className={inputClass}
                placeholder="owner@business.co.uk"
              />
            </Field>
            <Field label="Postcode">
              <input
                value={form.postcode}
                onChange={(event) => setForm({ ...form, postcode: event.target.value })}
                className={inputClass}
                placeholder="SW1A 1AA"
              />
            </Field>
            <Field label="Business category">
              <input
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className={inputClass}
                placeholder="Retail / food / services"
              />
            </Field>
            <Field label="Address">
              <input
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                className={inputClass}
                placeholder="1 High Street, London"
              />
            </Field>
            <Field label="Contact date">
              <input
                type="date"
                value={form.contactDate}
                onChange={(event) => setForm({ ...form, contactDate: event.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Conversation notes">
              <input
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className={inputClass}
                placeholder="What did they need?"
              />
            </Field>
            <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {createMutation.isPending ? 'Saving…' : 'Save prospect'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="min-h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">My business prospects</h2>
            <p className="text-xs text-slate-500">
              Approached {summary.approached} · interested {summary.interested} · verified{' '}
              {summary.verified}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business"
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs outline-none focus:border-blue-400 sm:w-52"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2 text-xs text-slate-700 outline-none focus:border-blue-400"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {label(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {prospectsQuery.isLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
            <span className="size-5 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />
            Loading prospects…
          </div>
        ) : prospectsQuery.isError ? (
          <div className="p-6 text-sm text-red-700">
            Could not load your business prospects. Please refresh the page.
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">storefront</span>
            <p className="mt-2 text-sm font-semibold text-slate-700">No prospects recorded yet</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
              Talk to a local business, then add it here. Generate an invitation so CHS links the
              registration back to you automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-[0.1em] text-slate-500">
                  <th className="px-4 py-3 font-semibold">Business</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Outreach stage</th>
                  <th className="px-4 py-3 font-semibold">Acquisition</th>
                  <th className="px-4 py-3 font-semibold">Invitation</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((prospect) => (
                  <tr key={prospect.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{prospect.businessName}</p>
                      <p className="text-[11px] text-slate-500">
                        {prospect.category || 'Uncategorised'}
                        {prospect.postcode ? ` · ${prospect.postcode}` : ''}
                      </p>
                      {prospect.centralBusinessId && (
                        <p className="mt-0.5 font-mono text-[10px] text-emerald-700">
                          CHS {prospect.centralBusinessId.slice(0, 8)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <p>{prospect.contactName || '—'}</p>
                      <p>{prospect.phone || prospect.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={prospect.status}
                        onChange={(event) =>
                          updateMutation.mutate({ id: prospect.id, status: event.target.value })
                        }
                        className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700 outline-none focus:border-blue-400"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {label(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass(
                          prospect.acquisitionStatus,
                        )}`}
                      >
                        {ACQUISITION_LABEL[prospect.acquisitionStatus] || label(prospect.acquisitionStatus)}
                      </span>
                      {prospect.convertedAt && (
                        <span className="ml-1 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Paid
                          {prospect.conversionAmount != null &&
                          Number(prospect.conversionAmount) > 0
                            ? ` £${Number(prospect.conversionAmount).toFixed(2)}`
                            : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600">
                      {prospect.invitationSentAt ? (
                        <span className="text-blue-700">Sent {new Date(prospect.invitationSentAt).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-slate-400">Not sent</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => void copyLink(prospect)}
                          disabled={inviteMutation.isPending}
                          className="inline-flex min-h-8 items-center gap-1 rounded-md border border-blue-200 px-2.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {prospect.invitationUrl ? 'content_copy' : 'link'}
                          </span>
                          {prospect.invitationUrl ? 'Copy link' : 'Create link'}
                        </button>
                        {prospect.acquisitionStatus !== 'verified' && (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmTarget(prospect);
                              setConfirmForm({
                                businessEmail: prospect.email || '',
                                centralBusinessId: prospect.centralBusinessId || '',
                                evidence: '',
                              });
                            }}
                            className="inline-flex min-h-8 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <span className="material-symbols-outlined text-[14px]">fact_check</span>
                            Confirm registration
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-base font-semibold text-slate-950">My CHS businesses</h2>
          <p className="text-xs text-slate-500">
            Businesses permanently attributed to you in Central Hub Solution.
          </p>
        </div>
        {acquiredQuery.isLoading ? (
          <div className="p-5 text-xs text-slate-500">Loading CHS businesses…</div>
        ) : (acquiredQuery.data?.businesses?.length ?? 0) === 0 ? (
          <div className="p-5 text-xs text-slate-500">
            {acquiredQuery.data?.message ||
              'No CHS businesses attributed to you yet. Create an invitation to start.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {acquiredQuery.data?.businesses.map((business) => (
              <div key={business.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{business.businessName}</p>
                  <p className="text-[11px] text-slate-500">
                    Acquired{' '}
                    {business.acquisitionAttributedAt
                      ? new Date(business.acquisitionAttributedAt).toLocaleDateString()
                      : '—'}
                    {business.accountManagerName
                      ? ` · Account manager: ${business.accountManagerName}`
                      : ' · No account manager assigned'}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass(
                    String(business.acquisitionStatus || 'unverified').toLowerCase(),
                  )}`}
                >
                  {ACQUISITION_LABEL[String(business.acquisitionStatus || '').toLowerCase()] ||
                    'Attribution recorded'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-3 sm:items-center">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Confirm direct registration</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Use this when {confirmTarget.businessName} registered on CHS without the
                  invitation link. The acquisition stays pending until Central Hub verifies it.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setConfirmTarget(null)}
                className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <Field label="Business email on CHS">
                <input
                  value={confirmForm.businessEmail}
                  onChange={(event) =>
                    setConfirmForm({ ...confirmForm, businessEmail: event.target.value })
                  }
                  className={inputClass}
                  placeholder="owner@business.co.uk"
                />
              </Field>
              <Field label="CHS business ID (optional)">
                <input
                  value={confirmForm.centralBusinessId}
                  onChange={(event) =>
                    setConfirmForm({ ...confirmForm, centralBusinessId: event.target.value })
                  }
                  className={inputClass}
                  placeholder="Paste the CHS business record ID if known"
                />
              </Field>
              <Field label="Evidence / notes">
                <textarea
                  value={confirmForm.evidence}
                  onChange={(event) =>
                    setConfirmForm({ ...confirmForm, evidence: event.target.value })
                  }
                  rows={3}
                  className={`${inputClass} h-auto py-2`}
                  placeholder="Visited the shop on 5 Nov, helped the owner register using this email."
                />
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="min-h-9 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmMutation.isPending}
                onClick={() => confirmMutation.mutate()}
                className="min-h-9 rounded-md bg-blue-700 px-4 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {confirmMutation.isPending ? 'Submitting…' : 'Submit for verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'light',
}: {
  label: string;
  value: number;
  hint: string;
  icon: string;
  tone?: 'light' | 'dark' | 'green' | 'amber';
}) {
  const toneClass =
    tone === 'dark'
      ? 'border-slate-800 bg-[#202b42] text-white'
      : tone === 'green'
        ? 'border-emerald-100 bg-emerald-50 text-emerald-950'
        : tone === 'amber'
          ? 'border-amber-100 bg-amber-50 text-amber-950'
          : 'border-slate-200 bg-white text-slate-950';
  const muted = tone === 'dark' ? 'text-slate-300' : 'text-slate-500';
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] opacity-80">{label}</p>
        <span className="material-symbols-outlined text-[18px] opacity-70">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className={`mt-0.5 text-[11px] ${muted}`}>{hint}</p>
    </div>
  );
}
