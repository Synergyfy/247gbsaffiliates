import AgentTasksPage from '../../agent/tasks/page';
import { RolePageFrame } from '@/components/dashboard/RolePageFrame';

export default function ConsultantTasksPage() {
    return <RolePageFrame><AgentTasksPage /></RolePageFrame>;
}
