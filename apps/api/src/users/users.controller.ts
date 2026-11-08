import { Controller, Get, Patch, Body, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserRole } from './entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('directory')
  @ApiOperation({ summary: 'Public affiliate directory of verified members' })
  @ApiResponse({ status: 200, description: 'Verified agents, account managers and consultants' })
  async directory(
    @Query('postcode') postcode?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('radius') radius?: string,
  ) {
    return this.usersService.findPublicDirectory({
      postcode,
      role,
      search,
      limit: Number(limit) || undefined,
      radiusMiles: radius !== undefined && radius !== '' ? Number(radius) : undefined,
    });
  }

  @Public()
  @Get('postal-code-lookup')
  @ApiOperation({ summary: 'Resolve a UK postal code using the CHS Nominatim lookup approach' })
  @ApiResponse({ status: 200, description: 'Resolved location or found=false when no match exists' })
  async lookupPostalCode(@Query('postcode') postcode: string) {
    return this.usersService.lookupPostalCode(postcode || '');
  }

  @Get('agents')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ACCOUNT_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get list of agents', description: 'Returns agents for account manager/admin dashboard' })
  @ApiResponse({ status: 200, description: 'List of agents' })
  async getAgents() {
    return this.usersService.getAgents();
  }

  @Patch('skills')
  @ApiOperation({ summary: 'Update user skills', description: 'Updates the skills for the authenticated user and checks for onboarding completion.' })
  @ApiBody({ schema: { type: 'object', properties: { skills: { type: 'array', items: { type: 'string' } } } } })
  @ApiResponse({ status: 200, description: 'Skills updated', schema: { example: { id: 'uuid', skills: ['SEO', 'Marketing'], isOnboarded: true } } })
  async updateSkills(@Request() req, @Body() body: { skills: string[] }) {
    return this.usersService.updateSkills(req.user.userId, body.skills);
  }

  @Patch('complete-onboarding')
  @ApiOperation({ summary: 'Complete onboarding', description: 'Marks onboarding as completed for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Onboarding completed' })
  async completeOnboarding(@Request() req) {
    return this.usersService.completeOnboarding(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update contact details for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @Request() req,
    @Body() body: { phone?: string; postcode?: string; city?: string; region?: string; country?: string },
  ) {
    return this.usersService.update(req.user.userId, body);
  }
}
