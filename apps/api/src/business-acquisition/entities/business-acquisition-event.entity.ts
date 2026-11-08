import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Append-only log of Central Hub acquisition lifecycle events. Persisting each
 * event lets the agent and admin dashboards show recent activity after a
 * reload, while the SSE stream delivers the same events live.
 */
@Entity('business_acquisition_events')
@Index(['affiliateId', 'createdAt'])
@Index(['centralBusinessId'])
export class BusinessAcquisitionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  affiliateId: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  prospectId: string | null;

  @Column({ type: 'varchar', nullable: true })
  centralBusinessId: string | null;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  businessName: string | null;

  @Column({ type: 'varchar', nullable: true })
  status: string | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'varchar', nullable: true })
  conversionType: string | null;

  @Column({ type: 'varchar', nullable: true })
  planName: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  amount: string | null;

  @Column({ type: 'varchar', nullable: true })
  currency: string | null;

  @Column({ type: 'varchar', nullable: true })
  provider: string | null;

  @Column({ type: 'varchar', nullable: true })
  paymentReference: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  occurredAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
