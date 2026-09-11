import apiClient from '@/lib/apiClient';

export const mcomService = {
  async startLogin(card?: string, business?: string, redirect?: string) {
    const { data } = await apiClient.get('/auth/sso/config');
    if (!data.configured) {
      throw new Error(
        'MCOM Solutions is not configured on the backend. Please set MCOM_SOLUTIONS_URL and MCOM_CLIENT_ID.'
      );
    }
    const params = new URLSearchParams();
    if (card) params.set('card', card);
    if (business) params.set('business', business);
    if (redirect) params.set('redirect', redirect);
    const qs = params.toString() ? `?${params.toString()}` : '';
    window.location.href = `${apiClient.defaults.baseURL}/auth/sso/login${qs}`;
  },

  async completeLogin(code: string, state: string) {
    const response = await apiClient.post('/auth/sso/callback', { code, state });
    return response.data;
  },

  async refreshSession(userId: string) {
    const response = await apiClient.post('/auth/sso/refresh', { userId });
    return response.data;
  },

  async getStatus(userId: string, sync?: boolean) {
    const params = new URLSearchParams({ userId });
    if (sync) params.set('sync', '1');
    const response = await apiClient.get(`/auth/sso/status?${params.toString()}`);
    return response.data;
  },

  async completeHandshake(token: string) {
    const response = await apiClient.get(`/auth/sso-login?token=${token}`);
    return response.data;
  },
};
