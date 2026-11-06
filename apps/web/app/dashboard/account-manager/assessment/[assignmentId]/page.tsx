import AssignedAssessmentPage from '../../../agent/assessment/[assignmentId]/page';
import { RolePageFrame } from '@/components/dashboard/RolePageFrame';

export default function AccountManagerAssignedAssessmentPage() {
    return <RolePageFrame><AssignedAssessmentPage /></RolePageFrame>;
}
