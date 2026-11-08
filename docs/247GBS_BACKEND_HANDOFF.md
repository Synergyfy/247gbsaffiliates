# 247GBS Affiliates — Backend Engineering Handoff & Audit Report

Prepared **6 November 2026** for the Backend Engineering team.  
This document consolidates the end-to-end technical audit of `apps/api` and the exact backend endpoints, security fixes, and contract updates required by the `apps/web` frontend across the **Account Manager**, **Agent**, **Consultant**, **Admin**, and **Find Affiliates (`/find-agent`)** workflows.

---

## Status Update (6 November 2026 - Latest Session Fixes)

The following recent integration and resilience issues have been investigated, resolved, and verified:

1. **Tasks 403 Forbidden on Unverified/New Affiliates (`GET /tasks`):**
   - **Resolved**: `TasksService.findAll` previously threw `403 Forbidden` (`assertQualifiedAffiliate`) for affiliates who had not completed onboarding or verification. It has been updated to catch qualification assertions and return an empty task collection `{ items: [], meta: { total: 0 } }`. Affiliates now see a clean empty state rather than an error banner.
2. **CHS MCOM Wallet Handshake (`GET /affiliate/wallets/:userId`):**
   - **Resolved**: CHS (`McomSolutions/apps/backend/.env`) was missing `INTERNAL_API_KEY="dev-internal-api-key"`, causing `AffiliateApiKeyGuard` to reject requests with 401 Unauthorized. The internal secret was added, allowing 247GBS backend calls to authenticate successfully.
3. **CHS Businesses 503 Service Unavailable (`GET /business-acquisition/acquired`):**
   - **Resolved**: In `BusinessAcquisitionService.getCentralBusinesses`, CHS requests that return 404/not found for affiliates with no attributed businesses are now caught and return `{ total: 0, businesses: [] }` instead of throwing an unhandled `503 ServiceUnavailableException`.
4. **Dashboard Empty States Standardization:**
   - **Resolved**: Standardized centered empty states with icons and descriptive helper text across **Assigned Tasks** (`AgentTasksPage`), **Consultancy Sessions** (`SessionsPage`), **Business Acquisition** (`BusinessAcquisitionWorkspace`), and **Consultant Overview** (`consultant/page.tsx`).
5. **Brand Name Standardization:**
   - **Resolved**: Replaced all remaining standalone "247gbs" mentions with the official brand name **"247GBS Affiliate"**.

---

## Current Repository State

- **Repository**: `/home/davestack/Documents/247gbsaffiliates`
- **Active Branch**: `feat/agent-dashboard-mobile` (fast-forwarded to match `origin/dev` at commit `cafdb6c` — *Merge PR #23 `feat/central-mcom-wallet-and-earnings`*).
- **Database Migrations**: SQL migrations exist under `apps/api/migrations/` (up through `202611050002_add_wallet_transaction_task_reference.sql`), while TypeORM runs with `synchronize: false`. Verify migration state in staging/production before deployment.

---

## Priority 1 — Critical Security & Authorization Fixes (`apps/api`)

### 1.1 Unauthenticated Wallet Deposit Endpoint (`POST /wallet/deposit`)
- **File**: `apps/api/src/wallet/wallet.controller.ts` (lines 42–48)
- **Issue**: `POST /wallet/deposit` is exposed to any authenticated user (`@UseGuards(JwtAuthGuard)`) with no `@Roles(UserRole.ADMIN)` guard or environment restriction, allowing any logged-in user to mint arbitrary balance into their local wallet.
- **Required Fix**: Restrict `POST /wallet/deposit` to `@Roles(UserRole.ADMIN)` (or disable when `NODE_ENV === 'production'`).

### 1.2 Unauthenticated Task Evidence File Downloads (`GET /tasks/attachments/:fileName`)
- **File**: `apps/api/src/tasks/tasks.controller.ts` (lines 176–191)
- **Issue**: Decorated with `@Public()`, allowing anyone on the internet who guesses or obtains a filename to download task evidence attachments without authentication or task ownership checks.
- **Required Fix**: Remove `@Public()` or validate a signed token / authenticated user's access to the associated task.

### 1.3 Account Manager Revenue Dashboard Globally Scoped (`GET /account-manager/dashboard/revenue`)
- **File**: `apps/api/src/account-manager/account-manager.service.ts` (lines 173–220)
- **Issue**: `getRevenueDashboard(accountManagerId)` accepts `accountManagerId` but never filters by it — it queries all `UserRole.AGENT` records globally (`this.usersRepo.find({ where: { role: UserRole.AGENT } })`) and sums `task.budget` across all currencies without grouping by currency.
- **Required Fix**:
  1. Scope the query to agents/tasks coordinated by `accountManagerId` (or their assigned Central Hub businesses).
  2. Group or separate revenue totals by currency (`GBP`, `USD`, etc.) rather than summing mixed currencies.

### 1.4 Hardcoded Secrets Fallback
- **Files**:
  - `apps/api/src/auth/strategies/jwt.strategy.ts` (`'super-secret-jwt-key-change-in-production'`)
  - `apps/api/src/auth/guards/api-key.guard.ts` (`'mcom-internal-secret-key-247gbs'`)
- **Required Fix**: Fail fast on startup when `JWT_SECRET` or `INTERNAL_API_KEY` is missing in non-test environments.

---

## Priority 2 — Account Manager Project & Task Delegation Gaps

The frontend Account Manager workspace (`apps/web/components/dashboard/AccountManagerReviewQueue.tsx` and `apps/web/hooks/useTasks.ts`) now implements:
- Service request clarification, quoting, and conversion to projects (`POST /account-manager/managed-requests/:id/convert`)
- Managed projects listing & filtering (`GET /account-manager/managed-projects`)
- Project closure with outcome summary & follow-up notes (`POST /account-manager/managed-projects/:id/close`)
- Managed task detail inspection with audit trail (`GET /account-manager/managed-tasks/:id`)
- Task delegation to verified affiliates (`POST /account-manager/managed-tasks/:id/assign`)

### Backend items needed to complete the Account Manager loop:

### 2.1 Missing Endpoint to Create Tasks Inside a Managed Project
- **Files**: `apps/api/src/account-manager/account-manager.controller.ts` & `account-manager.service.ts`
- **Issue**: After an Account Manager converts a service request into a project (`POST /account-manager/managed-requests/:id/convert`), the UI instructs them: *"Project created. Add tasks and assign an agent or consultant."* However, `AccountManagerController` has **no endpoint** to create a task under a managed project (`POST /account-manager/managed-projects/:id/tasks`).
- **Required Fix**: Add `POST /account-manager/managed-projects/:id/tasks` on `AccountManagerController` proxying to Central Hub (`POST /affiliate/account-managers/:mcomUserId/projects/:projectId/tasks`) and syncing the created task back to 247GBS.

### 2.2 Include `mcomUserId` in `GET /users/directory` for Task Delegation
- **File**: `apps/api/src/users/users.service.ts` (`findPublicDirectory`, lines 214–243)
- **Issue**: `POST /account-manager/managed-tasks/:id/assign` expects `{ assigneeUserId }`. Central Hub expects the affiliate's Central Hub user ID (`mcomUserId`), whereas `GET /users/directory` only returns the local 247GBS `user.id`. Currently, the frontend has to cross-reference `GET /messaging/directory` (`localUserId` -> `id`) to resolve `centralUserId`.
- **Required Fix**: Include `mcomUserId: user.mcomUserId ?? null` in the `findPublicDirectory` response items (or resolve local `user.id` -> `user.mcomUserId` automatically inside `AccountManagerService.assignManagedTask` before forwarding to Central Hub).

### 2.3 Account Manager Agents Screen (`GET /account-manager/agents`)
- **Files**:
  - `apps/web/app/dashboard/account-manager/agents/page.tsx`
  - `apps/api/src/users/users.controller.ts` (`GET /users/agents`)
- **Issue**: The Account Manager Agents screen previously called `useAdminUsers` (`GET /admin/users`), which returns `403 Forbidden` for `ACCOUNT_MANAGER`. Meanwhile, `GET /users/agents` returns all agents globally with minimal fields.
- **Required Fix**: Expose `GET /account-manager/agents` (or enrich `GET /users/agents`) returning manager-scoped agents with full verification, onboarding, assessment pass status, skills, and active/completed task counts.

### 2.4 Distinguish Central Hub Outages / Unlinked Accounts from Empty Lists
- **File**: `apps/api/src/account-manager/account-manager.service.ts` (lines 68–93)
- **Issue**: When `manager.mcomUserId` is null or Central Hub is unreachable, `centralGet` returns HTTP `200` with `{ success: false, data: [], total: 0, message: '...' }`.
- **Required Fix**: Return appropriate HTTP status codes (`409 Conflict` when `mcomUserId` is not linked; `503 Service Unavailable` when Central Hub is unreachable) or ensure the frontend error boundary receives a non-2xx response so outages do not masquerade as "0 projects / 0 tasks".

---

## Priority 3 — Public Directory & `/find-agent` (Find Affiliates) Enhancements

The `/find-agent` page (`apps/web/app/find-agent/page.tsx`) was updated with:
- Multi-select role dropdown filter (`All Affiliates`, `Agents`, `Managers`, `Consultants`) + `Clear` filter control.
- Compact partner cards with avatar, role badge, location + distance (`mi`), bio, and **Contact Me** button.
- Mobile-responsive **Affiliate Profile Modal** displaying **Score (`%`)**, **On-Time (`%`)**, **Tasks Done**, **Guide Rate (`£/hr`)**, **About**, **Credentials** (`Skill Assessment` progress bar, `ID Verified`, `Reply time`), **Skills**, **Languages**, **Timezone**, and a sticky **Delegate Task** CTA.

### Backend items needed for `/find-agent`:

### 3.1 Expose Real Affiliate Performance Metrics in `GET /users/directory`
- **File**: `apps/api/src/users/users.service.ts` (`findPublicDirectory`, lines 143–258)
- **Issue**: `findPublicDirectory` currently returns profile fields (`firstName`, `lastName`, `bio`, `skills`, `languages`, `hourlyRate`, `timezone`, `city`, `region`, `distanceMiles`, `isQuizPassed`, `verificationStatus`), but does **not** return:
  - `assessmentScore` (latest passed `QuizAttempt.score` percentage)
  - `completedTasksCount` (count of `Task` records with `assignedAgentId = user.id` and `status = 'completed'`)
  - `onTimeRate` / `averageResponseTime`
- **Required Fix**: Aggregate and return real `assessmentScore` (from `quiz_attempts`) and `completedTasksCount` (from `tasks`) in `findPublicDirectory` so the Affiliate Profile Modal on `/find-agent` displays live database metrics instead of derived estimates.

### 3.2 Support Multi-Role Filtering on `GET /users/directory`
- **File**: `apps/api/src/users/users.service.ts` (lines 181–189)
- **Issue**: `GET /users/directory?role=...` only accepts a single role string (`agent`, `account_manager`, or `consultant`).
- **Required Fix**: Support comma-separated roles (e.g. `?role=agent,consultant` or `?roles=agent,consultant`) in `findPublicDirectory` alongside the existing client-side multi-role filter.

### 3.3 Reliable Live UK Postcode Lookup (`GET /users/postal-code-lookup`)
- **File**: `apps/api/src/users/users.service.ts` (lines 300–450)
- **Issue**: `lookupPostalCode` has a hardcoded fallback for `SW1A 1AA` when Nominatim is unreachable, and `apps/api/src/users/users.service.spec.ts` currently fails 1 test because it expects `SW1A 1AA` to call Nominatim and return `region: 'England'` instead of the hardcoded `'Greater London'`.
- **Required Fix**:
  1. Ensure reliable server-side postcode geocoding (`postcodes.io` + Nominatim fallback) in all deployed environments.
  2. Align `users.service.spec.ts` with `users.service.ts` so unit tests pass cleanly.

---

## Priority 4 — Consultant, Qualification & Wallet Contracts

### 4.1 Appointments & Consultant Sessions Architecture
- **Files**: `apps/web/app/dashboard/consultant/sessions/page.tsx`, `apps/api/src/appointments/`
- **Issue**: The Consultant Sessions page previously filtered `/tasks` for `type === 'consultancy'`. Rather than overloading tasks or creating three separate appointment systems, a dedicated `Appointment` module (`apps/api/src/appointments/`) is approved for Stage 1.
- **Design Decisions**:
  - Unified appointments table serving all three affiliate roles (**Agent**, **Account Manager**, **Consultant**).
  - Concurrency-safe slot booking to prevent double-booking.
  - Linked to `centralBusinessId` and prepares audit columns (`convertedTaskId`, `convertedAt`, `convertedByUserId`) for conversion into delegated tasks in Task 2.
- **Status**: Stage 1 backend implementation pending approval/execution.

### 4.2 Persisted Qualification State for Account Managers & Consultants
- **Files**: `apps/api/src/users/entities/user.entity.ts`, `apps/api/src/users/users.service.ts`
- **Issue**: Onboarding/qualification checks (`checkAndSetOnboarding`) are tailored around Agent quiz + skills. Account Manager and Consultant dashboards need an explicit, persisted qualification/readiness status (`isQualified` or role-specific readiness checklist) on the authenticated profile response (`GET /auth/profile`).

### 4.3 Wallet Withdrawal Route (`POST /wallet/withdraw`)
- **Files**: `apps/web/hooks/useWallet.ts`, `apps/api/src/wallet/wallet.controller.ts`
- **Issue**: `useWallet.ts` calls `POST /wallet/withdraw`, which does not exist on `WalletController` (`GET /wallet/mcom`, `GET /wallet`, `POST /wallet/deposit`, `GET /wallet/transactions`).
- **Required Fix**: Either implement `POST /wallet/withdraw` (or proxy to Central Hub MCOM Wallet withdrawal if payouts are centrally managed) or confirm that withdrawals must be initiated in Central Hub.

---

## Summary Checklist for Backend Developer

| # | Priority | Area | Action Required |
|---|---|---|---|
| 1 | **Critical** | Wallet Security | Guard `POST /wallet/deposit` with `@Roles(UserRole.ADMIN)` or disable in production |
| 2 | **Critical** | File Security | Remove `@Public()` from `GET /tasks/attachments/:fileName` and enforce auth/ownership |
| 3 | **High** | Account Manager | Scope `GET /account-manager/dashboard/revenue` to the manager's agents/businesses and group by currency |
| 4 | **High** | Account Manager | Add `POST /account-manager/managed-projects/:id/tasks` to create tasks inside a managed project |
| 5 | **High** | Task Delegation | Return `mcomUserId` in `GET /users/directory` (or map local `user.id` -> `mcomUserId` in `assignManagedTask`) |
| 6 | **High** | Account Manager | Add manager-scoped `GET /account-manager/agents` endpoint with verification/qualification/task stats |
| 7 | **High** | Error Handling | Return `409` / `503` (instead of `200` empty array) when Central Hub is unlinked or unreachable |
| 8 | **Medium** | Find Affiliates | Return real `assessmentScore` and `completedTasksCount` in `GET /users/directory` |
| 9 | **Medium** | Postcode Lookup | Fix `users.service.spec.ts` test mismatch for `SW1A 1AA` and verify live postcode lookup |
| 10 | **High** | Appointments | Build unified Appointment module for all roles (Agent/Manager/Consultant) with task conversion support |
| 11 | **Medium** | Wallet | Implement `POST /wallet/withdraw` or align with Central Hub MCOM Wallet payout flow |
| 12 | **Medium** | Database | Verify and apply pending SQL migrations in `apps/api/migrations/` up to `202611050002` |
