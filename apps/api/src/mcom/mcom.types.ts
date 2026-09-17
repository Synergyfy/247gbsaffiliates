/**
 * Central Hub Solutions (MCOM) SSO — shared typed contracts.
 * 247gbs affiliate portal is restricted to Agent, Account Manager, Consultant, and Admin roles.
 */

/** Roles permitted to access the 247GBS Affiliate portal. */
export const ALLOWED_AFFILIATE_ROLES = [
  'agent',
  'account_manager',
  'account-manager',
  'account manager',
  'consultant',
  'admin',
  'administrator',
] as const;

/** Permission flag issued by Central for this app (new registration). */
export const MCOM_PERMISSION_KEY = 'canAccess_247gbs_affiliate';

/** Legacy flag from the previous `_test` registration — accepted as fallback. */
export const MCOM_PERMISSION_KEY_LEGACY = 'canAccess_247gbs_affiliate_test';

export interface McomAppPlan {
  source?: 'membership' | 'direct' | string;
  platform?: string;
  clientId?: string;
  planId?: string;
  planName?: string;
  status?: string;
  quotas?: Record<string, unknown>;
  limits?: Record<string, unknown>;
  membershipPlanName?: string | null;
  expiresAt?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface McomBusinessProfile {
  id?: string;
  businessName?: string;
  membershipLevel?: string;
  membershipStatus?: string;
  membershipPlanName?: string;
  appPlan?: McomAppPlan | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface McomCentralUser {
  id: string;
  email: string;
  /** Full display name (Central may send firstName/lastName instead). */
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  membershipLevel?: string;
  membershipStatus?: string;
  businessProfile?: McomBusinessProfile | null;
  permissions?: Record<string, boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface McomTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
  user: McomCentralUser;
}

export interface McomRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface JitProvisionInput {
  sub: string;
  email: string;
  name?: string;
  role?: string;
  membership?: { level?: string | null; status?: string | null };
  permissions?: Record<string, boolean>;
}

export interface McomSsoConfig {
  solutionsUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
  platformSlug: string;
  frontendUrl: string;
}
