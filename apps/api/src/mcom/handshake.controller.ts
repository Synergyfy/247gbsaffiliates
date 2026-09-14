import {
  Controller,
  Get,
  Logger,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { McomService } from './mcom.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth/sso')
@Controller()
export class HandshakeController {
  private readonly logger = new Logger(HandshakeController.name);

  constructor(
    private readonly mcomService: McomService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Direct dashboard handshake: Central redirects with a
  // shared-secret JWT (?token=). JIT-provision, issue local JWT,
  // redirect to the web app. No plan gating. ──

  @Public()
  @Get('auth/sso-login')
  @ApiOperation({ summary: 'Direct dashboard handshake from Central Hub' })
  async ssoLogin(
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = (
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:7089'
    ).replace(/\/$/, '');

    if (!token) {
      res.redirect(`${frontendUrl}/login?error=sso_missing_token`);
      return;
    }

    try {
      const payload = this.mcomService.verifyHandshakeJwt(token);

      if (!payload.email) {
        throw new Error('Handshake JWT missing email');
      }

      const name =
        payload.name ??
        `${payload.firstName ?? ''} ${payload.lastName ?? ''}`.trim();

      const user = await this.mcomService.jitProvision({
        sub: payload.sub || payload.email,
        email: payload.email.toLowerCase(),
        name: name || payload.email,
        role: payload.role,
        membership: payload.membership,
        permissions: payload.permissions,
      });

      const localToken = this.jwtService.sign({
        email: user.email,
        sub: user.id,
        role: user.role,
        isOnboarded: user.isOnboarded,
      });

      const role = (user.role ?? 'agent').toLowerCase().replace('_', '-');
      res.redirect(
        `${frontendUrl}/auth/callback?token=${encodeURIComponent(localToken)}&role=${encodeURIComponent(role)}`,
      );
    } catch (err) {
      this.logger.warn(`Handshake verification failed: ${err}`);
      res.redirect(`${frontendUrl}/login?error=sso_invalid_token`);
    }
  }
}
