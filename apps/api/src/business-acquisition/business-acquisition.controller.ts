import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { BusinessAcquisitionService } from './business-acquisition.service';
import {
  ConfirmBusinessAssociationDto,
  CreateBusinessProspectDto,
  UpdateBusinessAcquisitionSettingsDto,
  UpdateBusinessProspectDto,
} from './dto/business-acquisition.dto';
import { ProspectStatus } from './entities/business-prospect.entity';

@ApiTags('business-acquisition')
@ApiBearerAuth()
@Controller('business-acquisition')
@UseGuards(RolesGuard)
export class BusinessAcquisitionController {
  constructor(private readonly acquisition: BusinessAcquisitionService) {}

  @Get('summary')
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @ApiOperation({ summary: 'Acquisition counts, target and progress for the signed-in affiliate' })
  async summary(@Request() req) {
    return {
      success: true,
      data: await this.acquisition.getSummaryForUser(req.user.userId),
    };
  }

  @Get('prospects')
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @ApiOperation({ summary: 'My business prospects with acquisition summary' })
  async list(
    @Request() req,
    @Query('status') status?: ProspectStatus,
    @Query('search') search?: string,
  ) {
    return {
      success: true,
      data: await this.acquisition.listProspects(req.user.userId, { status, search }),
    };
  }

  @Post('prospects')
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @ApiOperation({ summary: 'Record a business approached in the local community' })
  async create(@Request() req, @Body() dto: CreateBusinessProspectDto) {
    return { success: true, data: await this.acquisition.createProspect(req.user.userId, dto) };
  }

  @Get('prospects/:id')
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @ApiOperation({ summary: 'A prospect with its relationship history' })
  async get(@Request() req, @Param('id') id: string) {
    return { success: true, data: await this.acquisition.getProspect(id, req.user.userId) };
  }

  @Patch('prospects/:id')
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @ApiOperation({ summary: 'Update outreach details or contact status' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessProspectDto,
  ) {
    return {
      success: true,
      data: await this.acquisition.updateProspect(id, req.user.userId, dto),
    };
  }

  @Post('prospects/:id/invitation')
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @ApiOperation({ summary: 'Create the tracked CHS invitation link for a prospect' })
  async invite(@Request() req, @Param('id') id: string) {
    return {
      success: true,
      data: await this.acquisition.generateInvitation(id, req.user.userId),
    };
  }

  @Post('prospects/:id/confirm')
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @ApiOperation({
    summary: 'Claim a business that registered directly; requires Central Hub verification',
  })
  async confirm(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ConfirmBusinessAssociationDto,
  ) {
    return {
      success: true,
      data: await this.acquisition.confirmAssociation(id, req.user.userId, dto),
    };
  }

  @Get('acquired')
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @ApiOperation({ summary: 'Businesses attributed to me in Central Hub' })
  async acquired(@Request() req) {
    return {
      success: true,
      data: await this.acquisition.getCentralBusinesses(req.user.userId),
    };
  }

  @Get('assignments')
  @Roles(UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @ApiOperation({ summary: 'Businesses for which I have active Central Hub work assignments' })
  async assignments(@Request() req) {
    return {
      success: true,
      data: await this.acquisition.getBusinessAssignments(req.user.userId),
    };
  }

  // ── Admin oversight ─────────────────────────────────────────────────

  @Get('admin/prospects')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'All business prospects and acquisition progress (admin)' })
  async adminList(
    @Query('status') status?: ProspectStatus,
    @Query('search') search?: string,
  ) {
    return {
      success: true,
      data: await this.acquisition.adminList({ status, search }),
    };
  }

  @Get('admin/settings')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Business acquisition target and deadline configuration' })
  async settings() {
    return { success: true, data: await this.acquisition.getSettings() };
  }

  @Patch('admin/settings')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update the configurable 20-business acquisition task' })
  async updateSettings(
    @Request() req,
    @Body() dto: UpdateBusinessAcquisitionSettingsDto,
  ) {
    return {
      success: true,
      data: await this.acquisition.updateSettings(req.user.userId, dto),
    };
  }

  @Post('admin/prospects/:id/verify')
  @Roles(UserRole.ADMIN)
  @ApiHeader({ name: 'x-api-key', required: false })
  @ApiOperation({
    summary: 'Verify or reject an acquisition; the change is written back to Central Hub',
  })
  async verify(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { decision: 'VERIFIED' | 'REJECTED'; notes?: string },
  ) {
    return {
      success: true,
      data: await this.acquisition.adminVerifyProspect(
        id,
        req.user.userId,
        body.decision,
        body.notes,
      ),
    };
  }
}
