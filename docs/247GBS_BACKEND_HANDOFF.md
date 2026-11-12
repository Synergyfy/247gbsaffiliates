# 247GBS Affiliates — Consolidated Backend Engineering Handoff & Specification

**Target Developer:** Azeem & Backend Engineering Team  
**Repositories:** `247gbsaffiliates` (`apps/api`) & `McomSolutions` (`apps/backend`)  
**Date:** 12 November 2026  
**Status:** Active Implementation Handoff  
**PR Reference:** [PR #37](https://github.com/Synergyfy/247gbsaffiliates/pull/37) on branch `fix/postcode-directory-search-and-managed-projects-dropdown`

---

## Executive Summary

This handoff consolidates the exact backend requirements, contracts, and bug fixes required by the `apps/web` frontend across all user roles (**Agent**, **Consultant**, **Account Manager**, **Admin**, and **Business**).

All frontend workflows, role-specific navigations, and verification states have been aligned and verified via Next.js production builds. The frontend does **not** require architectural workarounds; this document outlines the definitive backend tasks needed to complete the ecosystem loop cleanly.

---

## Table of Contents
1. [Core Architectural Principles & Clarifications](#1-core-architectural-principles--clarifications)
2. [Priority 1: Urgent Backend Fixes (Immediate Unblockers)](#2-priority-1-urgent-backend-fixes-immediate-unblockers)
   - 2.1 Open / Unassigned Task Detail 404 Bug (`GET /tasks/:id`)
   - 2.2 Role-Based Onboarding Qualification (`skills` bypass for Non-Agents)
   - 2.3 Consultancy Appointments / Sessions Architecture (`apps/api/src/appointments/`)
3. [Priority 2: CHS Integration, Wallets & Communication](#3-priority-2-chs-integration-wallets--communication)
   - 3.1 MCOM Wallet & Payout Architecture (No Duplicate 247GBS Withdrawal Engine)
   - 3.2 Notification Architecture (Communication via Messaging & CHS)
   - 3.3 Managed Projects Status Query Validation on CHS
4. [Priority 3: Verification Lifecycle & Access Enforcement](#4-priority-3-verification-lifecycle--access-enforcement)
   - 4.1 Affiliate Verification Review State (`PENDING` vs `VERIFIED`)
   - 4.2 Task Access Enforcement vs Graceful Empty Returns
5. [Priority 4: Currency, Pricing & Geolocation Standards](#5-priority-4-currency-pricing--geolocation-standards)
   - 5.1 Currency Fixed to EUR (€) & Hourly Rate Deprecation
   - 5.2 Postcode Geocoding vs Timezone
6. [Priority 5: Critical Security Fixes (From Technical Audit)](#6-priority-5-critical-security-fixes-from-technical-audit)
   - 6.1 Unauthenticated Wallet Deposit Endpoint
   - 6.2 Unauthenticated Task Evidence File Downloads
   - 6.3 Account Manager Revenue Dashboard Scoping
7. [Comprehensive Task Matrix for Backend](#7-comprehensive-task-matrix-for-backend)

---

## 1. Core Architectural Principles & Clarifications

Before implementing the items below, please note the agreed architectural boundaries:
- **Central Hub Solutions (CHS) is the Master for Payments & Payouts:** 247GBS displays affiliate earnings and bounty balances via server-to-server proxy from CHS. 247GBS must **not** implement a separate bank withdrawal or payout system. Affiliates manage their withdrawals directly in Central Hub.
- **No Redundant Notification Subsystem in 247GBS:** Real-time messaging (`/dashboard/{role}/messages`) and email/CHS handle communication. A standalone in-app notification engine inside 247GBS is out of scope and deprecated.
- **Fixed Pricing Only:** All task budgets, project estimates, and wallet balances operate in **EUR (€)**. Hourly rates (`hourlyRate`) are legacy artifacts and should not be used in task assignment logic.

---

## 2. Priority 1: Urgent Backend Fixes (Immediate Unblockers)

### 2.1 Open / Unassigned Task Detail 404 Bug
- **Endpoint:** `GET /tasks/:id` (`TasksController.findOneForUser`)
- **File:** `apps/api/src/tasks/tasks.service.ts` (`findOneForUser`)
- **Frontend Symptom:** When an affiliate (Agent or Consultant) views the list of assigned/open tasks on their dashboard (`/dashboard/consultant/tasks` or `/dashboard/agent/tasks`), open unassigned tasks are listed. However, clicking **"Open Task"** crashes with:
  > *"Couldn't load task details. Temporary connection issue."* (HTTP 404 Not Found)
- **Root Cause in Backend:**  
  `tasks.service.ts` currently searches with:
  ```typescript
  where: { id: taskId, assignedAgentId: userId }
  ```
  When an Account Manager or Admin creates an open/unassigned task (`assignedAgentId: null` or status `OPEN`), the task exists in the database, but `findOneForUser` cannot find it because it is not yet assigned to the requesting user's ID.
- **Required Backend Fix:**  
  Update `findOneForUser(taskId, userId)`:
  1. Allow lookup if `task.assignedAgentId === userId`.
  2. **OR** if the task is in `OPEN` / `UNASSIGNED` status and the requesting affiliate is verified and qualified (allowing them to preview task scope, requirements, and budget).
  3. Return the full task payload so the affiliate can see details and accept the assignment.

---

### 2.2 Role-Based Onboarding Qualification (`skills` bypass for Non-Agents)
- **Endpoints:** `PATCH /users/profile`, `GET /auth/profile`, `POST /auth/register`
- **Files:** `apps/api/src/users/users.service.ts` (`checkAndSetOnboarding`, `updateProfile`)
- **Frontend Alignment Done in PR #37:**  
  In `/onboarding`, the **Skill Selection** step is now strictly presented to **Agents** only. **Account Managers** and **Consultants** automatically skip skills and proceed directly from Basic/Profile Info to the **Onboarding Assessment Test**.
- **Required Backend Fix:**  
  Ensure backend onboarding completion logic does **not** require skills for non-agents:
  ```typescript
  // In UsersService.checkAndSetOnboarding:
  let isComplete = false;
  if (user.role === UserRole.AGENT) {
    // Agents require bio, selected skills, and passed quiz
    isComplete = Boolean(user.bio?.trim() && user.skills?.length > 0 && user.isQuizPassed);
  } else {
    // Consultants and Account Managers require bio and passed quiz (skills not required)
    isComplete = Boolean(user.bio?.trim() && user.isQuizPassed);
  }
  user.isOnboarded = isComplete;
  await this.usersRepo.save(user);
  ```
  Ensure `updateProfile` validation DTO does not throw validation errors if `skills` is empty or omitted when `role !== 'agent'`.

---

### 2.3 Consultancy Appointments / Sessions Architecture
- **Target Module:** `apps/api/src/appointments/` (New module)
- **Frontend Context:** `/dashboard/consultant/sessions`
- **Issue:** The frontend `Sessions` tab was temporarily querying regular tasks filtering for `type === 'consultancy'`. There is currently **zero backend support** for appointments (no table, no controller, no service).
- **Required Backend Implementation (Unified Appointments Module):**
  1. **Entity `Appointment`:**
     - `id`: UUID
     - `consultantId`: UUID (foreign key to `users.id`)
     - `clientBusinessId`: UUID (foreign key to `businesses.id` / CHS business)
     - `title`: string
     - `notes`: text
     - `scheduledAt`: timestamp with timezone
     - `durationMinutes`: integer (default 30 or 60)
     - `meetingUrl`: string (video call link)
     - `status`: enum (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`)
     - `convertedTaskId`: UUID (nullable, for converting session action items into delegated tasks)
  2. **Endpoints:**
     - `GET /appointments`: list appointments for current user (filtered by `consultantId` or `clientBusinessId`).
     - `GET /appointments/:id`: single appointment details.
     - `POST /appointments`: schedule an appointment (enforce slot collision checks).
     - `PATCH /appointments/:id`: update notes, meeting link, or status.
     - `POST /appointments/:id/convert-to-task`: converts advisory recommendations into a billable 247GBS task assigned to an Agent or Consultant.

---

## 3. Priority 2: CHS Integration, Wallets & Communication

### 3.1 MCOM Wallet & Payout Architecture
- **Status:** **Do NOT build a separate withdrawal / payout system in 247GBS.**
- **Frontend Alignment Done in PR #37:**  
  `<McomWalletPanel />` now displays real-time balances and pending holds, and provides a direct CTA deep-linking the affiliate to Central Hub:
  ```
  ${NEXT_PUBLIC_CENTRAL_HUB_URL}/dashboard/wallet
  ```
- **Backend Requirement:**
  1. 247GBS backend proxies wallet data via `McomService.getWallet(userId)`.
  2. Ensure webhook handling or background balance refreshes from Central Hub accurately reflect task earnings credited upon task completion.
  3. Ensure no unauthenticated balance deposit routes remain active in production (see Section 6.1).

---

### 3.2 Notification Architecture
- **Status:** **Do NOT build an independent notification subsystem in 247GBS.**
- **Rationale:** 247GBS relies on real-time direct messaging (`/dashboard/{role}/messages`) backed by WebSocket / CHS chat. Both frontend and backend should continue using the messaging inbox for all user-to-user and business communications.

---

### 3.3 Managed Projects Status Query Validation on CHS
- **Service:** `apps/api/src/account-manager/account-manager.service.ts` & CHS `AffiliateProjectService`
- **Issue:** When Account Managers query managed projects with status filters (e.g. `GET /account-manager/managed-projects?status=ACTIVE`), Central Hub's `AffiliateTaskQueryDto` rejected project statuses because it strictly validated against `AffiliateTaskStatus` enum.
- **Interim Fix in PR #37:** 247GBS backend now strips `status` before forwarding the query to CHS, filtering the returned array in memory.
- **Required CHS Fix:** In CHS `AffiliateProjectController`, validate query status against `AffiliateProjectStatus` (`ACTIVE`, `COMPLETED`, `ON_HOLD`, `ARCHIVED`) rather than task status.

---

### 3.4 Escrow & Quote Approval Financial Lifecycle
- **Services:** CHS `AffiliateTaskService.approveServiceRequestPrice`, `AffiliateSettlementService`
- **Issue Identified:** When a Business approves an Account Manager's service quote (`POST /business/affiliate/requests/:id/price-approve`), the backend currently only marks `status: APPROVED` without deducting funds or establishing an escrow hold. Later, when the Account Manager assigns tasks to agents, there are no locked funds in escrow, leaving tasks in `paymentStatus: ON_HOLD` ("Awaiting funds") and failing final payout settlement.
- **Required Backend Architecture:**
  1. **At Quote Approval (`approveServiceRequestPrice`):**
     - Verify business MCOM wallet balance.
     - Immediately **debit the quoted amount from the business wallet** and lock it into an `EscrowHold` (`status: HELD`).
  2. **At Task Delegation (`ensureForTask`):**
     - Draw assigned task bounties (e.g. €200) directly from this pre-funded project escrow pool.
  3. **At Business Deliverable Approval (`reviewTaskAsBusiness`):**
     - Automatically release the corresponding held escrow and disburse `TRANSFER_IN` credits directly to the executing affiliate's MCOM wallet available balance.

---

## 4. Priority 3: Verification Lifecycle & Access Enforcement

### 4.1 Affiliate Verification Review State (`PENDING` vs `VERIFIED`)
- **Endpoints:** `GET /admin/verifications`, `POST /admin/verifications/:id/approve`, `POST /admin/verifications/:id/reject`
- **Frontend Alignment Done in PR #37:**  
  When an affiliate completes onboarding and submits their ID verification, their status is `PENDING`. Dashboards display:
  > *"Your profile and quiz have been submitted. An administrator is currently reviewing your ID verification before client assignments unlock."*
- **Backend Requirement:**
  1. When an Admin approves a verification (`/admin/verifications/:id/approve`), ensure `user.verificationStatus` updates to `'VERIFIED'`.
  2. Public directory (`GET /users/directory`) must only return affiliates whose `verificationStatus === 'VERIFIED'`. Unverified affiliates must not appear in directory searches.

---

### 4.2 Task Access Enforcement vs Graceful Empty Returns
- **Endpoint:** `GET /tasks`
- **Behavior Requirement:** If an unverified or pending affiliate queries `GET /tasks`, the backend should return `{ items: [], meta: { total: 0 } }` rather than throwing a technical `403 Forbidden` exception, preventing unhandled error banners on client dashboards.

---

## 5. Priority 4: Currency, Pricing & Geolocation Standards

### 5.1 Currency Fixed to EUR (€) & Hourly Rate Deprecation
- **Rule:** Standardize on fixed project budgets in **EUR (€)**.
- **Backend Actions:**
  - In `tasks` and `campaigns` tables, default `currency` column to `'EUR'`.
  - Remove mandatory validation or calculation dependencies on `hourlyRate`.

---

### 5.2 Postcode Geocoding vs Timezone
- **Endpoint:** `GET /users/postal-code-lookup`
- **Rule:** UK Postcode lookup via `postcodes.io` provides coordinates (`latitude`, `longitude`), city, and administrative district.
- **Clarification:** Do **not** attempt to infer timezone from UK postcodes. The frontend standardizes UK affiliates to `GMT / BST (UK)` (`Europe/London`).

---

## 6. Priority 5: Critical Security Fixes (From Technical Audit)

### 6.1 Unauthenticated Wallet Deposit Endpoint
- **File:** `apps/api/src/wallet/wallet.controller.ts` (lines 42–48)
- **Issue:** `POST /wallet/deposit` is exposed to any authenticated user without role checks, allowing users to mint arbitrary balances.
- **Required Fix:** Restrict to `@Roles(UserRole.ADMIN)` or disable when `NODE_ENV === 'production'`.

---

### 6.2 Unauthenticated Task Evidence File Downloads
- **File:** `apps/api/src/tasks/tasks.controller.ts` (lines 176–191)
- **Issue:** `GET /tasks/attachments/:fileName` is decorated with `@Public()`, allowing unauthenticated downloads of task deliverables.
- **Required Fix:** Remove `@Public()` and verify the requesting user is either the assigned affiliate, the coordinating Account Manager, or an Admin.

---

### 6.3 Account Manager Revenue Dashboard Scoping
- **File:** `apps/api/src/account-manager/account-manager.service.ts` (`getRevenueDashboard`)
- **Issue:** `getRevenueDashboard(accountManagerId)` queries all agents globally rather than filtering by agents assigned to the requesting Account Manager's managed projects.
- **Required Fix:** Filter the revenue metrics by tasks and projects managed by `accountManagerId`.

---

## 7. Comprehensive Task Matrix for Backend

| # | Domain | Endpoint / Component | Issue / Requirement | Severity |
|---|---|---|---|---|
| **1** | **Tasks** | `GET /tasks/:id` | Allow qualified affiliates to view open/unassigned task details (currently returns 404). | **Blocker** |
| **2** | **Onboarding** | `UsersService.checkAndSetOnboarding` | Do not require `skills` for Consultants and Account Managers to reach `isOnboarded: true`. | **High** |
| **3** | **Appointments** | `apps/api/src/appointments/` | Implement dedicated appointments module with scheduling, slot collision check, and task conversion. | **High** |
| **4** | **Managed Projects** | CHS `AffiliateProjectController` | Fix status query DTO to accept project statuses (`ACTIVE`, `COMPLETED`, `ON_HOLD`). | **Medium** |
| **5** | **Security** | `POST /wallet/deposit` | Guard with `@Roles(ADMIN)` or disable in production. | **Critical** |
| **6** | **Security** | `GET /tasks/attachments/:fileName` | Remove `@Public()` and enforce task authorization checks. | **Critical** |
| **7** | **Directory** | `GET /users/directory` | Include `mcomUserId` in directory items to streamline task delegation. | **Medium** |
| **8** | **Currency** | `tasks`, `campaigns` | Standardize default currency to EUR (`€`); remove hourly rate dependencies. | **Medium** |
| **9** | **Revenue** | `GET /account-manager/dashboard/revenue` | Scope revenue calculations strictly to the Account Manager's assigned projects/agents. | **Medium** |
| **10** | **Wallet Sync** | `McomService` | Ensure webhook updates from Central Hub wallet reliably reflect bounty payouts. | **Medium** |
