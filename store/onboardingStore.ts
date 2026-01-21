import { create } from 'zustand';

export type Role = 'client' | 'artisan' | 'admin';

interface OnboardingState {
  // Navigation
  activeRole: Role | null;
  currentStep: number;
  totalSteps: number;
  
  // Data
  email: string;
  firstName: string;
  lastName: string;
  professionalTitle: string;
  bio: string;
  phoneNumber: string;
  
  // Artisan specific
  category: string;
  radius: number;
  schedule: any[];
  projects: any[];
  services: { id: string; name: string; price: number }[];
  documents: {
    id: string;
    license: string;
  };
  
  // Actions
  setRole: (role: Role) => void;
  setInternalStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<OnboardingState>) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  activeRole: null,
  currentStep: 0,
  totalSteps: 5,
  email: '',
  firstName: '',
  lastName: '',
  professionalTitle: '',
  bio: '',
  phoneNumber: '',
  
  category: '',
  radius: 25,
  schedule: [],
  projects: [],
  services: [],
  documents: {
    id: '',
    license: '',
  },
  
  setRole: (role) => set({ activeRole: role }),
  
  setInternalStep: (step) => set({ currentStep: step }),
  
  nextStep: () => set((state) => ({ 
    currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1) 
  })),
  
  prevStep: () => set((state) => ({ 
    currentStep: Math.max(state.currentStep - 1, 0) 
  })),
  
  updateData: (data) => set((state) => ({ ...state, ...data })),
}));
