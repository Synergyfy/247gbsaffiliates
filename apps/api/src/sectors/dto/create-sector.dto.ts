import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectorDto {
  @ApiProperty({ example: 'Technology' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Software, Hardware, and IT Services', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}