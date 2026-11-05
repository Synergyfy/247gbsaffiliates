import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LearningResource } from './learning-resource.entity';

export enum LearningProgressStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('learning_progress')
@Unique('UQ_learning_progress_user_resource', ['userId', 'resourceId'])
@Index('IDX_learning_progress_user_status', ['userId', 'status'])
export class LearningProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => LearningResource, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource: LearningResource;

  @Column({ name: 'resource_id', type: 'uuid' })
  resourceId: string;

  @Column({ type: 'varchar', length: 20, default: LearningProgressStatus.IN_PROGRESS })
  status: LearningProgressStatus;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
