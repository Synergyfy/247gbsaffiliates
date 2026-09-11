import { Controller, Get, Query, Res, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { McomService } from './mcom.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth/sso')
@Controller()
export class HandshakeController {
  constructor(
    private mcomService: McomService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ── Direct Dashboard Handshake: Central redirects with JWT ──

  @Public()
  @Get('auth/sso-login')
  @ApiOperation({ summary: 'Direct Dashboard Handshake from MCOM Central' })
  async ssoLogin(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    if (!token) {
      return res.redirect('/login?error=sso_missing_token');
    }

    try {
      // Verify shared-secret JWT
      const payload = this.mcomService.verifyHandshakeJwt(token);

      // JIT-provision user
      const centralUser = {
        sub: payload.sub || payload.email,
        email: payload.email,
        name: payload.name || `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
        role: payload.role,
        membership: payload.membership || undefined,
        permissions: payload.permissions || undefined,
      };
      const user = await this.mcomService.jitProvision(centralUser);

      // Issue local session JWT
      const localPayload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        isOnboarded: user.isOnboarded,
      };
      const localToken = this.jwtService.sign(localPayload);

      // Redirect to frontend with token
      const frontendUrl = this.config.get<string>('MCOM_REDIRECT_URI')?.replace('/auth/callback', '') || 'http://localhost:3011';
      return res.redirect(`${frontendUrl}/auth/callback?token=${localToken}&role=${user.role}`);
    } catch (err) {
      return res.redirect('/login?error=sso_invalid_token');
    }
  }
}
