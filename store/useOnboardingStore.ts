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
  assessmentSkipped: boolean; // New State

  questionnaireAnswers: {
    yearsExperience?: string;
    turnaroundTime?: string;
    availability?: string; // Yes/No
    portfolioUrl?: string;
    ratePreference?: string;
    languages?: string[];
    acceptFixedPrice?: boolean;
    agreeTerms?: boolean;
    // Account Manager Specific
    teamLeadershipExp?: string;
    campaignBudgetCapacity?: string;
    availabilityType?: string;
  };
  isPaidVisibilityRequested: boolean;
  profileStatus: 'active' | 'pending_verification' | null;

  setStep: (step: OnboardingStep) => void;
  setRole: (role: UserRole) => void;
  updateBasicInfo: (info: Partial<OnboardingState['basicInfo']>) => void;
  updateProfileInfo: (info: Record<string, any>) => void;
  updateQuestionnaireAnswers: (answers: Partial<OnboardingState['questionnaireAnswers']>) => void;
  setIsPaidVisibilityRequested: (requested: boolean) => void;
  setProfileStatus: (status: OnboardingState['profileStatus']) => void;
  toggleSkill: (skillId: string) => void;
  setQuizAnswer: (questionId: string, answerId: string) => void;
  setQuizResult: (result: OnboardingState['quizResult']) => void;
  setAssessmentSkipped: (skipped: boolean) => void; 
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
      questionnaireAnswers: {},
      isPaidVisibilityRequested: false,
      profileStatus: null,
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

      updateQuestionnaireAnswers: (answers) => set((state) => ({
        questionnaireAnswers: { ...state.questionnaireAnswers, ...answers }
      })),

      setIsPaidVisibilityRequested: (requested) => set({ isPaidVisibilityRequested: requested }),
      
      setProfileStatus: (status) => set({ profileStatus: status }),

      toggleSkill: (skillId) => set((state) => ({
        selectedSkills: state.selectedSkills.includes(skillId)
          ? state.selectedSkills.filter(id => id !== skillId)
          : [...state.selectedSkills, skillId]
      })),

      setQuizAnswer: (questionId, answerId) => set((state) => ({
        quizAnswers: { ...state.quizAnswers, [questionId]: answerId }
      })),

      setQuizResult: (result) => set({ quizResult: result, currentStep: 'outcome' }),

      // New State and Action for Skipped Assessment
      assessmentSkipped: false,
      setAssessmentSkipped: (skipped: boolean) => set({ assessmentSkipped: skipped }),

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
        quizResult: null,
        assessmentSkipped: false
      }),
    }),
    {
      name: 'listeo-onboarding',
    }
  )
);
