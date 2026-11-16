import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 'uuid-consultant',
    required: false,
    description:
      'Consultant who will run the session. Defaults to the signed-in consultant; mandatory when an account manager or admin schedules on their behalf.',
  })
  @IsOptional()
  @IsUUID()
  consultantId?: string;

  @ApiProperty({ example: 'uuid-central-business' })
  @IsUUID()
  clientBusinessId: string;

  @ApiProperty({ example: 'Quarterly growth strategy review' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Review Q1 acquisition results and agree the next campaign brief.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiProperty({ example: '2026-12-01T10:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ example: 60, required: false, default: 60 })
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
}
