import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Self-service profile update used by onboarding and the role profile screens.
 *
 * Every field is optional: the onboarding flow saves contact details first and
 * skills later (agents only). Nothing here may be mandatory for a non-agent
 * role, otherwise consultants and account managers get blocked by validation
 * before they can reach the assessment.
 */
export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiProperty({ required: false, description: 'UK postcode' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postcode?: string;

  @ApiProperty({
    required: false,
    description: 'Alias accepted from the verification form.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  profileImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  portfolioUrl?: string;

  @ApiProperty({ required: false, example: 'Europe/London' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  timezone?: string;

  @ApiProperty({ required: false, example: 'EUR' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description:
      'Optional on this endpoint. Agents still need at least one skill to be matched to work; consultants and account managers do not.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  skills?: string[];
}
