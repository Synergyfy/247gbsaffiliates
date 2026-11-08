'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { BusinessAcquisitionWorkspace } from '@/components/business-acquisition/BusinessAcquisitionWorkspace';

type Assignment = {
  centralBusinessId: string;
  businessName?: string | null;
  acquiredByAffiliateName?: string | null;
  acquiredByAffiliateRole?: string | null;
  accountManagerName?: string | null;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    dueDate?: string | null;
    deliverables?: string[] | null;
    materials?: string | null;
    submissionData?: Record<string, unknown> | null;
  }>;
};

export default function ConsultantBusinessesPage() {
  const assignments = useQuery({
    queryKey: ['business-acquisition', 'assignments'],
    queryFn: async () => {
      const response = await apiClient.get('/business-acquisition/assignments');
      return response.data?.data as { assignments: Assignment[]; total: number };
    },
  });

  return (
    <div>
      <BusinessAcquisitionWorkspace
        title="Business acquisition & assignments"
        description="Track businesses you introduce yourself, and see the businesses where you have been assigned specialist work."
      />
      <section className="mx-5 mb-8 rounded-xl border border-slate-200 bg-white lg:mx-8">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-base font-semibold text-slate-950">My business assignments</h2>
          <p className="text-xs text-slate-500">
            Specialist work is recorded separately from acquisition and account management.
          </p>
        </div>
        {assignments.isLoading ? (
          <div className="p-5 text-xs text-slate-500">Loading assignments…</div>
        ) : (assignments.data?.assignments?.length ?? 0) === 0 ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">assignment_ind</span>
            <p className="mt-2 text-sm font-semibold text-slate-700">No active business assignments yet</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
              When a business in CHS is assigned to you for specialist work, it will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {assignments.data?.assignments.map((assignment) => (
              <div key={assignment.centralBusinessId} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {assignment.businessName || 'CHS business'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Acquired by{' '}
                      <span className="font-medium text-slate-700">
                        {assignment.acquiredByAffiliateName || 'Direct signup'}
                      </span>
                      {assignment.acquiredByAffiliateRole
                        ? ` (${assignment.acquiredByAffiliateRole.replaceAll('_', ' ')})`
                        : ''}
                      {' · '}Account manager{' '}
                      <span className="font-medium text-slate-700">
                        {assignment.accountManagerName || 'not assigned'}
                      </span>
                    </p>
                  </div>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {assignment.tasks.length} task{assignment.tasks.length === 1 ? '' : 's'}
                  </span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {assignment.tasks.map((task) => (
                    <li key={task.id} className="rounded-md border border-slate-100 bg-slate-50/70 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs font-medium text-slate-800">{task.title}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          {task.status.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {task.dueDate
                          ? `Due ${new Date(task.dueDate).toLocaleDateString()}`
                          : 'No deadline'}
                        {task.deliverables?.length
                          ? ` · Deliverables: ${task.deliverables.join(', ')}`
                          : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
