import AgentVerificationPage from '../../agent/verification/page';
import { RolePageFrame } from '@/components/dashboard/RolePageFrame';

export default function AccountManagerVerificationPage() {
    return <RolePageFrame verticalPadding><AgentVerificationPage /></RolePageFrame>;
}
