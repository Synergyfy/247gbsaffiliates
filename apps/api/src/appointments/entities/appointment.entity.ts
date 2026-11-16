import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

/**
 * A consultancy session between a consultant and a Central Hub client
 * business. Appointments are not tasks: they hold the schedule, meeting link
 * and advisory notes. Once a session produces billable actions it can be
 * converted into a normal task through `POST /appointments/:id/convert-to-task`.
 */
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consultantId' })
  consultant: User;

  @Column({ type: 'uuid' })
  @Index()
  consultantId: string;

  // Central Hub owns businesses, so this is an opaque cross-system id rather
  // than a local foreign key.
  @Column({ type: 'uuid' })
  @Index()
  clientBusinessId: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  notes: string | null;

  @Column({ type: 'timestamptz' })
  @Index()
  scheduledAt: Date;

  @Column({ type: 'integer', default: 60 })
  durationMinutes: number;

  @Column({ type: 'varchar', nullable: true })
  meetingUrl: string | null;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  @Index()
  status: AppointmentStatus;

  @ManyToOne(() => Task, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'convertedTaskId' })
  convertedTask: Task | null;

  @Column({ type: 'uuid', nullable: true })
  convertedTaskId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  convertedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  convertedByUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
