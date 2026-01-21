
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'artisan' | 'admin';
  avatar?: string;
  image?: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alex Artisan', email: 'alex@artisans.com', role: 'artisan', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARXNH-vkGwvmEhwQRV0IBO_YK7Xod_Wo3k6CMwblM4Ws7uMmpyWIT5Ci-rHoheNbf_tLN2oQc8kcW9m9Tuym1MPeHL5weg6KkSNIJ4SvAnBQjcmFGMSSXG8Ar6ipUgF3YK8OwS3iMuqrzhYiL7Ad1HbxsVMWUYgilEndXUlLsE7QNfbzf2ggec8jaB4UoYJPo6fXKLfeGtSuVg2Trz9gmwQTPZy7SHeLT_7Kzp-fuOUTiTPJx8crF1TzcRaCPP1T6Dj2S263LUNwbL' },
  { id: '2', name: 'John Client', email: 'john@example.com', role: 'client' },
  { id: '3', name: 'Admin Master', email: 'admin@artisans.com', role: 'admin' },
];

export const mockApi = {
  login: async (email: string): Promise<{ user: User; token: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const user = mockUsers.find(u => u.email === email) || {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email,
      role: 'client' as const
    };
    return { user, token: 'mock-jwt-token-' + user.id };
  },

  signup: async (data: any): Promise<{ user: User; token: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || data.email.split('@')[0],
      email: data.email,
      role: data.role,
      avatar: data.avatar
    };
    return { user, token: 'mock-jwt-token-' + user.id };
  },

  getProfile: async (): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Simulated logged in user check (logic would go here)
    return mockUsers[0]; 
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },

  deleteAccount: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};
