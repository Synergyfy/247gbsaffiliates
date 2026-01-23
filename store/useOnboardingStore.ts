import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/lib/mockApi';

export type OnboardingStep = 'basic-info' | 'profile-info' | 'questionnaire' | 'quiz' | 'outcome';

interface OnboardingState {
  currentStep: OnboardingStep;
  role: UserRole | null;
  basicInfo: {
    location: string;
    zipCode: string;
    phone: string;
    headline: string;
  };
  profileInfo: Record<string, any>;
  selectedSkills: string[];
  quizAnswers: Record<string, string>;
  quizResult: {
    score: number;
    performance: {
      speed: number;
      accuracy: number;
      scenarios: number;
    };
  } | null;

  setStep: (step: OnboardingStep) => void;
  setRole: (role: UserRole) => void;
  updateBasicInfo: (info: Partial<OnboardingState['basicInfo']>) => void;
  updateProfileInfo: (info: Record<string, any>) => void;
  toggleSkill: (skillId: string) => void;
  setQuizAnswer: (questionId: string, answerId: string) => void;
  setQuizResult: (result: OnboardingState['quizResult']) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 'basic-info',
      role: null,
      basicInfo: {
        location: '',
        zipCode: '',
        phone: '',
        headline: '',
      },
      profileInfo: {},
      selectedSkills: [],
      quizAnswers: {},
      quizResult: null,

      setStep: (step) => set({ currentStep: step }),
      
      setRole: (role) => set({ role }),
      
      updateBasicInfo: (info) => set((state) => ({
        basicInfo: { ...state.basicInfo, ...info }
      })),

      updateProfileInfo: (info) => set((state) => ({
        profileInfo: { ...state.profileInfo, ...info }
      })),

      toggleSkill: (skillId) => set((state) => ({
        selectedSkills: state.selectedSkills.includes(skillId)
          ? state.selectedSkills.filter(id => id !== skillId)
          : [...state.selectedSkills, skillId]
      })),

      setQuizAnswer: (questionId, answerId) => set((state) => ({
        quizAnswers: { ...state.quizAnswers, [questionId]: answerId }
      })),

      setQuizResult: (result) => set({ quizResult: result, currentStep: 'outcome' }),

      resetOnboarding: () => set({
        currentStep: 'basic-info',
        role: null,
        basicInfo: {
          location: '',
          zipCode: '',
          phone: '',
          headline: '',
        },
        profileInfo: {},
        selectedSkills: [],
        quizAnswers: {},
        quizResult: null
      }),
    }),
    {
      name: 'listeo-onboarding',
    }
  )
);
