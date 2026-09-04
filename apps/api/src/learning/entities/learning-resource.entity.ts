import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('learning_resources')
export class LearningResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'simple-array' })
  targetRoles: string[]; // ['agent', 'account_manager', 'consultant']

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  articleUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}