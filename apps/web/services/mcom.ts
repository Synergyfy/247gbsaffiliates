import apiClient from '@/lib/apiClient';

export interface McomSsoConfig {
  membershipUrl?: string;
  walletEnabled: boolean;
  configured: boolean;
}

export interface McomSsoStatus {
  connected: boolean;
  mcomUserId: string | null;
  membership: {
    level: string | null;
    tier: string | null;
    status: string | null;
    canAccessAffiliate: boolean;
  };
}

export const mcomService = {
  async startLogin(card?: string, business?: string, redirect?: string): Promise<void> {
    const { data } = await apiClient.get<McomSsoConfig>('/auth/sso/config');
    if (!data.configured) {
      throw new Error(
        'Central Hub Solutions is not configured on the backend. Please set MCOM_SOLUTIONS_URL and MCOM_CLIENT_ID.',
      );
    }
    const params = new URLSearchParams();
    if (card) params.set('card', card);
    if (business) params.set('business', business);
    if (redirect) params.set('redirect', redirect);
    const qs = params.toString() ? `?${params.toString()}` : '';
    window.location.href = `${apiClient.defaults.baseURL}/auth/sso/login${qs}`;
  },

  async refreshSession(userId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post('/auth/sso/refresh', { userId });
    return response.data;
  },

  async getStatus(userId: string, sync?: boolean): Promise<McomSsoStatus> {
    const params = new URLSearchParams({ userId });
    if (sync) params.set('sync', '1');
    const response = await apiClient.get(`/auth/sso/status?${params.toString()}`);
    return response.data;
  },
};
