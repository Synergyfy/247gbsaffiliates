import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Admin-controlled configuration for the local business acquisition task.
 * The 20-business target is deliberately configurable, never hard-coded.
 */
@Entity('business_acquisition_settings')
export class BusinessAcquisitionSettings {
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  @Column({ type: 'int', default: 20 })
  targetCount: number;

  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  @Column('simple-array', { nullable: true })
  appliesToRoles: string[] | null;

  @Column({ default: true })
  requireVerification: boolean;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
