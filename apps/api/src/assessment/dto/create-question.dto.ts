import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TargetingLevel, TargetingType } from '../entities/question.entity';

export class CreateQuestionDto {
  @ApiProperty({ example: 'What is SEO?' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: 'multiple_choice' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: ['Search Engine Optimization', 'Social Engine Option'] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ example: 0 })
  @IsNumber()
  correctOptionIndex: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ enum: TargetingLevel, example: TargetingLevel.GLOBAL })
  @IsEnum(TargetingLevel)
  @IsOptional()
  targetingLevel?: TargetingLevel;

  @ApiProperty({ enum: TargetingType, example: TargetingType.ALL })
  @IsEnum(TargetingType)
  @IsOptional()
  targetingType?: TargetingType;

  @ApiProperty({ example: ['uuid-sector-1'], required: false })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  sectorIds?: string[];

  @ApiProperty({ example: ['uuid-cat-1'], required: false })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];
}

