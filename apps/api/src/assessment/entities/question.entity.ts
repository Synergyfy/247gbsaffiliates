import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Sector } from '../../sectors/entities/sector.entity';

export enum TargetingLevel {
  GLOBAL = 'global',
  SECTOR = 'sector',
  CATEGORY = 'category',
  SUB_CATEGORY = 'sub_category',
}

export enum TargetingType {
  ALL = 'all',
  INCLUDE = 'include',
  EXCLUDE = 'exclude',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column()
  type: string; // 'multiple_choice' | 'scenario'

  @Column('json')
  options: string[];

  @Column()
  correctOptionIndex: number;

  @Column({ default: 1 })
  weight: number;

  // Targeting Logic
  @Column({ type: 'enum', enum: TargetingLevel, default: TargetingLevel.GLOBAL })
  targetingLevel: TargetingLevel;

  @Column({ type: 'enum', enum: TargetingType, default: TargetingType.ALL })
  targetingType: TargetingType;

  // Linked Entities for Include/Exclude
  @ManyToMany(() => Sector)
  @JoinTable({ name: 'question_sectors' })
  sectors: Sector[];

  @ManyToMany(() => Category)
  @JoinTable({ name: 'question_categories' })
  categories: Category[];
}


