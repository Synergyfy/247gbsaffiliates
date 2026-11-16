import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min, IsArray, IsDateString } from 'class-validator';
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

  @ApiProperty({ example: 'https://adsmanager.facebook.com/', required: false, description: 'Where the affiliate should carry out the task' })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
  executionUrl?: string;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Min(5)
  budget: number;

  @ApiProperty({ example: 'EUR', required: false, default: 'EUR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ enum: TaskType, default: TaskType.ONE_TIME })
  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @ApiProperty({ example: ['SEO', 'HTML'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredSkills?: string[];

  @ApiProperty({
    example: 'uuid-agent',
    required: false,
    description: 'Optional affiliate (agent, account manager or consultant) to assign immediately.',
  })
  @IsString()
  @IsOptional()
  assignedAgentId?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    example: 'clx123project',
    required: false,
    description:
      'Central Hub project to create this task under. When set by an Account Manager, the task is created in Central Hub and linked to that project instead of staying local-only.',
  })
  @IsString()
  @IsOptional()
  centralProjectId?: string;

  @ApiProperty({
    example: 'uuid-central-business',
    required: false,
    description:
      'Central Hub business this work belongs to. Set by server-side flows (for example converting a consultancy appointment) to keep the affiliate task linked to the client business.',
  })
  @IsString()
  @IsOptional()
  centralBusinessId?: string;
}
