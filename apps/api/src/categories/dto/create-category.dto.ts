import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Marketing' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'All marketing related tasks', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid-parent-category', required: false })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}