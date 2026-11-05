import { Controller, Get, Patch, Param, Body, Request, UseGuards, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, UserStatus, VerificationStatus } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get admin dashboard stats', description: 'Returns platform statistics for admin dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users', description: 'Admin only. Returns paginated list of users with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'verificationStatus', required: false, enum: VerificationStatus })
  @ApiQuery({ name: 'isOnboarded', required: false, type: Boolean })
  @ApiQuery({ name: 'isQuizPassed', required: false, type: Boolean })
  @ApiQuery({ name: 'qualification', required: false, enum: ['qualified', 'incomplete'] })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
    @Query('search') search?: string,
    @Query('verificationStatus') verificationStatus?: VerificationStatus,
    @Query('isOnboarded') isOnboarded?: string,
    @Query('isQuizPassed') isQuizPassed?: string,
    @Query('qualification') qualification?: 'qualified' | 'incomplete',
  ) {
    return this.adminService.getUsers({
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(100, Math.max(1, Number(limit) || 20)),
      role,
      status,
      search,
      verificationStatus,
      isOnboarded: isOnboarded === undefined ? undefined : isOnboarded === 'true',
      isQuizPassed: isQuizPassed === undefined ? undefined : isQuizPassed === 'true',
      qualification,
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get an affiliate profile, assessment history and qualification progress' })
  async getAffiliateDetails(@Param('id') id: string) {
    return this.adminService.getAffiliateDetails(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status', description: 'Admin only. Updates user status (active, pending, suspended)' })
  @ApiResponse({ status: 200, description: 'User status updated' })
  async updateUserStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Get('verifications')
  @ApiOperation({ summary: 'List affiliate accounts awaiting verification or needing resubmission' })
  @ApiResponse({ status: 200, description: 'Verification queue with submitted profile details and document metadata' })
  async getVerificationQueue() {
    return this.adminService.getVerificationQueue();
  }

  @Get('verifications/:id/document')
  @ApiOperation({ summary: 'View an affiliate identity document (admin only)' })
  @ApiResponse({ status: 200, description: 'Identity document bytes' })
  async getVerificationDocument(@Param('id') id: string, @Res() response: Response) {
    const document = await this.adminService.getVerificationDocument(id);
    const safeName = document.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    response.setHeader('Content-Type', document.mimeType);
    response.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.status(200).send(document.data);
  }

  @Patch('users/:id/verification')
  @ApiOperation({ summary: 'Approve or reject affiliate account verification' })
  @ApiResponse({ status: 200, description: 'Verification decision saved' })
  async reviewVerification(
    @Param('id') id: string,
    @Body() body: { status: VerificationStatus; notes?: string },
  ) {
    return this.adminService.reviewVerification(id, body.status, body.notes);
  }
}
