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
  assessmentSkipped?: boolean; // Added for skip functionality
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

const mockQuestionsPool: Record<UserRole, QuizQuestion[]> = {
  agent: [
    // Existing questions
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
    },
    // New questions (Agent)
    {
      id: 'a3',
      text: 'When setting up a social media profile for a client, what is the first step?',
      options: [
        { id: 'opt1', text: 'Start posting immediately to gain traction.' },
        { id: 'opt2', text: 'Optimize the bio and profile picture for brand consistency.' },
        { id: 'opt3', text: 'Follow as many people as possible.' },
        { id: 'opt4', text: 'Run a paid ad campaign.' },
      ],
      correctOptionId: 'opt2'
    },
    {
        id: 'a4',
        text: 'Which file format is best for a logo with a transparent background?',
        options: [
            { id: 'opt1', text: 'JPG' },
            { id: 'opt2', text: 'PNG' },
            { id: 'opt3', text: 'GIF' },
            { id: 'opt4', text: 'BMP' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'a5',
        text: 'A client complains about a slow response time. What is the best immediate action?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Ignore the message until you are free.' },
            { id: 'opt2', text: 'Apologize and provide a timeline for resolution.' },
            { id: 'opt3', text: 'Explain that you were busy with other clients.' },
            { id: 'opt4', text: 'Refund their last payment immediately.' },
        ],
        correctOptionId: 'opt2'
    },
    {
        id: 'a6',
        text: 'What is a "Call to Action" (CTA)?',
        options: [
            { id: 'opt1', text: 'A phone number on a website.' },
            { id: 'opt2', text: 'A prompt that encourages the user to take a specific action.' },
            { id: 'opt3', text: 'A legal disclaimer.' },
            { id: 'opt4', text: 'A type of social media post.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'a7',
        text: 'Which metric is most important for measuring email engagement?',
        options: [
            { id: 'opt1', text: 'Total email list size.' },
            { id: 'opt2', text: 'Open rate and Click-through rate (CTR).' },
            { id: 'opt3', text: 'Number of images in the email.' },
            { id: 'opt4', text: 'Time of day sent.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'a8',
        text: 'You notice a typo in a live social media post. What should you do?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Leave it, no one will notice.' },
            { id: 'opt2', text: 'Edit the post if the platform allows, or delete and repost with a correction.' },
            { id: 'opt3', text: 'Write a comment pointing out the typo.' },
            { id: 'opt4', text: 'Blame the copywriter.' },
        ],
        correctOptionId: 'opt2'
    },
    {
        id: 'a9',
        text: 'What does SEO stand for?',
        options: [
            { id: 'opt1', text: 'Social Engagement Optimization' },
            { id: 'opt2', text: 'System Error Output' },
            { id: 'opt3', text: 'Search Engine Optimization' },
            { id: 'opt4', text: 'Site Efficiency Operation' },
        ],
        correctOptionId: 'opt3',
        type: 'knowledge'
    },
    {
        id: 'a10',
        text: 'Which tool is commonly used for scheduling social media posts?',
        options: [
            { id: 'opt1', text: 'Photoshop' },
            { id: 'opt2', text: 'Buffer or Hootsuite' },
            { id: 'opt3', text: 'Google Analytics' },
            { id: 'opt4', text: 'Slack' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'a11',
        text: 'A potential client asks for a discount on your first project. How do you respond?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Agree immediately to secure the client.' },
            { id: 'opt2', text: 'Refuse rudely.' },
            { id: 'opt3', text: 'Politely explain your value and offer a smaller scope for their budget.' },
            { id: 'opt4', text: 'Ignore the request.' },
        ],
        correctOptionId: 'opt3'
    },
    {
        id: 'a12',
        text: 'What is the ideal length for a standard blog post for SEO?',
        options: [
            { id: 'opt1', text: '100-200 words' },
            { id: 'opt2', text: '300-500 words' },
            { id: 'opt3', text: '1500-2500 words' },
            { id: 'opt4', text: '10,000+ words' },
        ],
        correctOptionId: 'opt3',
        type: 'knowledge'
    },
    {
        id: 'a13',
        text: 'How do you verify if a website is mobile-friendly?',
        options: [
            { id: 'opt1', text: 'Check it on your own phone.' },
            { id: 'opt2', text: 'Use Google\'s Mobile-Friendly Test tool.' },
            { id: 'opt3', text: 'Ask a friend.' },
            { id: 'opt4', text: 'Resize the browser window on desktop.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'a14',
        text: 'What is "Alt Text" used for?',
        options: [
            { id: 'opt1', text: 'To make text bold.' },
            { id: 'opt2', text: 'To describe images for screen readers and SEO.' },
            { id: 'opt3', text: 'To add alternative links.' },
            { id: 'opt4', text: 'To change font style.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'a15',
        text: 'A client sends you a file with a .psd extension. What software opens this?',
        options: [
            { id: 'opt1', text: 'Microsoft Word' },
            { id: 'opt2', text: 'Adobe Photoshop' },
            { id: 'opt3', text: 'Excel' },
            { id: 'opt4', text: 'VLC Media Player' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    }
  ],
  'account-manager': [
    // Existing questions
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
    },
    // New Questions (Account Manager)
    {
        id: 'am2',
        text: 'What is the primary goal of the "Onboarding" phase for a new client?',
        options: [
            { id: 'opt1', text: 'To sell them more services.' },
            { id: 'opt2', text: 'To establish clear goals, expectations, and communication channels.' },
            { id: 'opt3', text: 'To send them an invoice.' },
            { id: 'opt4', text: 'To introduce them to the entire company staff.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'am3',
        text: 'An agent on your team misses a critical deadline. How do you handle it with the client?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Blame the agent explicitly to save face.' },
            { id: 'opt2', text: 'Hide the delay and hope they don\'t notice.' },
            { id: 'opt3', text: 'Inform the client proactively, take responsibility, and provide a revised timeline.' },
            { id: 'opt4', text: 'Ignore the client\'s emails.' },
        ],
        correctOptionId: 'opt3'
    },
    {
        id: 'am4',
        text: 'Which key performance indicator (KPI) is most relevant for a lead generation campaign?',
        options: [
            { id: 'opt1', text: 'Number of likes on a post.' },
            { id: 'opt2', text: 'Cost Per Lead (CPL).' },
            { id: 'opt3', text: 'Bounce rate.' },
            { id: 'opt4', text: 'Server uptime.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'am5',
        text: 'How do you prioritize multiple conflicting requests from different clients?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'First come, first served always.' },
            { id: 'opt2', text: 'Prioritize the client who pays the most.' },
            { id: 'opt3', text: 'Assess urgency and impact, communicate realistic timelines to all parties.' },
            { id: 'opt4', text: 'Work overtime until everything is done.' },
        ],
        correctOptionId: 'opt3'
    },
    {
        id: 'am6',
        text: 'What is a "Scope Creep"?',
        options: [
            { id: 'opt1', text: 'A slow-moving project.' },
            { id: 'opt2', text: 'Uncontrolled changes or continuous growth in a project\'s scope.' },
            { id: 'opt3', text: 'A type of project management software.' },
            { id: 'opt4', text: 'A difficult client.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'am7',
        text: 'Which document formally defines the project scope and deliverables?',
        options: [
            { id: 'opt1', text: 'The invoice.' },
            { id: 'opt2', text: 'The Statement of Work (SOW).' },
            { id: 'opt3', text: 'The email thread.' },
            { id: 'opt4', text: 'The marketing brochure.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'am8',
        text: 'Your team is consistently overworking. What is the best long-term solution?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Tell them to work faster.' },
            { id: 'opt2', text: 'Review resource allocation and consider hiring or adjusting workload.' },
            { id: 'opt3', text: 'Ignore it, it\'s just a busy season.' },
            { id: 'opt4', text: 'Cut client projects randomly.' },
        ],
        correctOptionId: 'opt2'
    },
    {
        id: 'am9',
        text: 'What is "churn rate"?',
        options: [
            { id: 'opt1', text: 'The speed of website loading.' },
            { id: 'opt2', text: 'The percentage of customers who stop using a service during a given period.' },
            { id: 'opt3', text: 'The rate of new employee hiring.' },
            { id: 'opt4', text: 'The tax rate on services.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'am10',
        text: 'A client is unhappy with the creative direction. How do you resolve this?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Tell them they are wrong.' },
            { id: 'opt2', text: 'Schedule a call to listen to their feedback and align on a new mood board.' },
            { id: 'opt3', text: 'Refund their money immediately.' },
            { id: 'opt4', text: 'Keep sending the same designs.' },
        ],
        correctOptionId: 'opt2'
    },
    {
        id: 'am11',
        text: 'What is the purpose of a CRM system?',
        options: [
            { id: 'opt1', text: 'To design graphics.' },
            { id: 'opt2', text: 'To manage company relationships and interactions with customers.' },
            { id: 'opt3', text: 'To edit videos.' },
            { id: 'opt4', text: 'To host websites.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'am12',
        text: 'How often should you provide status reports to a retainer client?',
        options: [
            { id: 'opt1', text: 'Never, unless they ask.' },
            { id: 'opt2', text: 'Daily.' },
            { id: 'opt3', text: 'According to the schedule agreed upon in the SOW (e.g., Weekly or Monthly).' },
            { id: 'opt4', text: 'Once a year.' },
        ],
        correctOptionId: 'opt3',
        type: 'knowledge'
    },
    {
        id: 'am13',
        text: 'A project is delayed due to the client not providing assets. What do you do?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Wait silently.' },
            { id: 'opt2', text: 'Document the delay, inform the client of the impact on the timeline, and adjust the schedule.' },
            { id: 'opt3', text: 'Cancel the project.' },
            { id: 'opt4', text: 'Deliver the project empty.' },
        ],
        correctOptionId: 'opt2'
    },
    {
        id: 'am14',
        text: 'What is the "Pareto Principle" (80/20 rule) in account management?',
        options: [
            { id: 'opt1', text: '80% of revenue comes from 20% of clients.' },
            { id: 'opt2', text: 'Work 80 hours a week.' },
            { id: 'opt3', text: '20% of emails are spam.' },
            { id: 'opt4', text: 'Discount 80% to get 20% more clients.' },
        ],
        correctOptionId: 'opt1',
        type: 'knowledge'
    },
    {
        id: 'am15',
        text: 'Which methodology focuses on "Sprints"?',
        options: [
            { id: 'opt1', text: 'Waterfall' },
            { id: 'opt2', text: 'Agile/Scrum' },
            { id: 'opt3', text: 'Six Sigma' },
            { id: 'opt4', text: 'Prince2' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    }
  ],
  consultant: [
    // Existing questions
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
    },
    // New Questions (Consultant)
    {
        id: 'c2',
        text: 'A company has high revenue but low profitability. What is the most likely cause?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Their logo is ugly.' },
            { id: 'opt2', text: 'High operating costs or low profit margins on products.' },
            { id: 'opt3', text: 'They are posting too much on social media.' },
            { id: 'opt4', text: 'They need a new CEO.' },
        ],
        correctOptionId: 'opt2'
    },
    {
        id: 'c3',
        text: 'What is a SWOT analysis used for?',
        options: [
            { id: 'opt1', text: 'To calculate tax.' },
            { id: 'opt2', text: 'To identify Strengths, Weaknesses, Opportunities, and Threats.' },
            { id: 'opt3', text: 'To schedule meetings.' },
            { id: 'opt4', text: 'To design websites.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'c4',
        text: 'A client wants to expand into a new international market. What is the first step?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Translate the website immediately.' },
            { id: 'opt2', text: 'Conduct thorough market research and feasibility analysis.' },
            { id: 'opt3', text: 'Hire local staff.' },
            { id: 'opt4', text: 'Run ads in the new country.' },
        ],
        correctOptionId: 'opt2'
    },
    {
        id: 'c5',
        text: 'What does "LTV > CAC" indicate?',
        options: [
            { id: 'opt1', text: 'The business is losing money on every customer.' },
            { id: 'opt2', text: 'The Lifetime Value of a customer is greater than the Cost to Acquire them (Healthy).' },
            { id: 'opt3', text: 'The Cost to Acquire is too high.' },
            { id: 'opt4', text: 'Lateral Team Velocity.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'c6',
        text: 'Which framework is best for analyzing an industry\'s competitive intensity?',
        options: [
            { id: 'opt1', text: 'Porter\'s Five Forces' },
            { id: 'opt2', text: 'Maslow\'s Hierarchy' },
            { id: 'opt3', text: 'The 4 Ps of Marketing' },
            { id: 'opt4', text: 'Gantt Chart' },
        ],
        correctOptionId: 'opt1',
        type: 'knowledge'
    },
    {
        id: 'c7',
        text: 'A legacy business is failing to adopt digital transformation. How do you approach the CEO?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Tell them they are obsolete.' },
            { id: 'opt2', text: 'Present data showing market trends/risks and a phased roadmap for adoption with clear ROI.' },
            { id: 'opt3', text: 'Secretly implement software.' },
            { id: 'opt4', text: 'Resign.' },
        ],
        correctOptionId: 'opt2'
    },
    {
        id: 'c8',
        text: 'What is "Blue Ocean Strategy"?',
        options: [
            { id: 'opt1', text: 'Investing in water companies.' },
            { id: 'opt2', text: 'Creating a new market space with no competitors.' },
            { id: 'opt3', text: 'Competing fiercely in existing markets.' },
            { id: 'opt4', text: 'A sailing technique.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'c9',
        text: 'Identify the financial statement that shows a company\'s profitability over a period of time.',
        options: [
            { id: 'opt1', text: 'Balance Sheet' },
            { id: 'opt2', text: 'Cash Flow Statement' },
            { id: 'opt3', text: 'Income Statement (P&L)' },
            { id: 'opt4', text: 'Shareholder Equity Report' },
        ],
        correctOptionId: 'opt3',
        type: 'knowledge'
    },
    {
        id: 'c10',
        text: 'A startup needs funding. Which document is most critical for investors?',
        options: [
            { id: 'opt1', text: 'A catchy logo.' },
            { id: 'opt2', text: 'A Pitch Deck with financial projections and market analysis.' },
            { id: 'opt3', text: 'A list of office furniture.' },
            { id: 'opt4', text: 'The employee handbook.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'c11',
        text: 'What is "Change Management"?',
        options: [
            { id: 'opt1', text: 'Managing small coins.' },
            { id: 'opt2', text: 'Structured approach to ensuring changes are thoroughly and smoothly implemented.' },
            { id: 'opt3', text: 'Changing managers frequently.' },
            { id: 'opt4', text: 'Updating software versions.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'c12',
        text: 'Which pricing strategy involves setting a low initial price to enter a competitive market?',
        options: [
            { id: 'opt1', text: 'Skimming' },
            { id: 'opt2', text: 'Penetration Pricing' },
            { id: 'opt3', text: 'Premium Pricing' },
            { id: 'opt4', text: 'Bundle Pricing' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'c13',
        text: 'A client is facing a PR crisis. What is your advice?',
        type: 'scenario',
        options: [
            { id: 'opt1', text: 'Deny everything.' },
            { id: 'opt2', text: 'Delete all social media accounts.' },
            { id: 'opt3', text: 'Acknowledge the issue, apologize sincerely, and outline steps to rectify it.' },
            { id: 'opt4', text: 'Blame the media.' },
        ],
        correctOptionId: 'opt3'
    },
    {
        id: 'c14',
        text: 'What is the "MVP" concept in product development?',
        options: [
            { id: 'opt1', text: 'Most Valuable Player' },
            { id: 'opt2', text: 'Minimum Viable Product' },
            { id: 'opt3', text: 'Maximum Velocity Process' },
            { id: 'opt4', text: 'Multiple Version Protocol' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    },
    {
        id: 'c15',
        text: 'How do you measure employee churn?',
        options: [
            { id: 'opt1', text: 'By the number of coffee breaks.' },
            { id: 'opt2', text: 'Percentage of employees leaving within a specific period.' },
            { id: 'opt3', text: 'Total number of employees.' },
            { id: 'opt4', text: 'Average salary.' },
        ],
        correctOptionId: 'opt2',
        type: 'knowledge'
    }
  ]
};

// Helper to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const mockApi = {
  getSkills: async (): Promise<Skill[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockSkills;
  },

  getQuestions: async (role: UserRole): Promise<QuizQuestion[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const allQuestions = mockQuestionsPool[role] || [];
    // Shuffle and pick top 10 (or less if pool is smaller)
    const shuffled = shuffleArray(allQuestions);
    return shuffled.slice(0, 10);
  },

  submitQuiz: async (role: UserRole, answers: Record<string, string>): Promise<{ score: number; performance: any }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Since we return a subset, we need to find the questions again or assume the client sends IDs.
    // Ideally, the server tracks the session. logic here simplifies by checking against the full pool.
    // In a real app, you'd check against the specific subset sent to the user.
    const questions = mockQuestionsPool[role] || [];
    let correct = 0;
    let answeredCount = 0;
    
    // Calculate based on answers provided
    Object.keys(answers).forEach(questionId => {
      const question = questions.find(q => q.id === questionId);
      if (question && answers[questionId] === question.correctOptionId) {
        correct++;
      }
      if(question) answeredCount++;
    });

    // Score is based on the questions answered (assuming 10 were served)
    // If the frontend sends all answers, this works.
    const score = answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0;
    
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
     // Simulate creating a user. In a real app this would go to DB.
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || data.email.split('@')[0],
      email: data.email,
      role: data.role,
      avatar: data.avatar
    };
    // mockUsers.push(user); // Uncomment to persist in memory if needed
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
