# 247GBS Affiliates Platform

A monorepo containing the full-stack affiliate platform built with **Next.js 16** (frontend) and **NestJS 11** (backend), managed with **pnpm** and **Turborepo**.

## 🏗️ Architecture

```
247gbsaffiliates/
├── apps/
│   ├── web/          # Next.js 16 Frontend (App Router)
│   └── api/          # NestJS 11 Backend
├── turbo.json        # Turborepo pipeline configuration
├── pnpm-workspace.yaml
├── package.json      # Root workspace scripts
└── tsconfig.json     # Base TypeScript config
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.15.0
- **PostgreSQL** >= 15

### Installation

```bash
# Install dependencies for all workspaces
pnpm install

# Build all packages
pnpm build

# Run development servers (both frontend & backend)
pnpm dev
```

### Environment Setup

Create `.env` files in each app:

**apps/api/.env**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=247gbsaffiliates
DB_SYNC=true
DB_SSL=false

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=1d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRATION=7d

# External Services
MCOM_CENTRAL_URL=http://localhost:3010/api/v1
INTERNAL_API_KEY=your-internal-api-key

# App
PORT=3000
NODE_ENV=development
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Run all apps in development mode |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run tests for all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm db:generate` | Generate database migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma/TypeORM studio |

### Individual App Commands

```bash
# Frontend only
pnpm --filter @247gbsaffiliates/web dev
pnpm --filter @247gbsaffiliates/web build
pnpm --filter @247gbsaffiliates/web lint

# Backend only
pnpm --filter @247gbsaffiliates/api start:dev
pnpm --filter @247gbsaffiliates/api build
pnpm --filter @247gbsaffiliates/api test
```

## 🎯 Features

### Frontend (apps/web)
- **Next.js 16** with App Router and Turbopack
- **React 19** with Server Components
- **TanStack Query** for server state management
- **Zustand** for client state (auth, onboarding)
- **Tailwind CSS v4** for styling
- **React Hook Form + Zod** for form validation
- **TypeScript strict mode**

### Backend (apps/api)
- **NestJS 11** with modular architecture
- **TypeORM** with PostgreSQL
- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (Agent, Account Manager, Consultant, Admin)
- **Swagger/OpenAPI** documentation at `/api/v1/docs`
- **WebSocket-ready** messaging module
- **Assessment/Quiz** system with targeted questions

### User Roles & Hierarchy
```
Agent → Account Manager → Consultant → Admin
```
- **Agents**: Micro-task execution
- **Account Managers**: Team coordination, campaign management
- **Consultants**: Strategic advisory, coaching sessions
- **Admins**: Platform management, verification approvals

## 🔌 API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/register/admin` | Admin registration |
| GET | `/auth/profile` | Get current user profile |

### Users
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/users/agents` | Account Manager, Admin | List all agents |
| PATCH | `/users/skills` | All | Update user skills |
| PATCH | `/users/me` | All | Update profile |

### Account Manager
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/account-manager/dashboard/revenue` | Revenue dashboard |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard/stats` | Platform statistics |
| GET | `/admin/users` | List users with filters |
| PATCH | `/admin/users/:id/status` | Update user status |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks (paginated, filtered) |
| POST | `/tasks` | Create task (Admin, Account Manager, Consultant) |
| POST | `/tasks/:id/accept` | Accept assigned task |
| POST | `/tasks/:id/decline` | Decline assigned task |
| PATCH | `/tasks/:id/status` | Update task status |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallet` | Get wallet balance |
| GET | `/wallet/transactions` | Transaction history |
| POST | `/wallet/withdraw` | Request withdrawal |

### Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messaging/conversations` | List conversations |
| GET | `/messaging/conversations/:id/messages` | Get messages |
| POST | `/messaging/conversations` | Start conversation |
| POST | `/messaging/conversations/:id/messages` | Send message |

### Learning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/learning` | Get learning resources (filterable) |

### Assessment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assessment/quiz` | Get quiz questions |
| POST | `/assessment/submit` | Submit answers |

### Verification
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/verification` | Submit verification request |
| GET | `/verification/admin/requests` | List requests (Admin) |
| PATCH | `/verification/admin/requests/:id` | Approve/Reject (Admin) |

### Categories & Sectors (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories (public) |
| POST | `/categories` | Create category |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| GET | `/sectors` | List sectors (public) |
| POST | `/sectors` | Create sector |
| PATCH | `/sectors/:id` | Update sector |
| DELETE | `/sectors/:id` | Delete sector |

## 🗄️ Database Schema

Key entities:
- **User** - Authentication, roles, profile data
- **Task** - Work items with status workflow
- **Wallet/Transaction** - Financial tracking
- **Conversation/Message** - Real-time messaging
- **VerificationRequest** - Paid visibility & consultant verification
- **Question/QuizAttempt** - Assessment system
- **Category/Sector** - Hierarchical taxonomies
- **Skill** - Predefined skill tags

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Backend unit tests
pnpm --filter @247gbsaffiliates/api test

# Backend e2e tests
pnpm --filter @247gbsaffiliates/api test:e2e

# Frontend tests (when implemented)
pnpm --filter @247gbsaffiliates/web test
```

## 🔧 Code Quality

```bash
# Lint all
pnpm lint

# Format all
pnpm format

# Type check
pnpm --filter @247gbsaffiliates/api tsc --noEmit
pnpm --filter @247gbsaffiliates/web tsc --noEmit
```

## 📁 Project Structure Details

### apps/web (Frontend)
```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── (admin)/           # Admin layout group
│   ├── (auth)/            # Auth layout group
│   ├── dashboard/         # Role-based dashboards
│   └── learning/          # Learning pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI primitives
│   ├── dashboard/        # Dashboard-specific
│   ├── landing/          # Landing page sections
│   ├── onboarding/       # Onboarding flow
│   └── auth/             # Auth forms
├── hooks/                # Custom React hooks (TanStack Query)
├── lib/                  # Utilities, API client, schemas
├── store/                # Zustand stores
├── types/                # TypeScript types
└── public/               # Static assets
```

### apps/api (Backend)
```
apps/api/
├── src/
│   ├── auth/             # Authentication module
│   ├── users/            # User management
│   ├── tasks/            # Task management
│   ├── wallet/           # Wallet & transactions
│   ├── messaging/        # Conversations & messages
│   ├── assessment/       # Quiz & assessment
│   ├── verification/     # Verification requests
│   ├── categories/       # Category taxonomy
│   ├── sectors/          # Sector taxonomy
│   ├── skills/           # Skills registry
│   ├── account-manager/  # Account manager dashboard
│   ├── admin/            # Admin dashboard
│   ├── learning/         # Learning resources
│   ├── app.module.ts     # Root module
│   └── main.ts           # Entry point
├── test/                 # E2E tests
└── dist/                 # Compiled output
```

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
# Example Dockerfile for backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod
COPY . .
RUN pnpm --filter @247gbsaffiliates/api build
EXPOSE 3000
CMD ["pnpm", "--filter", "@247gbsaffiliates/api", "start:prod"]
```

### Environment Variables for Production

- Set `NODE_ENV=production`
- Disable `DB_SYNC=false` (use migrations)
- Use strong `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- Configure `DB_SSL=true` for managed databases
- Set `NEXT_PUBLIC_API_URL` to production API URL

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make changes with conventional commits
3. Run `pnpm lint && pnpm build` before committing
4. Submit PR to `main`

### Commit Convention
```
feat: new feature
fix: bug fix
docs: documentation changes
chore: maintenance tasks
refactor: code restructuring
test: adding tests
```

## 📄 License

UNLICENSED - Private proprietary codebase.

## 🔗 Related Repositories

- **Frontend (legacy)**: Original Next.js app
- **Backend (legacy)**: Original NestJS app
- **Central System**: mcom_central (external task source)

---

*Generated with Turborepo + pnpm workspaces*