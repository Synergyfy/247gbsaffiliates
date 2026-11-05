import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskAttachmentInput {
  @ApiProperty({ example: 'https://cdn.example.com/proof.png' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'proof.png' })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional({ example: 'image/png' })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({ example: 'IMAGE' })
  @IsString()
  @IsOptional()
  kind?: string;
}

export class SubmitTaskDto {
  @ApiPropertyOptional({ description: 'Free-form structured submission (notes, links, measurements…)' })
  @IsObject()
  @IsOptional()
  submissionData?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'Uploaded the first 20 products.' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({ type: [String], example: ['https://store.example.com/widget'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  links?: string[];

  @ApiPropertyOptional({ type: [TaskAttachmentInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskAttachmentInput)
  @IsOptional()
  attachments?: TaskAttachmentInput[];
}

export class CentralStatusUpdateDto {
  @ApiPropertyOptional({
    description: 'Central task status (assigned, accepted, pending_business_approval, completed, cancelled…)',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Set false once the business approves a chargeable task.' })
  @IsOptional()
  @IsBoolean()
  chargeApprovalRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class ReviewCallbackDto {
  @ApiProperty({ enum: ['APPROVED', 'CHANGES_REQUESTED'] })
  @IsEnum({ APPROVED: 'APPROVED', CHANGES_REQUESTED: 'CHANGES_REQUESTED' })
  decision: 'APPROVED' | 'CHANGES_REQUESTED';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  round?: number;

  @ApiPropertyOptional({ example: 'approved' })
  @IsString()
  @IsOptional()
  status?: string;
}
