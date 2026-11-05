import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { TargetingLevel, TargetingType } from '../entities/question.entity';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  text?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsNumber()
  correctOptionIndex?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsEnum(TargetingLevel)
  targetingLevel?: TargetingLevel;

  @IsOptional()
  @IsEnum(TargetingType)
  targetingType?: TargetingType;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sectorIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
