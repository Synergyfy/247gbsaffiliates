# Business Acquisition & Attribution

This feature connects the 247GBS Affiliates portal to Central Hub Solution (CHS)
so a business introduced by an affiliate can register and log in on CHS while
remaining permanently attributed to that affiliate.

## Relationship model

Three independent relationships are recorded for a business:

| Relationship | Stored in | Purpose |
| --- | --- | --- |
| Acquisition | `BusinessProfile.acquiredByAffiliateId` / external id + `business_prospects` | Who introduced the business |
| Onboarding assistance | `onboardedByAffiliateId` + relationship history | Who helped complete onboarding |
| Management | `BusinessProfile.accountManagerId` | The assigned Account Manager |
| Specialist work | `business_relationship_history` + delegated tasks | Agents/Consultants delivering work |

Assigning an Account Manager or a Consultant never overwrites the acquisition
record. History is append-only.

## Flow

1. An Agent, Account Manager or Consultant records a prospect in
   **My Businesses** (`/dashboard/<role>/businesses`).
2. The portal calls CHS `POST /api/v1/affiliate/business-invitations`.
   CHS stores a tracked `AffiliateBusinessInvitation` and returns an invitation
   URL pointing at `/getstarted/business?entry=signup&affiliateInvite=TOKEN`.
3. The business opens the link. The token is persisted in the browser and
   submitted with the onboarding payload.
4. CHS registration:
   - sets `BusinessProfile.acquiredBy*` and `acquisitionStatus = REGISTERED`;
   - sets `User.referredById` so the existing referral reporting counts the
     business under the introducing affiliate;
   - records `BusinessRelationshipHistory(ACQUISITION)`;
   - notifies the affiliate portal at `POST /internal/business-acquisition/events`.
5. Profile completion promotes the acquisition to `ONBOARDING_COMPLETED`.
6. An administrator verifies the acquisition (`VERIFIED`) in the affiliate
   admin page or in CHS. Verification is written to both databases.

If a business registers directly without the link, the affiliate uses
**Confirm registration**. CHS creates a pending `AffiliateBusinessClaim`; an
administrator must approve it before attribution changes. This prevents an
affiliate claiming a business they did not introduce.

## Status definitions

| Stage | Counts as successful onboarding |
| --- | --- |
| Prospect / approached / interested | No |
| Invitation sent / registration started | No |
| CHS registration completed | Not yet |
| Onboarding completed | Provisionally |
| Verified | Yes |

The dashboard reports approached, interested, invitations sent, registered,
onboarding completed, pending verification and verified separately.

## Configuration

The 20-business target is **not hard-coded**. Admins configure it from
`/dashboard/admin/business-acquisition`:

- target count
- completion date
- roles the target applies to
- whether verification is required

## Migration

Apply the new SQL migration before deploying the API:

```bash
# 247GBS Affiliates (Postgres/TypeORM)
psql "$DATABASE_URL" -f apps/api/migrations/202611050002_add_business_acquisition.sql
```

```bash
# Central Hub Solution (Prisma)
cd apps/backend
npx prisma migrate deploy
# or, for local development only:
npx prisma db push
```

## Environment

No new environment variables are required. The existing values are reused:

- Affiliate API: `MCOM_CENTRAL_URL`, `INTERNAL_API_KEY`
- Central API: `AFFILIATE_SERVICE_BASE_URL`, `AFFILIATE_INTERNAL_API_KEY`, `FRONTEND_URL`

`FRONTEND_URL` must point at the CHS frontend because it builds the invitation
link the business opens.
