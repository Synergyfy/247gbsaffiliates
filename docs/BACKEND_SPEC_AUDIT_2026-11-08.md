# Backend Specification Audit — 8 November 2026

**Audited document:** `docs/AZEEM_BACKEND_IMPLEMENTATION_HANDOFF.md`
**Repositories checked:**
- `247gbsaffiliates` (`apps/api`, `apps/web`)
- `central-hub-solution` (`apps/backend`, `apps/frontend`)
**Method:** static code audit of controllers, services, DTOs, Prisma schema, migrations, frontend hooks/components/routes. No runtime/DB checks were possible because neither repo has a committed `.env` and no local database was inspected.

**Implementation update (8 Nov 2026):** the following were implemented after the audit:
- `QUOTED` service-request status.
- Integer pence for the affiliate workflow: `estimatedCostPence`, `compensationPence`, `businessChargePence`; pounds are UI-only.
- Account Managers excluded from the 247 picker, with an explanatory note in the UI.
- Consultants (and all affiliate roles) must be verified before taking work.
- Admin wallet activity includes business metadata and search-by-business-name.

**Pence scope in this change:** all affiliate transaction money is now integer pence — service-request quotes, affiliate compensation, business charges, settlement source amounts, and the 247GBS task mirror. Catalogue/pricing modules (membership plan prices, access-plan prices, payment options), the legacy local campaign `budget`, MCOM credit balances, and revenue records are separate money surfaces and were left in their existing units. The affiliate workflow no longer reads or writes pounds.

---



## 0. Important context: the handoff document is stale

The document describes the `realign/dev-2026-11-08` snapshot where both backends supposedly matched `origin/dev`.

Current checkouts are on `feat/referral-rewards-commission-engine`:

| Repo | Current state |
|---|---|
| `247gbsaffiliates` | `apps/api` has **0 diff files** vs `origin/dev`. Correct. |
| `central-hub-solution` | `apps/backend` is **18 commits / 61 files ahead** of `origin/dev` (referrals, geo, plans, decline reason, per-tier delegation/whitelabel, etc.). |

So many items listed as “to implement” are already present in the current tree. The document should be treated as a **requirements checklist**, not as an accurate description of the current backend.

Also, several route, payload and status names in the document do not match the real contracts. Those must be corrected before handing it to a backend engineer.

---

## 1. Verdict by workflow

Legend:
- **TRUE / DONE** — the described behaviour exists; no backend work.
- **PARTIAL** — the feature exists, but the document contains wrong names/payloads, or one sub-behaviour is missing.
- **GAP** — a real behaviour is missing and should be implemented.
- **FALSE ALARM** — the stated issue does not exist in the current code; remove it.

| WF | Current implementation | Verdict |
|---|---|---|
| WF-01 Admin plans & wallet logs | `GET/POST/PUT/DELETE /admin/plans`, `GET /admin/app-payments/charges`, `GET /admin/app-payments/wallet-activity` all exist. Admin editor persists per-tier `freeDelegatedTasks`, `unlimitedFreeDelegatedTasks` and `whitelabelAccess`. | **PARTIAL** — functionality is done, document routes/fields are wrong. |
| WF-02 Service request | `POST /business/affiliate/requests` exists; auto-assigns a manager for active paid memberships; notifies manager, or admins if no manager. Default status `SUBMITTED`. | **TRUE / DONE** |
| WF-03 AM assignment | `GET /business/affiliate/account-manager`, `POST .../reassign` exist. Proximity + reputation + load ranking with a safe “national” fallback when postcode/geo is missing. | **PARTIAL** — fallback exists, but `GET` does not self-assign. |
| WF-04 Clarify / quote / convert | All three manager endpoints exist. Clarify uses `CLARIFICATION_REQUIRED`; quote now sets `QUOTED` and stores `estimatedCostPence`. | **DONE** — status names corrected. |
| WF-05 Convert to project | `POST /account-manager/managed-requests/:id/convert` exists and is atomic. Project defaults to `ACTIVE`. | **TRUE / DONE** — payload is flat, not nested under `project`. |
| WF-06 Project task creation | `POST /account-manager/managed-projects/:id/tasks` exists. | **GAP** — omitting `assigneeUserId` auto-assigns the business’s Account Manager instead of leaving the task unassigned/`OPEN`. |
| WF-07 Eligible affiliates & assign | `GET /account-manager/agents?scope=delegatable` exists; local id → `mcomUserId` translation exists; unlinked affiliate returns `409 AFFILIATE_CENTRAL_ACCOUNT_NOT_LINKED`. | **PARTIAL** — one residual input-type bug (see GAP-1); picker excludes Account Managers. |
| WF-08 Accept / decline | `POST /tasks/:id/accept`, `POST /tasks/:id/decline` exist. Reason is mandatory (≥5 chars), stored, and pushed to Central. | **TRUE / DONE** — declined status is `DECLINED`, not `OPEN`. |
| WF-09 Submit deliverables | `POST /tasks/:id/submit` exists; writes `submissionData`, sets `submittedAt`, status `SUBMITTED`. | **TRUE / DONE** — payload is `notes/links/attachments/submissionData`, not `materialsUrl/deliverables`. |
| WF-10 AM review / QA | `POST /account-manager/managed-tasks/:id/review` exists. `CHANGES_REQUESTED` → `REVISION_REQUESTED`; `APPROVED` → `PENDING_BUSINESS_APPROVAL` or `COMPLETED`; settlement is triggered on completion. | **TRUE / DONE** |
| WF-11 Business review | `POST /business/affiliate/tasks/:id/review` exists. Uses `decision` + `notes`, not `approved` + `feedback`. Approval completes and settles. | **TRUE / DONE** |
| WF-12 Project closure | Close endpoints exist in both portals. Project becomes `COMPLETED` (not `CLOSED`). | **GAP** — closure does not block open/in-flight tasks. |
| WF-13 Escrow & wallet | `GET /wallet/mcom` proxies Central. Settlement captures holds, credits the affiliate wallet with idempotency keys, and retries failures. | **TRUE / DONE** — response is a wallet snapshot; ledger is `WalletTransaction`, not `AppLedgerEntry`; quota is counted dynamically, not decremented. |
| WF-14 Admin monitoring | Wallet/charges endpoints exist. 247 admin task page uses `GET /tasks` as admin. Central admin uses `/admin/affiliate-tasks`. | **TRUE / DONE** — `GET /admin/tasks` does not exist. |

---

## 2. False alarms / claims to delete or correct

Remove or rewrite these before sending the document on:

### 2.1 WF-01 schema claim
> “missing columns in database schema (`acquired_by_affiliate_id`, `membership_tier`) caused Prisma P2022”

**False for the current tree, and inaccurate for `origin/dev`:**
- `BusinessProfile.acquiredByAffiliateId` and `membershipTier` exist in `origin/dev`’s schema.
- The genuinely missing items on `origin/dev` are `AffiliateTask.declineReason` and the per-tier delegation/whitelabel migration. Both exist on the current branch.

### 2.2 WF-01 endpoint and payload names
Replace:
- `GET/PUT /admin/membership-plans` → actual `GET/POST/PUT/DELETE /admin/plans`.
- `freeDelegatedTasksLimit` → actual `freeDelegatedTasks` (+ `unlimitedFreeDelegatedTasks`, and per-tier values).
- `hasWhiteLabel` → actual `whitelabelAccess: [{ clientId, tiers }]`.
- `priceMonthly` → actual `monthlyPrice` / `price` / tier prices.
- UI route `/admin/membership-plans` → actual `/admin/memberships` list and `/admin/memberships/new`, `/admin/memberships/:id/edit`.
- UI route `/admin/app-payments` → actual `/admin/mcom-pay` (the API prefix remains `/admin/app-payments`).

### 2.3 WF-02 “requests can fail or remain orphaned”
**False.** `createServiceRequest` auto-assigns a manager for paid active memberships and falls back to admin notification. It does not fail when no manager exists.

### 2.4 WF-03 “unknown/missing postcode returns 500”
**False.** `scoreAffinity` handles null city/borough/postcode and returns a `national` match; assignment still picks the best active manager.
What is true: `GET /business/affiliate/account-manager` only reads; it does not assign. Assignment happens on `POST .../reassign`, on request/task creation, and via the nightly backfill.

### 2.5 WF-04 status names
- `CLARIFICATION_REQUESTED` → actual `CLARIFICATION_REQUIRED`.
- `QUOTED` → **implemented**; quote stores `estimatedCostPence` and sets `QUOTED`.
- `503` on `managed-requests` is expected behaviour when Central is unreachable or the API key is invalid, not a normal empty-list bug.

### 2.6 WF-05 payload
The document shows `{ "project": { ... } }`. The real DTO is flat:
```json
{ "title": "...", "description": "...", "objective": "...", "dueAt": "...", "requiresBusinessApproval": true }
```

### 2.7 WF-06 status name and “unassigned” assumption
- Central status is `PENDING_ASSIGNMENT`, not `OPEN`. 247 maps `PENDING_ASSIGNMENT → open`.
- The document’s expected unassigned behaviour is **not** implemented (see GAP-2). The endpoint itself exists.

### 2.8 WF-07 “PostgreSQL type error if email is supplied”
**Partly false:** normal UI calls send local UUIDs and work. The translation helper is implemented.
**Still true as hardening:** a non-UUID string (e.g. email) is passed straight into `where: { id: identifier }` on a UUID column and can still raise Postgres `22P02` → 500. See GAP-1.
Also: the 404 “Assignee not found” issue is fixed for valid IDs.

### 2.9 WF-08 decline status
The document says a declined task returns to `OPEN`. Actual status is `DECLINED` with `declineReason`; the manager can reassign it, and `assignTask` explicitly clears the old decline state. This is correct and better for audit history.

### 2.10 WF-09 payload
The document’s `materialsUrl` and `deliverables` fields are not what the agent page sends. Actual payload:
```json
{ "notes": "...", "links": ["..."], "attachments": [{ "url": "...", "fileName": "...", "mimeType": "...", "kind": "IMAGE" }], "submissionData": { } }
```

### 2.11 WF-11 payload
Replace `{ "approved": true, "feedback": "..." }` with:
```json
{ "decision": "APPROVED", "notes": "...", "acceptanceNotes": "..." }
```
Also: business-level review is only required when the task/project has `requiresBusinessApproval = true`, or when the business has no Account Manager. Otherwise AM approval completes the task directly.

### 2.12 WF-12 status and wording
- Project status is `COMPLETED`, not `CLOSED`.
- `closedAt`, `outcomeSummary`, `followUpNotes` are persisted.
- The “validate no open tasks” requirement is currently **not** enforced (see GAP-3).
- There is no separate cross-system synchronisation job: both portals read the same Central records.

### 2.13 WF-13 response/accounting details
- `GET /wallet/mcom` returns `{ wallet, holds, transactions, referralEarnings }`, not `{ balance, pendingBalance, transactions }`.
- Affiliate payouts are `WalletTransaction` rows with category `TRANSFER_IN`; the document’s `REWARD` example and `AppLedgerEntry` model are incorrect (`AppPaymentLedgerEntry` is the MCOM Pay ledger, not the affiliate payout ledger).
- Quota is not decremented; it is counted dynamically from assigned, non-cancelled tasks in the entitlement period.

### 2.14 WF-14 endpoint names
- No `GET /admin/tasks` in either backend.
  - 247 admin page calls `GET /tasks` (admin role sees all local tasks).
  - Central admin uses `GET /admin/affiliate-tasks`.
- `GET /admin/app-payments/charges` and `GET /admin/app-payments/wallet-activity` do exist.
- Wallet activity now returns both user and business metadata (implemented in this change).

### 2.15 Section 1.4 `UNFUNDED`
There is no `UNFUNDED` task status. Funding is modelled as:
- `status = PENDING_ASSIGNMENT` (not yet delegated), and/or
- `paymentStatus = ON_HOLD` (funds not locked yet).
The frontend already renders “Awaiting funds” from `paymentStatus`.

### 2.16 Frontend route names
| Document | Actual |
|---|---|
| `/dashboard/delegated-tasks` | `/dashboard/tasks` (central `DashboardDelegatedTasks`) |
| `/admin/membership-plans` | `/admin/memberships` + editor routes |
| `/admin/app-payments` | `/admin/mcom-pay` |
| `/wallet` (247) | `/dashboard/agent/earnings`, `/dashboard/consultant/earnings`, `/dashboard/account-manager/revenue` |

---

## 3. Genuine gaps and implementation plan

### GAP-1 (High) — Assignee identifier is not type-safe
**Status: FIXED.** `resolveCentralAssigneeId` now validates UUIDs before querying `users.id`, resolves emails/Central ids, and returns `400 INVALID_ASSIGNEE_ID` for unknown non-UUID values. Tests added.

**Where:** `247gbsaffiliates/apps/api/src/account-manager/account-manager.service.ts`, `resolveCentralAssigneeId` (~L188–205).

**Issue:** The method calls `usersRepo.findOne({ where: { id: identifier } })` before checking the input shape. If `identifier` is an email or arbitrary string and the `users.id` column is UUID, Postgres raises `22P02 invalid input syntax for type uuid`, which surfaces as a 500.

**Plan:**
1. Trim and reject empty input with `400`.
2. If `isUUID(identifier)` (use `class-validator`’s `isUUID`), look up the local user by id.
3. If found and `mcomUserId` is null → keep the existing `409 AFFILIATE_CENTRAL_ACCOUNT_NOT_LINKED`.
4. If not found by id, look up by `mcomUserId` and (optionally) by lower-cased email.
5. If a local user is found, return its `mcomUserId`.
6. If no local user is found and the value is not a UUID, return `400 INVALID_ASSIGNEE_ID` instead of forwarding an arbitrary string.
7. Keep forwarding a valid unknown UUID to Central so Central remains the final validator.

**Tests:** local UUID → mcom UUID; mcom UUID → passthrough; email → mapped/mcom; unknown email → 400; unlinked local user → 409; unknown UUID → forwarded and Central 404.

**Acceptance:** no path can produce a Postgres UUID syntax error.

---

### GAP-2 (High) — Reassignment strands existing requests and projects
**Status: FIXED.** The assignment transaction now moves all open requests and active projects to the new manager. Test added.

**Where:** `central-hub-solution/apps/backend/src/affiliate/account-manager-assignment.service.ts`, `assignForBusiness` transaction (~L117–138).

**Issue:** Reassignment updates `BusinessProfile.accountManagerId` and manager counters, but does not update `AffiliateServiceRequest.accountManagerId` or `AffiliateProject.accountManagerId`.
- `listRequestsForManager` filters by `accountManagerId === managerId`.
- `listProjectsForManager` filters by `accountManagerId === managerId`.
- Therefore, after reassignment the old manager still “owns” the rows in queries, and the new manager sees an empty request/project queue. `createProjectTaskForManager` also checks both project and business ownership, so the old project can become unmanageable by either manager.

**Plan:** Inside the same transaction, after choosing the new manager:
```ts
await tx.affiliateServiceRequest.updateMany({
  where: {
    businessId,
    status: { in: ['SUBMITTED', 'CLARIFICATION_REQUIRED', 'APPROVED'] },
  },
  data: { accountManagerId: chosen.userId },
});

await tx.affiliateProject.updateMany({
  where: {
    businessId,
    status: { in: ['ACTIVE', 'ON_HOLD', 'AWAITING_BUSINESS_APPROVAL'] },
  },
  data: { accountManagerId: chosen.userId },
});
```
Keep `COMPLETED/CANCELLED/REJECTED` rows with the historical manager. Optionally record an event on each moved request/project.

**Tests:** reassign a business with one open request and one active project; new manager’s `GET /requests` and `GET /projects` include them; closed items remain with the old manager; old manager no longer sees open items.

**Acceptance:** after `POST /business/affiliate/account-manager/reassign`, the new AM can manage all open requests/projects without admin intervention.

---

### GAP-3 (Medium) — Project task without an assignee is auto-assigned to the AM
**Status: FIXED.** `createTaskForBusiness` now accepts a `defaultToManager` option; AM project-task creation passes `false`, so an omitted assignee stays `PENDING_ASSIGNMENT` / local `OPEN`. Test updated.

**Where:** `central-hub-solution/apps/backend/src/affiliate/affiliate-task.service.ts`, `createTaskForBusiness` (~L231–233), called by `createProjectTaskForManager` (~L1555).

**Issue:**
```ts
let assigneeId = dto.assigneeUserId ?? null;
if (!assigneeId && business.accountManagerId) assigneeId = business.accountManagerId;
```
This is correct for business-originated delegations, but wrong for AM project tasks where the UI explicitly offers “create without assignee” and counts unassigned tasks. The created task is therefore assigned to the AM, and 247 never shows it as `OPEN`/unassigned.

**Plan:**
1. Add an internal option to `createTaskForBusiness`, e.g. `{ defaultToManager?: boolean }` (default `true`).
2. In `createProjectTaskForManager`, call it with `defaultToManager: false`.
3. If no `assigneeUserId`, leave `effectiveAssignee = null` → status `PENDING_ASSIGNMENT` → 247 maps it to `OPEN`.
4. Keep the existing manager fallback for business/admin creation paths.
5. Ensure `processDelegationJob` already handles a null assignee (it does: notifies admins/business and waits).

**Tests:** AM creates a project task with no assignee → Central `PENDING_ASSIGNMENT`, `assigneeId = null`; 247 mirror/central list shows `OPEN`/unassigned; later `POST /account-manager/managed-tasks/:id/assign` assigns it and pushes to 247.

**Acceptance:** the UI’s unassigned-task count and “assign later” flow work.

---

### GAP-4 (Medium) — Project can be closed with incomplete tasks
**Status: FIXED.** `closeProject` now throws `409 PROJECT_TASKS_OPEN` with the open task list. Admin force-close is explicit via `force: true`, and the admin dashboard now has a Projects tab with a force-close control. Tests added.

**Where:** `central-hub-solution/apps/backend/src/affiliate/affiliate-task.service.ts`, `closeProject` (~L768–822).

**Issue:** The method computes `openTasks` but does not use it to block closure; it only returns the count. The 247 UI error copy says “Ensure all tasks are resolved first”, but the backend happily closes the project. Status is set to `COMPLETED`, not `CLOSED`.

**Plan:**
1. Define incomplete statuses as every status except `COMPLETED` and `CANCELLED` (include `PENDING_ASSIGNMENT`, `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `SUBMITTED`, `PENDING_BUSINESS_APPROVAL`, `REVISION_REQUESTED`, `DECLINED`).
2. If any exist and the caller is not an admin/force close, throw `409 Conflict`:
```json
{
  "statusCode": 409,
  "code": "PROJECT_TASKS_OPEN",
  "message": "Resolve or cancel all project tasks before closing.",
  "openTasks": [{ "id": "...", "title": "...", "status": "ASSIGNED" }]
}
```
3. Add an explicit `force` flag for admins if operational closure is required.
4. Keep the project status `COMPLETED` (frontend treats `COMPLETED`, `CLOSED`, `CANCELLED` as closed).
5. Apply the same rule to `POST /business/affiliate/projects/:id/close` and the AM/admin variants.

**Tests:** close with an `ASSIGNED` task → 409; cancel/complete all tasks → 200 `COMPLETED`; admin force → 200 with audit event.

**Acceptance:** the existing UI error message becomes truthful; no project closes with live work.

---

### GAP-5 (Low/Medium) — `GET /account-manager` does not self-heal a missing assignment
**Status: FIXED.** The endpoint lazily assigns for paid active businesses and degrades to `null` if no manager can be found. Tests added.

**Where:** `central-hub-solution/apps/backend/src/affiliate/affiliate-business.controller.ts`, `getAccountManager` (~L49–64); `account-manager-assignment.service.ts`.

**Issue:** The document says loading the page assigns a manager. The endpoint only reads. Assignment happens on:
- membership activation,
- `POST .../reassign`,
- service-request/task creation,
- nightly backfill.

For a paid active business whose assignment was missed (e.g. pre-existing membership), `GET` returns `null` until a manual action.

**Plan (recommended):**
1. In `getAccountManager`, if the business has a paid active membership and `manager == null`, call `assignment.assignForBusiness(business.id, { notify: false })` inside `try/catch`.
2. Return the new manager, or `null` without a 500 if no active manager exists.
3. Keep the existing `meta.assignable` flag.
4. Alternatively, auto-call `POST .../reassign` from the dashboard when `meta.assignable` is true; less robust because it depends on the client.

**Acceptance:** paid active business with no manager gets one on page load; a no-candidate environment still returns a clean response.

---

### GAP-6 (Deployment, High) — 247GBS SSO columns were not guaranteed by a migration
**Status: FIXED.** Affiliate membership columns were removed entirely (agents, account managers and consultants do not have platform memberships; only businesses do, and they use Central Hub, not 247GBS).

**Removed from `User` entity and code:**
- `mcom_membership_level`
- `mcom_membership_tier`
- `mcom_membership_status`

**Removed from SSO sync / webhook / frontend types:**
- `JitProvisionInput.membership`
- handshake `payload.membership`
- `mcomMembership*` writes in the Central webhook
- `McomSsoStatus.membership` and `User.mcomMembership*`
- `MCOM_MEMBERSHIP_URL` / `membershipUrl` config

**Kept:**
- `mcom_user_id` — required for SSO, messaging, wallet and delegation.
- `mcom_access_token`, `mcom_refresh_token`, token expiry fields — required for Central token refresh.
- `mcom_can_access_vcard` — this is the Central `canAccess_247gbs_affiliate` permission flag, not a membership.

**Migration added:** `apps/api/migrations/202611080001_affiliate_sso_schema_cleanup.sql`
```sql
BEGIN;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mcom_user_id" varchar;
ALTER TABLE "users"
  DROP COLUMN IF EXISTS "mcom_membership_level",
  DROP COLUMN IF EXISTS "mcom_membership_tier",
  DROP COLUMN IF EXISTS "mcom_membership_status";
CREATE INDEX IF NOT EXISTS "IDX_users_mcom_user_id" ON "users" ("mcom_user_id");
COMMIT;
```
`ADD/DROP ... IF EXISTS` makes it safe on databases that already have or lack these columns. If `mcom_access_token`/`mcom_refresh_token`/expiry columns are also missing on a fresh `DB_SYNC=false` database, add them separately; they are still referenced by token refresh.

**Acceptance:** a fresh `DB_SYNC=false` database can complete SSO login, and no affiliate membership columns remain.

---

### GAP-7 (Deployment, High) — Central migrations missing from `origin/dev`
The current branch contains:
- `20261106000000_affiliate_task_decline_reason`
- `20261107120000_membership_tier_delegation_whitelabel`

`origin/dev` does **not** contain them. If any environment is deployed from `origin/dev` or the old `realign` branch:
1. Apply `pnpm prisma migrate deploy` from the branch that contains both migrations.
2. Verify with `prisma migrate status`.
3. Otherwise decline-reason writes and per-tier delegation/whitelabel admin saves will fail with P2022 / missing-column errors.

Do not deploy a branch that lacks these migrations while running code that references the new columns.

---

### Decision items — resolved

1. **`QUOTED` request state — implemented.**
   `AffiliateServiceRequestStatus.QUOTED` was added. `quoteServiceRequest` now sets `QUOTED`; business approval moves it to `APPROVED`. Both portals show the quoted amount in pounds.
2. **Account Manager eligibility in the delegation picker — decided: no.**
   The 247 picker remains Agent/Consultant-only, and the create-task UI now explains that Account Managers coordinate rather than execute.
3. **Consultant verification — decided: all affiliates must be verified.**
   `getDelegatableAgents` now requires `verificationStatus === VERIFIED` + `isOnboarded` for Consultants. `assertQualifiedAffiliate` now requires verification + onboarding for every role; quiz + skills remain Agent-only.
4. **Wallet activity business metadata — implemented.**
   `GET /admin/app-payments/wallet-activity` now includes `business: { id, businessName, email }` and search matches business names. The admin UI displays it.
5. **Admin `/admin/tasks`** — remains unchanged. 247 uses local `GET /tasks`; Central uses `GET /admin/affiliate-tasks`.

---

## 4. Deployment and smoke-test checklist

### Environment
- [ ] Central `INTERNAL_API_KEY` matches 247’s key.
- [ ] 247 `MCOM_CENTRAL_URL` points at Central `/api/v1`.
- [ ] Central `AFFILIATE_SERVICE_BASE_URL` / `AFFILIATE_INTERNAL_API_KEY` point at 247 `/api/v1`.
- [ ] Central SSO client for 247 has the correct `serviceBaseUrl` and API key.
- [ ] 247 `DB_SYNC=false` in production; run the GAP-6 migration.
- [ ] Central `prisma migrate deploy` includes decline-reason and per-tier/whitelabel migrations.

### Smoke flow
1. Business submits a service request (WF-02) → status `SUBMITTED`, manager assigned or admin notified.
2. AM lists request, clarifies, quotes, converts (WF-04/05).
3. AM creates a project task with and without an assignee (WF-06) → unassigned must be `PENDING_ASSIGNMENT`/`OPEN`.
4. AM lists delegatable agents and assigns (WF-07).
5. Agent accepts/declines with reason (WF-08); declined reason visible to AM.
6. Agent submits deliverables (WF-09).
7. AM requests changes → agent resubmits (WF-10).
8. AM approves with `requiresBusinessApproval=false` → task `COMPLETED`.
9. Repeat with `requiresBusinessApproval=true` → business approves → `COMPLETED`.
10. Confirm wallet payout in Central and `GET /wallet/mcom` in 247 (WF-13).
11. Try closing the project with an open task (should be blocked after GAP-4) and after all tasks complete.
12. Reassign the business’s manager; verify the new AM sees open requests/projects and the old AM does not (GAP-2).
13. Admin views `/admin/app-payments/wallet-activity` and `/admin/mcom-pay`.

---

## 5. Recommended order

1. **GAP-6 + GAP-7** (schema/migrations) — nothing else is safe until the DB matches the entities.
2. **GAP-1** (input type safety) — prevents 500s on delegation.
3. **GAP-2** (reassignment ownership) — data/visibility correctness.
4. **GAP-3** (unassigned project tasks) — unblocks the existing AM UI.
5. **GAP-4** (closure guard) — prevents closing live projects.
6. **GAP-5** (lazy assignment) — resilience/polish.
7. Decision items.

---

## 6. Short version for Azeem

Most of the document is already implemented on the current branches. The real work is only:

1. UUID-safe assignee resolution.
2. Transfer open requests/projects when an Account Manager is reassigned.
3. Respect “create project task without assignee” instead of auto-assigning the manager.
4. Block project closure while tasks are still open.
5. Make `GET /account-manager` lazily assign for paid active businesses (optional).
6. Apply the missing 247 MCOM SSO migration and the two Central migrations in environments that do not have them.

Everything else in the document is either already done or uses the wrong endpoint/payload/status names.
