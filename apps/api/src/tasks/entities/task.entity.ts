import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  SUBMITTED = 'submitted',
  PENDING_BUSINESS_APPROVAL = 'pending_business_approval',
  REVISION_REQUESTED = 'revision_requested',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskCategory {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum TaskType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  CAMPAIGN = 'campaign',
  CONSULTANCY = 'consultancy',
}

export enum OriginSystem {
  INTERNAL = 'INTERNAL',
  MCOM_MALL = 'MCOM_MALL',
  MCOM_LOYALTY = 'MCOM_LOYALTY',
  MCOM_CENTRAL = 'MCOM_CENTRAL',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index()
  externalTaskId: string; // ID from mcom_central

  @Column({ type: 'enum', enum: OriginSystem, default: OriginSystem.INTERNAL })
  originSystem: OriginSystem;

  @Column({ nullable: true })
  originRequesterId: string;

  // Snapshot of the originating Central business (for the affiliate's context).
  @Column({ nullable: true })
  centralBusinessId: string;

  @Column({ nullable: true })
  centralBusinessName: string;

  // Platform tags the work spans (e.g. mall, rewards).
  @Column('simple-array', { nullable: true })
  platforms: string[];

  // Used to route a Central task before the affiliate has SSO'd locally.
  @Column({ nullable: true })
  @Index()
  assigneeEmail: string;

  @Column({ nullable: true })
  taskType: string;

  // Internal platform work vs external professional/creative services.
  @Column({ type: 'enum', enum: TaskCategory, default: TaskCategory.EXTERNAL })
  category: TaskCategory;

  // Project grouping and agreed scope/deliverables from Central Hub.
  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  projectName: string;

  @Column('simple-array', { nullable: true })
  deliverables: string[];

  @Column('text', { nullable: true })
  materials: string;

  @Column({ nullable: true })
  prerequisiteExternalTaskId: string;

  // Compensation arrangement (recorded before work begins).
  @Column({ nullable: true })
  compensationModel: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  compensationAmount: number;

  @Column({ default: 'GBP' })
  compensationCurrency: string;

  @Column({ default: false })
  billableToBusiness: boolean;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  businessChargeAmount: number;

  @Column({ default: 'GBP' })
  businessChargeCurrency: string;

  @Column({ default: false })
  chargeApprovalRequired: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  chargeApprovedAt: Date;

  @Column({ nullable: true })
  paymentStatus: string;

  @Column()
  @Index()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'varchar', nullable: true })
  executionUrl: string | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.OPEN })
  @Index()
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskType, default: TaskType.ONE_TIME })
  type: TaskType;

  // The Client who created the task (Internal only)
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  client: User;

  @Column({ nullable: true })
  clientId: string;

  // The Agent assigned to the task
  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  assignedAgent: User;

  @Column({ nullable: true })
  assignedAgentId: string;

  @Column('simple-array', { nullable: true })
  requiredSkills: string[];

  @Column({ nullable: true })
  dueDate: Date;

  // ── Submission + review loop (Central Hub delegated tasks) ──
  @Column('jsonb', { nullable: true })
  submissionData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  reviewHistory: Array<{
    round: number;
    decision: 'APPROVED' | 'CHANGES_REQUESTED';
    notes?: string | null;
    reviewedAt: string;
    acknowledgedAt?: string | null;
  }>;

  @Column({ nullable: true })
  reviewNotes: string;

  @Column({ default: 0 })
  revisionCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt: Date;

  /** Why the assignee declined the task (required when declining). */
  @Column('text', { nullable: true })
  declineReason: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastCentralSyncAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
