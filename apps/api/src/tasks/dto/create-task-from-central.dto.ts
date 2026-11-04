import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OriginSystem } from '../entities/task.entity';

export class CreateTaskFromCentralDto {
  @ApiProperty({ example: 'uuid-external-task', description: 'Task ID from mcom_central' })
  @IsString()
  @IsNotEmpty()
  externalTaskId: string;

  @ApiProperty({ enum: OriginSystem, example: OriginSystem.MCOM_CENTRAL, description: 'Source system' })
  @IsEnum(OriginSystem)
  @IsNotEmpty()
  originSystem: OriginSystem;

  @ApiProperty({ example: 'uuid-requester', description: 'ID of the requester in the origin system' })
  @IsString()
  @IsNotEmpty()
  originRequesterId: string;

  @ApiPropertyOptional({ example: 'PRODUCT_CREATION', description: 'Specific type code of the task' })
  @IsString()
  @IsOptional()
  taskType?: string;

  @ApiProperty({ example: '[Mall] Bulk Upload Help', description: 'Title of the task' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'I need help uploading...', description: 'Full task description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Global Retailers Ltd', description: 'Originating business name' })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ type: [String], example: ['mall', 'rewards'], description: 'Platform tags' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  platforms?: string[];

  @ApiPropertyOptional({ example: '2026-12-01T17:00:00.000Z', description: 'ISO deadline' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'agent@example.com', description: 'Email of the affiliate to assign' })
  @IsString()
  @IsOptional()
  assignedAgentEmail?: string;

  @ApiPropertyOptional({ example: 'Ada Agent', description: 'Display name of the assignee' })
  @IsString()
  @IsOptional()
  assignedAgentName?: string;

  @ApiPropertyOptional({ description: 'Opaque metadata from the origin system' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
