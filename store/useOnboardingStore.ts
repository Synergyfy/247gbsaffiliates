import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/lib/mockApi';

export type OnboardingStep = 'basic-info' | 'profile-info' | 'questionnaire' | 'quiz' | 'outcome';

interface OnboardingState {
  currentStep: OnboardingStep;
  role: UserRole | null;
  userName: string;
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
  missedQuestions: string[];
  performanceBreakdown: {
    category: string;
    score: number;
  }[];
  retakeAvailableAt: number | null;
  assessmentSkipped: boolean;

  questionnaireAnswers: {
    yearsExperience?: string;
    turnaroundTime?: string;
    availability?: string;
    portfolioUrl?: string;
    ratePreference?: string;
    languages?: string[];
    acceptFixedPrice?: boolean;
    agreeTerms?: boolean;
    teamLeadershipExp?: string;
    campaignBudgetCapacity?: string;
    availabilityType?: string;
  };
  isPaidVisibilityRequested: boolean;
  profileStatus: 'active' | 'pending_verification' | null;

  setStep: (step: OnboardingStep) => void;
  setRole: (role: UserRole) => void;
  setUserName: (name: string) => void;
  updateBasicInfo: (info: Partial<OnboardingState['basicInfo']>) => void;
  updateProfileInfo: (info: Record<string, any>) => void;
  updateQuestionnaireAnswers: (answers: Partial<OnboardingState['questionnaireAnswers']>) => void;
  setIsPaidVisibilityRequested: (requested: boolean) => void;
  setProfileStatus: (status: OnboardingState['profileStatus']) => void;
  toggleSkill: (skillId: string) => void;
  setQuizAnswer: (questionId: string, answerId: string) => void;
  setQuizResult: (result: OnboardingState['quizResult']) => void;
  setMissedQuestions: (questions: string[]) => void;
  setPerformanceBreakdown: (breakdown: OnboardingState['performanceBreakdown']) => void;
  setRetakeAvailableAt: (timestamp: number | null) => void;
  setAssessmentSkipped: (skipped: boolean) => void; 
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 'basic-info',
      role: null,
      userName: '',
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
      missedQuestions: [],
      performanceBreakdown: [],
      retakeAvailableAt: null,
      assessmentSkipped: false,

      setStep: (step) => set({ currentStep: step }),
      
      setRole: (role) => set({ role }),
      
      setUserName: (name) => set({ userName: name }),
      
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

      setMissedQuestions: (questions) => set({ missedQuestions: questions }),

      setPerformanceBreakdown: (breakdown) => set({ performanceBreakdown: breakdown }),

      setRetakeAvailableAt: (timestamp) => set({ retakeAvailableAt: timestamp }),

      setAssessmentSkipped: (skipped: boolean) => set({ assessmentSkipped: skipped }),

      resetOnboarding: () => set({
        currentStep: 'basic-info',
        role: null,
        userName: '',
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
        missedQuestions: [],
        performanceBreakdown: [],
        retakeAvailableAt: null,
        assessmentSkipped: false
      }),
    }),
    {
      name: 'listeo-onboarding',
    }
  )
);
