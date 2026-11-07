import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, Subject, filter, map, merge, interval } from 'rxjs';
import { UserRole } from '../users/entities/user.entity';
import { BusinessAcquisitionEvent } from './entities/business-acquisition-event.entity';

export type BusinessAcquisitionEventInput = {
  affiliateId: string;
  prospectId?: string | null;
  centralBusinessId?: string | null;
  type: string;
  businessName?: string | null;
  status?: string | null;
  conversionType?: string | null;
  planName?: string | null;
  amount?: number | null;
  currency?: string | null;
  provider?: string | null;
  paymentReference?: string | null;
  occurredAt?: Date | null;
  metadata?: Record<string, unknown> | null;
};

export type BusinessAcquisitionStreamEvent = {
  id: string;
  affiliateId: string;
  prospectId: string | null;
  centralBusinessId: string | null;
  type: string;
  businessName: string | null;
  status: string | null;
  message: string | null;
  conversionType: string | null;
  planName: string | null;
  amount: number | null;
  currency: string | null;
  provider: string | null;
  occurredAt: string | null;
  createdAt: string;
};

function conversionLabel(value?: string | null): string {
  switch ((value ?? '').toLowerCase()) {
    case 'membership':
      return 'a membership';
    case 'access_pass':
      return 'an access pass';
    case 'trial':
      return 'a trial';
    default:
      return 'a paid plan';
  }
}

function money(amount?: number | null, currency?: string | null): string {
  if (amount == null || Number(amount) <= 0) return '';
  const symbol = (currency ?? 'GBP').toUpperCase() === 'GBP' ? '£' : '';
  return ` ${symbol}${Number(amount).toFixed(2)}${symbol ? '' : ` ${(currency ?? '').toUpperCase()}`}`.trimEnd();
}

function buildMessage(input: BusinessAcquisitionEventInput): string {
  const business = input.businessName?.trim() || 'The business';
  switch (input.type) {
    case 'invitation_opened':
      return `${business} opened your invitation link.`;
    case 'registration':
      return `${business} completed signup on Central Hub.`;
    case 'onboarding_completed':
      return `${business} completed onboarding on Central Hub.`;
    case 'conversion': {
      const plan = input.planName ? ` (${input.planName})` : '';
      const paid = input.amount != null && Number(input.amount) > 0;
      return `${business} ${paid ? 'paid for' : 'activated'} ${conversionLabel(input.conversionType)}${plan}${money(input.amount, input.currency)}.`;
    }
    case 'verified':
      return `${business} was verified as your acquisition.`;
    case 'rejected':
      return `${business} acquisition was rejected.`;
    default:
      return `${business} updated their acquisition status.`;
  }
}

@Injectable()
export class BusinessAcquisitionEventsService {
  private readonly subject = new Subject<BusinessAcquisitionStreamEvent>();

  constructor(
    @InjectRepository(BusinessAcquisitionEvent)
    private readonly events: Repository<BusinessAcquisitionEvent>,
  ) {}

  /** Persist the event, then push it to every connected dashboard. */
  async record(input: BusinessAcquisitionEventInput): Promise<BusinessAcquisitionStreamEvent> {
    const saved = await this.events.save(
      this.events.create({
        affiliateId: input.affiliateId,
        prospectId: input.prospectId ?? null,
        centralBusinessId: input.centralBusinessId ?? null,
        type: input.type,
        businessName: input.businessName ?? null,
        status: input.status ?? null,
        message: buildMessage(input),
        conversionType: input.conversionType ?? null,
        planName: input.planName ?? null,
        amount:
          input.amount != null && Number.isFinite(Number(input.amount))
            ? Number(input.amount).toFixed(2)
            : null,
        currency: input.currency ?? null,
        provider: input.provider ?? null,
        paymentReference: input.paymentReference ?? null,
        metadata: input.metadata ?? null,
        occurredAt: input.occurredAt ?? new Date(),
      }),
    );

    const event = this.toStreamEvent(saved);
    this.subject.next(event);
    return event;
  }

  private toStreamEvent(row: BusinessAcquisitionEvent): BusinessAcquisitionStreamEvent {
    return {
      id: row.id,
      affiliateId: row.affiliateId,
      prospectId: row.prospectId,
      centralBusinessId: row.centralBusinessId,
      type: row.type,
      businessName: row.businessName,
      status: row.status,
      message: row.message,
      conversionType: row.conversionType,
      planName: row.planName,
      amount: row.amount != null ? Number(row.amount) : null,
      currency: row.currency,
      provider: row.provider,
      occurredAt: row.occurredAt ? row.occurredAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
    };
  }

  /**
   * Agents/consultants receive only their own acquisition events. Admins see
   * every event so they can oversee the whole affiliate network.
   */
  streamFor(user: { userId: string; role?: string }): Observable<{
    data: BusinessAcquisitionStreamEvent | { type: string };
  }> {
    const isAdmin = user.role === UserRole.ADMIN;
    const events = this.subject.asObservable().pipe(
      filter((event) => isAdmin || event.affiliateId === user.userId),
      map((event) => ({ data: event })),
    );
    // Comment frames keep proxies from closing an idle stream.
    const heartbeat = interval(25000).pipe(
      map(() => ({ data: { type: 'heartbeat', at: new Date().toISOString() } })),
    );
    return merge(events, heartbeat);
  }

  async listForAffiliate(affiliateId: string, limit = 50) {
    const take = Math.min(Math.max(limit || 50, 1), 200);
    const rows = await this.events.find({
      where: { affiliateId },
      order: { createdAt: 'DESC' },
      take,
    });
    return rows.map((row) => this.toStreamEvent(row));
  }

  async listForAdmin(limit = 100) {
    const take = Math.min(Math.max(limit || 100, 1), 500);
    const rows = await this.events.find({ order: { createdAt: 'DESC' }, take });
    return rows.map((row) => this.toStreamEvent(row));
  }
}
