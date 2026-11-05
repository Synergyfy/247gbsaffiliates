import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Project this task belongs to' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Human-readable project name' })
  @IsString()
  @IsOptional()
  projectName?: string;

  @ApiPropertyOptional({ enum: ['internal', 'external'], description: 'Internal platform task or external professional task' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredSkills?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Agreed deliverables' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deliverables?: string[];

  @ApiPropertyOptional({ description: 'Materials/information supplied by the business' })
  @IsString()
  @IsOptional()
  materials?: string;

  @ApiPropertyOptional({ description: 'Another Central task that must be completed first' })
  @IsString()
  @IsOptional()
  prerequisiteExternalTaskId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  compensationModel?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  compensationAmount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  compensationCurrency?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  billableToBusiness?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  businessChargeAmount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  businessChargeCurrency?: string;

  @ApiPropertyOptional({ description: 'Affiliate must not begin chargeable work until approved' })
  @IsBoolean()
  @IsOptional()
  chargeApprovalRequired?: boolean;

  @ApiPropertyOptional({ description: 'Opaque metadata from the origin system' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
