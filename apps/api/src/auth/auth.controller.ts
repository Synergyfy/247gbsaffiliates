import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Requires authentication. Returns the logged-in user profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: { example: { id: 'uuid', email: 'test@example.com', role: 'agent' } },
  })
  getProfile(@Request() req: { user: unknown }) {
    return req.user;
  }

  /**
   * Admin-only local login. All non-admin roles must use
   * Central Hub SSO (`GET /auth/sso/login`).
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Admin local login',
    description:
      'Email/password login restricted to admins. Other roles must use Central Hub SSO.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Admin authenticated' })
  @ApiResponse({ status: 403, description: 'Only admins may use local login' })
  async adminLogin(@Request() req: { user: { role: UserRole } }) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Local login is restricted to admins. Please sign in with Central Hub Solutions.',
      );
    }
    return this.authService.login(req.user as never);
  }
}
