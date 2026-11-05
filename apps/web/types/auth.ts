export type UserRole = 'agent' | 'account_manager' | 'account-manager' | 'consultant' | 'admin';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  roles?: string[];
  status?: string;
  verificationStatus?: string;
  verificationNotes?: string | null;
  verificationSubmission?: Record<string, unknown> | null;
  verificationReviewedAt?: string | null;
  avatar?: string;
  image?: string;
  score?: number;
  skills?: string[];
  bio?: string;
  assessmentSkipped?: boolean;
  isOnboarded?: boolean;
  isQuizPassed?: boolean;
  mcomUserId?: string | null;
  mcomMembershipLevel?: string | null;
  mcomMembershipTier?: string | null;
  mcomMembershipStatus?: string | null;
  mcomCanAccessVcard?: boolean;
  phone?: string | null;
  postcode?: string | null;
  postalCode?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  stats?: {
    tasksCompleted?: number;
    rating?: number;
    rank?: string;
  };
}
