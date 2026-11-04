import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type AssessmentAssignmentStatus = 'assigned' | 'in_progress' | 'pass' | 'partial' | 'fail';
export type AssessmentQuestionSnapshot = {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctOptionIndex: number;
  weight: number;
};

@Entity('assessment_assignments')
export class AssessmentAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedBy: string | null;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @Column({ name: 'due_at', type: 'timestamptz', nullable: true })
  dueAt: Date | null;

  @Column({ name: 'question_snapshot', type: 'jsonb' })
  questionSnapshot: AssessmentQuestionSnapshot[];

  @Column({ type: 'varchar', length: 20, default: 'assigned' })
  status: AssessmentAssignmentStatus;

  @Column({ type: 'jsonb', nullable: true })
  answers: { questionId: string; selectedOptionIndex: number }[] | null;

  @Column({ type: 'integer', nullable: true })
  score: number | null;

  @Column({ name: 'max_score', type: 'integer', nullable: true })
  maxScore: number | null;

  @Column({ type: 'integer', nullable: true })
  percentage: number | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
