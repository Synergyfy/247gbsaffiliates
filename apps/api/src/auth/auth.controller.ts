import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Request,
  Response as ResParam,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
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
import { UsersService } from '../users/users.service';
import { setAuthCookie, clearAuthCookie } from './auth-cookie.util';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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
  async getProfile(@Request() req: { user: { userId?: string } }) {
    if (req.user?.userId) {
      return this.usersService.findOne(req.user.userId);
    }
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
  async adminLogin(
    @Request() req: { user: { role: UserRole } },
    @ResParam({ passthrough: true }) res: Response,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Local login is restricted to admins. Please sign in with Central Hub Solutions.',
      );
    }
    const result = await this.authService.login(req.user as never);
    setAuthCookie(res, result.access_token);
    return result;
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear HttpOnly auth cookie' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@ResParam({ passthrough: true }) res: Response) {
    clearAuthCookie(res);
    return { success: true };
  }
}
