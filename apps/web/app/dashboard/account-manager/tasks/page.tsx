import AgentTasksPage from '../../agent/tasks/page';
import AccountManagerReviewQueue from '@/components/dashboard/AccountManagerReviewQueue';

export default function AccountManagerTasksPage() {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4 px-3 py-4 sm:px-5 lg:px-7">
      <AccountManagerReviewQueue />
      <AgentTasksPage />
    </div>
  );
}
