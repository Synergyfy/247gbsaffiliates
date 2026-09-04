import { z } from 'zod';

export const profileSchema = z.object({
    role: z.string(),
    hourlyRate: z.string().min(1, "Hourly/Rate is required"),
    bio: z.string().min(20, "Bio must be at least 20 characters").max(120, "Bio must be under 120 characters"),
    country: z.string().min(1, "Country is required"),
    timezone: z.string().min(1, "Timezone is required"),
    languages: z.string().min(1, "Languages are required"),
    portfolioUrl: z.string().url("Must be a valid URL"),
    idDocument: z.any().optional(), // File handling is tricky in simple Zod, usually validate existence if needed
    
    // Role specific optional fields
    licenseNumber: z.string().optional(),
    yearsExperience: z.string().optional(),
    company: z.string().optional(),
    expertise: z.string().optional(),
    linkedinUrl: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const questionnaireSchema = z.object({
    selectedSkills: z.array(z.string()).min(1, "Select at least 1 skill").max(3, "Select max 3 skills"),
    yearsExperience: z.string().min(1, "Experience is required"),
    
    // Agent
    turnaroundTime: z.string().optional(),
    acceptFixedPrice: z.boolean().optional(),
    
    // Manager
    teamLeadershipExp: z.string().optional(),
    campaignBudgetCapacity: z.string().optional(),
    availabilityType: z.string().optional(),
    
    paidVisibility: z.boolean().optional(),
});

export type QuestionnaireFormValues = z.infer<typeof questionnaireSchema>;
