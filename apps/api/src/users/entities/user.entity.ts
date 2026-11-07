import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  AGENT = 'agent',
  ACCOUNT_MANAGER = 'account_manager',
  CONSULTANT = 'consultant',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.AGENT })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column('simple-array', { nullable: true })
  skills: string[];

  // Profile Specifics
  @Column({ nullable: true })
  hourlyRate: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  timezone: string;

  @Column('simple-array', { nullable: true })
  languages: string[];

  @Column({ nullable: true })
  portfolioUrl: string;

  // Contact + territory imported from the Central Hub signup. Central collects
  // the UK postcode for every affiliate role, so the portal never asks for it
  // a second time during onboarding.
  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  postcode: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  country: string;

  // Hierarchy Context for Assessment
  @Column({ nullable: true })
  sectorId: string;

  @Column({ nullable: true })
  categoryId: string;

  @Column({ nullable: true })
  subCategoryId: string;

  // Verification & Visibility flags
  @Column({ default: false })
  isPaidVisible: boolean;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  verificationStatus: VerificationStatus;

  @Column('text', { nullable: true })
  verificationNotes: string | null; // Admin notes on verification

  @Column({ type: 'jsonb', nullable: true })
  verificationSubmission: Record<string, unknown> | null;

  @Column({ type: 'bytea', nullable: true, select: false })
  verificationDocument: Buffer | null;

  @Column({ type: 'varchar', nullable: true })
  verificationDocumentName: string | null;

  @Column({ type: 'varchar', nullable: true })
  verificationDocumentMimeType: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  verificationReviewedAt: Date | null;

  @Column({ default: false })
  isOnboarded: boolean;

  @Column({ default: false })
  isQuizPassed: boolean;

  // MCOM Solutions Central Hub SSO
  @Column({ name: 'mcom_user_id', type: 'varchar', nullable: true })
  mcomUserId: string | null;

  // Referral programme — synced from Central Hub so affiliates can share
  // their own referral code/link without leaving this portal.
  @Column({ name: 'referral_code', type: 'varchar', nullable: true })
  referralCode: string | null;

  @Column({ name: 'referral_link', type: 'text', nullable: true })
  referralLink: string | null;

  @Column({ name: 'mcom_membership_level', type: 'varchar', nullable: true })
  mcomMembershipLevel: string | null;

  @Column({ name: 'mcom_membership_tier', type: 'varchar', nullable: true })
  mcomMembershipTier: string | null;

  @Column({ name: 'mcom_membership_status', type: 'varchar', nullable: true })
  mcomMembershipStatus: string | null;

  @Column({ name: 'mcom_can_access_vcard', type: 'boolean', default: false })
  mcomCanAccessVcard: boolean;

  @Column({ name: 'mcom_access_token', type: 'text', nullable: true })
  @Exclude()
  mcomAccessToken: string | null;

  @Column({ name: 'mcom_refresh_token', type: 'text', nullable: true })
  @Exclude()
  mcomRefreshToken: string | null;

  @Column({ name: 'mcom_token_expires_at', type: 'timestamptz', nullable: true })
  mcomTokenExpiresAt: Date | null;

  @Column({ name: 'mcom_tokens_updated_at', type: 'timestamptz', nullable: true })
  mcomTokensUpdatedAt: Date | null;

  // Auth tokens
  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
