import AssignedAssessmentPage from '../../../agent/assessment/[assignmentId]/page';
import { RolePageFrame } from '@/components/dashboard/RolePageFrame';

export default function ConsultantAssignedAssessmentPage() {
    return <RolePageFrame><AssignedAssessmentPage /></RolePageFrame>;
}
