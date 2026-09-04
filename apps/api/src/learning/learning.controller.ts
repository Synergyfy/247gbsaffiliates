import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { LearningService } from './learning.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('learning')
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get learning resources', description: 'Returns learning resources, optionally filtered by role and category' })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of learning resources' })
  async getResources(
    @Query('role') role?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.userId;
    return this.learningService.getResources({ role, category, search, userId });
  }
}