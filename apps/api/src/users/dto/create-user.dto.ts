import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: 'uuid-sector', required: false })
  @IsUUID()
  @IsOptional()
  sectorId?: string;

  @ApiProperty({ example: 'uuid-category', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 'uuid-subcategory', required: false })
  @IsUUID()
  @IsOptional()
  subCategoryId?: string;
}
