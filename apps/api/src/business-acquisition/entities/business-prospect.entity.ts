import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProspectStatus {
  IDENTIFIED = 'identified',
  APPROACHED = 'approached',
  INTERESTED = 'interested',
  INVITATION_SENT = 'invitation_sent',
  REGISTRATION_STARTED = 'registration_started',
  REGISTERED = 'registered',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
}

export enum AcquisitionVerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum BusinessRelationshipType {
  ACQUISITION = 'acquisition',
  ONBOARDING_ASSISTANCE = 'onboarding_assistance',
  ACCOUNT_MANAGEMENT = 'account_management',
  CONSULTANT_ASSIGNMENT = 'consultant_assignment',
  TASK_ASSIGNMENT = 'task_assignment',
  ATTRIBUTION_CHANGE = 'attribution_change',
  STATUS_CHANGE = 'status_change',
}

/**
 * A local business approached by an affiliate. This is the affiliate portal's
 * working record; CHS remains the source of truth once the business registers.
 *
 * Acquisition attribution is stored permanently on this record and never
 * overwritten when the business is assigned an Account Manager or Consultant.
 */
@Entity('business_prospects')
export class BusinessProspect {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  affiliateId: string;

  @Column({ type: 'varchar', nullable: true })
  affiliateEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  affiliateName: string | null;

  @Column({ type: 'varchar', nullable: true })
  affiliateRole: string | null;

  @Column()
  businessName: string;

  @Column({ type: 'varchar', nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  postcode: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ type: 'date', nullable: true })
  contactDate: string | null;

  @Column({
    type: 'enum',
    enum: ProspectStatus,
    enumName: 'business_prospect_status_enum',
    default: ProspectStatus.IDENTIFIED,
  })
  @Index()
  status: ProspectStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: 'affiliate_outreach' })
  source: string;

  // ── Tracked invitation ────────────────────────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  @Index({ unique: true })
  invitationToken: string | null;

  @Column({ type: 'text', nullable: true })
  invitationUrl: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  invitationSentAt: Date | null;

  // ── Conversion (paid membership / access pass / trial) ────────────────
  @Column({ type: 'timestamptz', nullable: true })
  convertedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  conversionType: string | null;

  @Column({ type: 'varchar', nullable: true })
  conversionProvider: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  conversionAmount: string | null;

  @Column({ type: 'varchar', nullable: true })
  conversionReference: string | null;

  // ── Permanent CHS attribution ─────────────────────────────────────────
  @Index()
  @Column({ type: 'varchar', nullable: true })
  centralBusinessId: string | null;

  @Column({ type: 'varchar', nullable: true })
  centralUserId: string | null;

  @Column({ type: 'varchar', nullable: true })
  centralClaimId: string | null;

  @Column({
    type: 'enum',
    enum: AcquisitionVerificationStatus,
    enumName: 'business_prospect_acquisition_status_enum',
    default: AcquisitionVerificationStatus.UNVERIFIED,
  })
  @Index()
  acquisitionStatus: AcquisitionVerificationStatus;

  @Column({ type: 'text', nullable: true })
  claimEvidence: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  verifiedBy: string | null;

  // ── Duplicate handling ────────────────────────────────────────────────
  @Column({ default: false })
  duplicateFlag: boolean;

  @Column({ type: 'varchar', nullable: true })
  duplicateOfProspectId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
