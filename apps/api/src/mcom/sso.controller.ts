import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Body,
  UseGuards,
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

  // ── Step 2: Handle OAuth callback ──

  @Public()
  @Post('callback')
  @ApiOperation({ summary: 'Complete MCOM OAuth callback' })
  async callback(
    @Req() req: Request,
    @Res() res: Response,
    @Body('code') code: string,
    @Body('state') state: string,
  ) {
    const savedState = getOAuthStateCookie(req);
    clearOAuthStateCookie(res);

    if (!savedState || savedState !== state) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }

    // Exchange code for tokens
    const tokens = await this.mcomService.exchangeCode(code);

    // Fetch user profile from Central
    const centralUser = await this.mcomService.getUserInfo(tokens.access_token);

    // JIT-provision or update user
    const user = await this.mcomService.jitProvision(centralUser);

    // Encrypt and store Central tokens
    await this.mcomService.storeTokens(
      user.id,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in,
    );

    // Issue local session JWT
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      isOnboarded: user.isOnboarded,
    };
    const localToken = this.jwtService.sign(payload);

    // Get return context (card, business, redirect)
    const returnData = getReturnCookie(req);
    clearReturnCookie(res);

    return res.json({
      token: localToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isOnboarded: user.isOnboarded,
      },
      return_to: returnData?.redirect || null,
    });
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
      refreshed.access_token,
      refreshed.refresh_token,
      refreshed.expires_in,
    );

    // Sync profile
    const centralUser = await this.mcomService.getUserInfo(refreshed.access_token);
    await this.mcomService.jitProvision(centralUser);

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
          await this.mcomService.jitProvision(centralUser);
        } catch {
          // Token may be expired, try refresh
          if (tokens.refreshToken) {
            try {
              const refreshed = await this.mcomService.refreshTokens(tokens.refreshToken);
              await this.mcomService.storeTokens(
                user.id,
                refreshed.access_token,
                refreshed.refresh_token,
                refreshed.expires_in,
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
    return {
      membershipUrl: this.config.get<string>('MCOM_MEMBERSHIP_URL'),
      walletEnabled: this.config.get<string>('MCOM_WALLET_ENABLED') === 'true',
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
