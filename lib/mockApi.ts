export type UserRole = 'agent' | 'account-manager' | 'consultant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  image?: string;
  score?: number;
  skills?: string[];
}

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
  options: QuizOption[];
  correctOptionId: string;
  type?: 'scenario' | 'knowledge';
}

const mockUsers: User[] = [];

const mockSkills: Skill[] = [
  { id: '1', name: 'Social Media Setup' },
  { id: '2', name: 'AI Content Generation' },
  { id: '3', name: 'Local SEO' },
  { id: '4', name: 'Graphic Design' },
  { id: '5', name: 'Email Marketing' },
  { id: '6', name: 'Web Development' },
  { id: '7', name: 'Copywriting' },
  { id: '8', name: 'Data Analysis' },
  { id: '9', name: 'Paid Advertising' },
  { id: '10', name: 'Community Management' },
  { id: '11', name: 'Photography' },
  { id: '12', name: 'UI/UX Design' },
  { id: '13', name: 'Video Editing' },
  { id: '14', name: 'Market Research' },
];

const mockQuestions: Record<string, QuizQuestion[]> = {
  agent: [
    {
      id: 'a1',
      text: 'How to optimize a product blurb for SEO?',
      options: [
        { id: 'opt1', text: 'Include high-volume keywords naturally within the first 50 words.' },
        { id: 'opt2', text: 'Repeat the product name as many times as possible in every sentence.' },
        { id: 'opt3', text: 'Focus on long-tail keywords, benefit-driven language, and meta-descriptions.' },
        { id: 'opt4', text: 'Keep the blurb under 20 words to ensure faster mobile indexing.' },
      ],
      correctOptionId: 'opt3'
    },
    {
      id: 'a2',
      text: 'What is the most effective way to handle a lead that hasn\'t responded in 48 hours?',
      options: [
        { id: 'opt1', text: 'Mark as lost and move on' },
        { id: 'opt2', text: 'Send a "break-up" email immediately' },
        { id: 'opt3', text: 'Follow up with a value-driven touchpoint (e.g., a helpful resource)' },
        { id: 'opt4', text: 'Call them every 2 hours until they pick up' },
      ],
      correctOptionId: 'opt3'
    }
  ],
  'account-manager': [
    {
      id: 'am1',
      text: "A high-priority client's campaign is underperforming. How do you strategically reassign tasks?",
      type: 'scenario',
      options: [
        { id: 'opt1', text: 'Skill-Based Redistribution: Identify bottlenecks and reassign to specialists.' },
        { id: 'opt2', text: 'Capacity & Velocity Mapping: Shift tasks based on Agent bandwidth.' },
        { id: 'opt3', text: 'Equal Load Distribution: Divide tasks equally to prevent burnout.' },
        { id: 'opt4', text: 'External Resource Escalation: Request freelance support immediately.' },
      ],
      correctOptionId: 'opt2'
    }
  ],
  consultant: [
    {
      id: 'c1',
      text: 'Analyze this business growth chart and identify the primary bottleneck.',
      type: 'scenario',
      options: [
        { id: 'opt1', text: 'Adversely high customer acquisition costs (CAC) exceeding LTV in Q2.' },
        { id: 'opt2', text: 'A post-acquisition retention failure in Q3 despite high lead volume.' },
        { id: 'opt3', text: 'Market saturation within the primary demographic preventing penetration.' },
        { id: 'opt4', text: 'Infrastructure latency in Q4 causing high abandonment rates.' },
      ],
      correctOptionId: 'opt2'
    }
  ]
};

export const mockApi = {
  getSkills: async (): Promise<Skill[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockSkills;
  },

  getQuestions: async (role: UserRole): Promise<QuizQuestion[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockQuestions[role] || [];
  },

  submitQuiz: async (role: UserRole, answers: Record<string, string>): Promise<{ score: number; performance: any }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const questions = mockQuestions[role] || [];
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    return {
      score,
      performance: {
        speed: 95,
        accuracy: score,
        scenarios: 92
      }
    };
  },

  login: async (email: string): Promise<{ user: User; token: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const user = mockUsers.find(u => u.email === email) || {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[1] ? email.split('@')[0] : 'User',
      email: email,
      role: 'agent' as const
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
    return mockUsers[0]; 
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },

  verifyEmail: async (code: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return code === '123456';
  },

  deleteAccount: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};
