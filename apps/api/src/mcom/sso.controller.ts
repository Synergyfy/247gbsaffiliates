import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { McomService } from './mcom.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  setOAuthStateCookie,
  getOAuthStateCookie,
  clearOAuthStateCookie,
  setReturnCookie,
  getReturnCookie,
  clearReturnCookie,
} from './oauth-state.util';
import { randomBytes } from 'crypto';

@ApiTags('auth/sso')
@Controller('auth/sso')
export class SsoController {
  constructor(
    private mcomService: McomService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ── Step 1: Generate CSRF state, return Central authorize URL ──

  @Public()
  @Get('login')
  @ApiOperation({ summary: 'Initiate MCOM OAuth login' })
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Query('card') card?: string,
    @Query('business') business?: string,
    @Query('redirect') redirect?: string,
  ) {
    const state = randomBytes(32).toString('hex');
    setOAuthStateCookie(res, state);

    if (card || business || redirect) {
      setReturnCookie(res, { card: card || '', business: business || '', redirect: redirect || '' });
    }

    const authorizeUrl = this.mcomService.getAuthorizeUrl(state);
    return res.redirect(authorizeUrl);
  }

  // ── Step 2: Handle OAuth callback (browser navigates here directly) ──

  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'Complete MCOM OAuth callback' })
  async callback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
  ) {
    const frontendUrl = this.config.get<string>('MCOM_REDIRECT_URI')?.replace('/auth/callback', '') || 'http://localhost:3011';

    if (error) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`);
    }

    const savedState = getOAuthStateCookie(req);
    clearOAuthStateCookie(res);

    if (!savedState || savedState !== state) {
      return res.redirect(`${frontendUrl}/login?error=sso_state_mismatch`);
    }

    try {
      const tokenResponse = await this.mcomService.exchangeCode(code);

      const hasAccess = tokenResponse.user?.permissions?.['canAccess_247gbs_affiliate_test'] === true;

      const user = await this.mcomService.jitProvision({
        sub: tokenResponse.user.id,
        email: tokenResponse.user.email,
        name: tokenResponse.user.name,
        role: tokenResponse.user.role,
        membership: {
          level: tokenResponse.user.membershipLevel,
          status: tokenResponse.user.membershipStatus,
        },
        permissions: tokenResponse.user.permissions,
      });

      await this.mcomService.storeTokens(
        user.id,
        tokenResponse.accessToken,
        tokenResponse.refreshToken,
      );

      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        isOnboarded: user.isOnboarded,
      };
      const localToken = this.jwtService.sign(payload);

      const returnData = getReturnCookie(req);
      clearReturnCookie(res);

      const role = user.role?.toLowerCase().replace('_', '-') || 'agent';
      const redirectUrl = returnData?.redirect || `${frontendUrl}/auth/callback?token=${localToken}&role=${role}`;
      return res.redirect(redirectUrl);
    } catch (err: any) {
      console.error('[SSO] Token exchange failed:', err.response?.data || err.message);
      return res.redirect(`${frontendUrl}/login?error=sso_exchange_failed`);
    }
  }

  // ── Refresh Central tokens ──

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh MCOM Central tokens' })
  async refresh(@Body('userId') userId: string) {
    const user = await this.mcomService['usersService'].findOne(userId);
    const tokens = this.mcomService.getDecryptedTokens(user);

    if (!tokens.refreshToken) {
      throw new UnauthorizedException('No refresh token available');
    }

    const refreshed = await this.mcomService.refreshTokens(tokens.refreshToken);

    await this.mcomService.storeTokens(
      user.id,
      refreshed.accessToken,
      refreshed.refreshToken,
    );

    // Sync profile
    const centralUser = await this.mcomService.getUserInfo(refreshed.accessToken);
    await this.mcomService.jitProvision({
      sub: centralUser.id,
      email: centralUser.email,
      name: centralUser.name,
      role: centralUser.role,
      membership: {
        level: centralUser.membershipLevel,
        status: centralUser.membershipStatus,
      },
      permissions: centralUser.permissions,
    });

    return { success: true };
  }

  // ── Current access status ──

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Get MCOM SSO access status' })
  async status(@Query('userId') userId: string, @Query('sync') sync?: string) {
    const user = await this.mcomService['usersService'].findOne(userId);

    if (sync === '1' && user.mcomAccessToken) {
      const tokens = this.mcomService.getDecryptedTokens(user);
      if (tokens.accessToken) {
        try {
          const centralUser = await this.mcomService.getUserInfo(tokens.accessToken);
          await this.mcomService.jitProvision({
            sub: centralUser.id,
            email: centralUser.email,
            name: centralUser.name,
            role: centralUser.role,
            membership: {
              level: centralUser.membershipLevel,
              status: centralUser.membershipStatus,
            },
            permissions: centralUser.permissions,
          });
        } catch {
          // Token may be expired, try refresh
          if (tokens.refreshToken) {
            try {
              const refreshed = await this.mcomService.refreshTokens(tokens.refreshToken);
              await this.mcomService.storeTokens(
                user.id,
                refreshed.accessToken,
                refreshed.refreshToken,
              );
            } catch {
              // Refresh failed
            }
          }
        }
      }
    }

    const updated = await this.mcomService['usersService'].findOne(userId);
    return {
      connected: !!updated.mcomUserId,
      mcomUserId: updated.mcomUserId,
      membership: {
        level: updated.mcomMembershipLevel,
        tier: updated.mcomMembershipTier,
        status: updated.mcomMembershipStatus,
        canAccessVcard: updated.mcomCanAccessVcard,
      },
    };
  }

  // ── Public config ──

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Get MCOM SSO public config' })
  getConfig() {
    const solutionsUrl = this.config.get<string>('MCOM_SOLUTIONS_URL');
    const clientId = this.config.get<string>('MCOM_CLIENT_ID');
    const redirectUri = this.config.get<string>('MCOM_REDIRECT_URI');

    return {
      membershipUrl: this.config.get<string>('MCOM_MEMBERSHIP_URL'),
      walletEnabled: this.config.get<string>('MCOM_WALLET_ENABLED') === 'true',
      configured: !!(solutionsUrl && clientId),
    };
  }

  // ── HMAC-signed permissions ──

  @Public()
  @Get('data/permissions')
  @ApiOperation({ summary: 'Fetch permissions from MCOM Central' })
  async permissions(@Query('userId') userId: string) {
    const user = await this.mcomService['usersService'].findOne(userId);
    if (!user.mcomUserId) {
      throw new UnauthorizedException('Not connected to MCOM Central');
    }
    return this.mcomService.fetchPermissions(user.mcomUserId);
  }
}
