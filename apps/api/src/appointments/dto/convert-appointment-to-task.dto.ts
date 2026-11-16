import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConvertAppointmentToTaskDto {
  @ApiProperty({
    example: 'Deliver the Q1 acquisition campaign brief',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    required: false,
    description:
      'Task brief. Defaults to the appointment notes (or a generated summary).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ApiProperty({ example: 500, description: 'Fixed budget in EUR.' })
  @IsNumber()
  @Min(5)
  budget: number;

  @ApiProperty({
    example: 'uuid-agent-or-consultant',
    required: false,
    description: 'Affiliate to assign immediately.',
  })
  @IsOptional()
  @IsUUID()
  assignedAgentId?: string;

  @ApiProperty({ example: '2026-12-15T17:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiProperty({
    example: 'uuid-central-project',
    required: false,
    description:
      'Create the task inside this Central Hub project instead of leaving it as a local-only task.',
  })
  @IsOptional()
  @IsString()
  centralProjectId?: string;
}
