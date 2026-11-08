import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ProspectStatus } from '../entities/business-prospect.entity';

export class CreateBusinessProspectDto {
  @IsString()
  @MinLength(1)
  businessName: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  postcode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  contactDate?: string;

  @IsOptional()
  @IsEnum(ProspectStatus)
  status?: ProspectStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBusinessProspectDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  postcode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  contactDate?: string;

  @IsOptional()
  @IsEnum(ProspectStatus)
  status?: ProspectStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConfirmBusinessAssociationDto {
  @IsOptional()
  @IsString()
  centralBusinessId?: string;

  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  evidence?: string;
}

export class UpdateBusinessAcquisitionSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  targetCount?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appliesToRoles?: string[];

  @IsOptional()
  @IsBoolean()
  requireVerification?: boolean;
}

export class CentralAcquisitionEventDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  invitationToken?: string | null;

  @IsOptional()
  @IsString()
  prospectExternalId?: string | null;

  @IsOptional()
  @IsString()
  businessId?: string | null;

  @IsOptional()
  @IsString()
  businessName?: string | null;

  @IsOptional()
  @IsString()
  userId?: string | null;

  @IsOptional()
  @IsString()
  status?: string | null;

  @IsOptional()
  @IsString()
  occurredAt?: string | null;

  @IsOptional()
  @IsString()
  claimId?: string | null;

  /** Conversion payload (paid membership / access pass / trial). */
  @IsOptional()
  @IsString()
  conversionType?: string | null;

  @IsOptional()
  @IsString()
  planName?: string | null;

  @IsOptional()
  @IsNumber()
  amount?: number | null;

  @IsOptional()
  @IsString()
  currency?: string | null;

  @IsOptional()
  @IsString()
  provider?: string | null;

  @IsOptional()
  @IsString()
  paymentReference?: string | null;
}
