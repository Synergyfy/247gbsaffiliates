import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BusinessRelationshipType } from './business-prospect.entity';

/**
 * Append-only trail of the separate relationships a business has with the
 * affiliate network: who acquired it, who helped onboard it, who manages it,
 * and who is delivering specialist work.
 */
@Entity('business_relationship_history')
export class BusinessRelationshipHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  prospectId: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  centralBusinessId: string | null;

  @Column({
    type: 'enum',
    enum: BusinessRelationshipType,
    enumName: 'business_relationship_type_enum',
  })
  relationshipType: BusinessRelationshipType;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  affiliateId: string | null;

  @Column({ type: 'varchar', nullable: true })
  actorId: string | null;

  @Column({ type: 'text', nullable: true })
  previousValue: string | null;

  @Column({ type: 'text', nullable: true })
  newValue: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
