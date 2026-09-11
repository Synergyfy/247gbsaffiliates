import apiClient from '@/lib/apiClient';

export const mcomService = {
  // Start OAuth flow: redirects browser to MCOM Central
  async startLogin(card?: string, business?: string, redirect?: string) {
    const params = new URLSearchParams();
    if (card) params.set('card', card);
    if (business) params.set('business', business);
    if (redirect) params.set('redirect', redirect);
    const qs = params.toString() ? `?${params.toString()}` : '';
    window.location.href = `${apiClient.defaults.baseURL}/auth/sso/login${qs}`;
  },

  // Complete OAuth: POST /auth/sso/callback with { code, state }
  async completeLogin(code: string, state: string) {
    const response = await apiClient.post('/auth/sso/callback', { code, state });
    return response.data;
  },

  // Refresh: POST /auth/sso/refresh
  async refreshSession(userId: string) {
    const response = await apiClient.post('/auth/sso/refresh', { userId });
    return response.data;
  },

  // Status check: GET /auth/sso/status
  async getStatus(userId: string, sync?: boolean) {
    const params = new URLSearchParams({ userId });
    if (sync) params.set('sync', '1');
    const response = await apiClient.get(`/auth/sso/status?${params.toString()}`);
    return response.data;
  },

  // Direct handshake: already handled via redirect, but can call manually
  async completeHandshake(token: string) {
    // The handshake is completed server-side via redirect.
    // This is a fallback that calls the status endpoint after redirect.
    const response = await apiClient.get(`/auth/sso-login?token=${token}`);
    return response.data;
  },
};
