import { redirect } from 'next/navigation';
import { getAffiliateRegisterUrl } from '@/lib/centralHub';

/**
 * Email verification is owned by Central Hub Solutions. Affiliate accounts are
 * created and verified there, then provisioned into this portal through SSO.
 */
export default function VerifyEmailPage() {
    redirect(getAffiliateRegisterUrl());
}
