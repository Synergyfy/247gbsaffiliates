import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '../entities/appointment.entity';

export class FindAppointmentsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ required: false, enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({
    required: false,
    description: 'Only appointments from this date/time (inclusive).',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({
    required: false,
    description: 'Only appointments up to this date/time (inclusive).',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiProperty({
    required: false,
    description: 'Account managers and admins can filter by consultant.',
  })
  @IsOptional()
  @IsUUID()
  consultantId?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by the Central Hub client business.',
  })
  @IsOptional()
  @IsUUID()
  clientBusinessId?: string;
}
