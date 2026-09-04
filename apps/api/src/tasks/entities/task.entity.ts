import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}

export enum OriginSystem {
  INTERNAL = 'INTERNAL',
  MCOM_MALL = 'MCOM_MALL',
  MCOM_LOYALTY = 'MCOM_LOYALTY',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  externalTaskId: string; // ID from mcom_central

  @Column({ type: 'enum', enum: OriginSystem, default: OriginSystem.INTERNAL })
  originSystem: OriginSystem;

  @Column({ nullable: true })
  originRequesterId: string;

  @Column({ nullable: true })
  taskType: string;

  @Column()
  @Index()
  title: string;

  @Column('text')
  description: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
