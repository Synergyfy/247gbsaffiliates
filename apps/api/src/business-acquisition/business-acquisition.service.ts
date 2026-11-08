import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import {
  AcquisitionVerificationStatus,
  BusinessProspect,
  BusinessRelationshipType,
  ProspectStatus,
} from './entities/business-prospect.entity';
import { BusinessRelationshipHistory } from './entities/business-relationship-history.entity';
import { BusinessAcquisitionSettings } from './entities/business-acquisition-settings.entity';
import { BusinessAcquisitionEventsService } from './business-acquisition-events.service';
import {
  ConfirmBusinessAssociationDto,
  CreateBusinessProspectDto,
  UpdateBusinessAcquisitionSettingsDto,
  UpdateBusinessProspectDto,
} from './dto/business-acquisition.dto';

const COUNTED_AS_APPROACHED: ProspectStatus[] = [
  ProspectStatus.APPROACHED,
  ProspectStatus.INTERESTED,
  ProspectStatus.INVITATION_SENT,
  ProspectStatus.REGISTRATION_STARTED,
  ProspectStatus.REGISTERED,
  ProspectStatus.ONBOARDING_COMPLETED,
  ProspectStatus.VERIFIED,
  ProspectStatus.ACTIVE,
];
const COUNTED_AS_INTERESTED: ProspectStatus[] = [
  ProspectStatus.INTERESTED,
  ProspectStatus.INVITATION_SENT,
  ProspectStatus.REGISTRATION_STARTED,
  ProspectStatus.REGISTERED,
  ProspectStatus.ONBOARDING_COMPLETED,
  ProspectStatus.VERIFIED,
  ProspectStatus.ACTIVE,
];
const COUNTED_AS_REGISTERED: ProspectStatus[] = [
  ProspectStatus.REGISTERED,
  ProspectStatus.ONBOARDING_COMPLETED,
  ProspectStatus.VERIFIED,
  ProspectStatus.ACTIVE,
];
const COUNTED_AS_ONBOARDED: ProspectStatus[] = [
  ProspectStatus.ONBOARDING_COMPLETED,
  ProspectStatus.VERIFIED,
  ProspectStatus.ACTIVE,
];

@Injectable()
export class BusinessAcquisitionService {
  private readonly logger = new Logger(BusinessAcquisitionService.name);

  constructor(
    @InjectRepository(BusinessProspect)
    private readonly prospects: Repository<BusinessProspect>,
    @InjectRepository(BusinessRelationshipHistory)
    private readonly history: Repository<BusinessRelationshipHistory>,
    @InjectRepository(BusinessAcquisitionSettings)
    private readonly settingsRepo: Repository<BusinessAcquisitionSettings>,
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    private readonly usersService: UsersService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly events: BusinessAcquisitionEventsService,
  ) {}

  // ── Central Hub bridge ────────────────────────────────────────────────

  private get centralUrl(): string {
    return (
      this.config.get<string>('MCOM_CENTRAL_URL') || 'http://localhost:3010/api/v1'
    ).replace(/\/+$/, '');
  }

  private get centralHeaders(): Record<string, string> {
    return {
      'x-api-key': this.config.get<string>('INTERNAL_API_KEY') || '',
      'content-type': 'application/json',
    };
  }

  private async centralPost<T>(path: string, body: unknown): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.post<T>(`${this.centralUrl}${path}`, body, {
          headers: this.centralHeaders,
          timeout: 15000,
        }),
      );
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Central Hub request failed';
      this.logger.warn(`Central Hub POST ${path} failed: ${message}`);
      if (error?.response?.status && error.response.status < 500) {
        throw new BadRequestException(
          Array.isArray(message) ? message.join(', ') : String(message),
        );
      }
      throw new ServiceUnavailableException('Central Hub is unavailable. Please try again.');
    }
  }

  private async centralGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.get<T>(`${this.centralUrl}${path}`, {
          headers: this.centralHeaders,
          params,
          timeout: 12000,
        }),
      );
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Central Hub request failed';
      this.logger.warn(`Central Hub GET ${path} failed: ${message}`);
      throw new ServiceUnavailableException('Central Hub is unavailable. Please try again.');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private normalizePhone(value?: string | null): string {
    return (value ?? '').replace(/[^0-9]/g, '');
  }

  private normalizeName(value?: string | null): string {
    return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private normalizePostcode(value?: string | null): string {
    return (value ?? '').toUpperCase().replace(/\s+/g, '');
  }

  private async requireAffiliateUser(affiliateId: string): Promise<User> {
    const user = await this.usersService.findOne(affiliateId);
    if (
      ![UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT].includes(user.role)
    ) {
      throw new ForbiddenException('Only affiliate roles can manage business prospects.');
    }
    return user;
  }

  private async recordHistory(input: {
    prospectId?: string | null;
    centralBusinessId?: string | null;
    relationshipType: BusinessRelationshipType;
    affiliateId?: string | null;
    actorId?: string | null;
    previousValue?: string | null;
    newValue?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    return this.history.save(
      this.history.create({
        prospectId: input.prospectId ?? null,
        centralBusinessId: input.centralBusinessId ?? null,
        relationshipType: input.relationshipType,
        affiliateId: input.affiliateId ?? null,
        actorId: input.actorId ?? null,
        previousValue: input.previousValue ?? null,
        newValue: input.newValue ?? null,
        metadata: input.metadata ?? null,
      }),
    );
  }

  private async findOwnedProspect(id: string, user: User): Promise<BusinessProspect> {
    const prospect = await this.prospects.findOne({ where: { id } });
    if (!prospect) throw new NotFoundException('Business prospect not found');
    if (prospect.affiliateId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not own this business prospect.');
    }
    return prospect;
  }

  // ── Duplicate detection ───────────────────────────────────────────────

  private async findLocalDuplicate(
    user: User,
    dto: { businessName?: string; phone?: string; email?: string; postcode?: string },
  ) {
    const phone = this.normalizePhone(dto.phone);
    const email = (dto.email ?? '').trim().toLowerCase();
    const name = this.normalizeName(dto.businessName);
    const postcode = this.normalizePostcode(dto.postcode);
    if (!phone && !email && !name) return null;

    const qb = this.prospects.createQueryBuilder('p');
    const clauses: string[] = [];
    const params: Record<string, string> = {};
    if (phone) {
      clauses.push(`regexp_replace(COALESCE(p.phone, ''), '[^0-9]', '', 'g') = :phone`);
      params.phone = phone;
    }
    if (email) {
      clauses.push(`LOWER(COALESCE(p.email, '')) = :email`);
      params.email = email;
    }
    if (name && postcode) {
      clauses.push(
        `(LOWER(TRIM(p."businessName")) = :name AND UPPER(REPLACE(COALESCE(p.postcode, ''), ' ', '')) = :postcode)`,
      );
      params.name = name;
      params.postcode = postcode;
    }
    if (!clauses.length) return null;
    qb.where(`(${clauses.join(' OR ')})`, params);
    qb.orderBy('p."createdAt"', 'DESC');
    return qb.getOne();
  }

  private async lookupCentralBusiness(dto: {
    businessName?: string;
    phone?: string;
    email?: string;
    postcode?: string;
  }): Promise<{
    businessId: string;
    businessName: string;
    acquiredByAffiliateId?: string | null;
    acquiredByAffiliateExternalId?: string | null;
    acquisitionStatus?: string | null;
  } | null> {
    const params: Record<string, string> = {};
    if (dto.businessName) params.name = dto.businessName;
    if (dto.phone) params.phone = dto.phone;
    if (dto.email) params.email = dto.email;
    if (dto.postcode) params.postcode = dto.postcode;
    if (!Object.keys(params).length) return null;

    try {
      const response = await this.centralGet<{ success: boolean; data: any }>(
        '/affiliate/businesses/lookup',
        params,
      );
      const business = response?.data;
      if (!business) return null;
      return {
        businessId: business.id ?? business.businessId,
        businessName: business.businessName,
        acquiredByAffiliateId: business.acquiredByAffiliateId ?? null,
        acquiredByAffiliateExternalId: business.acquiredByAffiliateExternalId ?? null,
        acquisitionStatus: business.acquisitionStatus ?? null,
      };
    } catch (error) {
      // A Central outage must not prevent an affiliate recording local outreach.
      this.logger.warn(
        `Central business lookup skipped: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  // ── Prospect CRUD ─────────────────────────────────────────────────────

  async createProspect(userId: string, dto: CreateBusinessProspectDto) {
    const user = await this.requireAffiliateUser(userId);
    const localDuplicate = await this.findLocalDuplicate(user, dto);

    if (localDuplicate) {
      if (localDuplicate.affiliateId === user.id) {
        return {
          duplicate: true,
          sameAffiliate: true,
          message: 'You already have this business in your prospects.',
          prospect: localDuplicate,
        };
      }
      throw new ConflictException(
        'This business is already recorded by another affiliate. Submit an attribution claim instead of creating a duplicate prospect.',
      );
    }

    const central = await this.lookupCentralBusiness(dto);
    if (central) {
      const acquiredByMe =
        (central.acquiredByAffiliateExternalId &&
          central.acquiredByAffiliateExternalId === user.id) ||
        (central.acquiredByAffiliateId &&
          Boolean(user.mcomUserId) &&
          central.acquiredByAffiliateId === user.mcomUserId);
      const hasAcquisition = Boolean(
        central.acquiredByAffiliateExternalId || central.acquiredByAffiliateId,
      );
      if (hasAcquisition && !acquiredByMe) {
        throw new ConflictException(
          'This business is already onboarded on CHS and attributed to another affiliate.',
        );
      }
    }

    const prospect = await this.prospects.save(
      this.prospects.create({
        affiliateId: user.id,
        affiliateEmail: user.email,
        affiliateName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
        affiliateRole: user.role,
        businessName: dto.businessName.trim(),
        contactName: dto.contactName?.trim() || null,
        phone: dto.phone?.trim() || null,
        email: dto.email?.trim().toLowerCase() || null,
        postcode: dto.postcode?.trim().toUpperCase() || null,
        address: dto.address?.trim() || null,
        category: dto.category?.trim() || null,
        contactDate: dto.contactDate || null,
        status: dto.status ?? ProspectStatus.IDENTIFIED,
        notes: dto.notes?.trim() || null,
        centralBusinessId: central?.businessId ?? null,
        metadata: central ? { matchedCentralBusiness: central } : null,
      }),
    );

    await this.recordHistory({
      prospectId: prospect.id,
      centralBusinessId: prospect.centralBusinessId,
      relationshipType: BusinessRelationshipType.ACQUISITION,
      affiliateId: user.id,
      actorId: user.id,
      newValue: 'prospect_created',
      metadata: { source: 'affiliate_outreach' },
    });

    return { duplicate: false, prospect, centralMatch: central };
  }

  async updateProspect(id: string, userId: string, dto: UpdateBusinessProspectDto) {
    const user = await this.requireAffiliateUser(userId);
    const prospect = await this.findOwnedProspect(id, user);
    const previousStatus = prospect.status;

    if (dto.businessName !== undefined) prospect.businessName = dto.businessName.trim();
    if (dto.contactName !== undefined) prospect.contactName = dto.contactName?.trim() || null;
    if (dto.phone !== undefined) prospect.phone = dto.phone?.trim() || null;
    if (dto.email !== undefined) prospect.email = dto.email?.trim().toLowerCase() || null;
    if (dto.postcode !== undefined) prospect.postcode = dto.postcode?.trim().toUpperCase() || null;
    if (dto.address !== undefined) prospect.address = dto.address?.trim() || null;
    if (dto.category !== undefined) prospect.category = dto.category?.trim() || null;
    if (dto.contactDate !== undefined) prospect.contactDate = dto.contactDate || null;
    if (dto.notes !== undefined) prospect.notes = dto.notes?.trim() || null;
    if (dto.status !== undefined) prospect.status = dto.status;

    const saved = await this.prospects.save(prospect);
    if (dto.status && dto.status !== previousStatus) {
      await this.recordHistory({
        prospectId: prospect.id,
        centralBusinessId: prospect.centralBusinessId,
        relationshipType: BusinessRelationshipType.STATUS_CHANGE,
        affiliateId: user.id,
        actorId: user.id,
        previousValue: previousStatus,
        newValue: dto.status,
      });
    }
    return saved;
  }

  async getProspect(id: string, userId: string) {
    const user = await this.usersService.findOne(userId);
    const prospect = await this.findOwnedProspect(id, user);
    const history = await this.history.find({
      where: [{ prospectId: prospect.id }, { centralBusinessId: prospect.centralBusinessId ?? '__none__' }],
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return { prospect, history };
  }

  async listProspects(
    userId: string,
    filters: { status?: ProspectStatus; search?: string } = {},
  ) {
    const user = await this.requireAffiliateUser(userId);
    await this.syncFromCentral(user);
    const qb = this.prospects
      .createQueryBuilder('p')
      .where('p."affiliateId" = :affiliateId', { affiliateId: user.id });

    if (filters.status) qb.andWhere('p.status = :status', { status: filters.status });
    if (filters.search?.trim()) {
      qb.andWhere(
        '(LOWER(p."businessName") LIKE :search OR LOWER(COALESCE(p.email, \'\')) LIKE :search OR COALESCE(p.phone, \'\') LIKE :search)',
        { search: `%${filters.search.trim().toLowerCase()}%` },
      );
    }
    qb.orderBy('p."createdAt"', 'DESC');
    const items = await qb.getMany();

    return {
      items,
      summary: await this.buildSummary(user),
      settings: await this.getSettings(),
    };
  }

  async getSummaryForUser(userId: string) {
    const user = await this.requireAffiliateUser(userId);
    await this.syncFromCentral(user);
    return {
      summary: await this.buildSummary(user),
      settings: await this.getSettings(),
    };
  }

  /**
   * Best-effort reconciliation with Central Hub. Webhooks are the primary
   * update path; this makes the dashboard self-heal if a callback was missed.
   */
  private async syncFromCentral(user: User) {
    if (!user.mcomUserId) return;
    try {
      const response = await this.centralGet<{ success: boolean; data: any }>(
        `/affiliate/businesses/acquired/${encodeURIComponent(user.mcomUserId)}`,
        { affiliateExternalId: user.id },
      );
      const businesses: any[] = response?.data?.businesses ?? [];
      for (const business of businesses) {
        const token = business?.affiliateInvitations?.[0]?.token as string | undefined;
        const prospect = await this.prospects.findOne({
          where: [
            { centralBusinessId: business.id },
            ...(token ? [{ invitationToken: token }] : []),
          ],
        });
        if (!prospect) continue;

        const status = String(business.acquisitionStatus || '').toLowerCase();
        const nextStatus =
          status === 'verified'
            ? ProspectStatus.VERIFIED
            : status === 'onboarding_completed'
              ? ProspectStatus.ONBOARDING_COMPLETED
              : status === 'registered'
                ? ProspectStatus.REGISTERED
                : status === 'rejected'
                  ? ProspectStatus.REJECTED
                  : prospect.status;
        // A paid conversion is a later stage than registration/onboarding.
        // Central's acquisitionStatus does not track payment, so never regress.
        const resolvedStatus =
          prospect.convertedAt &&
          (nextStatus === ProspectStatus.REGISTERED ||
            nextStatus === ProspectStatus.ONBOARDING_COMPLETED)
            ? ProspectStatus.ACTIVE
            : nextStatus;
        const nextVerification =
          status === 'verified'
            ? AcquisitionVerificationStatus.VERIFIED
            : status === 'rejected'
              ? AcquisitionVerificationStatus.REJECTED
              : prospect.acquisitionStatus;

        if (
          prospect.centralBusinessId !== business.id ||
          prospect.status !== resolvedStatus ||
          prospect.acquisitionStatus !== nextVerification
        ) {
          prospect.centralBusinessId = business.id;
          prospect.status = resolvedStatus;
          prospect.acquisitionStatus = nextVerification;
          if (nextVerification === AcquisitionVerificationStatus.VERIFIED && !prospect.verifiedAt) {
            prospect.verifiedAt = new Date();
          }
          prospect.lastSyncedAt = new Date();
          await this.prospects.save(prospect);
        }
      }
    } catch (error) {
      this.logger.warn(
        `Business acquisition sync skipped: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async buildSummary(user: User) {
    const all = await this.prospects.find({ where: { affiliateId: user.id } });
    const countStatuses = (statuses: ProspectStatus[]) =>
      all.filter((p) => statuses.includes(p.status)).length;

    return {
      totalProspects: all.length,
      approached: countStatuses(COUNTED_AS_APPROACHED),
      interested: countStatuses(COUNTED_AS_INTERESTED),
      invitationsSent: all.filter((p) => Boolean(p.invitationSentAt)).length,
      registered: countStatuses(COUNTED_AS_REGISTERED),
      onboardingCompleted: countStatuses(COUNTED_AS_ONBOARDED),
      converted: all.filter((p) => Boolean(p.convertedAt)).length,
      verified: all.filter(
        (p) => p.acquisitionStatus === AcquisitionVerificationStatus.VERIFIED,
      ).length,
      pendingVerification: all.filter(
        (p) => p.acquisitionStatus === AcquisitionVerificationStatus.PENDING_VERIFICATION,
      ).length,
      inactive: all.filter(
        (p) => p.status === ProspectStatus.INACTIVE || p.status === ProspectStatus.REJECTED,
      ).length,
    };
  }

  // ── Invitations ───────────────────────────────────────────────────────

  async generateInvitation(id: string, userId: string) {
    const user = await this.requireAffiliateUser(userId);
    const prospect = await this.findOwnedProspect(id, user);

    if (
      prospect.acquisitionStatus === AcquisitionVerificationStatus.VERIFIED ||
      prospect.status === ProspectStatus.VERIFIED
    ) {
      throw new ConflictException('This business acquisition is already verified.');
    }
    if (prospect.invitationUrl) {
      return { invitationUrl: prospect.invitationUrl, token: prospect.invitationToken, existing: true };
    }

    const response = await this.centralPost<{
      success: boolean;
      data: { token: string; invitationUrl: string };
    }>('/affiliate/business-invitations', {
      affiliateUserId: user.mcomUserId ?? undefined,
      affiliateExternalId: user.id,
      affiliateEmail: user.email,
      affiliateName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      affiliateRole: user.role,
      prospectExternalId: prospect.id,
      businessName: prospect.businessName,
      contactName: prospect.contactName ?? undefined,
      businessPhone: prospect.phone ?? undefined,
      businessEmail: prospect.email ?? undefined,
      postcode: prospect.postcode ?? undefined,
      address: prospect.address ?? undefined,
      category: prospect.category ?? undefined,
      notes: prospect.notes ?? undefined,
      metadata: { localProspectId: prospect.id },
    });

    const invitation = response?.data;
    if (!invitation?.token) {
      throw new ServiceUnavailableException('Central Hub did not return an invitation token.');
    }

    const previousStatus = prospect.status;
    prospect.invitationToken = invitation.token;
    prospect.invitationUrl = invitation.invitationUrl;
    prospect.invitationSentAt = new Date();
    prospect.status =
      prospect.status === ProspectStatus.IDENTIFIED || prospect.status === ProspectStatus.APPROACHED
        ? ProspectStatus.INVITATION_SENT
        : prospect.status;
    prospect.lastSyncedAt = new Date();
    await this.prospects.save(prospect);

    await this.recordHistory({
      prospectId: prospect.id,
      relationshipType: BusinessRelationshipType.ONBOARDING_ASSISTANCE,
      affiliateId: user.id,
      actorId: user.id,
      previousValue: previousStatus,
      newValue: prospect.status,
      metadata: { invitationToken: invitation.token },
    });

    return { invitationUrl: invitation.invitationUrl, token: invitation.token, existing: false };
  }

  /**
   * A business that registered directly (without following the link) can be
   * claimed, but the claim stays pending until Central Hub verifies it.
   */
  async confirmAssociation(
    id: string,
    userId: string,
    dto: ConfirmBusinessAssociationDto,
  ) {
    const user = await this.requireAffiliateUser(userId);
    const prospect = await this.findOwnedProspect(id, user);

    if (prospect.acquisitionStatus === AcquisitionVerificationStatus.VERIFIED) {
      return { prospect, claimId: prospect.centralClaimId, alreadyVerified: true };
    }

    const response = await this.centralPost<{
      success: boolean;
      data: { id: string; businessId?: string | null };
    }>(
      '/affiliate/business-claims',
      {
        businessId: dto.centralBusinessId || prospect.centralBusinessId || undefined,
        businessEmail: dto.businessEmail || prospect.email || undefined,
        businessName: prospect.businessName,
        affiliateUserId: user.mcomUserId ?? undefined,
        affiliateExternalId: user.id,
        affiliateEmail: user.email,
        affiliateName:
          [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
        affiliateRole: user.role,
        prospectExternalId: prospect.id,
        evidence:
          dto.evidence ||
          'Affiliate confirmed a direct CHS registration from their dashboard.',
        metadata: { localProspectId: prospect.id },
      },
    );

    prospect.centralClaimId = response?.data?.id ?? null;
    prospect.claimEvidence = dto.evidence ?? null;
    prospect.acquisitionStatus = AcquisitionVerificationStatus.PENDING_VERIFICATION;
    const matchedBusinessId = dto.centralBusinessId || response?.data?.businessId || null;
    if (matchedBusinessId) {
      prospect.centralBusinessId = matchedBusinessId;
      prospect.status = ProspectStatus.REGISTERED;
    }
    prospect.lastSyncedAt = new Date();
    await this.prospects.save(prospect);

    await this.recordHistory({
      prospectId: prospect.id,
      centralBusinessId: prospect.centralBusinessId,
      relationshipType: BusinessRelationshipType.ATTRIBUTION_CHANGE,
      affiliateId: user.id,
      actorId: user.id,
      newValue: 'claim_pending_verification',
      metadata: { claimId: prospect.centralClaimId, evidence: dto.evidence ?? null },
    });

    return { prospect, claimId: prospect.centralClaimId, alreadyVerified: false };
  }

  // ── Central Hub lifecycle events ──────────────────────────────────────

  async handleCentralEvent(event: {
    type: string;
    invitationToken?: string | null;
    prospectExternalId?: string | null;
    businessId?: string | null;
    businessName?: string | null;
    userId?: string | null;
    status?: string | null;
    occurredAt?: string | null;
    claimId?: string | null;
    conversionType?: string | null;
    planName?: string | null;
    amount?: number | null;
    currency?: string | null;
    provider?: string | null;
    paymentReference?: string | null;
  }) {
    const prospect = await this.findProspectForEvent(event);
    if (!prospect) {
      this.logger.warn(
        `Business acquisition event ${event.type} did not match a local prospect.`,
      );
      return { matched: false };
    }

    const previousStatus = prospect.status;
    if (event.businessId) prospect.centralBusinessId = event.businessId;
    if (event.userId) prospect.centralUserId = event.userId;
    if (event.claimId) prospect.centralClaimId = event.claimId;
    prospect.lastSyncedAt = new Date();

    const advancedStatuses: ProspectStatus[] = [
      ProspectStatus.REGISTERED,
      ProspectStatus.ONBOARDING_COMPLETED,
      ProspectStatus.VERIFIED,
      ProspectStatus.ACTIVE,
    ];

    switch (event.type) {
      case 'invitation_opened':
        if (
          [
            ProspectStatus.IDENTIFIED,
            ProspectStatus.APPROACHED,
            ProspectStatus.INTERESTED,
            ProspectStatus.INVITATION_SENT,
          ].includes(prospect.status)
        ) {
          prospect.status = ProspectStatus.REGISTRATION_STARTED;
        }
        break;
      case 'registration':
        // Events may arrive out of order; never regress a later stage.
        if (!advancedStatuses.includes(prospect.status)) {
          prospect.status = ProspectStatus.REGISTERED;
          prospect.acquisitionStatus = AcquisitionVerificationStatus.UNVERIFIED;
        }
        break;
      case 'onboarding_completed':
        if (prospect.status !== ProspectStatus.VERIFIED && prospect.status !== ProspectStatus.ACTIVE) {
          prospect.status = ProspectStatus.ONBOARDING_COMPLETED;
        }
        break;
      case 'conversion':
        // Paid membership, access pass or trial. The acquisition is now a
        // converted customer; verification remains a separate admin decision.
        prospect.status = ProspectStatus.ACTIVE;
        prospect.convertedAt = event.occurredAt ? new Date(event.occurredAt) : new Date();
        prospect.conversionType = (event.conversionType ?? 'membership').toLowerCase();
        prospect.conversionProvider = event.provider ?? null;
        prospect.conversionAmount =
          event.amount != null && Number.isFinite(Number(event.amount))
            ? Number(event.amount).toFixed(2)
            : null;
        prospect.conversionReference = event.paymentReference ?? null;
        break;
      case 'verified':
        prospect.status = ProspectStatus.VERIFIED;
        prospect.acquisitionStatus = AcquisitionVerificationStatus.VERIFIED;
        prospect.verifiedAt = new Date();
        break;
      case 'rejected':
        prospect.status = ProspectStatus.REJECTED;
        prospect.acquisitionStatus = AcquisitionVerificationStatus.REJECTED;
        break;
      case 'claim_status':
        if ((event.status ?? '').toUpperCase() === 'APPROVED') {
          prospect.acquisitionStatus = AcquisitionVerificationStatus.VERIFIED;
          prospect.status = ProspectStatus.VERIFIED;
          prospect.verifiedAt = new Date();
        } else if ((event.status ?? '').toUpperCase() === 'REJECTED') {
          prospect.acquisitionStatus = AcquisitionVerificationStatus.REJECTED;
        }
        break;
      default:
        break;
    }

    await this.prospects.save(prospect);
    await this.recordHistory({
      prospectId: prospect.id,
      centralBusinessId: prospect.centralBusinessId,
      relationshipType: BusinessRelationshipType.ATTRIBUTION_CHANGE,
      affiliateId: prospect.affiliateId,
      actorId: null,
      previousValue: previousStatus,
      newValue: prospect.status,
      metadata: { event },
    });

    // Persist + publish to the SSE stream. Never let an activity-log failure
    // roll back the acquisition status that was just saved.
    await this.recordEventSafely(prospect, event);

    return { matched: true, prospectId: prospect.id, status: prospect.status };
  }

  private async recordEventSafely(
    prospect: BusinessProspect,
    event: {
      type: string;
      businessName?: string | null;
      conversionType?: string | null;
      planName?: string | null;
      amount?: number | null;
      currency?: string | null;
      provider?: string | null;
      paymentReference?: string | null;
      occurredAt?: string | null;
    },
  ) {
    try {
      await this.events.record({
        affiliateId: prospect.affiliateId,
        prospectId: prospect.id,
        centralBusinessId: prospect.centralBusinessId,
        type: event.type,
        businessName: event.businessName ?? prospect.businessName,
        status: prospect.status,
        conversionType: event.conversionType ?? prospect.conversionType,
        planName: event.planName ?? null,
        amount:
          event.amount != null
            ? Number(event.amount)
            : prospect.conversionAmount != null
              ? Number(prospect.conversionAmount)
              : null,
        currency: event.currency ?? 'GBP',
        provider: event.provider ?? prospect.conversionProvider,
        paymentReference: event.paymentReference ?? prospect.conversionReference,
        occurredAt: event.occurredAt ? new Date(event.occurredAt) : new Date(),
        metadata: { ...event },
      });
    } catch (error) {
      this.logger.warn(
        `Could not persist acquisition event ${event.type}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async findProspectForEvent(event: {
    invitationToken?: string | null;
    prospectExternalId?: string | null;
    businessId?: string | null;
  }) {
    if (event.prospectExternalId) {
      const byId = await this.prospects.findOne({ where: { id: event.prospectExternalId } });
      if (byId) return byId;
    }
    if (event.invitationToken) {
      const byToken = await this.prospects.findOne({
        where: { invitationToken: event.invitationToken },
      });
      if (byToken) return byToken;
    }
    if (event.businessId) {
      return this.prospects.findOne({ where: { centralBusinessId: event.businessId } });
    }
    return null;
  }

  // ── Business assignments for consultants ──────────────────────────────

  async getBusinessAssignments(userId: string) {
    const user = await this.usersService.findOne(userId);
    const tasks = (
      await this.tasks.find({
        where: { assignedAgentId: user.id },
        order: { createdAt: 'DESC' },
        take: 200,
      })
    ).filter((task) => Boolean(task.centralBusinessId));

    const grouped = new Map<
      string,
      {
        centralBusinessId: string;
        businessName: string | null;
        acquiredByAffiliateName?: string | null;
        acquiredByAffiliateRole?: string | null;
        accountManagerName?: string | null;
        tasks: Task[];
      }
    >();
    for (const task of tasks) {
      if (!task.centralBusinessId) continue;
      const existing = grouped.get(task.centralBusinessId) ?? {
        centralBusinessId: task.centralBusinessId,
        businessName: task.centralBusinessName ?? null,
        acquiredByAffiliateName: null,
        acquiredByAffiliateRole: null,
        accountManagerName: null,
        tasks: [],
      };
      existing.tasks.push(task);
      grouped.set(task.centralBusinessId, existing);
    }

    // Enrich each business with the acquisition and management relationships.
    // Consultants only see these relationship summaries plus their assigned
    // work, never unrestricted access to the business account.
    await Promise.all(
      Array.from(grouped.values()).map(async (assignment) => {
        try {
          const response = await this.centralGet<{
            success: boolean;
            data: {
              business?: {
                acquiredByAffiliateName?: string | null;
                acquiredByAffiliateRole?: string | null;
                accountManager?: {
                  firstName?: string | null;
                  lastName?: string | null;
                  email?: string | null;
                } | null;
              };
            };
          }>(
            `/affiliate/businesses/${encodeURIComponent(assignment.centralBusinessId)}/relationships`,
          );
          const business = response?.data?.business;
          assignment.acquiredByAffiliateName = business?.acquiredByAffiliateName ?? null;
          assignment.acquiredByAffiliateRole = business?.acquiredByAffiliateRole ?? null;
          assignment.accountManagerName = business?.accountManager
            ? [business.accountManager.firstName, business.accountManager.lastName]
                .filter(Boolean)
                .join(' ') || business.accountManager.email || null
            : null;
        } catch {
          // The assignment list must still render if CHS is temporarily down.
        }
      }),
    );

    return { assignments: Array.from(grouped.values()), total: grouped.size };
  }

  // ── Live acquisition activity ─────────────────────────────────────────

  streamEvents(user: { userId: string; role?: string }) {
    return this.events.streamFor(user);
  }

  listEvents(affiliateId: string, limit?: number) {
    return this.events.listForAffiliate(affiliateId, limit);
  }

  adminListEvents(limit?: number) {
    return this.events.listForAdmin(limit);
  }

  // ── Settings & admin ─────────────────────────────────────────────────

  async getSettings(): Promise<BusinessAcquisitionSettings> {
    const existing = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (existing) return existing;
    return this.settingsRepo.save(
      this.settingsRepo.create({
        id: 1,
        targetCount: 20,
        dueDate: null,
        appliesToRoles: [UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT],
        requireVerification: true,
        updatedBy: null,
      }),
    );
  }

  async updateSettings(adminId: string, dto: UpdateBusinessAcquisitionSettingsDto) {
    const settings = await this.getSettings();
    if (dto.targetCount !== undefined) settings.targetCount = dto.targetCount;
    if (dto.dueDate !== undefined) settings.dueDate = dto.dueDate || null;
    if (dto.appliesToRoles !== undefined) settings.appliesToRoles = dto.appliesToRoles;
    if (dto.requireVerification !== undefined) {
      settings.requireVerification = dto.requireVerification;
    }
    settings.updatedBy = adminId;
    return this.settingsRepo.save(settings);
  }

  async adminList(params: { status?: ProspectStatus; search?: string } = {}) {
    const qb = this.prospects.createQueryBuilder('p');
    if (params.status) qb.andWhere('p.status = :status', { status: params.status });
    if (params.search?.trim()) {
      qb.andWhere(
        '(LOWER(p."businessName") LIKE :search OR LOWER(COALESCE(p.email, \'\')) LIKE :search OR LOWER(COALESCE(p."affiliateEmail", \'\')) LIKE :search)',
        { search: `%${params.search.trim().toLowerCase()}%` },
      );
    }
    qb.orderBy('p."createdAt"', 'DESC');
    return {
      items: await qb.getMany(),
      settings: await this.getSettings(),
    };
  }

  async adminVerifyProspect(
    id: string,
    adminId: string,
    decision: 'VERIFIED' | 'REJECTED',
    notes?: string,
  ) {
    const prospect = await this.prospects.findOne({ where: { id } });
    if (!prospect) throw new NotFoundException('Business prospect not found');
    if (!prospect.centralBusinessId && !prospect.centralClaimId) {
      throw new BadRequestException(
        'This prospect has no CHS business record or pending claim yet. Complete registration first.',
      );
    }

    if (prospect.centralClaimId) {
      // A direct-registration claim must be approved through the claim review
      // endpoint; the business does not yet carry the attribution to verify.
      await this.centralPost(`/affiliate/business-claims/${prospect.centralClaimId}/review`, {
        decision: decision === 'VERIFIED' ? 'APPROVED' : 'REJECTED',
        notes,
        reviewerUserId: adminId,
      });
    } else {
      await this.centralPost(`/affiliate/businesses/${prospect.centralBusinessId}/verify`, {
        decision,
        notes,
        reviewerUserId: adminId,
      });
    }

    const previous = prospect.status;
    prospect.acquisitionStatus =
      decision === 'VERIFIED'
        ? AcquisitionVerificationStatus.VERIFIED
        : AcquisitionVerificationStatus.REJECTED;
    prospect.status =
      decision === 'VERIFIED' ? ProspectStatus.VERIFIED : ProspectStatus.REJECTED;
    prospect.verifiedAt = decision === 'VERIFIED' ? new Date() : null;
    prospect.verifiedBy = adminId;
    await this.prospects.save(prospect);

    await this.recordHistory({
      prospectId: prospect.id,
      centralBusinessId: prospect.centralBusinessId,
      relationshipType: BusinessRelationshipType.ATTRIBUTION_CHANGE,
      affiliateId: prospect.affiliateId,
      actorId: adminId,
      previousValue: previous,
      newValue: prospect.status,
      metadata: { decision, notes: notes ?? null },
    });

    return prospect;
  }

  /** Pull the current CHS record for an acquired business. */
  async getCentralBusinesses(userId: string) {
    const user = await this.requireAffiliateUser(userId);
    if (!user.mcomUserId) {
      return { total: 0, businesses: [], message: 'Central Hub account is not linked.' };
    }
    try {
      const response = await this.centralGet<{ success: boolean; data: any }>(
        `/affiliate/businesses/acquired/${encodeURIComponent(user.mcomUserId)}`,
        { affiliateExternalId: user.id },
      );
      return response?.data ?? { total: 0, businesses: [] };
    } catch (error) {
      this.logger.warn(
        `Central businesses retrieval skipped for affiliate ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { total: 0, businesses: [] };
    }
  }
}
