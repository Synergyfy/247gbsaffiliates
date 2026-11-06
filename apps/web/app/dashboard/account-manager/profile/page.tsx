import AgentProfilePage from '../../agent/profile/page';
import { RolePageFrame } from '@/components/dashboard/RolePageFrame';

export default function AccountManagerProfilePage() {
    return <RolePageFrame verticalPadding><AgentProfilePage /></RolePageFrame>;
}
