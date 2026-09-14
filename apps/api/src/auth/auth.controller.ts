import { Controller, Get, Request } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile', description: 'Requires authentication. Returns the logged-in user profile.' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', schema: { example: { id: 'uuid', email: 'test@example.com', role: 'agent' } } })
  getProfile(@Request() req) {
    return req.user;
  }
}
