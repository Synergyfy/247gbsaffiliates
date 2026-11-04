import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { UsersService } from './users.service';

/**
 * Backend-to-backend directory endpoints. Secured by the shared internal API
 * key (Central Hub sends `x-api-key`). Not exposed as a user-facing API.
 */
@ApiTags('internal')
@Controller('internal')
export class InternalDirectoryController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @UseGuards(ApiKeyGuard)
  @Get('affiliates')
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiOperation({ summary: 'List active affiliates with skills (Central Hub only)' })
  async affiliates(@Query('skill') _skill?: string) {
    const users = await this.usersService.listAffiliateDirectory();
    return { success: true, data: users };
  }
}
