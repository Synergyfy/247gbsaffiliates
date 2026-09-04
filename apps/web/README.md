MCOMMALL (Listeo)

MCOMMALL (powered by the Listeo engine) is a high-performance service marketplace and professional ecosystem. It bridges the gap between businesses and a tiered workforce of specialized providers, ranging from micro-task execution to high-level strategic consultancy.
Project Status

Current Phase: Implementation of Tiered Role Hierarchy (Agents, Account Managers, Consultants)
The Vision

MCOMMALL is built on a "Ladder of Growth" model, ensuring quality control and professional development:

    Agents: Entry-level specialists focused on micro-tasks (Social media setup, basic SEO audits, AI content generation).

    Account Managers: Mid-level leads who coordinate onboarding, manage teams of agents, and run full campaigns.

    Consultants: Senior experts providing strategic audits, business coaching, and high-value advisory sessions.

Role Hierarchy & Qualification

The platform utilizes a multi-step verification process to maintain marketplace integrity:

    Role Selection: Users identify their tier at signup.

    Questionnaire: Capture of skills, experience, and turnaround times.

    Quismatic Quiz: A scored competency test that determines visibility for paid assignments.

    Verification: Manual review for senior Consultant profiles to ensure trust and quality.

Technology Stack

    Framework: Next.js 15 (App Router)

    State Management: Zustand (via useAuthStore)

    Styling: Tailwind CSS v4

    Language: TypeScript (Strict Mode)

    Icons: Google Material Icons Round

Getting Started

    Clone and Navigate:
    Bash

    git clone [repository-url]
    cd mcommall-listeo

    Install Dependencies:
    Bash

    npm install

    Configure Environment: Create a .env.local file with your authentication and database credentials.

    Run Development Server:
    Bash

    npm run dev

Key Directory Structure

    /components: Reusable UI blocks (Role selectors, Skill chips, Quiz components).

    /store: Centralized state management for authentication and user roles.

    /app/dashboard: Nested layouts for agent, account-manager, consultant, and client.