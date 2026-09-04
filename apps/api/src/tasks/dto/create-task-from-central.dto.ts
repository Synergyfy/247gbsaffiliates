import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OriginSystem } from '../entities/task.entity';

export class CreateTaskFromCentralDto {
  @ApiProperty({ example: 'uuid-external-task', description: 'Task ID from mcom_central' })
  @IsString()
  @IsNotEmpty()
  externalTaskId: string;

  @ApiProperty({ enum: OriginSystem, example: OriginSystem.MCOM_MALL, description: 'Source system' })
  @IsEnum(OriginSystem)
  @IsNotEmpty()
  originSystem: OriginSystem;

  @ApiProperty({ example: 'uuid-requester', description: 'ID of the requester in the origin system' })
  @IsString()
  @IsNotEmpty()
  originRequesterId: string;

  @ApiProperty({ example: 'PRODUCT_CREATION', required: false, description: 'Specific type code of the task' })
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
}
