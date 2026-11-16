import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../entities/appointment.entity';

export class UpdateAppointmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiProperty({ required: false, example: '2026-12-02T14:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({ required: false, example: 30 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes?: number;

  @ApiProperty({
    example: 'https://meet.google.com/abc-defg-hij',
    required: false,
  })
  @IsOptional()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false,
    },
    { message: 'meetingUrl must be a valid http(s) meeting link.' },
  )
  @MaxLength(2048)
  meetingUrl?: string;

  @ApiProperty({
    required: false,
    enum: AppointmentStatus,
    example: AppointmentStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
