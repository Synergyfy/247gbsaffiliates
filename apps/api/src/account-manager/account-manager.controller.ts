import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
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

  @Get('agents')
  @ApiOperation({
    summary: 'Agents for this account manager',
    description:
      'Default scope returns the roster already working on this manager’s work. Use ?scope=delegatable to list qualified agents and consultants with a live Central Hub link, skills and current workload.',
  })
  async getManagedAgents(@Request() req, @Query('scope') scope?: string) {
    if (scope === 'delegatable') {
      return this.accountManagerService.getDelegatableAgents(req.user.userId);
    }
    return this.accountManagerService.getManagedAgents(req.user.userId);
  }

  @Get('businesses')
  @ApiOperation({ summary: 'List businesses assigned to the signed-in account manager' })
  @ApiResponse({ status: 200, description: 'Assigned businesses from Central Hub' })
  async getAssignedBusinesses(@Request() req) {
    return this.accountManagerService.getAssignedBusinesses(req.user.userId);
  }

  @Get('managed-tasks')
  @ApiOperation({ summary: 'Tasks across the businesses this account manager coordinates' })
  async managedTasks(@Request() req, @Query() query: Record<string, unknown>) {
    return this.accountManagerService.getManagedTasks(req.user.userId, query);
  }

  @Get('managed-tasks/:id')
  @ApiOperation({ summary: 'Get a managed task with review history and audit events' })
  async managedTask(@Request() req, @Param('id') id: string) {
    return this.accountManagerService.getManagedTask(req.user.userId, id);
  }

  @Post('managed-tasks/:id/review')
  @ApiOperation({ summary: 'Check a submission and forward it to the business or request changes' })
  async reviewManagedTask(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVED' | 'CHANGES_REQUESTED'; notes?: string },
  ) {
    return this.accountManagerService.reviewManagedTask(req.user.userId, id, body);
  }

  @Post('managed-tasks/:id/assign')
  @ApiOperation({ summary: 'Assign a managed task to an agent or consultant' })
  async assignManagedTask(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { assigneeUserId: string; note?: string },
  ) {
    return this.accountManagerService.assignManagedTask(req.user.userId, id, body);
  }

  @Get('managed-requests')
  @ApiOperation({ summary: 'Service requests for this manager’s businesses' })
  async managedRequests(@Request() req, @Query() query: Record<string, unknown>) {
    return this.accountManagerService.getManagedRequests(req.user.userId, query);
  }

  @Post('managed-requests/:id/clarify')
  @ApiOperation({ summary: 'Ask the business for missing information' })
  async clarifyManagedRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { note: string },
  ) {
    return this.accountManagerService.clarifyManagedRequest(
      req.user.userId,
      id,
      body.note,
    );
  }

  @Post('managed-requests/:id/quote')
  @ApiOperation({ summary: 'Set the price the business must approve before chargeable work' })
  async quoteManagedRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { estimatedCostPence: number; currency?: string; notes?: string },
  ) {
    return this.accountManagerService.quoteManagedRequest(req.user.userId, id, body);
  }

  @Post('managed-requests/:id/convert')
  @ApiOperation({ summary: 'Convert a clarified request into a project/service plan' })
  async convertManagedRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.accountManagerService.convertManagedRequest(req.user.userId, id, body);
  }

  @Get('managed-projects')
  @ApiOperation({ summary: 'Projects coordinated by this account manager' })
  async managedProjects(@Request() req, @Query() query: Record<string, unknown>) {
    return this.accountManagerService.getManagedProjects(req.user.userId, query);
  }

  @Post('managed-projects/:id/close')
  @ApiOperation({ summary: 'Close a project with an outcome summary and follow-up notes' })
  async closeManagedProject(
    @Request() req,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.accountManagerService.closeManagedProject(req.user.userId, id, body);
  }

  @Post('managed-projects/:id/tasks')
  @ApiOperation({
    summary: 'Create a task inside a managed project',
    description:
      'Creates the task in Central Hub under the project and syncs it back to the affiliate task board.',
  })
  async createManagedProjectTask(
    @Request() req,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.accountManagerService.createManagedProjectTask(
      req.user.userId,
      id,
      body,
    );
  }
}