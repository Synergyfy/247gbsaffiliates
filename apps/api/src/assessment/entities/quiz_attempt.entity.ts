import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column()
  score: number;

  @Column()
  maxScore: number;

  @Column()
  percentage: number;

  @Column()
  band: string; // 'Pass', 'Fail', 'Partial'

  @Column('json')
  answers: any; // Store user's answers for record

  @CreateDateColumn()
  createdAt: Date;
}
