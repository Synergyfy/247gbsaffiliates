import { z } from 'zod';

export const profileSchema = z.object({
    role: z.string(),
    hourlyRate: z.string().min(1, "Hourly/Rate is required"),
    bio: z.string().min(20, "Bio must be at least 20 characters").max(120, "Bio must be under 120 characters"),
    phone: z.string().trim().min(1, "Phone number is required"),
    postalCode: z.string().trim().min(1, "Postal code is required"),
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().min(1, "Enter a supported postal code to detect your country"),
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
    acceptFixedPrice: z.boolean().optional(),
    
    // Manager
    teamLeadershipExp: z.string().optional(),
    campaignBudgetCapacity: z.string().optional(),
    availabilityType: z.string().optional(),
    
    paidVisibility: z.boolean().optional(),
});

export type QuestionnaireFormValues = z.infer<typeof questionnaireSchema>;
