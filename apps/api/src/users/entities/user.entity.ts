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

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.UNVERIFIED })
  verificationStatus: VerificationStatus;

  @Column('text', { nullable: true })
  verificationNotes: string; // Admin notes on verification

  @Column({ default: false })
  isOnboarded: boolean;

  @Column({ default: false })
  isQuizPassed: boolean;

  // Auth tokens
  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
