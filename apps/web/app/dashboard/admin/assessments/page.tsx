'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';
import { stabilizeErrorRetry } from '@/lib/requestErrors';

type Question = {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctOptionIndex: number;
  weight?: number;
  targetingLevel?: string;
  targetingType?: string;
};

type Attempt = {
  id: string;
  userId: string;
  user?: { email: string; firstName?: string; lastName?: string } | null;
  score: number;
  maxScore: number;
  percentage: number;
  band: string;
  createdAt: string;
};

type Affiliate = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Assignment = {
  id: string;
  title: string;
  affiliate?: { id: string; email: string; name: string } | null;
  status: string;
  questionCount: number;
  percentage?: number | null;
  score?: number | null;
  maxScore?: number | null;
  dueAt?: string | null;
  createdAt: string;
};

type QuestionFormState = {
  id?: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
};

const defaultOptions = ['', '', '', ''];

const emptyForm: QuestionFormState = {
  text: '',
  options: [...defaultOptions],
  correctOptionIndex: 0,
};

export default function AdminAssessmentsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<QuestionFormState>(emptyForm);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Accordion state for question bank: only one can be open at a time; first question open by default
  const [userExpandedQuestionId, setUserExpandedQuestionId] = useState<string | null | undefined>(undefined);

  // Standalone Assignment state
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [assignmentDueAt, setAssignmentDueAt] = useState('');
  const [affiliateIds, setAffiliateIds] = useState<string[]>([]);
  const [assignmentQuestionIds, setAssignmentQuestionIds] = useState<string[]>([]);

  // Search & filter states for pickers
  const [affiliateSearch, setAffiliateSearch] = useState('');
  const [affiliateRoleFilter, setAffiliateRoleFilter] = useState<'all' | 'agent' | 'consultant' | 'account_manager'>('all');
  const [questionSearch, setQuestionSearch] = useState('');

  // Queries
  const questionsQuery = stabilizeErrorRetry(
    useQuery({
      queryKey: ['admin-assessment-questions'],
      queryFn: async () => (await apiClient.get('/assessment/admin/questions')).data as Question[],
    }),
  );

  const activeExpandedQuestionId =
    userExpandedQuestionId !== undefined
      ? userExpandedQuestionId
      : questionsQuery.data?.[0]?.id ?? null;

  const toggleQuestionAccordion = (questionId: string) => {
    setUserExpandedQuestionId((prev) => {
      const current = prev !== undefined ? prev : (questionsQuery.data?.[0]?.id ?? null);
      return current === questionId ? null : questionId;
    });
  };

  const attemptsQuery = stabilizeErrorRetry(
    useQuery({
      queryKey: ['admin-assessment-attempts'],
      queryFn: async () => (await apiClient.get('/assessment/admin/attempts')).data as Attempt[],
    }),
  );

  const affiliatesQuery = stabilizeErrorRetry(
    useQuery({
      queryKey: ['assessment-assignment-affiliates'],
      queryFn: async () => {
        const response = await apiClient.get('/admin/users', { params: { page: 1, limit: 200 } });
        const data = response.data?.data ?? response.data;
        return (Array.isArray(data) ? data : data?.items || []) as Affiliate[];
      },
    }),
  );

  const assignmentsQuery = stabilizeErrorRetry(
    useQuery({
      queryKey: ['admin-assessment-assignments'],
      queryFn: async () => (await apiClient.get('/assessment/admin/assignments')).data as Assignment[],
    }),
  );

  // Mutations
  const saveQuestion = useMutation({
    mutationFn: async (payload: QuestionFormState) => {
      const { id, text, options, correctOptionIndex } = payload;
      const cleanOptions = options.map((opt) => opt.trim()).filter(Boolean);
      const body = {
        text: text.trim(),
        type: 'multiple_choice',
        options: cleanOptions,
        correctOptionIndex: Number(correctOptionIndex),
        weight: 1,
        targetingLevel: 'global',
        targetingType: 'all',
        categoryIds: [],
        sectorIds: [],
      };
      return id ? apiClient.patch(`/assessment/questions/${id}`, body) : apiClient.post('/assessment/questions', body);
    },
    onSuccess: async () => {
      setForm(emptyForm);
      setFeedback('Question saved to objective question bank.');
      setErrorMessage('');
      await queryClient.invalidateQueries({ queryKey: ['admin-assessment-questions'] });
    },
    onError: () => {
      setFeedback('');
      setErrorMessage('The question could not be saved. Check that all fields are filled with valid options.');
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/assessment/questions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-assessment-questions'] }),
  });

  const createAssignments = useMutation({
    mutationFn: async () =>
      apiClient.post('/assessment/admin/assignments', {
        title: assignmentTitle.trim(),
        instructions: assignmentInstructions.trim() || undefined,
        dueAt: assignmentDueAt || null,
        affiliateIds,
        questionIds: assignmentQuestionIds,
      }),
    onSuccess: async () => {
      setAssignmentTitle('');
      setAssignmentInstructions('');
      setAssignmentDueAt('');
      setAffiliateIds([]);
      setAssignmentQuestionIds([]);
      await queryClient.invalidateQueries({ queryKey: ['admin-assessment-assignments'] });
    },
  });

  const editQuestion = (question: Question) => {
    setForm({
      id: question.id,
      text: question.text,
      options: question.options.length >= 2 ? [...question.options] : [...question.options, ''],
      correctOptionIndex: question.correctOptionIndex || 0,
    });
    setUserExpandedQuestionId(question.id);
    setFeedback('');
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered affiliates for scalable assignment
  const filteredAffiliates = useMemo(() => {
    const list = affiliatesQuery.data || [];
    const query = affiliateSearch.trim().toLowerCase();
    return list.filter((affiliate) => {
      const normalizedRole = (affiliate.role || '').toLowerCase().replace('-', '_');
      if (affiliateRoleFilter !== 'all' && normalizedRole !== affiliateRoleFilter) {
        return false;
      }
      if (!query) return true;
      const name = (affiliate.name || '').toLowerCase();
      const email = (affiliate.email || '').toLowerCase();
      const role = normalizedRole.replace('_', ' ');
      return name.includes(query) || email.includes(query) || role.includes(query);
    });
  }, [affiliatesQuery.data, affiliateSearch, affiliateRoleFilter]);

  // Filtered questions for scalable assignment
  const filteredQuestions = useMemo(() => {
    const list = questionsQuery.data || [];
    const query = questionSearch.trim().toLowerCase();
    if (!query) return list;
    return list.filter((q) => q.text.toLowerCase().includes(query));
  }, [questionsQuery.data, questionSearch]);

  const toggleAllFilteredAffiliates = () => {
    const filteredIds = filteredAffiliates.map((a) => a.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => affiliateIds.includes(id));
    if (allSelected) {
      setAffiliateIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setAffiliateIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const toggleAllFilteredQuestions = () => {
    const filteredIds = filteredQuestions.map((q) => q.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => assignmentQuestionIds.includes(id));
    if (allSelected) {
      setAssignmentQuestionIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setAssignmentQuestionIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  return (
    <div className="mx-auto max-w-7xl font-display text-slate-900">
      {/* Header */}
      <header className="mb-4 sm:mb-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 sm:text-xs">Assessment Operations</p>
        <h1 className="mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">Questions and Results</h1>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">Manage the objective affiliate quiz bank, assign standalone evaluations, and review attempts.</p>
      </header>

      {/* SECTION 1: ASSIGN STANDALONE ASSESSMENT */}
      <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 sm:text-base">Assign a Standalone Assessment</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Search and select affiliates and question-bank items to assign a targeted evaluation.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            createAssignments.mutate();
          }}
          className="space-y-4"
        >
          {/* Title & Due Date */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              Assessment Title <span className="text-red-600" aria-hidden="true">*</span>
              <input
                required
                maxLength={160}
                placeholder="e.g. Q4 Compliance & Operations Assessment"
                value={assignmentTitle}
                onChange={(event) => setAssignmentTitle(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Due Date (optional)
              <input
                type="datetime-local"
                value={assignmentDueAt}
                onChange={(event) => setAssignmentDueAt(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </label>
          </div>

          {/* Instructions */}
          <label className="block text-xs font-semibold text-slate-700">
            Instructions (optional)
            <textarea
              rows={2}
              placeholder="Add guidance or context for assigned affiliates..."
              value={assignmentInstructions}
              onChange={(event) => setAssignmentInstructions(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </label>

          {/* Scalable Multi-Select Pickers: Affiliates & Questions */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Affiliates Picker */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:p-3.5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-800">
                  Select Affiliates <span className="text-red-600">*</span>
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {affiliateIds.length} Selected
                </span>
              </div>

              {/* Search input */}
              <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[15px] text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by name, email, or role..."
                  value={affiliateSearch}
                  onChange={(e) => setAffiliateSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Role Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 mb-2">
                {(['all', 'agent', 'consultant', 'account_manager'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAffiliateRoleFilter(r)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                      affiliateRoleFilter === r
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {r === 'all' ? 'All Roles' : r.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={toggleAllFilteredAffiliates}
                  className="ml-auto text-[10px] font-semibold text-blue-600 hover:underline"
                >
                  {filteredAffiliates.length > 0 && filteredAffiliates.every((a) => affiliateIds.includes(a.id))
                    ? 'Deselect filtered'
                    : 'Select filtered'}
                </button>
              </div>

              {/* Affiliates Scrollable List */}
              <div className="max-h-52 min-h-36 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {affiliatesQuery.isLoading && !affiliatesQuery.isError ? (
                  <p className="p-4 text-center text-xs text-slate-400">Loading affiliate directory…</p>
                ) : affiliatesQuery.isError ? (
                  <div className="p-3">
                    <RequestErrorState
                      area="Assessment affiliates"
                      label="Affiliates"
                      error={affiliatesQuery.error}
                      onRetry={() => void affiliatesQuery.refetch()}
                      supportHref="/dashboard/admin"
                    />
                  </div>
                ) : filteredAffiliates.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">No matching affiliates found.</p>
                ) : (
                  filteredAffiliates.map((affiliate) => {
                    const isChecked = affiliateIds.includes(affiliate.id);
                    const roleLabel = (affiliate.role || 'agent').replace('_', ' ').toUpperCase();
                    return (
                      <label
                        key={affiliate.id}
                        className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-slate-50 ${
                          isChecked ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setAffiliateIds((curr) =>
                              curr.includes(affiliate.id) ? curr.filter((id) => id !== affiliate.id) : [...curr, affiliate.id],
                            )
                          }
                          className="size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-800">
                            {affiliate.name || affiliate.email}
                          </p>
                          <p className="truncate text-[10px] text-slate-500">{affiliate.email}</p>
                        </div>
                        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                          {roleLabel}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Questions Picker */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:p-3.5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-800">
                  Select Questions <span className="text-red-600">*</span>
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {assignmentQuestionIds.length} Selected
                </span>
              </div>

              {/* Search input */}
              <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[15px] text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search questions by keywords..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Quick action bar */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500">
                  {filteredQuestions.length} questions available
                </span>
                <button
                  type="button"
                  onClick={toggleAllFilteredQuestions}
                  className="text-[10px] font-semibold text-blue-600 hover:underline"
                >
                  {filteredQuestions.length > 0 && filteredQuestions.every((q) => assignmentQuestionIds.includes(q.id))
                    ? 'Deselect filtered'
                    : 'Select filtered'}
                </button>
              </div>

              {/* Questions Scrollable List */}
              <div className="max-h-52 min-h-36 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {questionsQuery.isLoading && !questionsQuery.isError ? (
                  <p className="p-4 text-center text-xs text-slate-400">Loading question bank…</p>
                ) : questionsQuery.isError ? (
                  <div className="p-3">
                    <RequestErrorState
                      area="Assessment questions"
                      label="Questions"
                      error={questionsQuery.error}
                      onRetry={() => void questionsQuery.refetch()}
                      supportHref="/dashboard/admin"
                    />
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">No matching questions found.</p>
                ) : (
                  filteredQuestions.map((q) => {
                    const isChecked = assignmentQuestionIds.includes(q.id);
                    return (
                      <label
                        key={q.id}
                        className={`flex cursor-pointer items-start gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-slate-50 ${
                          isChecked ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setAssignmentQuestionIds((curr) =>
                              curr.includes(q.id) ? curr.filter((id) => id !== q.id) : [...curr, q.id],
                            )
                          }
                          className="mt-0.5 size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800 line-clamp-2">{q.text}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {q.options?.length || 0} options · Objective
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Submission feedback */}
          {createAssignments.isError && (
            <p className="text-xs text-red-700" role="alert">
              Assignment could not be created. Confirm you selected at least one affiliate and question.
            </p>
          )}
          {createAssignments.isSuccess && (
            <p className="text-xs text-emerald-700" role="status">
              Assessment assigned successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={createAssignments.isPending || !affiliateIds.length || !assignmentQuestionIds.length}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
            <span>
              {createAssignments.isPending
                ? 'Assigning…'
                : `Assign Assessment (${affiliateIds.length} Affiliates · ${assignmentQuestionIds.length} Questions)`}
            </span>
          </button>
        </form>
      </section>

      {/* SECTION 2: STANDALONE ASSIGNMENTS TABLE */}
      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Active Standalone Assignments</h2>
        </div>
        {assignmentsQuery.isLoading && !assignmentsQuery.isError ? (
          <p className="p-5 text-xs text-slate-500">Loading assignments…</p>
        ) : assignmentsQuery.isError ? (
          <div className="p-4">
            <RequestErrorState
              area="Admin assessment assignments"
              label="Assignments"
              error={assignmentsQuery.error}
              onRetry={() => void assignmentsQuery.refetch()}
              supportHref="/dashboard/admin"
            />
          </div>
        ) : assignmentsQuery.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Assessment</th>
                  <th className="px-4 py-2.5">Affiliate</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Result</th>
                  <th className="px-4 py-2.5">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignmentsQuery.data.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{assignment.title}</span>
                      <span className="block text-[10px] text-slate-500">{assignment.questionCount} questions</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">
                        {assignment.affiliate?.name || assignment.affiliate?.email || 'Affiliate unavailable'}
                      </span>
                      <span className="block text-[10px] text-slate-500">{assignment.affiliate?.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-700">
                        {assignment.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {assignment.percentage != null
                        ? `${assignment.percentage}% · ${assignment.score}/${assignment.maxScore}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {assignment.dueAt ? new Date(assignment.dueAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-center text-xs text-slate-400">No standalone assessments assigned yet.</p>
        )}
      </section>

      {/* SECTION 3: OBJECTIVE QUESTION CREATOR & EDITOR */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setFeedback('');
          setErrorMessage('');
          const cleanOptions = form.options.map((item) => item.trim()).filter(Boolean);
          if (cleanOptions.length < 2) {
            setErrorMessage('Add at least two answer options.');
            return;
          }
          if (form.correctOptionIndex < 0 || form.correctOptionIndex >= cleanOptions.length) {
            setErrorMessage('Please select one of the answer options as the correct answer.');
            return;
          }
          saveQuestion.mutate(form);
        }}
        className="mb-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              {form.id ? 'Edit Objective Question' : 'Add Objective Question'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Create multiple-choice questions for the unified assessment bank. Select the correct answer option using the radio control.
            </p>
          </div>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="text-xs font-semibold text-slate-600 underline hover:text-slate-900"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Question Text */}
          <label className="block text-xs font-semibold text-slate-700">
            Question Text <span className="text-red-600" aria-hidden="true">*</span>
            <textarea
              required
              rows={3}
              placeholder="e.g. Under partner policies, what is the primary standard for verifying prospective client contact details?"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          {/* Answer Options with Visual Correct Option Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Answer Options <span className="text-red-600">*</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Mark the radio button next to the correct answer
              </span>
            </div>

            <div className="space-y-2">
              {form.options.map((option, idx) => {
                const isCorrect = form.correctOptionIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`group flex items-center gap-2.5 rounded-lg border px-3 py-1.5 transition-all focus-within:ring-2 ${
                      isCorrect
                        ? 'border-emerald-400 bg-emerald-50/40 focus-within:border-emerald-500 focus-within:ring-emerald-500/20'
                        : 'border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-blue-500/20 hover:border-slate-300'
                    }`}
                  >
                    <label
                      title="Mark as correct answer"
                      className="flex cursor-pointer items-center gap-1.5 shrink-0 select-none py-1"
                    >
                      <input
                        type="radio"
                        name="correctOption"
                        checked={isCorrect}
                        onChange={() => setForm((f) => ({ ...f, correctOptionIndex: idx }))}
                        className="size-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-bold transition-colors ${
                          isCorrect ? 'text-emerald-700' : 'text-slate-500 group-hover:text-slate-700'
                        }`}
                      >
                        {isCorrect ? '✓ Correct' : `Option ${idx + 1}`}
                      </span>
                    </label>

                    <input
                      type="text"
                      required
                      placeholder={`Enter answer option ${idx + 1}...`}
                      value={option}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((f) => {
                          const next = [...f.options];
                          next[idx] = val;
                          return { ...f, options: next };
                        });
                      }}
                      className="min-w-0 flex-1 border-none bg-transparent px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    />

                    {form.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => {
                            const next = f.options.filter((_, i) => i !== idx);
                            let nextCorrect = f.correctOptionIndex;
                            if (nextCorrect >= next.length) nextCorrect = next.length - 1;
                            else if (nextCorrect === idx) nextCorrect = 0;
                            return { ...f, options: next, correctOptionIndex: nextCorrect };
                          });
                        }}
                        title="Remove option"
                        className="flex size-7 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {form.options.length < 6 && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, options: [...f.options, ''] }))}
                className="mt-1 inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Add another option</span>
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <p className="mt-3 text-xs text-red-700" role="alert">
            {errorMessage}
          </p>
        )}
        {feedback && (
          <p className="mt-3 text-xs text-emerald-700" role="status">
            {feedback}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={saveQuestion.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            <span>{saveQuestion.isPending ? 'Saving…' : form.id ? 'Save Question' : 'Create Question'}</span>
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* SECTION 4: QUESTION BANK LIST (Single-open Accordion, 1 option per line) */}
      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Unified Question Bank</h2>
            <p className="text-[11px] text-slate-500">
              Objective questions for affiliate assessment. Click a question to expand its answer options.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {questionsQuery.data?.length || 0} Questions
          </span>
        </div>
        {questionsQuery.isLoading && !questionsQuery.isError ? (
          <p className="p-5 text-xs text-slate-500">Loading questions…</p>
        ) : questionsQuery.isError ? (
          <div className="p-4">
            <RequestErrorState
              area="Question bank"
              label="Question bank"
              error={questionsQuery.error}
              onRetry={() => void questionsQuery.refetch()}
              supportHref="/dashboard/admin"
            />
          </div>
        ) : questionsQuery.data?.length ? (
          <div className="divide-y divide-slate-100">
            {questionsQuery.data.map((question, qIdx) => {
              const isExpanded = activeExpandedQuestionId === question.id;
              return (
                <article
                  key={question.id}
                  className={`transition-colors ${isExpanded ? 'bg-slate-50/40' : 'hover:bg-slate-50/50'}`}
                >
                  {/* Collapsible Header Row */}
                  <div
                    onClick={() => toggleQuestionAccordion(question.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleQuestionAccordion(question.id);
                      }
                    }}
                    className="flex cursor-pointer items-start justify-between gap-3 p-3.5 sm:p-4 select-none"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                        {qIdx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                          {question.text}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                          <span>{question.options.length} Options</span>
                          <span>•</span>
                          <span>Objective Multiple Choice</span>
                          {!isExpanded && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-medium truncate max-w-[220px] sm:max-w-xs">
                                Correct: {question.options[question.correctOptionIndex]}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          editQuestion(question);
                        }}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deleteQuestion.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Remove this question from the bank? Existing assignment results will remain.')) {
                            deleteQuestion.mutate(question.id);
                          }
                        }}
                        className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 shadow-xs"
                      >
                        Remove
                      </button>
                      <span
                        className="material-symbols-outlined shrink-0 text-slate-400 transition-transform duration-200"
                        style={{
                          fontSize: '20px',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Expanded Body: Each option stands on its own line */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-3.5 pb-4 pt-3 sm:px-4 sm:pl-11">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Answer Options
                      </p>
                      <div className="space-y-1.5">
                        {question.options.map((option, index) => {
                          const isCorrect = index === question.correctOptionIndex;
                          return (
                            <div
                              key={index}
                              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
                                isCorrect
                                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950 font-medium shadow-xs'
                                  : 'border-slate-200/80 bg-white text-slate-700'
                              }`}
                            >
                              <span
                                className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {isCorrect ? (
                                  <span className="material-symbols-outlined text-[13px] leading-none">check</span>
                                ) : (
                                  String.fromCharCode(65 + index)
                                )}
                              </span>
                              <span className="min-w-0 flex-1 leading-relaxed">{option}</span>
                              {isCorrect && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                                  <span className="material-symbols-outlined text-[11px] leading-none">check_circle</span>
                                  <span>Correct Answer</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="p-8 text-center text-xs text-slate-400">No assessment questions found.</p>
        )}
      </section>

      {/* SECTION 5: AFFILIATE ASSESSMENT RESULTS TABLE */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Affiliate Assessment Results</h2>
        </div>
        {attemptsQuery.isLoading && !attemptsQuery.isError ? (
          <p className="p-5 text-xs text-slate-500">Loading results…</p>
        ) : attemptsQuery.isError ? (
          <div className="p-4">
            <RequestErrorState
              area="Assessment results"
              label="Assessment results"
              error={attemptsQuery.error}
              onRetry={() => void attemptsQuery.refetch()}
              supportHref="/dashboard/admin"
            />
          </div>
        ) : attemptsQuery.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Affiliate</th>
                  <th className="px-4 py-2.5">Result</th>
                  <th className="px-4 py-2.5">Score</th>
                  <th className="px-4 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attemptsQuery.data.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-900">{attempt.user?.email || attempt.userId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                          attempt.band === 'pass'
                            ? 'bg-emerald-50 text-emerald-700'
                            : attempt.band === 'partial'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {attempt.band}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {attempt.percentage}% · {attempt.score}/{attempt.maxScore}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(attempt.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-xs text-slate-400">No assessment attempts recorded.</p>
        )}
      </section>
    </div>
  );
}
