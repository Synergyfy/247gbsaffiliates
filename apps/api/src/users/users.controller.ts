import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserRole } from './entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}