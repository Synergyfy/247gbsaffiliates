import { Controller, Get, Query, Request, UseGuards, Post, Patch, Param, Body, ForbiddenException } from '@nestjs/common';
import { LearningService } from './learning.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';
import { UpdateLearningResourceDto } from './dto/update-learning-resource.dto';
import { UpdateLearningProgressDto } from './dto/update-learning-progress.dto';

@ApiTags('learning')
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @Get('progress/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the signed-in affiliate learning progress' })
  getMyProgress(@Request() req: any) {
    return this.learningService.getMyProgress(req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @Patch(':resourceId/progress')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the signed-in affiliate learning progress' })
  updateMyProgress(@Request() req: any, @Param('resourceId') resourceId: string, @Body() dto: UpdateLearningProgressDto) {
    if (!req.user?.userId) throw new ForbiddenException();
    return this.learningService.updateMyProgress(req.user.userId, req.user.role, resourceId, dto.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/resources')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all learning resources, including drafts (admin only)' })
  getAdminResources() {
    return this.learningService.getAdminResources();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/resources')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a learning resource (admin only)' })
  createAdminResource(@Body() dto: CreateLearningResourceDto) {
    return this.learningService.createAdminResource(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/resources/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update or publish a learning resource (admin only)' })
  updateAdminResource(@Param('id') id: string, @Body() dto: UpdateLearningResourceDto) {
    return this.learningService.updateAdminResource(id, dto);
  }

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
