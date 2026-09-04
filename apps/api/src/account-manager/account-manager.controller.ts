import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AccountManagerService } from './account-manager.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('account-manager')
@Controller('account-manager')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ACCOUNT_MANAGER, UserRole.ADMIN)
export class AccountManagerController {
  constructor(private readonly accountManagerService: AccountManagerService) {}

  @Get('dashboard/revenue')
  @ApiOperation({ summary: 'Get account manager revenue dashboard', description: 'Returns revenue stats for account manager' })
  @ApiResponse({ status: 200, description: 'Revenue data' })
  async getRevenueDashboard(@Request() req) {
    return this.accountManagerService.getRevenueDashboard(req.user.userId);
  }
}