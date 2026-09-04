import { UserRole } from './auth';

export interface Skill {
  id: string;
  name: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[] | QuizOption[]; // Backend returns string[], mock used objects
  correctOptionId?: string;
  type?: 'scenario' | 'knowledge';
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  category: 'scenario' | 'knowledge' | 'skills' | 'general';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url: string;
  role: UserRole;
}
