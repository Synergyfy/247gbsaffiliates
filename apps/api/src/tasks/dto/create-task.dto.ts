import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskType } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ example: 'Fix SEO issues on landing page' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Analyze the homepage and fix meta tags, alt attributes, and broken links.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Min(5)
  budget: number;

  @ApiProperty({ enum: TaskType, default: TaskType.ONE_TIME })
  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @ApiProperty({ example: ['SEO', 'HTML'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredSkills?: string[];

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
