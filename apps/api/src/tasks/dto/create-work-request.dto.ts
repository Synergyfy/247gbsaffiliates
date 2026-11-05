import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Public enterprise work request submitted from the Find Affiliates page.
 * The selected affiliate is matched by local user id (preferred) or email;
 * without one the request lands in the open task pool for an administrator
 * to route.
 */
export class CreateWorkRequestDto {
  @ApiProperty({ example: '[Enterprise Request] Acme Ltd - Jane Doe' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Client: Jane Doe\nCompany: Acme Ltd\nProject scope: ...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(5)
  budget: number;

  @ApiProperty({ example: 'GBP', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 'uuid-of-affiliate', required: false })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ example: 'agent@example.com', required: false })
  @IsEmail()
  @IsOptional()
  assigneeEmail?: string;
}
