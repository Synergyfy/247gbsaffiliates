import AgentTasksPage from '../../agent/tasks/page';
import AccountManagerReviewQueue from '@/components/dashboard/AccountManagerReviewQueue';

export default function AccountManagerTasksPage() {
  return (
    <div className="space-y-6">
      <AccountManagerReviewQueue />
      <AgentTasksPage />
    </div>
  );
}
