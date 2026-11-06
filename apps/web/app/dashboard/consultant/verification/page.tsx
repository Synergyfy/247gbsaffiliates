import AgentVerificationPage from '../../agent/verification/page';
import { RolePageFrame } from '@/components/dashboard/RolePageFrame';

export default function ConsultantVerificationPage() {
    return <RolePageFrame verticalPadding><AgentVerificationPage /></RolePageFrame>;
}
